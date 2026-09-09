import { z } from "zod";

// Funcion para convertir valores vacios a null
const emptyToNull = (value) =>
  value === "" || value === undefined || value === null || Number.isNaN(value) ? null : value;

// Funciones para crear validaciones opcionales
const optionalText = (max) =>
  z.preprocess(emptyToNull, z.string().trim().max(max).nullable());
const optionalNumber = (min, max) =>
  z.preprocess(emptyToNull, z.number().min(min).max(max).nullable());
const optionalDate = z.preprocess(
  emptyToNull,
  z
    .string()
    .refine(
      (value) => !Number.isNaN(new Date(`${value}T12:00:00`).getTime()),
      "Fecha inválida",
    )
    .nullable(),
);
const optionalBoolean = z.boolean().nullable().optional();
const phone = z
  .string()
  .trim()
  .regex(/^[\d\s()+-]{7,20}$/, "Teléfono inválido");

// Schema para validacion de familiares
const familiarSchema = z.object({
  parentesco: z.enum(
    ["PADRE", "MADRE", "ESPOSO_A", "HIJO_A", "HERMANO_A", "EMERGENCIA"],
    { error: "Seleccione el parentesco" },
  ),
  nombres_apellidos: z
    .string()
    .trim()
    .min(1, "El nombre es requerido")
    .max(150),
  edad: optionalNumber(0, 120),
  direccion: optionalText(5000),
  ocupacion: optionalText(100),
  telefono: z.preprocess(emptyToNull, phone.nullable()),
});

// Schema para validacion de historial educativo
const educacionSchema = z.object({
  nivel: z.enum(
    [
      "PRIMARIA",
      "BASICOS",
      "DIVERSIFICADO",
      "TECNICO",
      "LICENCIATURA",
      "MAESTRIA",
      "OTRO",
    ],
    { error: "Seleccione el nivel" },
  ),
  establecimiento: optionalText(150),
  ano_inicial: optionalNumber(1900, 2100),
  ano_final: optionalNumber(1900, 2100),
});

// Schema para validacion de idiomas
const idiomaSchema = z.object({
  idioma: z.string().trim().min(1, "El idioma es requerido").max(50),
  habla: optionalBoolean,
  lee: optionalBoolean,
  escribe: optionalBoolean,
});

// Schema para validacion de capacitaciones
const capacitacionSchema = z.object({
  nombre_curso: z.string().trim().min(1, "El curso es requerido").max(150),
  establecimiento_pais: optionalText(150),
  tiempo_duracion: optionalText(50),
  fecha_inicial: optionalDate,
  fecha_final: optionalDate,
});

// Schema para validacion de experiencia laboral
const experienciaSchema = z.object({
  empresa: z.string().trim().min(1, "La empresa es requerida").max(150),
  puesto: z.string().trim().min(1, "El puesto es requerido").max(100),
  direccion: optionalText(5000),
  telefono: z.preprocess(emptyToNull, phone.nullable()),
  jefe_inmediato: optionalText(150),
  fecha_ingreso: optionalDate,
  fecha_retiro: optionalDate,
  salario_inicial: optionalNumber(0, 99999999.99),
  salario_final: optionalNumber(0, 99999999.99),
  tareas_realizadas: optionalText(5000),
  motivo_retiro: z.preprocess(
    emptyToNull,
    z.enum(["RENUNCIA", "DESPIDO", "REORGANIZACION", "OTRO"]).nullable(),
  ),
});
const referenciaSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es requerido").max(150),
  telefono: phone.optional(),
  direccion: optionalText(5000),
});

