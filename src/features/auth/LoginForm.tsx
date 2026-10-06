import { useState, type FormEvent } from 'react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { cn } from '../../lib/cn'
import { useAuth } from './authContext'

type Mode = 'signin' | 'signup' | 'reset'

const titles: Record<Mode, { submit: string; description: string }> = {
  signin: { submit: 'Ingresar', description: 'Ingresá con tu email y contraseña.' },
  signup: { submit: 'Crear cuenta', description: 'Creá tu cuenta para empezar.' },
  reset: { submit: 'Enviar email', description: 'Te enviamos un enlace para restablecer tu contraseña.' },
}

export function LoginForm({ disabled = false }: { disabled?: boolean }) {
  const { signIn, signUp, resetPassword } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)

  const switchMode = (next: Mode) => {
    setMode(next)
    setPassword('')
    setConfirm('')
    setMessage(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (mode === 'signup') {
      if (password.length < 6) return setMessage({ tone: 'error', text: 'La contraseña debe tener al menos 6 caracteres.' })
      if (password !== confirm) return setMessage({ tone: 'error', text: 'Las contraseñas no coinciden.' })
    }

    setLoading(true)
    const { error } =
      mode === 'signin'
        ? await signIn(email, password)
        : mode === 'signup'
          ? await signUp(email, password)
          : await resetPassword(email)
    setLoading(false)

    if (error) return setMessage({ tone: 'error', text: error })
    if (mode === 'signup') setMessage({ tone: 'success', text: 'Te enviamos un email para confirmar tu cuenta.' })
    if (mode === 'reset') setMessage({ tone: 'success', text: 'Si el email existe, vas a recibir un enlace en unos minutos.' })
  }

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((v) => !v)}
      className="rounded-md p-2 text-subtle hover:text-fg"
      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
    >
      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  )

  return (
    <div>
      {mode !== 'reset' && (
        <SegmentedControl
          className="mb-5 flex w-full"
          ariaLabel="Tipo de acceso"
          value={mode}
          onChange={switchMode}
          options={[
            { value: 'signin', label: 'Ingresar' },
            { value: 'signup', label: 'Crear cuenta' },
          ]}
        />
      )}

      <p className="mb-4 text-sm text-muted">{titles[mode].description}</p>

      {message && (
        <div
          role={message.tone === 'error' ? 'alert' : 'status'}
          className={cn(
            'mb-4 rounded-lg border px-3 py-2.5 text-sm',
            message.tone === 'error'
              ? 'border-danger/30 bg-danger/10 text-danger'
              : 'border-success/30 bg-success/10 text-success',
          )}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="h-4 w-4" />}
          placeholder="tu@email.com"
          disabled={disabled}
        />

        {mode !== 'reset' && (
          <Input
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="h-4 w-4" />}
            trailing={passwordToggle}
            disabled={disabled}
          />
        )}

        {mode === 'signup' && (
          <Input
            label="Repetir contraseña"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            icon={<Lock className="h-4 w-4" />}
            disabled={disabled}
          />
        )}

        <Button type="submit" size="lg" className="w-full" loading={loading} disabled={disabled}>
          {titles[mode].submit}
        </Button>
      </form>

      <div className="mt-4 text-center">
        {mode === 'signin' && (
          <button type="button" onClick={() => switchMode('reset')} className="text-sm text-accent hover:underline">
            ¿Olvidaste tu contraseña?
          </button>
        )}
        {mode === 'reset' && (
          <button type="button" onClick={() => switchMode('signin')} className="text-sm text-accent hover:underline">
            Volver a ingresar
          </button>
        )}
      </div>
    </div>
  )
}
