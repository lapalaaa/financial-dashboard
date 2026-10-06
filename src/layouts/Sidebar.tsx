import { NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Logo } from '../components/Logo'
import { useAuth } from '../features/auth/authContext'
import { cn } from '../lib/cn'
import { NAV_ITEMS } from './navItems'

/** Navegación lateral fija, visible desde `md` (≥ 768 px). */
export function Sidebar() {
  const { user, signOut } = useAuth()

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-surface md:flex">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>

      <nav aria-label="Principal" className="flex-1 space-y-0.5 px-3 py-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                isActive ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-surface-2 hover:text-fg',
              )
            }
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-sm font-semibold uppercase text-muted">
            {user?.email.charAt(0) || '?'}
          </div>
          <p className="min-w-0 flex-1 truncate text-sm text-muted" title={user?.email}>
            {user?.email}
          </p>
          <button
            type="button"
            onClick={() => void signOut()}
            className="rounded-lg p-2 text-subtle hover:bg-surface-2 hover:text-fg"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
