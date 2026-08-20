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

// Función de cierre de sesión
export const logout = () => {}