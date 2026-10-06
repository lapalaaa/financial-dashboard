import { HardDrive } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { ErrorState, Skeleton } from '../../components/ui/States'
import { AccountManager } from '../../features/settings/components/AccountManager'
import { CategoryManager } from '../../features/settings/components/CategoryManager'
import { PreferencesCard } from '../../features/settings/components/PreferencesCard'
import { ProductSourcesSection } from '../../features/settings/components/ProductSourcesSection'
import { SessionCard } from '../../features/settings/components/SessionCard'
import { useSettings } from '../../features/settings/settingsContext'
import { PageHeader } from '../../layouts/PageHeader'

function LoadingSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Cargando configuración">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { status, error, isLocal, reload } = useSettings()

  return (
    <>
      <PageHeader title="Ajustes" description="Fuentes de datos, finanzas y preferencias." />

      {isLocal && (
        <div className="mb-4 flex gap-2.5 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2.5 text-sm text-warning">
          <HardDrive className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Modo desarrollo sin Supabase: los cambios se guardan solo en este navegador.</p>
        </div>
      )}

      {status === 'error' ? (
        // La sesión queda accesible: en celular es el único lugar para cerrarla.
        <div className="space-y-4">
          <Card>
            <ErrorState title="No se pudo cargar la configuración" message={error} onRetry={() => void reload()} />
          </Card>
          <SessionCard />
        </div>
      ) : status !== 'ready' ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-6">
          <ProductSourcesSection />
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
            <CategoryManager />
            <AccountManager />
          </div>
          <PreferencesCard />
          <SessionCard />
        </div>
      )}
    </>
  )
}
