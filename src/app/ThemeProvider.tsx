import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery'
import {
  THEME_STORAGE_KEY,
  ThemeContext,
  type ThemePreference,
} from '../hooks/useTheme'

function readStoredPreference(): ThemePreference {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch {
    // almacenamiento bloqueado: se usa el valor por defecto
  }
  return 'system'
}

// En la Fase 1 la preferencia también se sincroniza con Supabase (user_preferences).
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(readStoredPreference)
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)')
  const resolved = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark')
  }, [resolved])

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, preference)
    } catch {
      // sin persistencia; el tema igual se aplica en esta sesión
    }
  }, [preference])

  const value = useMemo(() => ({ preference, resolved, setPreference }), [preference, resolved])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
