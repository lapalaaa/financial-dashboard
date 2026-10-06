# Mi Aplicación

Aplicación web personal con dos módulos:

- **Productos**: consulta de productos en dos planillas de Google Sheets (solo lectura) y registro del stock físico.
- **Finanzas**: registro de gastos por categoría y cuenta.

Funciona en PC y celular (web responsive).

## Reglas del proyecto

Las reglas obligatorias están en [`docs/REGLAS_DEL_PROYECTO.md`](docs/REGLAS_DEL_PROYECTO.md). En resumen:

1. **Dos fuentes independientes:** A = *INVENTARIO PROVEEDORES DE ARGENTINA* y
   B = *INVENTARIO PRODUCTOS IMPORTADOS*, ambas con la hoja *INVENTARIO INICIAL*. Nunca se mezclan.
2. **Las planillas son solo lectura.** La app nunca modifica ninguna celda; sus datos propios viven en Supabase.
3. **El stock de la planilla es solo referencia**, nunca stock físico. El físico lo ingresa el usuario
   (No → 0, Sí → ≥ 1).
4. **Un código de barras puede repetirse** con distintas variantes (color/medida): el buscador debe mostrar
   todas y dejar elegir.
5. **El stock físico es por usuario + fuente + producto/variante**: A y B nunca comparten stock.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · React Router · Recharts · Supabase

## Puesta en marcha

```bash
npm install
cp .env.example .env   # completar con los datos del proyecto de Supabase
npm run dev
```

Sin `.env`, `npm run dev` permite entrar en un **modo desarrollo** local para recorrer la interfaz
(no disponible en el build de producción). En ese modo la configuración se guarda solo en el navegador.

## Base de datos (Supabase)

El esquema está en `supabase/migrations/`. Para aplicarlo en tu proyecto:

- **Desde el panel:** SQL Editor → pegar el contenido de `20261006180000_initial_schema.sql` → Run.
- **Con la CLI:** `supabase link --project-ref <ref>` y luego `supabase db push`.

Crea las tablas `user_preferences`, `product_sources` (fuentes A y B), `physical_stock`,
`physical_stock_history`, `expense_categories`, `accounts` y `expenses`, todas con Row Level Security
por usuario. Al iniciar sesión la app llama a `bootstrap_user()`, que crea las fuentes A/B y
categorías/cuentas iniciales si todavía no existen.

Google Sheets es **solo lectura**: la base guarda la configuración de cada planilla y el stock
físico que ingresa el usuario, nunca escribe en las planillas.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo en `http://localhost:5173` |
| `npm run build` | Chequeo de tipos + build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción |
| `npm run lint` | ESLint |

## Estructura

```
src/
├── app/          App, router, providers, tema, rutas protegidas
├── layouts/      Layout principal (sidebar en PC, barra inferior en celular)
├── pages/        Una página por sección
├── features/     Lógica por dominio (auth, products, finance, settings)
├── components/   Componentes compartidos; ui/ = kit base
├── hooks/        useTheme, useMediaQuery, useDebounce
└── lib/          supabase, formato (ARS / es-AR), utilidades
```

## Estado

- [x] Fase 0 — Esqueleto, navegación y kit de interfaz
- [x] Fase 1 — Base de datos y Ajustes (fuentes, categorías, cuentas, preferencias)
- [ ] Fase 2 — Finanzas
- [ ] Fase 3 — Conexión de solo lectura con Google Sheets
- [ ] Fase 4 — Productos y stock físico
- [ ] Fase 5 — Inicio y pulido
