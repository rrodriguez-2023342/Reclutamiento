import axios from 'axios'

// Instancia de Axios configurada con la URL base del backend y los interceptores para manejar el token JWT y la sesión.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

// Interceptor de peticiones: agrega el token JWT si existe.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de respuestas: si el backend responde 401, limpiamos la sesión.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      // Si estamos en otra ruta distinta al login, redirigimos.
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api