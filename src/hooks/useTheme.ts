import { createContext, useContext } from 'react'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeContextValue {
  /** Lo que eligió el usuario. */
  preference: ThemePreference
  /** Lo que se está mostrando (resuelve "system"). */
  resolved: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
}

export const THEME_STORAGE_KEY = 'theme'

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>')
  return ctx
}
