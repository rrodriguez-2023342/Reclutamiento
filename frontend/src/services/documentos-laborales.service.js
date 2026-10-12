import api from './api.js'

export async function getCamposDocumento() {
  const { data } = await api.get('/documentos/campos')
  return data.data
}

export async function getDestinosDocumento() {
  const { data } = await api.get('/documentos/destinos-generacion')
  return data.data
}

export async function getTiposDocumento(params = {}) {
  const { data } = await api.get('/documentos/tipos', { params })
  return data.data
}

export async function crearTipoDocumento(tipo) {
  const { data } = await api.post('/documentos/tipos', tipo)
  return data.data
}

export async function actualizarTipoDocumento(id, cambios) {
  const { data } = await api.patch(`/documentos/tipos/${id}`, cambios)
  return data.data
}

export async function getVersionesPlantilla(tipoDocumentoId) {
  const { data } = await api.get(`/documentos/tipos/${tipoDocumentoId}/plantillas`)
  return data.data
}

export async function subirPlantilla(tipoDocumentoId, archivo, notasCambio) {
  const formData = new FormData()
  formData.append('archivo', archivo)
  if (notasCambio) formData.append('notas_cambio', notasCambio)
  const { data } = await api.post(`/documentos/tipos/${tipoDocumentoId}/plantillas`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export async function cambiarEstadoPlantilla(id, estado) {
  const { data } = await api.patch(`/documentos/plantillas/${id}/estado`, { estado })
  return data.data
}

export async function eliminarVersionPlantilla(id) {
  const { data } = await api.delete(`/documentos/plantillas/${id}`)
  return data.data
}

export async function descargarPlantilla(id) {
  const { data } = await api.get(`/documentos/plantillas/${id}/descargar`, {
    responseType: 'blob',
  })
  return data
}

export async function solicitarDocumento(solicitud) {
  const { data } = await api.post('/documentos/solicitudes', solicitud)
  return data.data
}

export async function getMisSolicitudes() {
  const { data } = await api.get('/documentos/solicitudes/mias')
  return data.data
}

export async function getSolicitudes(params = {}) {
  const { data } = await api.get('/documentos/solicitudes', { params })
  return data.data
}

export async function getSolicitud(id) {
  const { data } = await api.get(`/documentos/solicitudes/${id}`)
  return data.data
}

export async function ponerSolicitudEnProceso(id) {
  const { data } = await api.patch(`/documentos/solicitudes/${id}/en-proceso`)
  return data.data
}

export async function rechazarSolicitud(id, motivo) {
  const { data } = await api.post(`/documentos/solicitudes/${id}/rechazar`, { motivo })
  return data.data
}

export async function previsualizarDocumento(datos) {
  const { data } = await api.post('/documentos/previsualizar', datos, {
    responseType: 'blob',
  })
  return data
}

export async function generarDocumento(datos) {
  const { data } = await api.post('/documentos/generar', datos)
  return data.data
}

export async function descargarDocumentoGenerado(id) {
  const { data } = await api.get(`/documentos/generados/${id}/descargar`, {
    responseType: 'blob',
  })
  return data
}

export async function getDocumentosGenerados(params = {}) {
  const { data } = await api.get('/documentos/generados', { params })
  return data.data
}

export async function eliminarDocumentoGenerado(id) {
  const { data } = await api.delete(`/documentos/generados/${id}`)
  return data.data
}
