import { z } from "zod";

export const divisionSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es requerido").max(150, "El nombre no puede exceder 150 caracteres"),
  descripcion: z.string().trim().max(5000).nullish(),
  empresa_id: z.coerce.number({ error: "Seleccione una empresa válida" }).int("Seleccione una empresa válida").positive("Seleccione una empresa válida"),
  activo: z.boolean().default(true),
});

export const defaultDivisionValues = {
  nombre: "",
  descripcion: "",
  empresa_id: null,
  activo: true,
};