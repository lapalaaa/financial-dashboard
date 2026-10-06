import { DEFAULT_ACCOUNTS, DEFAULT_CATEGORIES, DEFAULT_PREFERENCES } from '../constants'
import type { Account, Category, Preferences, ProductSource } from '../types'
import { isSourceConfigured, normalizeColumnMap } from '../utils/sources'
import { SettingsError, type SettingsRepository } from './repository'

/**
 * Implementación en localStorage para el modo desarrollo (sin Supabase).
 * Replica las reglas de la base que importan para la interfaz:
 * nombres únicos y fuentes que solo se activan si están configuradas.
 */

const STORAGE_KEY = 'dev-settings:v1'

interface Store {
  preferences: Preferences
  sources: ProductSource[]
  categories: Category[]
  accounts: Account[]
}

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

function load(): Store | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Store) : null
  } catch {
    return null
  }
}

let memory: Store | null = null

function read(): Store {
  memory ??= load()
  if (!memory) throw new SettingsError('Datos locales no inicializados.')
  return memory
}

function write(store: Store) {
  memory = store
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // sin persistencia: los datos viven mientras la pestaña esté abierta
  }
}

const byOrder = <T extends { sortOrder: number; name: string }>(a: T, b: T) =>
  a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'es')

function assertUniqueName(items: Array<{ id: string; name: string }>, name: string, exceptId: string | null, label: string) {
  const key = name.trim().toLowerCase()
  if (items.some((i) => i.id !== exceptId && i.name.trim().toLowerCase() === key)) {
    throw new SettingsError(`Ya existe una ${label} con ese nombre.`, '23505')
  }
}

function findIndex<T extends { id: string }>(items: T[], id: string): number {
  const i = items.findIndex((x) => x.id === id)
  if (i < 0) throw new SettingsError('No se encontró el registro.', 'PGRST116')
  return i
}

export const localRepository: SettingsRepository = {
  async bootstrap() {
    if (load()) return
    const now = new Date().toISOString()
    write({
      preferences: { ...DEFAULT_PREFERENCES },
      sources: (['A', 'B'] as const).map((slot) => ({
        id: newId(),
        slot,
        name: `Fuente ${slot}`,
        spreadsheetId: null,
        sheetName: null,
        headerRow: 1,
        columnMap: {},
        enabled: false,
        updatedAt: now,
      })),
      categories: DEFAULT_CATEGORIES.map((c, i) => ({ id: newId(), ...c, sortOrder: i + 1, archived: false })),
      accounts: DEFAULT_ACCOUNTS.map((a, i) => ({ id: newId(), ...a, sortOrder: i + 1, archived: false })),
    })
  },

  async getPreferences() {
    return { ...read().preferences }
  },

  async updatePreferences(patch) {
    const store = read()
    const preferences = { ...store.preferences, ...patch }
    write({ ...store, preferences })
    return { ...preferences }
  },

  async listSources() {
    return read().sources.map((s) => ({ ...s }))
  },

  async updateSource(id, patch) {
    const store = read()
    const i = findIndex(store.sources, id)
    const next: ProductSource = {
      ...store.sources[i],
      ...patch,
      columnMap: patch.columnMap ? normalizeColumnMap(patch.columnMap) : store.sources[i].columnMap,
      updatedAt: new Date().toISOString(),
    }
    if (next.enabled && !isSourceConfigured(next)) {
      throw new SettingsError('Completá planilla, pestaña y columna de nombre antes de activar la fuente.', '23514')
    }
    const sources = [...store.sources]
    sources[i] = next
    write({ ...store, sources })
    return { ...next }
  },

  async listCategories() {
    return [...read().categories].sort(byOrder)
  },

  async createCategory({ name, color, sortOrder }) {
    const store = read()
    assertUniqueName(store.categories, name, null, 'categoría')
    const category: Category = { id: newId(), name: name.trim(), color, sortOrder, archived: false }
    write({ ...store, categories: [...store.categories, category] })
    return { ...category }
  },

  async updateCategory(id, patch) {
    const store = read()
    const i = findIndex(store.categories, id)
    if (patch.name !== undefined) assertUniqueName(store.categories, patch.name, id, 'categoría')
    const next = { ...store.categories[i], ...patch, name: (patch.name ?? store.categories[i].name).trim() }
    const categories = [...store.categories]
    categories[i] = next
    write({ ...store, categories })
    return { ...next }
  },

  // En modo local no hay gastos, así que nada impide borrar.
  async deleteCategory(id) {
    const store = read()
    findIndex(store.categories, id)
    write({ ...store, categories: store.categories.filter((c) => c.id !== id) })
  },

  async listAccounts() {
    return [...read().accounts].sort(byOrder)
  },

  async createAccount({ name, kind, sortOrder }) {
    const store = read()
    assertUniqueName(store.accounts, name, null, 'cuenta')
    const account: Account = { id: newId(), name: name.trim(), kind, sortOrder, archived: false }
    write({ ...store, accounts: [...store.accounts, account] })
    return { ...account }
  },

  async updateAccount(id, patch) {
    const store = read()
    const i = findIndex(store.accounts, id)
    if (patch.name !== undefined) assertUniqueName(store.accounts, patch.name, id, 'cuenta')
    const next = { ...store.accounts[i], ...patch, name: (patch.name ?? store.accounts[i].name).trim() }
    const accounts = [...store.accounts]
    accounts[i] = next
    write({ ...store, accounts })
    return { ...next }
  },

  async deleteAccount(id) {
    const store = read()
    findIndex(store.accounts, id)
    write({ ...store, accounts: store.accounts.filter((a) => a.id !== id) })
  },
}
