import { z } from "zod";

// Esquema para validar los parametros al listar historial de empresa
export const listarHistorialEmpresaQuerySchema = z.object({
  usuario_id: z.coerce
    .number({ error: "ID de usuario invalido" })
    .int("ID de usuario invalido")
    .positive("ID de usuario invalido"),
  page: z.coerce.number({ error: "Pagina invalida" }).int().min(1).default(1),
  limit: z.coerce
    .number({ error: "Limite invalido" })
    .int()
    .min(1)
    .max(100)
    .default(20),
});