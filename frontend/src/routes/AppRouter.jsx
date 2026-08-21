import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/auth/Login.jsx'
import ChangePassword from '../pages/auth/ChangePassword.jsx'
import ForgotPassword from '../pages/auth/ForgotPassword.jsx'
import ResetPassword from '../pages/auth/ResetPassword.jsx'
import PublicRoute from './PublicRoute.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import { useAuth } from '../hooks/useAuth.js'

// Componente temporal de dashboard
function DashboardTemporal() {
  const { user, logout } = useAuth()

  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-6 bg-[#f5f7fb] px-4 font-sans text-[#071b3b]">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard temporal</h1>
      <p className="text-lg text-[#65738c]">
        Bienvenido, <span className="font-semibold text-[#071b3b]">{user?.nombre}</span> ({user?.rol})
      </p>
      <button
        type="button"
        onClick={logout}
        className="rounded-xl bg-[#1e3a8a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#182f70]"
      >
        Cerrar sesión
      </button>
    </div>
  )
}

// Wrapper para redirigir si mustChangePassword
function ProtectedWithPasswordCheck({ children }) {
  const { user } = useAuth()
  if (user?.mustChangePassword) {
    return <Navigate to="/cambiar-password" replace state={{ fromLogin: true }} />
  }
  return children
}

// Rutas de la aplicación.
function AppRouter() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/recuperar"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password/:token"
        element={<ResetPassword />}
      />

      {/* Rutas protegidas con verificación de cambio de contraseña obligatorio */}
      <Route
        path="/cambiar-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ProtectedWithPasswordCheck>
              <DashboardTemporal />
            </ProtectedWithPasswordCheck>
          </ProtectedRoute>
        }
      />

      {/* Catch-all: si autenticado va a dashboard, si no a login */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default AppRouter
