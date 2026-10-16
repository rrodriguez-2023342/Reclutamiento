import { z } from 'zod'

const id = z.coerce.number().int().positive('El identificador no es válido')

export const crearTipoDocumentoSchema = z.object({
  empresa_id: id.nullable().optional(),
  clave: z
    .string()
    .trim()
    .min(2, 'La clave debe tener al menos 2 caracteres')
    .max(80)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Use solo letras, números, guiones y guiones bajos'),
  nombre: z.string().trim().min(2).max(150),
  descripcion: z.string().trim().max(5000).nullable().optional(),
  visible_colaboradores: z.boolean().optional(),
})

export const actualizarTipoDocumentoSchema = z.object({
  nombre: z.string().trim().min(2).max(150).optional(),
  descripcion: z.string().trim().max(5000).nullable().optional(),
  activo: z.boolean().optional(),
  visible_colaboradores: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, 'Indique al menos un campo para actualizar')

export const subirPlantillaSchema = z.object({
  notas_cambio: z.string().trim().max(5000).optional(),
})

export const crearSolicitudDocumentoSchema = z.object({
  tipo_documento_id: id,
  comentario: z.string().trim().max(5000).optional(),
})

export const listarSolicitudesSchema = z.object({
  estado: z.enum(['PENDIENTE', 'EN_PROCESO', 'GENERADO', 'RECHAZADA']).optional(),
  tipo_documento_id: id.optional(),
  colaborador_id: id.optional(),
  empresa_id: id.optional(),
})

export const generarDocumentoSchema = z.object({
  solicitud_id: id.optional(),
  tipo_documento_id: id.optional(),
  plantilla_id: id,
  colaborador_id: id.optional(),
  empresa_id: id.optional(),
}).refine((data) => data.solicitud_id || (data.tipo_documento_id && data.colaborador_id), {
  message: 'Indique una solicitud o un colaborador y tipo de documento',
})

export const rechazarSolicitudSchema = z.object({
  motivo: z.string().trim().min(1, 'Indique el motivo del rechazo').max(5000),
})

export const listarTiposSchema = z.object({
  empresa_id: id.optional(),
  activo: z.enum(['true', 'false']).optional(),
})

// Tipos de documento permitidos
export const TIPOS_DOCUMENTO = [
  'FOTO',
  'ANTECEDENTES_PENALES',
  'CARTA_RECOMENDACION',
  'COPIA_DPI',
  'TARJETA_SALUD',
  'CURRICULUM',
]

// Mapeo de tipos de documento
const TIPOS_MIME = {
  FOTO: ['image/jpeg', 'image/png', 'image/webp'],
  ANTECEDENTES_PENALES: ['application/pdf'],
  CARTA_RECOMENDACION: ['application/pdf'],
  COPIA_DPI: ['application/pdf'],
  TARJETA_SALUD: ['application/pdf'],
  CURRICULUM: ['application/pdf'],
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
