import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

// Componente de ruta protegida que verifica la autenticación del usuario.
function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center font-sans text-[#071b3b]">
        Cargando...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute