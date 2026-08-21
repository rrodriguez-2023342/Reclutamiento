import { createContext, useCallback, useEffect, useState } from 'react'
import * as authService from '../services/auth.service.js'

// Contexto de autenticación para la aplicación.
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null)

// Proveedor de autenticación que maneja el estado del usuario y las funciones de inicio/cierre de sesión.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => !!localStorage.getItem('token'))

  // Al montar, si hay un token guardado, pedimos los datos del usuario
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      return
    }

    authService
      .getCurrentUser()
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem('token')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  // Función de inicio de sesión: guarda el token y establece el usuario.
  const login = useCallback(async (credentials) => {
    const { token, user: userData } = await authService.login(credentials)
    localStorage.setItem('token', token)
    setUser(userData)
    return userData
  }, [])

  // Cerrar sesión
  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      localStorage.removeItem('token')
      setUser(null)
    }
  }, [])

  // Operaciones de contraseña disponibles tanto dentro como fuera de sesión.
  const changePassword = useCallback(async (credentials) => {
    const result = await authService.changePassword(credentials)
    setUser((currentUser) => (
      currentUser ? { ...currentUser, mustChangePassword: false } : currentUser
    ))
    return result
  }, [])
  const forgotPassword = useCallback((correo) => authService.forgotPassword(correo), [])
  const resetPassword = useCallback((token, newPassword) => authService.resetPassword(token, newPassword), [])

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    changePassword,
    forgotPassword,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
