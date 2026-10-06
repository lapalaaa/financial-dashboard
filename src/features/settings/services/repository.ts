import type {
  Account,
  AccountInput,
  AccountPatch,
  Category,
  CategoryInput,
  CategoryPatch,
  Preferences,
  ProductSource,
  ProductSourcePatch,
} from '../types'

/**
 * Acceso a la configuración del usuario. Hay dos implementaciones:
 * Supabase (real) y localStorage (modo desarrollo sin Supabase).
 * Todos los métodos lanzan `SettingsError` con un mensaje para mostrar.
 */
export interface SettingsRepository {
  /** Crea preferencias, fuentes A/B y categorías/cuentas iniciales si faltan. */
  bootstrap(): Promise<void>

  getPreferences(): Promise<Preferences>
  updatePreferences(patch: Partial<Preferences>): Promise<Preferences>

  listSources(): Promise<ProductSource[]>
  updateSource(id: string, patch: ProductSourcePatch): Promise<ProductSource>

  listCategories(): Promise<Category[]>
  createCategory(input: CategoryInput & { sortOrder: number }): Promise<Category>
  updateCategory(id: string, patch: CategoryPatch): Promise<Category>
  deleteCategory(id: string): Promise<void>

  listAccounts(): Promise<Account[]>
  createAccount(input: AccountInput & { sortOrder: number }): Promise<Account>
  updateAccount(id: string, patch: AccountPatch): Promise<Account>
  deleteAccount(id: string): Promise<void>
}

export class SettingsError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message)
    this.name = 'SettingsError'
  }
}

/** Mensaje para mostrar a partir de cualquier error lanzado por una acción. */
export function errorMessage(e: unknown): string {
  return e instanceof Error && e.message ? e.message : 'Ocurrió un error inesperado.'
}

export type Entity = 'category' | 'account' | 'source' | 'preferences'

const DUPLICATE: Record<Entity, string> = {
  category: 'Ya existe una categoría con ese nombre.',
  account: 'Ya existe una cuenta con ese nombre.',
  source: 'Esa fuente ya existe.',
  preferences: 'Las preferencias ya existen.',
}

const IN_USE: Record<Entity, string> = {
  category: 'Esta categoría tiene gastos asociados. Archivala en lugar de eliminarla.',
  account: 'Esta cuenta tiene gastos asociados. Archivala en lugar de eliminarla.',
  source: 'Esta fuente tiene stock físico registrado.',
  preferences: 'No se puede eliminar.',
}

/** Traduce errores de Postgres/PostgREST a mensajes en español. */
export function toSettingsError(
  error: { code?: string; message?: string } | null | undefined,
  entity: Entity,
): SettingsError {
  const code = error?.code
  const message = error?.message ?? ''
  switch (code) {
    case '23505':
      return new SettingsError(DUPLICATE[entity], code)
    case '23503':
      return new SettingsError(IN_USE[entity], code)
    case '23514':
      return new SettingsError('Algún dato no es válido. Revisá los campos.', code)
    case '42P01':
    case 'PGRST202':
    case 'PGRST205':
      return new SettingsError(
        'La base de datos no está preparada. Falta aplicar la migración de Supabase.',
        code,
      )
    case '42501':
      return new SettingsError('No tenés permiso para realizar esta acción.', code)
    case 'PGRST116':
      return new SettingsError('No se encontró el registro.', code)
  }
  if (/failed to fetch|network/i.test(message)) {
    return new SettingsError('No se pudo conectar con el servidor. Revisá tu conexión.', code)
  }
  return new SettingsError(message || 'Ocurrió un error inesperado.', code)
}
