import { Home, Package, Settings, Wallet, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Solo coincide con la ruta exacta (para "/"). */
  end?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/productos', label: 'Productos', icon: Package },
  { to: '/finanzas', label: 'Finanzas', icon: Wallet },
  { to: '/ajustes', label: 'Ajustes', icon: Settings },
]
