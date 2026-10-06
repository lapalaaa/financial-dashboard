import { LogOut, UserRound } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../../components/ui/Card'
import { useAuth } from '../../auth/authContext'

export function SessionCard() {
  const { user, isDevSession, signOut } = useAuth()

  return (
    <Card>
      <CardHeader icon={<UserRound className="h-5 w-5" />} title="Sesión" />
      <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user?.email}</p>
          <p className="text-sm text-muted">
            {isDevSession ? 'Sesión local de desarrollo (sin Supabase).' : 'Sesión iniciada.'}
          </p>
        </div>
        <Button variant="secondary" size="sm" icon={<LogOut className="h-4 w-4" />} onClick={() => void signOut()}>
          Cerrar sesión
        </Button>
      </CardBody>
    </Card>
  )
}
