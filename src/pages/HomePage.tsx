import { Link } from 'react-router-dom'
import { ArrowRight, Package, Plus, Wallet, type LucideIcon } from 'lucide-react'
import { buttonClasses } from '../components/ui/buttonStyles'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { PageHeader } from '../layouts/PageHeader'
import { formatDateLong, formatMoney, formatMonth } from '../lib/format'

function ModuleCard({ to, icon: Icon, title, description }: { to: string; icon: LucideIcon; title: string; description: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-card transition-colors hover:border-accent/40 sm:p-5"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">{title}</span>
        <span className="block text-sm text-muted">{description}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-subtle transition-colors group-hover:text-accent" />
    </Link>
  )
}

export default function HomePage() {
  const today = new Date()
  const dateLabel = formatDateLong(today)

  return (
    <>
      <PageHeader title="Inicio" description={dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)} />

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <ModuleCard
          to="/productos"
          icon={Package}
          title="Productos"
          description="Buscá un producto y registrá su stock físico"
        />
        <ModuleCard to="/finanzas" icon={Wallet} title="Finanzas" description="Registrá y revisá tus gastos" />
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Gastos del mes"
          description={formatMonth(today)}
          action={
            <Link to="/finanzas?nuevo=1" className={buttonClasses('secondary', 'sm')}>
              <Plus className="h-4 w-4" />
              Gasto
            </Link>
          }
        />
        <CardBody>
          <p className="tabular text-3xl font-semibold tracking-tight">{formatMoney(0)}</p>
          <p className="mt-1 text-sm text-muted">Todavía no registraste gastos este mes.</p>
        </CardBody>
      </Card>
    </>
  )
}
