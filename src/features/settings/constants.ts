import type { AccountKind, CategoryInput, AccountInput, Preferences } from './types'

// Mismos valores por defecto que bootstrap_user() en la migración.

export const CATEGORY_COLORS = [
  '#0d9488',
  '#ea580c',
  '#2563eb',
  '#7c3aed',
  '#ca8a04',
  '#dc2626',
  '#db2777',
  '#0891b2',
  '#16a34a',
  '#64748b',
] as const

export const DEFAULT_CATEGORIES: CategoryInput[] = [
  { name: 'Supermercado', color: '#0d9488' },
  { name: 'Comida y delivery', color: '#ea580c' },
  { name: 'Transporte', color: '#2563eb' },
  { name: 'Servicios', color: '#7c3aed' },
  { name: 'Hogar', color: '#ca8a04' },
  { name: 'Salud', color: '#dc2626' },
  { name: 'Ocio', color: '#db2777' },
  { name: 'Ropa', color: '#0891b2' },
  { name: 'Educación', color: '#16a34a' },
  { name: 'Otros', color: '#64748b' },
]

export const DEFAULT_ACCOUNTS: AccountInput[] = [
  { name: 'Efectivo', kind: 'efectivo' },
  { name: 'Tarjeta de débito', kind: 'debito' },
  { name: 'Tarjeta de crédito', kind: 'credito' },
  { name: 'Billetera virtual', kind: 'billetera' },
]

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'system',
  defaultPeriod: 'this-month',
  catalogCacheMinutes: 60,
}

export const ACCOUNT_KIND_LABELS: Record<AccountKind, string> = {
  efectivo: 'Efectivo',
  debito: 'Tarjeta de débito',
  credito: 'Tarjeta de crédito',
  billetera: 'Billetera virtual',
  transferencia: 'Transferencia',
  otro: 'Otro',
}

export const NAME_MAX_LENGTH = 40
export const SOURCE_NAME_MAX_LENGTH = 60
