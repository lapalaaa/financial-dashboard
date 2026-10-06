import { supabase } from '../../../lib/supabase'
import type { Database, TableRow } from '../../../types/database'
import type { Account, Category, Preferences, ProductSource } from '../types'
import { columnMapToJson, parseColumnMap } from '../utils/sources'
import { toSettingsError, type Entity, type SettingsRepository } from './repository'

type Tables = Database['public']['Tables']

// ---- Mapeo filas (snake_case) ↔ dominio (camelCase) ----

const toPreferences = (r: TableRow<'user_preferences'>): Preferences => ({
  theme: r.theme,
  defaultPeriod: r.default_period,
  catalogCacheMinutes: r.catalog_cache_minutes,
})

const toSource = (r: TableRow<'product_sources'>): ProductSource => ({
  id: r.id,
  slot: r.slot,
  name: r.name,
  spreadsheetId: r.spreadsheet_id,
  sheetName: r.sheet_name,
  headerRow: r.header_row,
  columnMap: parseColumnMap(r.column_map),
  enabled: r.enabled,
  updatedAt: r.updated_at,
})

const toCategory = (r: TableRow<'expense_categories'>): Category => ({
  id: r.id,
  name: r.name,
  color: r.color,
  sortOrder: r.sort_order,
  archived: r.archived,
})

const toAccount = (r: TableRow<'accounts'>): Account => ({
  id: r.id,
  name: r.name,
  kind: r.kind,
  sortOrder: r.sort_order,
  archived: r.archived,
})

type ErrorLike = { code?: string; message?: string }

/** Devuelve `data` (sin null) o lanza el error traducido. */
function unwrap<R extends { data: unknown; error: ErrorLike | null }>(result: R, entity: Entity): NonNullable<R['data']> {
  if (result.error) throw toSettingsError(result.error, entity)
  if (result.data === null || result.data === undefined) throw toSettingsError({ code: 'PGRST116' }, entity)
  return result.data as NonNullable<R['data']>
}

function check(result: { error: ErrorLike | null }, entity: Entity): void {
  if (result.error) throw toSettingsError(result.error, entity)
}

// Las consultas no filtran por user_id: RLS ya limita todo a auth.uid().
export const supabaseRepository: SettingsRepository = {
  async bootstrap() {
    check(await supabase.rpc('bootstrap_user'), 'preferences')
  },

  async getPreferences() {
    return toPreferences(unwrap(await supabase.from('user_preferences').select('*').single(), 'preferences'))
  },

  async updatePreferences(patch) {
    const update: Tables['user_preferences']['Update'] = {}
    if (patch.theme !== undefined) update.theme = patch.theme
    if (patch.defaultPeriod !== undefined) update.default_period = patch.defaultPeriod
    if (patch.catalogCacheMinutes !== undefined) update.catalog_cache_minutes = patch.catalogCacheMinutes
    // Filtro explícito por la única fila del usuario (un UPDATE sin WHERE puede estar bloqueado).
    const { data: auth } = await supabase.auth.getSession()
    const row = unwrap(
      await supabase
        .from('user_preferences')
        .update(update)
        .eq('user_id', auth.session?.user.id ?? '')
        .select('*')
        .single(),
      'preferences',
    )
    return toPreferences(row)
  },

  async listSources() {
    const rows = unwrap(await supabase.from('product_sources').select('*').order('slot'), 'source')
    return rows.map(toSource)
  },

  async updateSource(id, patch) {
    const update: Tables['product_sources']['Update'] = {}
    if (patch.name !== undefined) update.name = patch.name.trim()
    if (patch.spreadsheetId !== undefined) update.spreadsheet_id = patch.spreadsheetId
    if (patch.sheetName !== undefined) update.sheet_name = patch.sheetName?.trim() || null
    if (patch.headerRow !== undefined) update.header_row = patch.headerRow
    if (patch.columnMap !== undefined) update.column_map = columnMapToJson(patch.columnMap)
    if (patch.enabled !== undefined) update.enabled = patch.enabled
    const row = unwrap(await supabase.from('product_sources').update(update).eq('id', id).select('*').single(), 'source')
    return toSource(row)
  },

  async listCategories() {
    const rows = unwrap(
      await supabase.from('expense_categories').select('*').order('sort_order').order('name'),
      'category',
    )
    return rows.map(toCategory)
  },

  async createCategory({ name, color, sortOrder }) {
    const row = unwrap(
      await supabase
        .from('expense_categories')
        .insert({ name: name.trim(), color, sort_order: sortOrder })
        .select('*')
        .single(),
      'category',
    )
    return toCategory(row)
  },

  async updateCategory(id, patch) {
    const update: Tables['expense_categories']['Update'] = {}
    if (patch.name !== undefined) update.name = patch.name.trim()
    if (patch.color !== undefined) update.color = patch.color
    if (patch.archived !== undefined) update.archived = patch.archived
    const row = unwrap(
      await supabase.from('expense_categories').update(update).eq('id', id).select('*').single(),
      'category',
    )
    return toCategory(row)
  },

  async deleteCategory(id) {
    check(await supabase.from('expense_categories').delete().eq('id', id), 'category')
  },

  async listAccounts() {
    const rows = unwrap(await supabase.from('accounts').select('*').order('sort_order').order('name'), 'account')
    return rows.map(toAccount)
  },

  async createAccount({ name, kind, sortOrder }) {
    const row = unwrap(
      await supabase.from('accounts').insert({ name: name.trim(), kind, sort_order: sortOrder }).select('*').single(),
      'account',
    )
    return toAccount(row)
  },

  async updateAccount(id, patch) {
    const update: Tables['accounts']['Update'] = {}
    if (patch.name !== undefined) update.name = patch.name.trim()
    if (patch.kind !== undefined) update.kind = patch.kind
    if (patch.archived !== undefined) update.archived = patch.archived
    const row = unwrap(await supabase.from('accounts').update(update).eq('id', id).select('*').single(), 'account')
    return toAccount(row)
  },

  async deleteAccount(id) {
    check(await supabase.from('accounts').delete().eq('id', id), 'account')
  },
}
