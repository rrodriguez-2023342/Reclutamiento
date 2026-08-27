import { z } from "zod";

// Convierte valores vacios o invalidos a undefined para que sean tratados como opcionales
const optionalSalary = z.preprocess(
  (value) =>
    value === "" || value === undefined || Number.isNaN(value)
      ? undefined
      : Number(value),
  z.number().min(0, "El salario no puede ser negativo").optional(),
);

// Valida que el salario minimo sea menor o igual al salario maximo
export const plazaSchema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(1, "El nombre es requerido")
      .max(150, "El nombre es demasiado largo"),
    descripcion: z
      .string()
      .trim()
      .max(5000, "La descripción es demasiado larga")
      .optional(),
    salario_min: optionalSalary,
    salario_max: optionalSalary,
    activa: z.boolean(),
  })
  .refine(
    ({ salario_min, salario_max }) =>
      salario_min === undefined ||
      salario_max === undefined ||
      salario_min <= salario_max,
    {
      path: ["salario_max"],
      message: "Debe ser mayor o igual al salario mínimo",
    },
  );

// Valores por defecto para el formulario de plazas
export const defaultPlazaValues = {
  nombre: "",
  descripcion: "",
  salario_min: undefined,
  salario_max: undefined,
  activa: true,
};
