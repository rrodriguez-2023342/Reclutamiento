import { z } from 'zod'

// Definicion del esquema de validacion para un patrono
export const patronoSchema = z.object({
    razon_social: z.string().trim().min(1, 'La razón social es requerida').max(150, 'La razón social no puede exceder 150 caracteres'),
    numero_patronal: z.string().trim().max(50).nullish(),
    nit: z.string().trim().regex(/^\d{7}-\d$/, 'NIT inválido (formato: 1234567-8)').nullish(),
    representante_legal: z.string().trim().max(150).nullish(),
    dpi_representante: z.string().trim().regex(/^\d{13}$/, 'DPI inválido (13 dígitos)').nullish(),
    fecha_vencimiento_dpi: z.string().nullish(),
    fecha_nacimiento: z.string().nullish(),
    sexo: z.enum(['MASCULINO', 'FEMENINO']).nullish(),
    estado_civil: z.enum(['SOLTERO', 'CASADO', 'UNIDO', 'VIUDO', 'DIVORCIADO']).nullish(),
    profesion: z.string().trim().max(100).nullish(),
    dpi_extendido_en: z.string().trim().max(100).nullish(),
    activo: z.boolean().default(true),
})

// Valores por defecto para un patrono
export const defaultPatronoValues = {
    razon_social: '',
    numero_patronal: '',
    nit: '',
    representante_legal: '',
    dpi_representante: '',
    fecha_vencimiento_dpi: '',
    fecha_nacimiento: '',
    sexo: undefined,
    estado_civil: undefined,
    profesion: '',
    dpi_extendido_en: '',
    activo: true,
}
