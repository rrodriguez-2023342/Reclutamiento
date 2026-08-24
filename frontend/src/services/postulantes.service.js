import api from './api.js'

export const getPostulantes = async (params) => {
  const { data } = await api.get('/postulantes', { params })
  return data.data
}

export const getPlazasPostulantes = async () => {
  const { data } = await api.get('/postulantes/plazas')
  return data.data
}
