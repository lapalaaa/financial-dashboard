import { APP_NAME } from '../lib/config'
import { cn } from '../lib/cn'

/** Marca de la app: el mismo dibujo que public/favicon.svg. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn('h-8 w-8 shrink-0', className)}>
      <rect width="32" height="32" rx="8" className="fill-accent" />
      <g fill="none" strokeWidth="2" strokeLinejoin="round" className="stroke-accent-fg">
        <path d="M9 11.5 16 8l7 3.5v9L16 24l-7-3.5z" />
        <path d="M9 11.5 16 15l7-3.5M16 15v9" />
      </g>
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="text-base font-semibold tracking-tight">{APP_NAME}</span>
    </span>
  )
}
