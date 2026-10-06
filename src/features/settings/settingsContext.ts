import { createContext, useContext } from 'react'
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
} from './types'

export type SettingsStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface SettingsContextValue {
  status: SettingsStatus
  /** Mensaje si falló la carga inicial. */
  error: string | null
  /** true si los datos se guardan solo en este navegador (modo desarrollo). */
  isLocal: boolean

  preferences: Preferences
  sources: ProductSource[]
  categories: Category[]
  accounts: Account[]

  reload: () => Promise<void>

  // Las acciones lanzan SettingsError: quien las llama decide cómo mostrarlo.
  updatePreferences: (patch: Partial<Preferences>) => Promise<void>
  updateSource: (id: string, patch: ProductSourcePatch) => Promise<void>
  createCategory: (input: CategoryInput) => Promise<void>
  updateCategory: (id: string, patch: CategoryPatch) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  createAccount: (input: AccountInput) => Promise<void>
  updateAccount: (id: string, patch: AccountPatch) => Promise<void>
  deleteAccount: (id: string) => Promise<void>
}

export const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings debe usarse dentro de <SettingsProvider>')
  return ctx
}
