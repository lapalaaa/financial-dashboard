import type { ReactNode } from 'react'
import { ToastProvider } from '../components/ui/ToastProvider'
import { AuthProvider } from '../features/auth/AuthProvider'
import { SettingsProvider } from '../features/settings/SettingsProvider'
import { ThemeProvider } from './ThemeProvider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <SettingsProvider>{children}</SettingsProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
