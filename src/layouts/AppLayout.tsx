import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { LogoMark } from '../components/Logo'
import { APP_NAME } from '../lib/config'
import { BottomNav } from './BottomNav'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  const { pathname } = useLocation()

  // Al cambiar de sección, volver arriba.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-dvh">
      <Sidebar />

      {/* Barra superior mínima en celular */}
      <div className="sticky top-0 z-20 border-b border-border bg-bg/90 pt-safe backdrop-blur md:hidden">
        <div className="flex h-12 items-center gap-2 px-4">
          <LogoMark className="h-6 w-6" />
          <span className="text-sm font-semibold">{APP_NAME}</span>
        </div>
      </div>

      <main className="md:pl-60">
        <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-5 sm:px-6 md:px-8 md:pb-12 md:pt-8">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
