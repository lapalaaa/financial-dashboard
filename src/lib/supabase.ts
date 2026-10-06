import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** false si faltan las variables de entorno (se muestra un aviso en el login). */
export const isSupabaseConfigured = Boolean(url && anonKey && /^https?:\/\//.test(url))

/**
 * Sesión local de desarrollo: solo con `npm run dev` y sin Supabase configurado,
 * para poder recorrer la interfaz. Nunca está disponible en el build de producción.
 */
export const canUseDevSession = import.meta.env.DEV && !isSupabaseConfigured

// Con valores de relleno el cliente se crea sin lanzar errores; no se usa si no está configurado.
export const supabase = createClient(
  isSupabaseConfigured ? url! : 'http://localhost:54321',
  isSupabaseConfigured ? anonKey! : 'no-configurado',
)
