import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import ChangePassword from '../pages/auth/ChangePassword.jsx'
import ForgotPassword from '../pages/auth/ForgotPassword.jsx'
import Login from '../pages/auth/Login.jsx'
import ResetPassword from '../pages/auth/ResetPassword.jsx'
import Dashboard from '../pages/dashboard/Dashboard.jsx'
import Postulantes from '../pages/postulantes/Postulantes.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import PublicRoute from './PublicRoute.jsx'

function ProtectedWithPasswordCheck({ children }) {
  const { user } = useAuth()

  if (user?.mustChangePassword) {
    return <Navigate to="/cambiar-password" replace />
  }

  return children
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/recuperar" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/cambiar-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><ProtectedWithPasswordCheck><Dashboard /></ProtectedWithPasswordCheck></ProtectedRoute>} />
      <Route path="/postulantes" element={<ProtectedRoute><ProtectedWithPasswordCheck><Postulantes /></ProtectedWithPasswordCheck></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default AppRouter
