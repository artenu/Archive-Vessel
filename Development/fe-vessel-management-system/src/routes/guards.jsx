import { Navigate, Outlet, useLocation } from 'react-router'
import { canAccessPath } from '../data/navigation'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export function RoleRoute({ path, children }) {
  const { user } = useAuth()
  if (!canAccessPath(user?.role, path)) {
    return <Navigate to="/unauthorized" replace />
  }
  return children
}
