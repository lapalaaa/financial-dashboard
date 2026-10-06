import { useState } from 'react'
import { PieChart, Plus, Receipt } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { EmptyState } from '../../components/ui/States'
import { PageHeader } from '../../layouts/PageHeader'
import { formatMoney } from '../../lib/format'

// Esqueleto visual. Gastos, categorías y cuentas llegan en las fases 1 y 2.
type PeriodPreset = 'this-month' | 'last-month' | 'last-30' | 'custom'

const PERIODS: Array<{ value: PeriodPreset; label: string }> = [
  { value: 'this-month', label: 'Este mes' },
  { value: 'last-month', label: 'Mes anterior' },
  { value: 'last-30', label: '30 días' },
  { value: 'custom', label: 'Otro' },
]

export default function FinancePage() {
  const [period, setPeriod] = useState<PeriodPreset>('this-month')

  return (
    <>
      <PageHeader
        title="Finanzas"
        description="Tus gastos del período."
        actions={
          <Button icon={<Plus className="h-4 w-4" />} disabled title="Disponible próximamente">
            Agregar gasto
          </Button>
        }
      />

      <SegmentedControl
        ariaLabel="Período"
        value={period}
        onChange={setPeriod}
        options={PERIODS}
        className="mb-4 flex w-full sm:inline-flex sm:w-auto"
      />

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader title="Total gastado" />
          <CardBody>
            <p className="tabular text-3xl font-semibold tracking-tight">{formatMoney(0)}</p>
            <p className="mt-1 text-sm text-muted">0 gastos en el período</p>
          </CardBody>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader title="Por categoría" />
          <EmptyState
            className="py-6"
            icon={<PieChart className="h-5 w-5" />}
            title="Sin datos para mostrar"
            description="El gráfico aparece cuando registres gastos."
          />
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="Gastos recientes" />
        <EmptyState
          icon={<Receipt className="h-5 w-5" />}
          title="Todavía no hay gastos"
          description="Cuando agregues un gasto, lo vas a ver acá."
        />
      </Card>
    </>
  )
}
