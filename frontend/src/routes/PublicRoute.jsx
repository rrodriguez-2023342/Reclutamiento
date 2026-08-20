import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

// Componente de ruta pública que redirige a /dashboard si el usuario ya está autenticado.
function PublicRoute({ children }) {
  const { loading, isAuthenticated } = useAuth()

  // Mientras se carga el estado de autenticación, no renderizamos nada.
  if (loading) {
    return null
  }

  // Si el usuario está autenticado, redirigimos a /dashboard.
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default PublicRoute