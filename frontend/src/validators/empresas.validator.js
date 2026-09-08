import { z } from 'zod'

// Definicion del esquema de validacion para una empresa
export const empresaSchema = z.object({
    nombre_empresa: z.string().trim().min(1, 'El nombre de la empresa es requerido').max(150, 'El nombre no puede exceder 150 caracteres'),
    detalle_empresa: z.string().trim().max(5000).nullish(),
    activo: z.boolean().default(true),
})

// Valores por defecto para una empresa
export const defaultEmpresaValues = {
    nombre_empresa: '',
    detalle_empresa: '',
    activo: true,
}
