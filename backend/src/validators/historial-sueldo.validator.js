import { z } from "zod";

// Esquema para validar los parametros al listar historial de sueldo
export const listarHistorialQuerySchema = z.object({
  usuario_id: z.coerce
    .number({ error: "ID de usuario inválido" })
    .int("ID de usuario inválido")
    .positive("ID de usuario inválido"),
  page: z.coerce.number({ error: "Página inválida" }).int().min(1).default(1),
  limit: z.coerce
    .number({ error: "Límite inválido" })
    .int()
    .min(1)
    .max(100)
    .default(20),
});
