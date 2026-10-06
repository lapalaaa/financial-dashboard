import { createContext, useContext } from 'react'

export type ToastTone = 'info' | 'success' | 'error'

export interface ToastContextValue {
  toast: (message: string, tone?: ToastTone) => void
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}
