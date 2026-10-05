import { z } from "zod";

export const divisionSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es requerido").max(150, "El nombre no puede exceder 150 caracteres"),
  descripcion: z.string().trim().max(5000).nullish(),
  activo: z.boolean().default(true),
});

export const defaultDivisionValues = {
  nombre: "",
  descripcion: "",
  empresa_id: null,
  activo: true,
};