import {
  createPlazaSchema,
  updatePlazaSchema,
  listarPlazasQuerySchema,
} from "../validators/plazas.validator.js";
import { plazaService } from "../services/plaza.service.js";

// Funcion para validar los datos de entrada
function validar(schema, datos, res) {
  const parsed = schema.safeParse(datos);

  if (!parsed.success) {
    res.status(400).json({
      status: "error",
      message: parsed.error.issues[0].message,
    });
    return null;
  }

  return parsed.data;
}

// Funcion para parsear el id de la plaza
function parsearId(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ status: "error", message: "Id inválido" });
    return null;
  }

  return id;
}

// Listar todas las plazas
export const listarPlazas = async (req, res) => {
  const query = validar(listarPlazasQuerySchema, req.query, res);
  if (!query) return;

  const plazas = await plazaService.listar(query);
  res.json({ status: "ok", data: plazas });
};

// Obtener una plaza por su id
export const getPlazaById = async (req, res) => {
  const id = parsearId(req, res);
  if (!id) return;

  const plaza = await plazaService.obtenerPorId(id);

  if (!plaza) {
    return res
      .status(404)
      .json({ status: "error", message: "Plaza no encontrada" });
  }

  res.json({ status: "ok", data: plaza });
};

// Crear una nueva plaza
export const createPlaza = async (req, res) => {
  const data = validar(createPlazaSchema, req.body, res);
  if (!data) return;

  const plaza = await plazaService.crear(data);
  res.status(201).json({ status: "ok", data: plaza });
};


// Actualizar una plaza existente
export const updatePlaza = async (req, res) => {
  const id = parsearId(req, res);
  if (!id) return;

  const data = validar(updatePlazaSchema, req.body, res);
  if (!data) return;

  const plaza = await plazaService.actualizar(id, data);
  res.json({ status: "ok", data: plaza });
};

// Eliminar una plaza
export const deletePlaza = async (req, res) => {
  const id = parsearId(req, res);
  if (!id) return;

  await plazaService.eliminar(id);
  res.json({ status: "ok", message: "Plaza eliminada" });
};
