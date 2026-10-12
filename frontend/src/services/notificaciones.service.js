import api from './api.js'

export async function getNotificaciones() {
  const { data } = await api.get('/notificaciones')
  return data.data
}

export async function marcarNotificacionLeida(id) {
  const { data } = await api.patch(`/notificaciones/${id}/leer`)
  return data
}

export async function marcarTodasNotificacionesLeidas() {
  const { data } = await api.patch('/notificaciones/leer-todas')
  return data
}
