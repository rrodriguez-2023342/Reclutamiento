import api from './api.js'

// Obtener lista de postulantes
export const getPostulantes = async (params) => {
  const { data } = await api.get('/postulantes', { params })
  return data.data
}

// Obtener lista de plazas para postulantes
export const getPlazasPostulantes = async () => {
  const { data } = await api.get('/postulantes/plazas')
  return data.data
}

// Crear un nuevo postulante
export const createPostulante = async (postulante) => {
  const { data } = await api.post('/postulantes', postulante)
  return data.data
}
