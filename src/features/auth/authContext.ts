import { createContext, useContext } from 'react'

export interface AuthUser {
  id: string
  email: string
}

export interface AuthResult {
  error: string | null
}

export interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  /** true si la sesión es la local de desarrollo (sin Supabase). */
  isDevSession: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string) => Promise<AuthResult>
  resetPassword: (email: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  /** Solo en `npm run dev` y sin Supabase configurado. */
  startDevSession: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
