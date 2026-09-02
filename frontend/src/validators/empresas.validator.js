import { z } from 'zod'

// Definicion del esquema de validacion para una empresa
export const empresaSchema = z.object({
    nombre: z.string().trim().min(1, 'El nombre es requerido').max(150, 'El nombre no puede exceder 150 caracteres'),
    direccion: z.string().trim().max(5000).nullish(),
    telefono: z.string().trim().regex(/^[\d\s()+-]{7,20}$/, 'Teléfono inválido').nullish(),
    activo: z.boolean().default(true),
})

// Valores por defecto para una empresa
export const defaultEmpresaValues = {
    nombre: '',
    direccion: '',
    telefono: '',
    activo: true,
}
