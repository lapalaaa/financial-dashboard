import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { FullScreenSpinner } from '../components/ui/Spinner'
import { useAuth } from '../features/auth/authContext'

/** Protege las rutas internas: sin sesión, redirige a /login recordando a dónde iba. */
export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullScreenSpinner />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  return <Outlet />
}
