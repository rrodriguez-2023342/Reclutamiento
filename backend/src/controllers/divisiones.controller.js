import { listarDivisionesQuerySchema } from "../validators/divisiones.validator.js";
import { createDivisionSchema, updateDivisionSchema } from "../validators/divisiones.validator.js";
import { divisionesService } from "../services/divisiones.service.js";

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

export const listarDivisiones = async (req, res) => {
  const query = validar(listarDivisionesQuerySchema, req.query, res);
  if (!query) return;
  const resultado = await divisionesService.listar(query);
  res.json({ status: "ok", data: resultado });
};

export const obtenerDivision = async (req, res) => {
  console.log('DEBUG obtenerDivision - req.params:', req.params);
  const id = parseInt(req.params.id);
  console.log('DEBUG obtenerDivision - parsed id:', id);
  if (!Number.isInteger(id) || id <= 0) {
    console.log('DEBUG - Id inválido:', req.params.id);
    return res.status(400).json({ status: "error", message: "Id inválido" });
  }
  const division = await divisionesService.obtenerPorId(id);
  if (!division) {
    return res.status(404).json({ status: "error", message: "División no encontrada" });
  }
  res.json({ status: "ok", data: division });
};

export const crearDivision = async (req, res) => {
  const data = validar(createDivisionSchema, req.body, res);
  if (!data) return;
  const division = await divisionesService.crear(data);
  res.status(201).json({ status: "ok", data: division });
};

export const actualizarDivision = async (req, res) => {
  const id = parseInt(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ status: "error", message: "Id inválido" });
  }
  const data = validar(updateDivisionSchema, req.body, res);
  if (!data) return;
  const division = await divisionesService.actualizar(id, data);
  res.json({ status: "ok", data: division });
};

export const desactivarDivision = async (req, res) => {
  const id = parseInt(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ status: "error", message: "Id inválido" });
  }
  const division = await divisionesService.desactivar(id);
  res.json({ status: "ok", data: division });
};

export const activarDivision = async (req, res) => {
  const id = parseInt(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ status: "error", message: "Id inválido" });
  }
  const division = await divisionesService.activar(id);
  res.json({ status: "ok", data: division });
};