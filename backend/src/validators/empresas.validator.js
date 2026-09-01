import { z } from 'zod'

// Funcion para validar texto opcional con longitud maxima
const textoOpcional = (max) => z.string().trim().max(max).nullish()

// Schemas de validacion para empresas
export const createEmpresaSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido').max(150),
  direccion: textoOpcional(5000),
  telefono: z.string().trim().regex(/^[\d\s()+-]{7,20}$/, 'Teléfono inválido').nullish(),
  activo: z.boolean().nullish(),
})

// Schema de validacion para actualizar empresa
export const updateEmpresaSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es requerido').max(150).optional(),
  direccion: textoOpcional(5000),
  telefono: z.string().trim().regex(/^[\d\s()+-]{7,20}$/, 'Teléfono inválido').optional(),
  activo: z.boolean().optional(),
})

// Schema de validacion para listar empresas con query params
export const listarEmpresasQuerySchema = z
  .object({
    page: z.coerce.number({ error: 'Página inválida' }).int().min(1).default(1),
    limit: z.coerce.number({ error: 'Límite inválido' }).int().min(1).max(100).default(10),
    q: z.string().trim().max(100).optional(),
    activa: z.coerce.boolean().optional(),
  })
  .transform((query) => ({
    ...query,
    q: query.q || undefined,
    activa: query.activa !== undefined ? query.activa : undefined,
  }))
