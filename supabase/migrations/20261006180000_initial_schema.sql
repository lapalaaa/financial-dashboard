-- =============================================================================
-- Esquema inicial: preferencias, fuentes de productos (A/B), stock físico,
-- categorías, cuentas y gastos.
--
-- Principios:
--   * Todas las tablas pertenecen a un usuario (user_id) y tienen RLS por auth.uid().
--   * Las FK compuestas (id, user_id) garantizan que un registro solo pueda
--     referenciar filas del MISMO usuario, además de lo que ya filtra RLS.
--   * Google Sheets es solo lectura: acá solo se guarda su configuración y el
--     stock FÍSICO que ingresa el usuario. El stock de la planilla es referencia.
--   * Sin saldos, ingresos ni transferencias: solo gastos.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Utilidades
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Preferencias del usuario (1 fila por usuario)
-- -----------------------------------------------------------------------------
create table public.user_preferences (
  user_id               uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  theme                 text not null default 'system'
                        check (theme in ('light', 'dark', 'system')),
  default_period        text not null default 'this-month'
                        check (default_period in ('this-month', 'last-month', 'last-30')),
  catalog_cache_minutes integer not null default 60
                        check (catalog_cache_minutes between 0 and 1440),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create trigger user_preferences_set_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Fuentes de productos: exactamente dos ranuras independientes, A y B.
-- column_map: { "name": "<encabezado>", "sku"?: ..., "barcode"?: ...,
--               "sheetStock"?: ..., "price"?: ..., "display"?: ["<enc>", ...] }
-- -----------------------------------------------------------------------------
create table public.product_sources (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  slot           text not null check (slot in ('A', 'B')),
  name           text not null check (char_length(btrim(name)) between 1 and 60),
  spreadsheet_id text check (spreadsheet_id is null or spreadsheet_id ~ '^[A-Za-z0-9_-]{20,100}$'),
  sheet_name     text check (sheet_name is null or char_length(btrim(sheet_name)) between 1 and 100),
  header_row     integer not null default 1 check (header_row between 1 and 1000),
  column_map     jsonb not null default '{}'::jsonb check (jsonb_typeof(column_map) = 'object'),
  enabled        boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint product_sources_user_slot_key unique (user_id, slot),
  constraint product_sources_id_user_key unique (id, user_id),
  -- Solo se puede activar una fuente completamente configurada.
  constraint product_sources_enabled_requires_config check (
    not enabled
    or (spreadsheet_id is not null and sheet_name is not null and column_map ? 'name')
  )
);

create trigger product_sources_set_updated_at
  before update on public.product_sources
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Stock físico: último conteo por (usuario, fuente, producto).
-- product_key: 'sku:<SKU normalizado>' | 'bc:<código de barras>' | 'name:<nombre normalizado>'
-- Nunca el número de fila de la planilla.
-- -----------------------------------------------------------------------------
create table public.physical_stock (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  source_id       uuid not null,
  product_key     text not null check (product_key ~ '^(sku|bc|name):.+$'),
  has_product     boolean not null,
  quantity        integer not null,
  -- Snapshots al momento del conteo (legibles aunque la planilla cambie).
  product_name    text not null check (char_length(btrim(product_name)) >= 1),
  sku             text,
  barcode         text,
  sheet_stock_ref text, -- valor de la planilla, solo como referencia
  counted_at      timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint physical_stock_source_fk
    foreign key (source_id, user_id) references public.product_sources (id, user_id),
  constraint physical_stock_user_source_product_key unique (user_id, source_id, product_key),
  -- NO → 0 · SÍ → al menos 1
  constraint physical_stock_answer_matches_quantity check (
    (not has_product and quantity = 0) or (has_product and quantity >= 1)
  )
);

create index physical_stock_source_id_idx on public.physical_stock (source_id);
create index physical_stock_user_counted_at_idx on public.physical_stock (user_id, counted_at desc);

create trigger physical_stock_set_updated_at
  before update on public.physical_stock
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Historial de stock físico (solo se agregan filas; lo escribe un trigger).
-- -----------------------------------------------------------------------------
create table public.physical_stock_history (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  source_id         uuid not null,
  physical_stock_id uuid references public.physical_stock (id) on delete set null,
  product_key       text not null,
  has_product       boolean not null,
  quantity          integer not null,
  product_name      text not null,
  sku               text,
  barcode           text,
  sheet_stock_ref   text,
  counted_at        timestamptz not null,
  created_at        timestamptz not null default now(),

  constraint physical_stock_history_source_fk
    foreign key (source_id, user_id) references public.product_sources (id, user_id),
  constraint physical_stock_history_answer_matches_quantity check (
    (not has_product and quantity = 0) or (has_product and quantity >= 1)
  )
);

create index physical_stock_history_product_idx
  on public.physical_stock_history (user_id, source_id, product_key, counted_at desc);
create index physical_stock_history_source_id_idx on public.physical_stock_history (source_id);
create index physical_stock_history_stock_id_idx on public.physical_stock_history (physical_stock_id);

-- SECURITY DEFINER: el cliente no tiene permiso de escritura sobre el historial;
-- solo este trigger puede agregar filas, copiando la fila que el usuario ya
-- pudo escribir bajo RLS (mismo user_id).
create or replace function public.log_physical_stock_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE'
     and new.has_product is not distinct from old.has_product
     and new.quantity is not distinct from old.quantity
     and new.counted_at is not distinct from old.counted_at then
    return new; -- cambio de snapshot sin nuevo conteo: no se registra
  end if;

  insert into public.physical_stock_history (
    user_id, source_id, physical_stock_id, product_key, has_product, quantity,
    product_name, sku, barcode, sheet_stock_ref, counted_at
  ) values (
    new.user_id, new.source_id, new.id, new.product_key, new.has_product, new.quantity,
    new.product_name, new.sku, new.barcode, new.sheet_stock_ref, new.counted_at
  );
  return new;
end;
$$;

revoke all on function public.log_physical_stock_change() from public, anon, authenticated;

create trigger physical_stock_log_change
  after insert or update on public.physical_stock
  for each row execute function public.log_physical_stock_change();

-- -----------------------------------------------------------------------------
-- Categorías de gastos
-- -----------------------------------------------------------------------------
create table public.expense_categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name       text not null check (char_length(btrim(name)) between 1 and 40),
  color      text not null default '#64748b' check (color ~ '^#[0-9a-fA-F]{6}$'),
  sort_order integer not null default 0,
  archived   boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint expense_categories_id_user_key unique (id, user_id)
);

