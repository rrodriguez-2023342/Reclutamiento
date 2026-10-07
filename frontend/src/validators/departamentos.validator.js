import { z } from "zod";

export const departamentoSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es requerido").max(150, "El nombre no puede exceder 150 caracteres"),
  descripcion: z.string().trim().max(5000).nullish(),
  activo: z.boolean().default(true),
});

export const defaultDepartamentoValues = {
  nombre: "",
  descripcion: "",
  activo: true,
};