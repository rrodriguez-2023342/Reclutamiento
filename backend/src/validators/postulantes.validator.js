import { z } from 'zod'

// Estados posibles de un postulante en el proceso de selección
export const ESTADOS_POSTULANTE = ['PENDIENTE', 'EN_PROCESO', 'CONTRATADO', 'RECHAZADO']

const ESTADOS_CIVILES = ['SOLTERO', 'CASADO', 'UNIDO', 'VIUDO', 'DIVORCIADO']
const TIPOS_VIVIENDA = ['PROPIA', 'ALQUILADA', 'FAMILIAR', 'OTRA']
const MEDIOS_ENTERADO = ['ANUNCIO', 'REFERENCIA', 'OTRO']
const PARENTESCOS = ['PADRE', 'MADRE', 'ESPOSO_A', 'HIJO_A', 'HERMANO_A', 'EMERGENCIA']
const NIVELES_EDUCATIVOS = ['PRIMARIA', 'BASICOS', 'DIVERSIFICADO', 'TECNICO', 'LICENCIATURA', 'MAESTRIA', 'OTRO']
const MOTIVOS_RETIRO = ['RENUNCIA', 'DESPIDO', 'REORGANIZACION', 'OTRO']

// Helpers reutilizables
const telefonoRegex = /^[\d\s()+-]{7,20}$/

const texto = (max) => z.string().trim().max(max)
const textoOpcional = (max) => texto(max).nullish()
const textoLibreOpcional = () => z.string().trim().max(5000).nullish()

const booleanoOpcional = () => z.boolean().nullish()
const enteroOpcional = (min, max) => z.coerce.number({ error: 'Debe ser un número' }).int('Debe ser un número entero').min(min).max(max).nullish()
const montoOpcional = () => z.coerce.number({ error: 'Debe ser un valor numérico' }).min(0, 'No puede ser negativo').max(99999999.99, 'El monto excede el máximo permitido').nullish()
const fechaOpcional = () => z.coerce.date({ error: 'Fecha inválida' }).nullish()

const telefonoSchema = z.string().trim().regex(telefonoRegex, 'Teléfono inválido')

// El DPI guatemalteco (CUI) tiene 13 dígitos; se permiten espacios y guiones como separadores
const dpiSchema = z
  .string({ error: 'El DPI es requerido' })
  .transform((valor) => valor.replace(/[\s-]/g, ''))
  .refine((valor) => /^\d{13}$/.test(valor), 'El DPI debe tener 13 dígitos')

const fechaNacimientoSchema = z.coerce
  .date({ error: 'Fecha de nacimiento inválida' })
  .refine((fecha) => fecha < new Date(), 'La fecha de nacimiento debe ser en el pasado')

// SECCIONES HIJAS

const datosFamiliaresSchema = z.object({
  parentesco: z.enum(PARENTESCOS, { error: 'Parentesco inválido' }),
  nombres_apellidos: z.string().trim().min(1, 'El nombre del familiar es requerido').max(150),
  edad: enteroOpcional(0, 120),
  direccion: textoLibreOpcional(),
  ocupacion: textoOpcional(100),
  telefono: telefonoSchema.nullish(),
})

const educacionHistorialSchema = z.object({
  nivel: z.enum(NIVELES_EDUCATIVOS, { error: 'Nivel educativo inválido' }),
  establecimiento: textoOpcional(150),
  ano_inicial: z.coerce.number({ error: 'Año inválido' }).int().min(1900).max(2100).nullish(),
  ano_final: z.coerce.number({ error: 'Año inválido' }).int().min(1900).max(2100).nullish(),
})

const idiomasSchema = z.object({
  idioma: z.string().trim().min(1, 'El idioma es requerido').max(50),
  habla: booleanoOpcional(),
  lee: booleanoOpcional(),
  escribe: booleanoOpcional(),
})

const capacitacionesSchema = z.object({
  nombre_curso: z.string().trim().min(1, 'El nombre del curso es requerido').max(150),
  establecimiento_pais: textoOpcional(150),
  tiempo_duracion: textoOpcional(50),
  fecha_inicial: fechaOpcional(),
  fecha_final: fechaOpcional(),
})

const experienciaLaboralSchema = z.object({
  empresa: z.string().trim().min(1, 'La empresa es requerida').max(150),
  puesto: z.string().trim().min(1, 'El puesto es requerido').max(100),
  direccion: textoLibreOpcional(),
  telefono: telefonoSchema.nullish(),
  jefe_inmediato: textoOpcional(150),
  fecha_ingreso: fechaOpcional(),
  fecha_retiro: fechaOpcional(),
  salario_inicial: montoOpcional(),
  salario_final: montoOpcional(),
  tareas_realizadas: textoLibreOpcional(),
  motivo_retiro: z.enum(MOTIVOS_RETIRO, { error: 'Motivo de retiro inválido' }).nullish(),
})

const referenciasPersonalesSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre de la referencia es requerido').max(150),
  telefono: telefonoSchema,
  direccion: textoLibreOpcional(),
})

// Creación de un postulante

