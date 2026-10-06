import { cn } from '../../lib/cn'

const sizes = { sm: 'h-4 w-4 border-2', md: 'h-6 w-6 border-2', lg: 'h-10 w-10 border-[3px]' }

export function Spinner({ size = 'md', className }: { size?: keyof typeof sizes; className?: string }) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={cn('inline-block animate-spin rounded-full border-current border-t-transparent', sizes[size], className)}
    />
  )
}

export function FullScreenSpinner({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 text-muted">
      <Spinner size="lg" className="text-accent" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
