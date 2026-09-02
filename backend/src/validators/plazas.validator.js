import { z } from "zod";

const texto = (max) => z.string().trim().max(max);
const textoOpcional = (max) => texto(max).nullish();
const textoLibreOpcional = () => z.string().trim().max(5000).nullish();

// Validacion para el campo de monto, permitiendo valores nulos o undefined
const montoOpcional = () =>
  z.coerce
    .number({ error: "Debe ser un valor numérico" })
    .min(0, "No puede ser negativo")
    .max(99999999.99, "El monto excede el máximo permitido")
    .nullish();

// Validaciones para la creacion y actualizacion de plazas
export const createPlazaSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre de la plaza es requerido")
    .max(100),
  descripcion: textoLibreOpcional(),
  salario_min: montoOpcional(),
  salario_max: montoOpcional(),
  activo: z.boolean().nullish(),
});

// Validacion para la actualizacion de plazas, permitiendo campos opcionales
export const updatePlazaSchema = createPlazaSchema.partial();

// Validacion para la query de listar plazas, permitiendo filtros opcionales
export const listarPlazasQuerySchema = z
  .object({
    q: z.string().trim().max(100).optional(),
    activo: z.coerce.boolean().optional(),
  })
  .transform((query) => ({
    ...query,
    q: query.q || undefined,
    activo: query.activo !== undefined ? query.activo : undefined,
  }));
