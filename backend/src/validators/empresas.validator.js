import { z } from 'zod'

// Schemas de validacion para empresas
export const createEmpresaSchema = z.object({
  nombre_empresa: z.string().trim().min(1, 'El nombre de la empresa es requerido').max(150),
  detalle_empresa: z.string().trim().max(5000).nullish(),
  activo: z.boolean().nullish(),
})

// Schema de validacion para actualizar empresa
export const updateEmpresaSchema = z.object({
  nombre_empresa: z.string().trim().min(1, 'El nombre de la empresa es requerido').max(150).nullish(),
  detalle_empresa: z.string().trim().max(5000).nullish(),
  activo: z.boolean().nullish(),
})

// Schema de validacion para listar empresas con query params
export const listarEmpresasQuerySchema = z
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