// Schema principal para validacion del formulario de postulante
export const postulanteSchema = z.object({
  nombre_completo: z
    .string()
    .trim()
    .min(1, "El nombre completo es requerido")
    .max(150),
  direccion: z.string().trim().min(1, "La dirección es requerida").max(5000),
  lugar_nacimiento: z
    .string()
    .trim()
    .min(1, "El lugar de nacimiento es requerido")
    .max(100),
  fecha_nacimiento: z
    .string()
    .min(1, "La fecha de nacimiento es requerida")
    .refine((value) => {
      const date = new Date(`${value}T12:00:00`);
      return !Number.isNaN(date.getTime()) && date < new Date();
    }, "La fecha de nacimiento debe ser anterior a hoy"),
  telefono: phone,
  correo: z.string().trim().email("Correo inválido").max(100),
  estado_civil: z.enum(["SOLTERO", "CASADO", "UNIDO", "VIUDO", "DIVORCIADO"], {
    error: "Seleccione el estado civil",
  }),
  dpi: z
    .string()
    .transform((value) => value.replace(/[\s-]/g, ""))
    .refine((value) => /^\d{13}$/.test(value), "El DPI debe tener 13 dígitos"),
  dpi_extendido_en: optionalText(100),
  nit: optionalText(20),
  igss: optionalText(20),
  perfil_facebook: optionalText(100),
  plaza_id: z.coerce
    .number({ error: "Seleccione una plaza válida" })
    .int("Seleccione una plaza válida")
    .positive("Seleccione una plaza válida"),
  salario_aspira: optionalNumber(0, 99999999.99),
  fecha_inicio_disponible: optionalDate,
  trabajar_extraordinario: optionalBoolean,
  trabajar_turnos_rotativos: optionalBoolean,
  medio_enterado: z.preprocess(
    emptyToNull,
    z.enum(["ANUNCIO", "REFERENCIA", "OTRO"]).nullable(),
  ),
  porque_gustaria_trabajar: optionalText(5000),
  porque_deberiamoss_contratar: optionalText(5000),
  fortaleza_1: optionalText(255),
  fortaleza_2: optionalText(255),
  fortaleza_3: optionalText(255),
  debilidad_1: optionalText(255),
  debilidad_2: optionalText(255),
  debilidad_3: optionalText(255),
  afiliacion_gremial: optionalBoolean,
  afiliacion_religiosa: optionalBoolean,
  afiliacion_politica: optionalBoolean,
  afiliacion_deportiva: optionalBoolean,
  practica_deporte: optionalBoolean,
  deporte_cual: optionalText(100),
  ha_estado_enfermo_gravedad: optionalBoolean,
  toma_medicamento: optionalBoolean,
  fuma_o_bebe: optionalBoolean,
  fuma_bebe_frecuencia: optionalText(100),
  impedimento_fisico: optionalBoolean,
  personas_dependientes: optionalNumber(0, 99),
  total_efectivo_hogar: optionalNumber(0, 99999999.99),
  vivienda_tipo: z.preprocess(
    emptyToNull,
    z.enum(["PROPIA", "ALQUILADA", "FAMILIAR", "OTRA"]).nullable(),
  ),
  vivienda_valor: optionalNumber(0, 99999999.99),
  vivienda_renta_monto: optionalNumber(0, 99999999.99),
  tiene_vehiculo: optionalBoolean,
  licencia_tipo: optionalText(50),
  licencia_numero: optionalText(50),
  deudas_pendientes: optionalBoolean,
  deudas_monto: optionalNumber(0, 99999999.99),
  deudas_institucion: optionalText(150),
  detenido_policia: optionalBoolean,
  procesado_legalmente: optionalBoolean,
  datosFamiliares: z.array(familiarSchema).default([]),
  educacionHistorial: z.array(educacionSchema).default([]),
  idiomas: z.array(idiomaSchema).default([]),
  capacitaciones: z.array(capacitacionSchema).default([]),
  experienciaLaboral: z.array(experienciaSchema).default([]),
  referenciasPersonales: z.array(referenciaSchema).default([]),
});

// Valores por defecto para un nuevo postulante
export const defaultPostulanteValues = {
  nombre_completo: "",
  direccion: "",
  lugar_nacimiento: "",
  fecha_nacimiento: "",
  telefono: "",
  correo: "",
  estado_civil: undefined,
  dpi: "",
  dpi_extendido_en: "",
  nit: "",
  igss: "",
  perfil_facebook: "",
  plaza_id: undefined,
  salario_aspira: undefined,
  fecha_inicio_disponible: "",
  trabajar_extraordinario: null,
  trabajar_turnos_rotativos: null,
  medio_enterado: undefined,
  porque_gustaria_trabajar: "",
  porque_deberiamoss_contratar: "",
  fortaleza_1: "",
  fortaleza_2: "",
  fortaleza_3: "",
  debilidad_1: "",
  debilidad_2: "",
  debilidad_3: "",
  afiliacion_gremial: null,
  afiliacion_religiosa: null,
  afiliacion_politica: null,
  afiliacion_deportiva: null,
  practica_deporte: null,
  deporte_cual: "",
  ha_estado_enfermo_gravedad: null,
  toma_medicamento: null,
  fuma_o_bebe: null,
  fuma_bebe_frecuencia: "",
  impedimento_fisico: null,
  personas_dependientes: undefined,
  total_efectivo_hogar: undefined,
  vivienda_tipo: undefined,
  vivienda_valor: undefined,
  vivienda_renta_monto: undefined,
  tiene_vehiculo: null,
  licencia_tipo: "",
  licencia_numero: "",
  deudas_pendientes: null,
  deudas_monto: undefined,
  deudas_institucion: "",
  detenido_policia: null,
  procesado_legalmente: null,
  datosFamiliares: [],
  educacionHistorial: [],
  idiomas: [],
  capacitaciones: [],
  experienciaLaboral: [],
  referenciasPersonales: [],
};