create unique index expense_categories_user_name_key
  on public.expense_categories (user_id, lower(btrim(name)));
create index expense_categories_user_list_idx
  on public.expense_categories (user_id, archived, sort_order);

create trigger expense_categories_set_updated_at
  before update on public.expense_categories
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Cuentas / fuentes de gasto (sin saldo: solo indican de dónde salió el gasto)
-- -----------------------------------------------------------------------------
create table public.accounts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name       text not null check (char_length(btrim(name)) between 1 and 40),
  kind       text not null default 'otro'
             check (kind in ('efectivo', 'debito', 'credito', 'billetera', 'transferencia', 'otro')),
  sort_order integer not null default 0,
  archived   boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint accounts_id_user_key unique (id, user_id)
);

create unique index accounts_user_name_key on public.accounts (user_id, lower(btrim(name)));
create index accounts_user_list_idx on public.accounts (user_id, archived, sort_order);

create trigger accounts_set_updated_at
  before update on public.accounts
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Gastos
-- Las FK (sin ON DELETE) impiden borrar físicamente una categoría o cuenta
-- que tenga gastos: en ese caso se archiva.
-- -----------------------------------------------------------------------------
create table public.expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  amount      numeric(14, 2) not null check (amount > 0),
  category_id uuid not null,
  account_id  uuid not null,
  spent_on    date not null default current_date,
  description text check (description is null or char_length(description) <= 280),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint expenses_category_fk
    foreign key (category_id, user_id) references public.expense_categories (id, user_id),
  constraint expenses_account_fk
    foreign key (account_id, user_id) references public.accounts (id, user_id)
);

create index expenses_user_spent_on_idx on public.expenses (user_id, spent_on desc, created_at desc);
create index expenses_category_id_idx on public.expenses (category_id);
create index expenses_account_id_idx on public.expenses (account_id);

create trigger expenses_set_updated_at
  before update on public.expenses
  for each row execute function public.set_updated_at();

