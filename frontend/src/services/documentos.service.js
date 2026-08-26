import api from './api.js'

// Listar todos los documento de un postulante
export const getDocumentos = async (postulanteId) => {
  const { data } = await api.get(`/postulantes/${postulanteId}/documentos`)
  return data.data
}

// Obtener un documento especifico de un postulante
export const getDocumento = async (postulanteId, tipo) => {
  const { data } = await api.get(`/postulantes/${postulanteId}/documentos/${tipo}`)
  return data.data
}

// Subir un documento para un postulante
export const subirDocumento = async (postulanteId, tipo, archivo) => {
  const formData = new FormData()
  formData.append('tipo', tipo)
  formData.append('archivo', archivo)
  const { data } = await api.post(`/postulantes/${postulanteId}/documentos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

// Descargar un documento especifico de un postulante
export const descargarDocumento = async (postulanteId, tipo) => {
  const response = await api.get(`/postulantes/${postulanteId}/documentos/${tipo}/descargar`, {
    responseType: 'blob',
  })
  return response.data
}

// Eliminar un documento especifico de un postulante
export const eliminarDocumento = async (postulanteId, tipo) => {
  const { data } = await api.delete(`/postulantes/${postulanteId}/documentos/${tipo}`)
  return data
}