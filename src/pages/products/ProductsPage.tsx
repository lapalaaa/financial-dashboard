import { Link } from 'react-router-dom'
import { Database, ScanBarcode, Search } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { buttonClasses } from '../../components/ui/buttonStyles'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { EmptyState } from '../../components/ui/States'
import { PageHeader } from '../../layouts/PageHeader'

// Esqueleto visual. La conexión con las planillas y la búsqueda llegan en las fases 3 y 4.
const SOURCES = [
  { slot: 'A', label: 'Fuente A' },
  { slot: 'B', label: 'Fuente B' },
]

export default function ProductsPage() {
  return (
    <>
      <PageHeader title="Productos" description="Consultá un producto y registrá cuánto tenés físicamente." />

      <Input
        aria-label="Buscar producto"
        type="search"
        inputMode="search"
        placeholder="Nombre, SKU o código de barras"
        icon={<Search className="h-4 w-4" />}
        className="h-12 text-base"
        disabled
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {SOURCES.map((s) => (
          <Badge key={s.slot}>
            <Database className="h-3 w-3" />
            {s.label}: sin configurar
          </Badge>
        ))}
      </div>

      <Card className="mt-6">
        <EmptyState
          icon={<ScanBarcode className="h-5 w-5" />}
          title="Conectá tus plantillas para empezar a buscar"
          description="Configurá las dos fuentes de Google Sheets en Ajustes. La app solo lee los datos: nunca modifica las planillas."
          action={
            <Link to="/ajustes" className={buttonClasses('secondary')}>
              Ir a Ajustes
            </Link>
          }
        />
      </Card>
    </>
  )
}
