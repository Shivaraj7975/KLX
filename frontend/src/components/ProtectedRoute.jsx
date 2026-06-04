import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

const ProtectedRoute = ({ roles, adminOnly = false, children }) => {
  const { isAuthenticated, role, isAdmin, getHomeForRole } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    const returnTo = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />
  }

  if (roles && roles.length > 0 && !roles.includes(role)) {
    return <Navigate to={getHomeForRole(role)} replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to={getHomeForRole(role)} replace />
  }

  return children
}

export default ProtectedRoute
