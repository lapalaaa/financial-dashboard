import { Navigate, useLocation } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { LogoMark } from '../components/Logo'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAuth } from '../features/auth/authContext'
import { LoginForm } from '../features/auth/LoginForm'
import { APP_NAME } from '../lib/config'
import { canUseDevSession, isSupabaseConfigured } from '../lib/supabase'

export default function LoginPage() {
  const { user, startDevSession } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  if (user) return <Navigate to={from} replace />

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10 pt-safe">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark className="h-12 w-12" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-muted">Productos y finanzas personales</p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-4 flex gap-2.5 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2.5 text-sm text-warning">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Supabase no está configurado. Copiá <code>.env.example</code> a <code>.env</code> y completá los datos de tu
              proyecto.
            </p>
          </div>
        )}

        <Card className="p-5 sm:p-6">
          <LoginForm disabled={!isSupabaseConfigured} />
        </Card>

        {canUseDevSession && (
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm" onClick={startDevSession}>
              Entrar en modo desarrollo (sin Supabase)
            </Button>
            <p className="mt-1 text-xs text-subtle">Solo disponible con npm run dev.</p>
          </div>
        )}
      </div>
    </div>
  )
}
