import { z } from 'zod'

const campoOpcional = (schema) => z.preprocess(
  (valor) => typeof valor === 'string' && valor.trim() === '' ? undefined : valor,
  schema.nullish(),
)

// Schemas de validacion para patronos
export const createPatronoSchema = z.object({
  razon_social: z.string().trim().min(1, 'La razón social es requerida').max(150),
  numero_patronal: z.string().trim().max(50).nullish(),
  nit: campoOpcional(z.string().trim().regex(/^\d{7}-\d$/, 'NIT inválido (formato: 1234567-8)')),
  representante_legal: z.string().trim().max(150).nullish(),
  dpi_representante: campoOpcional(z.string().trim().regex(/^\d{13}$/, 'DPI inválido (13 dígitos)')),
  fecha_vencimiento_dpi: z.string().nullish(),
  fecha_nacimiento: z.string().nullish(),
  sexo: z.enum(['MASCULINO', 'FEMENINO']).nullish(),
  estado_civil: z.enum(['SOLTERO', 'CASADO', 'UNIDO', 'VIUDO', 'DIVORCIADO']).nullish(),
  profesion: z.string().trim().max(100).nullish(),
  dpi_extendido_en: z.string().trim().max(100).nullish(),
  direccion: z.string().trim().max(500).nullish(),
  telefono: campoOpcional(z.string().trim().regex(/^\d{8,15}$/, 'Teléfono inválido')),
  correo: campoOpcional(z.string().trim().email('Correo inválido').max(100)),
  activo: z.boolean().nullish(),
})

// Schema de validacion para actualizar patrono
export const updatePatronoSchema = z.object({
  razon_social: z.string().trim().min(1, 'La razón social es requerida').max(150).nullish(),
  numero_patronal: z.string().trim().max(50).nullish(),
  nit: campoOpcional(z.string().trim().regex(/^\d{7}-\d$/, 'NIT inválido (formato: 1234567-8)')),
  representante_legal: z.string().trim().max(150).nullish(),
  dpi_representante: campoOpcional(z.string().trim().regex(/^\d{13}$/, 'DPI inválido (13 dígitos)')),
  fecha_vencimiento_dpi: z.string().nullish(),
  fecha_nacimiento: z.string().nullish(),
  sexo: z.enum(['MASCULINO', 'FEMENINO']).nullish(),
  estado_civil: z.enum(['SOLTERO', 'CASADO', 'UNIDO', 'VIUDO', 'DIVORCIADO']).nullish(),
  profesion: z.string().trim().max(100).nullish(),
  dpi_extendido_en: z.string().trim().max(100).nullish(),
  direccion: z.string().trim().max(500).nullish(),
  telefono: campoOpcional(z.string().trim().regex(/^\d{8,15}$/, 'Teléfono inválido')),
  correo: campoOpcional(z.string().trim().email('Correo inválido').max(100)),
  activo: z.boolean().nullish(),
})

// Schema de validacion para listar patronos con query params
export const listarPatronosQuerySchema = z
  .object({
    page: z.coerce.number({ error: 'Página inválida' }).int().min(1).default(1),
    limit: z.coerce.number({ error: 'Límite inválido' }).int().min(1).max(100).default(10),
    q: z.string().trim().max(100).optional(),
    activo: z.string().optional(),
  })
  .transform((query) => ({
    ...query,
    q: query.q || undefined,
    activo: query.activo !== undefined ? query.activo === 'true' : undefined,
  }))
