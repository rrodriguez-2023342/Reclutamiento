import { z } from "zod";

// Define una funcion reutilizable para validar texto
const texto = (max) => z.string().trim().max(max);
// Define una funcion para campos de texto opcionales
const textoOpcional = (max) => texto(max).nullish();

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
});

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
    activo: z.coerce.boolean().optional(),
  })
  .transform((query) => ({
    ...query,
    q: query.q || undefined,
    rol_id: query.rol_id || undefined,
    activo: query.activo !== undefined ? query.activo : undefined,
  }));
