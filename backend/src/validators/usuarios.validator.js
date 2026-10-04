import { z } from "zod";

// Define una funcion reutilizable para validar texto
const texto = (max) => z.string().trim().max(max);
// Define una funcion para campos de texto opcionales
const textoOpcional = (max) => texto(max).nullish();

const validarSeguros = (data, ctx) => {
  if (data.tipo_contrato === "DEFINIDO" && !data.fecha_fin_contrato?.trim()) {
    ctx.addIssue({ code: "custom", path: ["fecha_fin_contrato"], message: "La fecha de finalización es requerida para un contrato definido" });
  }

  if (data.tiene_seguro_gastos_medicos) {
    if (!data.tipo_seguro_gastos_medicos) {
      ctx.addIssue({ code: "custom", path: ["tipo_seguro_gastos_medicos"], message: "Seleccione la modalidad del seguro médico" });
    }
    if (!data.empresa_seguro_gastos_medicos?.trim()) {
      ctx.addIssue({ code: "custom", path: ["empresa_seguro_gastos_medicos"], message: "La empresa aseguradora es requerida" });
    }
    if (!data.categoria_seguro_gastos_medicos?.trim()) {
      ctx.addIssue({ code: "custom", path: ["categoria_seguro_gastos_medicos"], message: "La categoría del seguro médico es requerida" });
    }
  }

  if (data.tiene_seguro_vida) {
    if (!data.empresa_seguro_vida?.trim()) {
      ctx.addIssue({ code: "custom", path: ["empresa_seguro_vida"], message: "La empresa aseguradora es requerida" });
    }
    if (!data.categoria_seguro_vida?.trim()) {
      ctx.addIssue({ code: "custom", path: ["categoria_seguro_vida"], message: "La categoría del seguro de vida es requerida" });
    }
  }
};

// Esquema para validar los datos necesarios al crear un usuario
export const createUsuarioSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es requerido").max(100),
  correo: z.string().trim().email("Correo inválido").max(100),
  rol_id: z.coerce
    .number({ error: "Seleccione un rol válido" })
    .int("Seleccione un rol válido")
    .positive("Seleccione un rol válido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100)
    .optional(),
  activo: z.boolean().nullish(),
  empresa_id: z.coerce.number().int().positive().nullish(),
  patrono_id: z.coerce.number().int().positive().nullish(),
  puesto_id: z.coerce.number().int().positive().nullish(),
  fecha_nacimiento: z.string().nullish(),
  estado_civil: z.enum(["SOLTERO", "CASADO", "UNIDO", "VIUDO", "DIVORCIADO"]).nullish(),
  nacionalidad: textoOpcional(100),
  telefono: textoOpcional(20),
  ultimo_grado_cursado: z.enum(["PRIMARIA", "BASICOS", "DIVERSIFICADO", "TECNICO", "LICENCIATURA", "MAESTRIA", "OTRO"]).nullish(),
  fecha_contratacion: z.string().min(1, "La fecha de contratación es requerida"),
  tipo_contrato: z.enum(["INDEFINIDO", "DEFINIDO"]).default("INDEFINIDO"),
  fecha_fin_contrato: z.string().nullish(),
  nit: textoOpcional(20),
  numero_afiliacion_igss: textoOpcional(30),
  sexo: z.enum(["MASCULINO", "FEMENINO"]).nullish(),
  dpi: z.string().trim().max(20).nullish(),
  dpi_extendido_en: z.string().trim().max(100).nullish(),
  direccion: z.string().trim().nullish(),
  sueldo: z.coerce.number().positive().nullish(),
  bonos: z.coerce.number().positive().nullish(),
  moneda_sueldo: z.enum(["QUETZAL", "DOLAR"]).default("QUETZAL"),
  banco: textoOpcional(100),
  tipo_cuenta_bancaria: textoOpcional(50),
  numero_cuenta_bancaria: textoOpcional(50),
  contacto_emergencia_nombre: textoOpcional(150),
  contacto_emergencia_telefono: textoOpcional(20),
  motivo_cambio_sueldo: z.string().trim().nullish(),
  motivo_cambio_empresa: z.string().trim().nullish(),
  tiene_seguro_gastos_medicos: z.boolean().nullish(),
  empresa_seguro_gastos_medicos: z.string().trim().max(100).nullish(),
  tipo_seguro_gastos_medicos: z.enum(["INDIVIDUAL", "FAMILIAR"]).nullish(),
  categoria_seguro_gastos_medicos: textoOpcional(100),
  tiene_seguro_vida: z.boolean().nullish(),
  empresa_seguro_vida: z.string().trim().max(100).nullish(),
  categoria_seguro_vida: textoOpcional(100),
}).superRefine(validarSeguros);

