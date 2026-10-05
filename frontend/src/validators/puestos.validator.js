import { z } from "zod";

export const puestoSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es requerido").max(150, "El nombre no puede exceder 150 caracteres"),
  descripcion: z.string().trim().max(5000).nullish(),
  division_id: z.coerce.number({ error: "Seleccione una división válida" }).int().positive("Seleccione una división válida"),
  departamento_id: z.coerce.number({ error: "Seleccione un departamento válido" }).int("Seleccione un departamento válido").positive("Seleccione un departamento válido"),
  activo: z.boolean().default(true),
});

export const defaultPuestoValues = {
  nombre: "",
  descripcion: "",
  division_id: null,
  departamento_id: null,
  activo: true,
};