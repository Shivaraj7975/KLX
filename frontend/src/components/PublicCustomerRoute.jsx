import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

const PublicCustomerRoute = ({ children }) => {
  const { isAuthenticated, role, getHomeForRole } = useAuth()
  const location = useLocation()

  if (isAuthenticated) {
    return <Navigate to={getHomeForRole(role)} replace state={{ from: location }} />
  }

  return children
}

export default PublicCustomerRoute
