import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '../pages/auth/Login.jsx'
import PublicRoute from './PublicRoute.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import { useAuth } from '../hooks/useAuth.js'

// Componente temporal de dashboard para mostrar información del usuario autenticado.
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

// Rutas de la aplicación.
function AppRouter() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardTemporal />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default AppRouter