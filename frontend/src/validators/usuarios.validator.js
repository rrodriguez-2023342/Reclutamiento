import { z } from 'zod'

// Esquema de validacion del usuario
export const usuarioSchema = z.object({
    nombre: z.string().trim().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
    correo: z.string().trim().min(1, 'El correo es requerido').email('Correo inválido'),
    rol_id: z.coerce.number({ error: 'Seleccione un rol válido' }).int('Seleccione un rol válido').positive('Seleccione un rol válido'),
    activo: z.boolean().default(true),
    empresa_id: z.coerce.number().int().positive().nullish(),
    patrono_id: z.coerce.number().int().positive().nullish(),
    fecha_nacimiento: z.string().nullish(),
    sexo: z.enum(['MASCULINO', 'FEMENINO']).nullish(),
    dpi: z.string().trim().max(20).nullish(),
    dpi_extendido_en: z.string().trim().max(100).nullish(),
    direccion: z.string().trim().nullish(),
    sueldo: z.coerce.number().positive().nullish(),
    bonos: z.coerce.number().positive().nullish(),
    motivo_cambio_sueldo: z.string().trim().nullish(),
    motivo_cambio_empresa: z.string().trim().nullish(),
})

// Valores iniciales del formulario
export const defaultUsuarioValues = {
    nombre: '',
    correo: '',
    rol_id: 2,
    activo: true,
    empresa_id: null,
    patrono_id: null,
    fecha_nacimiento: '',
    sexo: '',
    dpi: '',
    dpi_extendido_en: '',
    direccion: '',
    sueldo: '',
    bonos: '',
    motivo_cambio_sueldo: '',
    motivo_cambio_empresa: '',
}
