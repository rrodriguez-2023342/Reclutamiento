import { listarPuestosQuerySchema } from "../validators/puestos.validator.js";
import { createPuestoSchema, updatePuestoSchema } from "../validators/puestos.validator.js";
import { puestosService } from "../services/puestos.service.js";

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

export const listarPuestos = async (req, res) => {
  const query = validar(listarPuestosQuerySchema, req.query, res);
  if (!query) return;
  const resultado = await puestosService.listar(query);
  res.json({ status: "ok", data: resultado });
};

export const exportarPuestos = async (req, res) => {
  const query = validar(listarPuestosQuerySchema, req.query, res);
  if (!query) return;
  const data = await puestosService.exportar(query);
  res.json({ status: "ok", data });
};

export const obtenerPuesto = async (req, res) => {
  console.log('DEBUG obtenerPuesto - req.params:', req.params);
  const id = parseInt(req.params.id);
  console.log('DEBUG obtenerPuesto - parsed id:', id);
  if (!Number.isInteger(id) || id <= 0) {
    console.log('DEBUG - Id inválido:', req.params.id);
    return res.status(400).json({ status: "error", message: "Id inválido" });
  }
  const puesto = await puestosService.obtenerPorId(id);
  if (!puesto) {
    return res.status(404).json({ status: "error", message: "Puesto no encontrado" });
  }
  res.json({ status: "ok", data: puesto });
};

export const crearPuesto = async (req, res) => {
  const data = validar(createPuestoSchema, req.body, res);
  if (!data) return;
  const puesto = await puestosService.crear(data);
  res.status(201).json({ status: "ok", data: puesto });
};

export const actualizarPuesto = async (req, res) => {
  const id = parseInt(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ status: "error", message: "Id inválido" });
  }
  const data = validar(updatePuestoSchema, req.body, res);
  if (!data) return;
  const puesto = await puestosService.actualizar(id, data);
  res.json({ status: "ok", data: puesto });
};

export const desactivarPuesto = async (req, res) => {
  const id = parseInt(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ status: "error", message: "Id inválido" });
  }
  const puesto = await puestosService.desactivar(id);
  res.json({ status: "ok", data: puesto });
};

export const activarPuesto = async (req, res) => {
  const id = parseInt(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ status: "error", message: "Id inválido" });
  }
  const puesto = await puestosService.activar(id);
  res.json({ status: "ok", data: puesto });
};