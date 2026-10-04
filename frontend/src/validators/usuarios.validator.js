import { z } from 'zod'

const validarSeguros = (data, ctx) => {
    if (data.tipo_contrato === 'DEFINIDO' && !data.fecha_fin_contrato?.trim()) {
        ctx.addIssue({ code: 'custom', path: ['fecha_fin_contrato'], message: 'La fecha de finalización es requerida para un contrato definido' })
    }

    if (data.tiene_seguro_gastos_medicos) {
        if (!data.tipo_seguro_gastos_medicos) {
            ctx.addIssue({ code: 'custom', path: ['tipo_seguro_gastos_medicos'], message: 'Selecciona la modalidad del seguro médico' })
        }
        if (!data.empresa_seguro_gastos_medicos?.trim()) {
            ctx.addIssue({ code: 'custom', path: ['empresa_seguro_gastos_medicos'], message: 'La empresa aseguradora es requerida' })
        }
        if (!data.categoria_seguro_gastos_medicos?.trim()) {
            ctx.addIssue({ code: 'custom', path: ['categoria_seguro_gastos_medicos'], message: 'La categoría es requerida' })
        }
    }

    if (data.tiene_seguro_vida) {
        if (!data.empresa_seguro_vida?.trim()) {
            ctx.addIssue({ code: 'custom', path: ['empresa_seguro_vida'], message: 'La empresa aseguradora es requerida' })
        }
        if (!data.categoria_seguro_vida?.trim()) {
            ctx.addIssue({ code: 'custom', path: ['categoria_seguro_vida'], message: 'La categoría es requerida' })
        }
    }
}

// Esquema de validacion del usuario
export const usuarioSchema = z.object({
    nombre: z.string().trim().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
    correo: z.string().trim().min(1, 'El correo es requerido').email('Correo inválido'),
    rol_id: z.coerce.number({ error: 'Seleccione un rol válido' }).int('Seleccione un rol válido').positive('Seleccione un rol válido'),
    activo: z.boolean().default(true),
    empresa_id: z.coerce.number().int().positive().nullish(),
    patrono_id: z.coerce.number().int().positive().nullish(),
    fecha_nacimiento: z.string().nullish(),
    estado_civil: z.enum(['SOLTERO', 'CASADO', 'UNIDO', 'VIUDO', 'DIVORCIADO']).nullish().or(z.literal('')),
    nacionalidad: z.string().trim().max(100).nullish(),
    telefono: z.string().trim().max(20).nullish(),
    ultimo_grado_cursado: z.enum(['PRIMARIA', 'BASICOS', 'DIVERSIFICADO', 'TECNICO', 'LICENCIATURA', 'MAESTRIA', 'OTRO']).nullish().or(z.literal('')),
    fecha_contratacion: z.string().min(1, 'La fecha de contratación es requerida'),
    tipo_contrato: z.enum(['INDEFINIDO', 'DEFINIDO']).default('INDEFINIDO'),
    fecha_fin_contrato: z.string().nullish(),
    nit: z.string().trim().max(20).nullish(),
    numero_afiliacion_igss: z.string().trim().max(30).nullish(),
    sexo: z.enum(['MASCULINO', 'FEMENINO']).nullish(),
    dpi: z.string().trim().max(20).nullish(),
    dpi_extendido_en: z.string().trim().max(100).nullish(),
    direccion: z.string().trim().nullish(),
    sueldo: z.coerce.number().positive().nullish(),
    bonos: z.coerce.number().positive().nullish(),
    moneda_sueldo: z.enum(['QUETZAL', 'DOLAR']).default('QUETZAL'),
    banco: z.string().trim().max(100).nullish(),
    tipo_cuenta_bancaria: z.string().trim().max(50).nullish(),
    numero_cuenta_bancaria: z.string().trim().max(50).nullish(),
    contacto_emergencia_nombre: z.string().trim().max(150).nullish(),
    contacto_emergencia_telefono: z.string().trim().max(20).nullish(),
    motivo_cambio_sueldo: z.string().trim().nullish(),
    motivo_cambio_empresa: z.string().trim().nullish(),
    tiene_seguro_gastos_medicos: z.boolean().nullish(),
    empresa_seguro_gastos_medicos: z.string().trim().max(100).nullish(),
    tipo_seguro_gastos_medicos: z.enum(['INDIVIDUAL', 'FAMILIAR']).nullish().or(z.literal('')),
    categoria_seguro_gastos_medicos: z.string().trim().max(100).nullish(),
    tiene_seguro_vida: z.boolean().nullish(),
    empresa_seguro_vida: z.string().trim().max(100).nullish(),
    categoria_seguro_vida: z.string().trim().max(100).nullish(),
    puesto_id: z.coerce.number().int().positive().nullish(),
}).superRefine(validarSeguros)

// Valores iniciales del formulario
export const defaultUsuarioValues = {
    nombre: '',
    correo: '',
    rol_id: 2,
    activo: true,
    empresa_id: null,
    patrono_id: null,
    fecha_nacimiento: '',
    estado_civil: '',
    nacionalidad: '',
    telefono: '',
    ultimo_grado_cursado: '',
    fecha_contratacion: '',
    tipo_contrato: 'INDEFINIDO',
    fecha_fin_contrato: '',
    nit: '',
    numero_afiliacion_igss: '',
    sexo: '',
    dpi: '',
    dpi_extendido_en: '',
    direccion: '',
    sueldo: '',
    bonos: '',
    moneda_sueldo: 'QUETZAL',
    banco: '',
    tipo_cuenta_bancaria: '',
    numero_cuenta_bancaria: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    motivo_cambio_sueldo: '',
    motivo_cambio_empresa: '',
    tiene_seguro_gastos_medicos: false,
    empresa_seguro_gastos_medicos: '',
    tipo_seguro_gastos_medicos: '',
    categoria_seguro_gastos_medicos: '',
    tiene_seguro_vida: false,
    empresa_seguro_vida: '',
    categoria_seguro_vida: '',
    puesto_id: null,
}
