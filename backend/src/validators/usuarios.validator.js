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
