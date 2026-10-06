import type { ReactNode } from 'react'
import { Database, LogOut, Monitor, Moon, Sun, Tags, UserRound, Wallet, SlidersHorizontal } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { EmptyState } from '../../components/ui/States'
import { useAuth } from '../../features/auth/authContext'
import { useTheme, type ThemePreference } from '../../hooks/useTheme'
import { PageHeader } from '../../layouts/PageHeader'
import { formatDate, formatMoney } from '../../lib/format'

function Row({ label, hint, children }: { label: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-sm text-muted">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

const THEME_OPTIONS: Array<{ value: ThemePreference; label: string; icon: ReactNode }> = [
  { value: 'light', label: 'Claro', icon: <Sun className="h-3.5 w-3.5" /> },
  { value: 'dark', label: 'Oscuro', icon: <Moon className="h-3.5 w-3.5" /> },
  { value: 'system', label: 'Sistema', icon: <Monitor className="h-3.5 w-3.5" /> },
]

export default function SettingsPage() {
  const { preference, setPreference } = useTheme()
  const { user, isDevSession, signOut } = useAuth()

  return (
    <>
      <PageHeader title="Ajustes" description="Fuentes de datos, finanzas y preferencias." />

      <div className="space-y-4">
        <Card>
          <CardHeader
            icon={<Database className="h-5 w-5" />}
            title="Fuentes de productos"
            description="Las dos plantillas de Google Sheets. Solo lectura."
          />
          <CardBody className="divide-y divide-border">
            {['Fuente A', 'Fuente B'].map((name) => (
              <Row key={name} label={name} hint="Planilla, pestaña y mapeo de columnas">
                <div className="flex items-center gap-2">
                  <Badge>Sin configurar</Badge>
                  <Button variant="secondary" size="sm" disabled title="Disponible próximamente">
                    Configurar
                  </Button>
                </div>
              </Row>
            ))}
          </CardBody>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader icon={<Tags className="h-5 w-5" />} title="Categorías" description="Para clasificar tus gastos." />
            <EmptyState className="py-6" title="Sin categorías" description="Vas a poder crearlas próximamente." />
          </Card>
          <Card>
            <CardHeader icon={<Wallet className="h-5 w-5" />} title="Cuentas" description="Desde dónde salió cada gasto." />
            <EmptyState className="py-6" title="Sin cuentas" description="Vas a poder crearlas próximamente." />
          </Card>
        </div>

        <Card>
          <CardHeader icon={<SlidersHorizontal className="h-5 w-5" />} title="Preferencias" />
          <CardBody className="divide-y divide-border">
            <Row label="Tema" hint="“Sistema” sigue la configuración de tu dispositivo.">
              <SegmentedControl
                ariaLabel="Tema"
                value={preference}
                onChange={setPreference}
                options={THEME_OPTIONS}
                size="sm"
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

        <Card>
          <CardHeader icon={<UserRound className="h-5 w-5" />} title="Cuenta" />
          <CardBody>
            <Row
              label={user?.email}
              hint={isDevSession ? 'Sesión local de desarrollo (sin Supabase).' : 'Sesión iniciada.'}
            >
              <Button variant="secondary" size="sm" icon={<LogOut className="h-4 w-4" />} onClick={() => void signOut()}>
                Cerrar sesión
              </Button>
            </Row>
          </CardBody>
        </Card>
      </div>
    </>
  )
}