export const createPostulanteSchema = z.object({
  // Datos personales (obligatorios)
  nombre_completo: z.string().trim().min(1, 'El nombre completo es requerido').max(150),
  direccion: z.string().trim().min(1, 'La dirección es requerida').max(5000),
  lugar_nacimiento: z.string().trim().min(1, 'El lugar de nacimiento es requerido').max(100),
  fecha_nacimiento: fechaNacimientoSchema,
  telefono: telefonoSchema,
  correo: z.string().trim().email('Correo inválido').max(100),
  estado_civil: z.enum(ESTADOS_CIVILES, { error: 'Estado civil inválido' }),
  dpi: dpiSchema,
  plaza_id: z.coerce.number({ error: 'Seleccione una plaza válida' }).int('Seleccione una plaza válida').positive('Seleccione una plaza válida'),

  // Identificación (opcionales)
  dpi_extendido_en: textoOpcional(100),
  nit: textoOpcional(20),
  igss: textoOpcional(20),
  perfil_facebook: textoOpcional(100),

  // Afiliaciones
  afiliacion_gremial: booleanoOpcional(),
  afiliacion_religiosa: booleanoOpcional(),
  afiliacion_politica: booleanoOpcional(),
  afiliacion_deportiva: booleanoOpcional(),

  // Salud y hábitos
  practica_deporte: booleanoOpcional(),
  deporte_cual: textoOpcional(100),
  ha_estado_enfermo_gravedad: booleanoOpcional(),
  toma_medicamento: booleanoOpcional(),
  fuma_o_bebe: booleanoOpcional(),
  fuma_bebe_frecuencia: textoOpcional(100),
  impedimento_fisico: booleanoOpcional(),

  // Situación socioeconómica
  personas_dependientes: enteroOpcional(0, 99),
  total_efectivo_hogar: montoOpcional(),
  vivienda_tipo: z.enum(TIPOS_VIVIENDA, { error: 'Tipo de vivienda inválido' }).nullish(),
  vivienda_valor: montoOpcional(),
  vivienda_renta_monto: montoOpcional(),
  tiene_vehiculo: booleanoOpcional(),
  licencia_tipo: textoOpcional(50),
  licencia_numero: textoOpcional(50),
  deudas_pendientes: booleanoOpcional(),
  deudas_monto: montoOpcional(),
  deudas_institucion: textoOpcional(150),
  detenido_policia: booleanoOpcional(),
  procesado_legalmente: booleanoOpcional(),

  // Aspiración laboral
  salario_aspira: montoOpcional(),
  fecha_inicio_disponible: fechaOpcional(),
  trabajar_extraordinario: booleanoOpcional(),
  trabajar_turnos_rotativos: booleanoOpcional(),
  medio_enterado: z.enum(MEDIOS_ENTERADO, { error: 'Medio enterado inválido' }).nullish(),
  porque_gustaria_trabajar: textoLibreOpcional(),
  porque_deberiamoss_contratar: textoLibreOpcional(),

  // Autoevaluación
  fortaleza_1: textoOpcional(255),
  fortaleza_2: textoOpcional(255),
  fortaleza_3: textoOpcional(255),
  debilidad_1: textoOpcional(255),
  debilidad_2: textoOpcional(255),
  debilidad_3: textoOpcional(255),

  // Secciones anidadas
  datosFamiliares: z.array(datosFamiliaresSchema).default([]),
  educacionHistorial: z.array(educacionHistorialSchema).default([]),
  idiomas: z.array(idiomasSchema).default([]),
  capacitaciones: z.array(capacitacionesSchema).default([]),
  experienciaLaboral: z.array(experienciaLaboralSchema).default([]),
  referenciasPersonales: z.array(referenciasPersonalesSchema).default([]),
})

// Actualización de un postulante (parcial, secciones opcionales)
export const updatePostulanteSchema = createPostulanteSchema
  .extend({
    datosFamiliares: z.array(datosFamiliaresSchema).nullish(),
    educacionHistorial: z.array(educacionHistorialSchema).nullish(),
    idiomas: z.array(idiomasSchema).nullish(),
    capacitaciones: z.array(capacitacionesSchema).nullish(),
    experienciaLaboral: z.array(experienciaLaboralSchema).nullish(),
    referenciasPersonales: z.array(referenciasPersonalesSchema).nullish(),
  })
  .partial()

  // Schema para actualizar el estado de un postulante
export const updateEstadoSchema = z.object({
  estado: z.enum(ESTADOS_POSTULANTE, { error: 'Estado inválido' }),
  empresa_id: z.coerce.number({ error: 'Empresa inválida' }).int().positive().optional(),
  patrono_id: z.coerce.number({ error: 'Patrono inválido' }).int().positive().optional(),
})

// Query para listar postulantes con paginación, búsqueda y filtro por estado
export const listarQuerySchema = z
  .object({
    page: z.coerce.number({ error: 'Página inválida' }).int().min(1).default(1),
    limit: z.coerce.number({ error: 'Límite inválido' }).int().min(1).max(100).default(10),
    q: z.string().trim().max(100).optional(),
    plaza_id: z.coerce.number({ error: 'Plaza inválida' }).int().positive().optional(),
    estado: z.enum(ESTADOS_POSTULANTE, { error: 'Estado inválido' }).optional(),
  })
  .transform((query) => ({ ...query, q: query.q || undefined, plaza_id: query.plaza_id || undefined }))