import { z } from "zod";

export const departamentoSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es requerido").max(150, "El nombre no puede exceder 150 caracteres"),
  descripcion: z.string().trim().max(5000).nullish(),
  division_id: z.coerce.number({ error: "Seleccione una división válida" }).int("Seleccione una división válida").positive("Seleccione una división válida"),
  activo: z.boolean().default(true),
});

export const defaultDepartamentoValues = {
  nombre: "",
  descripcion: "",
  division_id: null,
  activo: true,
};