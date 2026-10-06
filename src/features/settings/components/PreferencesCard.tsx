import type { ReactNode } from 'react'
import { Monitor, Moon, SlidersHorizontal, Sun } from 'lucide-react'
import { Card, CardBody, CardHeader } from '../../../components/ui/Card'
import { SegmentedControl } from '../../../components/ui/SegmentedControl'
import { Select } from '../../../components/ui/Select'
import { useToast } from '../../../components/ui/toastContext'
import { formatDate, formatMoney } from '../../../lib/format'
import type { DefaultPeriodValue, ThemeValue } from '../../../types/database'
import { errorMessage } from '../services'
import { useSettings } from '../settingsContext'
import type { Preferences } from '../types'

const THEME_OPTIONS: Array<{ value: ThemeValue; label: string; icon: ReactNode }> = [
  { value: 'light', label: 'Claro', icon: <Sun className="h-3.5 w-3.5" /> },
  { value: 'dark', label: 'Oscuro', icon: <Moon className="h-3.5 w-3.5" /> },
  { value: 'system', label: 'Sistema', icon: <Monitor className="h-3.5 w-3.5" /> },
]

const PERIOD_OPTIONS: Array<{ value: DefaultPeriodValue; label: string }> = [
  { value: 'this-month', label: 'Este mes' },
  { value: 'last-month', label: 'Mes anterior' },
  { value: 'last-30', label: 'Últimos 30 días' },
]

const CACHE_OPTIONS = [
  { value: '0', label: 'Cada vez que abro Productos' },
  { value: '15', label: 'Cada 15 minutos' },
  { value: '60', label: 'Cada 1 hora' },
  { value: '360', label: 'Cada 6 horas' },
  { value: '1440', label: 'Una vez por día' },
]

function Row({ label, hint, children }: { label: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-sm text-muted">{hint}</p>}
      </div>
      <div className="shrink-0 sm:w-64 sm:text-right">{children}</div>
    </div>
  )
}

export function PreferencesCard() {
  const { preferences, updatePreferences } = useSettings()
  const { toast } = useToast()

  const save = async (patch: Partial<Preferences>) => {
    try {
      await updatePreferences(patch)
    } catch (e) {
      toast(errorMessage(e), 'error')
    }
  }

  const cacheValue = CACHE_OPTIONS.some((o) => o.value === String(preferences.catalogCacheMinutes))
    ? String(preferences.catalogCacheMinutes)
    : '60'

  return (
    <Card>
      <CardHeader icon={<SlidersHorizontal className="h-5 w-5" />} title="Preferencias" />
      <CardBody className="divide-y divide-border">
        <Row label="Tema" hint="“Sistema” sigue la configuración de tu dispositivo.">
          <SegmentedControl
            ariaLabel="Tema"
            value={preferences.theme}
            onChange={(theme) => void save({ theme })}
            options={THEME_OPTIONS}
            size="sm"
          />
        </Row>
        <Row label="Período inicial en Finanzas">
          <Select
            aria-label="Período inicial en Finanzas"
            value={preferences.defaultPeriod}
            onChange={(e) => void save({ defaultPeriod: e.target.value as DefaultPeriodValue })}
            options={PERIOD_OPTIONS}
          />
        </Row>
        <Row label="Actualizar catálogo de productos" hint="Cada cuánto se vuelven a leer las planillas.">
          <Select
            aria-label="Actualizar catálogo de productos"
            value={cacheValue}
            onChange={(e) => void save({ catalogCacheMinutes: Number(e.target.value) })}
            options={CACHE_OPTIONS}
          />
        </Row>
        <Row label="Moneda">
          <span className="text-sm text-muted">Peso argentino (ARS)</span>
        </Row>
        <Row label="Formato regional" hint={`${formatMoney(1234.5)} · ${formatDate(new Date())}`}>
          <span className="text-sm text-muted">Español (Argentina)</span>
        </Row>
      </CardBody>
    </Card>
  )
}
