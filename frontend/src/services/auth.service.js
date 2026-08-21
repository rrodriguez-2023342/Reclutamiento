import api from './api.js'

// Función de inicio de sesión: envía las credenciales al backend y recibe el token y los datos del usuario.
export const login = async ({ usuario, password }) => {
  const { data } = await api.post('/auth/login', { usuario, password })
  return data
}

// Función para obtener los datos del usuario autenticado usando el token guardado en localStorage.
export const getCurrentUser = async () => {
  const { data } = await api.get('/auth/me')
  return data.user
}

// Función de cierre de sesión: llama al backend y limpia el token en el interceptor
export const logout = async () => {
  await api.post('/auth/logout')
}

// Cambiar contraseña (usuario autenticado)
export const changePassword = async ({ currentPassword, newPassword }) => {
  const { data } = await api.put('/auth/change-password', { currentPassword, newPassword })
  return data
}

// Solicitar reset de contraseña (forgot password)
export const forgotPassword = async (correo) => {
  const { data } = await api.post('/auth/forgot-password', { correo })
  return data
}

// Resetear contraseña con token
export const resetPassword = async (token, newPassword) => {
  const { data } = await api.post('/auth/reset-password', { token, newPassword })
  return data
}