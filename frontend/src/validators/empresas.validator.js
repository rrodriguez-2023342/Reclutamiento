import { z } from 'zod'

// Definicion del esquema de validacion para una empresa
export const empresaSchema = z.object({
    nombre_empresa: z.string().trim().min(1, 'El nombre de la empresa es requerido').max(150, 'El nombre no puede exceder 150 caracteres'),
    detalle_empresa: z.string().trim().max(5000).nullish(),
    direccion: z.string().trim().max(5000).nullish(),
    telefono: z.string().trim().max(20).nullish(),
    correo: z.string().trim().email('Correo inválido').max(100).nullish().or(z.literal('')),
    fecha_aniversario: z.string().nullish(),
    activo: z.boolean().default(true),
})

// Valores por defecto para una empresa
export const defaultEmpresaValues = {
    nombre_empresa: '',
    detalle_empresa: '',
    direccion: '',
    telefono: '',
    correo: '',
    fecha_aniversario: '',
    activo: true,
}
