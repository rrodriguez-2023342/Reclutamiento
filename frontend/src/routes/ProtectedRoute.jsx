import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

// Componente de ruta protegida que verifica la autenticación del usuario.
function ProtectedRoute({ children }) {
  const { loading, isAuthenticated, authError, refreshUser } = useAuth()

  if (loading) {
    return (
      <div className="flex h-dvh items-center justify-center font-sans text-text-main">
        Cargando...
      </div>
    )
  }

  if (authError) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg p-6 font-sans text-text-main">
        <div className="w-full max-w-lg rounded-[10px] border border-danger bg-surface p-8 text-center">
          <p role="alert" className="font-semibold text-danger">{authError}</p>
          <button
            type="button"
            onClick={refreshUser}
            className="mt-5 rounded-[8px] bg-action px-5 py-3 font-semibold text-white transition hover:bg-ink"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute