import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-10 text-center', className)}>
      {icon && (
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-muted">
          {icon}
        </div>
      )}
      <p className="font-medium">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

interface ErrorStateProps {
  title?: ReactNode
  message?: ReactNode
  onRetry?: () => void
  className?: string
}

export function ErrorState({ title = 'Algo salió mal', message, onRetry, className }: ErrorStateProps) {
  return (
    <EmptyState
      className={className}
      icon={<AlertTriangle className="h-5 w-5 text-danger" />}
      title={title}
      description={message}
      action={
        onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            Reintentar
          </Button>
        )
      }
    />
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('rounded-md bg-surface-2', className)} />
}
