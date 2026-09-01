import {
  createEmpresaSchema,
  updateEmpresaSchema,
  listarEmpresasQuerySchema,
} from '../validators/empresas.validator.js'
import { empresaService } from '../services/empresa.service.js'

// Funciones auxiliares para validar datos y parsear ID
function validar(schema, datos, res) {
  const parsed = schema.safeParse(datos)
  if (!parsed.success) {
    res.status(400).json({ status: 'error', message: parsed.error.issues[0].message })
    return null
  }
  return parsed.data
}

function parsearId(req, res) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ status: 'error', message: 'Id inválido' })
    return null
  }
  return id
}

// Funcion para listar empresas con paginacion, busqueda y filtro por estado
export const listarEmpresas = async (req, res) => {
  const query = validar(listarEmpresasQuerySchema, req.query, res)
  if (!query) return

  const resultado = await empresaService.listar(query)
  res.json({ status: 'ok', data: resultado })
}

// Funcio para obtener una empresa por su ID
export const getEmpresaById = async (req, res) => {
  const id = parsearId(req, res)
  if (!id) return

  const empresa = await empresaService.obtenerPorId(id)
  if (!empresa) {
    return res.status(404).json({ status: 'error', message: 'Empresa no encontrada' })
  }

  res.json({ status: 'ok', data: empresa })
}

// Funcion para crear una nueva empresa
export const createEmpresa = async (req, res) => {
  const data = validar(createEmpresaSchema, req.body, res)
  if (!data) return

  const empresa = await empresaService.crear(data)
  res.status(201).json({ status: 'ok', data: empresa })
}

// Funcion para actulizar una empresa existente
export const updateEmpresa = async (req, res) => {
  const id = parsearId(req, res)
  if (!id) return

  const data = validar(updateEmpresaSchema, req.body, res)
  if (!data) return

  const empresa = await empresaService.actualizar(id, data)
  res.json({ status: 'ok', data: empresa })
}

// Funcion para desactivar una empresa
export const desactivarEmpresa = async (req, res) => {
  const id = parsearId(req, res)
  if (!id) return

  const empresa = await empresaService.desactivar(id)
  res.json({ status: 'ok', data: empresa })
}

// Funcion para activar una empresa
export const activarEmpresa = async (req, res) => {
  const id = parsearId(req, res)
  if (!id) return

  const empresa = await empresaService.activar(id)
  res.json({ status: 'ok', data: empresa })
}