// Esquema para validar los datos utilizados para actualizar un usuario
export const updateUsuarioSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es requerido")
    .max(100)
    .optional(),
  correo: z.string().trim().email("Correo inválido").max(100).optional(),
  rol_id: z.coerce
    .number({ error: "Seleccione un rol válido" })
    .int("Seleccione un rol válido")
    .positive("Seleccione un rol válido")
    .optional(),
  activo: z.boolean().optional(),
  empresa_id: z.coerce.number().int().positive().nullish(),
  patrono_id: z.coerce.number().int().positive().nullish(),
  puesto_id: z.coerce.number().int().positive().nullish(),
  fecha_nacimiento: z.string().nullish(),
  estado_civil: z.enum(["SOLTERO", "CASADO", "UNIDO", "VIUDO", "DIVORCIADO"]).nullish(),
  nacionalidad: textoOpcional(100),
  telefono: textoOpcional(20),
  ultimo_grado_cursado: z.enum(["PRIMARIA", "BASICOS", "DIVERSIFICADO", "TECNICO", "LICENCIATURA", "MAESTRIA", "OTRO"]).nullish(),
  fecha_contratacion: z.string().min(1, "La fecha de contratación es requerida").optional(),
  tipo_contrato: z.enum(["INDEFINIDO", "DEFINIDO"]).optional(),
  fecha_fin_contrato: z.string().nullish(),
  nit: textoOpcional(20),
  numero_afiliacion_igss: textoOpcional(30),
  sexo: z.enum(["MASCULINO", "FEMENINO"]).nullish(),
  dpi: z.string().trim().max(20).nullish(),
  dpi_extendido_en: z.string().trim().max(100).nullish(),
  direccion: z.string().trim().nullish(),
  sueldo: z.coerce.number().positive().nullish(),
  bonos: z.coerce.number().positive().nullish(),
  moneda_sueldo: z.enum(["QUETZAL", "DOLAR"]).optional(),
  banco: textoOpcional(100),
  tipo_cuenta_bancaria: textoOpcional(50),
  numero_cuenta_bancaria: textoOpcional(50),
  contacto_emergencia_nombre: textoOpcional(150),
  contacto_emergencia_telefono: textoOpcional(20),
  motivo_cambio_sueldo: z.string().trim().nullish(),
  motivo_cambio_empresa: z.string().trim().nullish(),
  tiene_seguro_gastos_medicos: z.boolean().nullish(),
  empresa_seguro_gastos_medicos: z.string().trim().max(100).nullish(),
  tipo_seguro_gastos_medicos: z.enum(["INDIVIDUAL", "FAMILIAR"]).nullish(),
  categoria_seguro_gastos_medicos: textoOpcional(100),
  tiene_seguro_vida: z.boolean().nullish(),
  empresa_seguro_vida: z.string().trim().max(100).nullish(),
  categoria_seguro_vida: textoOpcional(100),
}).superRefine(validarSeguros);

export const registrarBajaUsuarioSchema = z.object({
  fecha_baja: z.iso.date("La fecha de baja debe ser válida"),
  motivo_baja: z.enum([
    "Abandono",
    "Baja ocupación",
    "Falta a normas",
    "Estudios - Horarios",
    "Fallecimiento",
    "Familiar",
    "Enfermedad",
    "Jubilación",
    "Ambiente de compañeros",
    "Liderazgo",
    "Mejor ocupación",
    "Período de prueba",
    "Viaje",
    "Otros",
  ]),
  reingreso_baja: z.boolean(),
  notas_baja: z.string().trim().max(160).nullish(),
});

// Esquema para validar los parametros utilizados al listar los usuarios
export const listarUsuariosQuerySchema = z
  .object({
    page: z.coerce.number({ error: "Página inválida" }).int().min(1).default(1),
    limit: z.coerce
      .number({ error: "Límite inválido" })
      .int()
      .min(1)
      .max(100)
      .default(10),
    q: z.string().trim().max(100).optional(),
    rol_id: z.coerce
      .number({ error: "Rol inválido" })
      .int()
      .positive()
      .optional(),
    activo: z.string().optional(),
  })
  .transform((query) => ({
    ...query,
    q: query.q || undefined,
    rol_id: query.rol_id || undefined,
    activo: query.activo !== undefined ? query.activo === 'true' : undefined,
  }));
