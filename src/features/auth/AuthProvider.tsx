import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { canUseDevSession, isSupabaseConfigured, supabase } from '../../lib/supabase'
import { AuthContext, type AuthContextValue, type AuthUser } from './authContext'

const DEV_SESSION_KEY = 'dev-session'

const toAuthUser = (u: User | null | undefined): AuthUser | null =>
  u ? { id: u.id, email: u.email ?? '' } : null

const NOT_CONFIGURED = 'Supabase no está configurado. Completá el archivo .env.'

function translateAuthError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'Email o contraseña incorrectos.'
  if (m.includes('email not confirmed')) return 'Todavía no confirmaste tu email. Revisá tu casilla.'
  if (m.includes('user already registered')) return 'Ya existe una cuenta con ese email.'
  if (m.includes('password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.'
  if (m.includes('rate limit')) return 'Demasiados intentos. Esperá unos minutos y volvé a probar.'
  if (m.includes('failed to fetch') || m.includes('network')) return 'No se pudo conectar. Revisá tu conexión.'
  return message
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDevSession, setIsDevSession] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      if (canUseDevSession && sessionStorage.getItem(DEV_SESSION_KEY)) {
        setUser({ id: 'dev', email: 'desarrollo@local' })
        setIsDevSession(true)
      }
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(toAuthUser(data.session?.user))
      setLoading(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toAuthUser(session?.user))
      setLoading(false)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) return { error: NOT_CONFIGURED }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? translateAuthError(error.message) : null }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) return { error: NOT_CONFIGURED }
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error ? translateAuthError(error.message) : null }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) return { error: NOT_CONFIGURED }
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    return { error: error ? translateAuthError(error.message) : null }
  }, [])

  const signOut = useCallback(async () => {
    if (isDevSession) {
      sessionStorage.removeItem(DEV_SESSION_KEY)
      setIsDevSession(false)
      setUser(null)
      return
    }
    await supabase.auth.signOut()
  }, [isDevSession])

  const startDevSession = useCallback(() => {
    if (!canUseDevSession) return
    sessionStorage.setItem(DEV_SESSION_KEY, '1')
    setIsDevSession(true)
    setUser({ id: 'dev', email: 'desarrollo@local' })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, isDevSession, signIn, signUp, resetPassword, signOut, startDevSession }),
    [user, loading, isDevSession, signIn, signUp, resetPassword, signOut, startDevSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
