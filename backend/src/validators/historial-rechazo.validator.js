import { z } from "zod";

// Esquema para validar los parametros al listar historial del postulante
export const listarHistorialRechazoQuerySchema = z.object({
  postulante_id: z.coerce
    .number({ error: "ID de postulante invalido" })
    .int("ID de postulante invalido")
    .positive("ID de postulante invalido"),
  page: z.coerce.number({ error: "Pagina invalida" }).int().min(1).default(1),
  limit: z.coerce
    .number({ error: "Limite invalido" })
    .int()
    .min(1)
    .max(100)
    .default(20),
});

export const registrarRechazoSchema = z.object({
  postulante_id: z.coerce.number().int().positive(),
  motivo: z.string().trim().min(1, "El motivo es requerido").max(5000),
  rechazado_por: z.coerce.number().int().positive(),
});