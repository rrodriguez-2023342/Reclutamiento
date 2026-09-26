import { listarDepartamentosQuerySchema } from "../validators/departamentos.validator.js";
import { createDepartamentoSchema, updateDepartamentoSchema } from "../validators/departamentos.validator.js";
import { departamentosService } from "../services/departamentos.service.js";

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

export const listarDepartamentos = async (req, res) => {
  const query = validar(listarDepartamentosQuerySchema, req.query, res);
  if (!query) return;
  const resultado = await departamentosService.listar(query);
  res.json({ status: "ok", data: resultado });
};

export const obtenerDepartamento = async (req, res) => {
  console.log('DEBUG obtenerDepartamento - req.params:', req.params);
  const id = parseInt(req.params.id);
  console.log('DEBUG obtenerDepartamento - parsed id:', id);
  if (!Number.isInteger(id) || id <= 0) {
    console.log('DEBUG - Id inválido:', req.params.id);
    return res.status(400).json({ status: "error", message: "Id inválido" });
  }
  const departamento = await departamentosService.obtenerPorId(id);
  if (!departamento) {
    return res.status(404).json({ status: "error", message: "Departamento no encontrado" });
  }
  res.json({ status: "ok", data: departamento });
};

export const crearDepartamento = async (req, res) => {
  const data = validar(createDepartamentoSchema, req.body, res);
  if (!data) return;
  const departamento = await departamentosService.crear(data);
  res.status(201).json({ status: "ok", data: departamento });
};

export const actualizarDepartamento = async (req, res) => {
  const id = parseInt(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ status: "error", message: "Id inválido" });
  }
  const data = validar(updateDepartamentoSchema, req.body, res);
  if (!data) return;
  const departamento = await departamentosService.actualizar(id, data);
  res.json({ status: "ok", data: departamento });
};

export const desactivarDepartamento = async (req, res) => {
  const id = parseInt(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ status: "error", message: "Id inválido" });
  }
  const departamento = await departamentosService.desactivar(id);
  res.json({ status: "ok", data: departamento });
};

export const activarDepartamento = async (req, res) => {
  const id = parseInt(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ status: "error", message: "Id inválido" });
  }
  const departamento = await departamentosService.activar(id);
  res.json({ status: "ok", data: departamento });
};