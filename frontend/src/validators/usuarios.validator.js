import { z } from 'zod'

// Esquema de validacion del usuario
export const usuarioSchema = z.object({
    nombre: z.string().trim().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
    correo: z.string().trim().min(1, 'El correo es requerido').email('Correo inválido'),
    rol_id: z.coerce.number({ error: 'Seleccione un rol válido' }).int('Seleccione un rol válido').positive('Seleccione un rol válido'),
    activo: z.boolean().default(true),
})

// Valores iniciales del formulario
export const defaultUsuarioValues = {
    nombre: '',
    correo: '',
    rol_id: 2,
    activo: true,
}
