import { createContext, useCallback, useEffect, useState } from 'react'
import * as authService from '../services/auth.service.js'

// Contexto de autenticación para la aplicación.
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null)

// Proveedor de autenticación que maneja el estado del usuario y las funciones de inicio/cierre de sesión.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => !!localStorage.getItem('token'))
  const [authError, setAuthError] = useState('')

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setUser(null)
      setAuthError('')
      setLoading(false)
      return
    }

    setLoading(true)
    setAuthError('')
    try {
      const data = await authService.getCurrentUser()
      setUser(data)
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        setUser(null)
        setAuthError('Tu sesión expiró. Inicia sesión nuevamente.')
      } else {
        setAuthError('No fue posible verificar tu sesión. Revisa tu conexión e inténtalo de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!localStorage.getItem('token')) return undefined
    let active = true
    Promise.resolve().then(() => {
      if (active) refreshUser()
    })
    return () => {
      active = false
    }
  }, [refreshUser])

  // Función de inicio de sesión: guarda el token y establece el usuario.
  const login = useCallback(async (credentials) => {
    const { token, user: userData } = await authService.login(credentials)
    localStorage.setItem('token', token)
    setUser(userData)
    setAuthError('')
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
    authError,
    refreshUser,
    login,
    logout,
    changePassword,
    forgotPassword,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
