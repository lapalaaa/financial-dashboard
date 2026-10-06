import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { buttonClasses } from '../components/ui/buttonStyles'
import { EmptyState } from '../components/ui/States'

export default function NotFoundPage() {
  return (
    <EmptyState
      className="py-20"
      icon={<Compass className="h-5 w-5" />}
      title="Página no encontrada"
      description="La dirección no existe o fue movida."
      action={
        <Link to="/" className={buttonClasses('secondary')}>
          Volver al inicio
        </Link>
      }
    />
  )
}