-- =============================================================================
-- Row Level Security
-- (select auth.uid()) se evalúa una sola vez por consulta (recomendación de Supabase).
-- =============================================================================
alter table public.user_preferences       enable row level security;
alter table public.product_sources        enable row level security;
alter table public.physical_stock         enable row level security;
alter table public.physical_stock_history enable row level security;
alter table public.expense_categories     enable row level security;
alter table public.accounts               enable row level security;
alter table public.expenses               enable row level security;

-- user_preferences: leer / crear / editar la propia fila.
create policy "user_preferences: select own" on public.user_preferences
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "user_preferences: insert own" on public.user_preferences
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "user_preferences: update own" on public.user_preferences
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- product_sources: sin DELETE (las ranuras A/B son fijas; se desactivan).
create policy "product_sources: select own" on public.product_sources
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "product_sources: insert own" on public.product_sources
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "product_sources: update own" on public.product_sources
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- physical_stock: CRUD propio.
create policy "physical_stock: select own" on public.physical_stock
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "physical_stock: insert own" on public.physical_stock
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "physical_stock: update own" on public.physical_stock
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "physical_stock: delete own" on public.physical_stock
  for delete to authenticated using ((select auth.uid()) = user_id);

-- physical_stock_history: solo lectura para el usuario (lo escribe el trigger).
create policy "physical_stock_history: select own" on public.physical_stock_history
  for select to authenticated using ((select auth.uid()) = user_id);

-- expense_categories: CRUD propio (el borrado falla por FK si tiene gastos).
create policy "expense_categories: select own" on public.expense_categories
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "expense_categories: insert own" on public.expense_categories
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "expense_categories: update own" on public.expense_categories
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "expense_categories: delete own" on public.expense_categories
  for delete to authenticated using ((select auth.uid()) = user_id);

-- accounts: CRUD propio (el borrado falla por FK si tiene gastos).
create policy "accounts: select own" on public.accounts
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "accounts: insert own" on public.accounts
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "accounts: update own" on public.accounts
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "accounts: delete own" on public.accounts
  for delete to authenticated using ((select auth.uid()) = user_id);

-- expenses: CRUD propio.
create policy "expenses: select own" on public.expenses
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "expenses: insert own" on public.expenses
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "expenses: update own" on public.expenses
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "expenses: delete own" on public.expenses
  for delete to authenticated using ((select auth.uid()) = user_id);

-- El historial no se escribe desde el cliente ni siquiera con políticas futuras.
revoke insert, update, delete on public.physical_stock_history from anon, authenticated;

-- =============================================================================
-- Datos iniciales por usuario (idempotente).
-- SECURITY INVOKER: corre con los permisos del usuario, así que RLS aplica.
-- La app lo llama al iniciar sesión; no hace nada si ya existen los datos.
-- =============================================================================
create or replace function public.bootstrap_user()
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'bootstrap_user requiere un usuario autenticado';
  end if;

  insert into public.user_preferences (user_id) values (uid)
  on conflict (user_id) do nothing;

  insert into public.product_sources (user_id, slot, name) values
    (uid, 'A', 'Fuente A'),
    (uid, 'B', 'Fuente B')
  on conflict (user_id, slot) do nothing;

  if not exists (select 1 from public.expense_categories where user_id = uid) then
    insert into public.expense_categories (user_id, name, color, sort_order) values
      (uid, 'Supermercado',      '#0d9488', 1),
      (uid, 'Comida y delivery', '#ea580c', 2),
      (uid, 'Transporte',        '#2563eb', 3),
      (uid, 'Servicios',         '#7c3aed', 4),
      (uid, 'Hogar',             '#ca8a04', 5),
      (uid, 'Salud',             '#dc2626', 6),
      (uid, 'Ocio',              '#db2777', 7),
      (uid, 'Ropa',              '#0891b2', 8),
      (uid, 'Educación',         '#16a34a', 9),
      (uid, 'Otros',             '#64748b', 10);
  end if;

  if not exists (select 1 from public.accounts where user_id = uid) then
    insert into public.accounts (user_id, name, kind, sort_order) values
      (uid, 'Efectivo',           'efectivo',  1),
      (uid, 'Tarjeta de débito',  'debito',    2),
      (uid, 'Tarjeta de crédito', 'credito',   3),
      (uid, 'Billetera virtual',  'billetera', 4);
  end if;
end;
$$;

revoke all on function public.bootstrap_user() from public, anon;
grant execute on function public.bootstrap_user() to authenticated;
