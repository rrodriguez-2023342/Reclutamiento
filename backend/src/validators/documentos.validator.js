import { z } from 'zod'

// Tipos de documento permitidos
export const TIPOS_DOCUMENTO = [
  'FOTO',
  'ANTECEDENTES_PENALES',
  'CARTA_RECOMENDACION',
  'COPIA_DPI',
  'TARJETA_SALUD',
]

// Mapeo de tipos de documento
const TIPOS_MIME = {
  FOTO: ['image/jpeg', 'image/png', 'image/webp'],
  ANTECEDENTES_PENALES: ['application/pdf'],
  CARTA_RECOMENDACION: ['application/pdf'],
  COPIA_DPI: ['application/pdf'],
  TARJETA_SALUD: ['application/pdf'],
}

const tipoSchema = z.enum(TIPOS_DOCUMENTO, { message: 'Tipo de documento inválido' })

// Schema para validar el tipo de documento en la carga
const tipoUploadSchema = z.object({
  tipo: tipoSchema,
})

// Funciones auxiliares para validar tipo de archivo y crear errores
function crearError(mensaje, status) {
  const error = new Error(mensaje)
  error.status = status
  return error
}

function validarTipoArchivo(tipo, mimeType) {
  const permitidos = TIPOS_MIME[tipo]
  if (!permitidos.includes(mimeType)) {
    throw crearError(`Formato inválido para ${tipo}. Permitidos: ${permitidos.join(', ')}`, 400)
  }
}

export const documentosValidator = {
  tipoUploadSchema,
  TIPOS_DOCUMENTO,
  TIPOS_MIME,
  validarTipoArchivo,
  crearError,
}
