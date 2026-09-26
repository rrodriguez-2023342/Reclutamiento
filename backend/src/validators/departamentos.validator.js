import { z } from "zod";

export const createDepartamentoSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es requerido").max(150, "El nombre no puede exceder 150 caracteres"),
  descripcion: z.string().trim().max(5000).nullish(),
  division_id: z.coerce.number({ error: "Seleccione una división válida" }).int().positive("Seleccione una división válida"),
  activo: z.boolean().default(true),
});

export const updateDepartamentoSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es requerido").max(150, "El nombre no puede exceder 150 caracteres").nullish(),
  descripcion: z.string().trim().max(5000).nullish(),
  division_id: z.coerce.number().int().positive().nullish(),
  activo: z.boolean().nullish(),
});

export const listarDepartamentosQuerySchema = z
  .object({
    page: z.coerce.number({ error: "Página inválida" }).int().min(1).default(1),
    limit: z.coerce.number({ error: "Límite inválido" }).int().min(1).max(100).default(10),
    q: z.string().trim().max(100).optional(),
    division_id: z.coerce.number().int().positive().optional(),
    activo: z.union([z.string(), z.boolean()]).optional(),
  })
  .transform((query) => ({
    ...query,
    q: query.q || undefined,
    division_id: query.division_id || undefined,
    activo: query.activo !== undefined
      ? (typeof query.activo === "string" ? query.activo === "true" : query.activo)
      : undefined,
  }));