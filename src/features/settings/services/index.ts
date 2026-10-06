import { isSupabaseConfigured } from '../../../lib/supabase'
import { localRepository } from './localRepository'
import type { SettingsRepository } from './repository'
import { supabaseRepository } from './supabaseRepository'

/** true cuando la configuración se guarda solo en este navegador (sin Supabase). */
export const isLocalSettings = !isSupabaseConfigured

export const settingsRepository: SettingsRepository = isSupabaseConfigured ? supabaseRepository : localRepository

export { SettingsError, errorMessage } from './repository'
