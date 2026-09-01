import {
  createPatronoSchema,
  updatePatronoSchema,
  listarPatronosQuerySchema,
} from '../validators/patronos.validator.js'
import { patronoService } from '../services/patrono.service.js'

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

export const listarPatronos = async (req, res) => {
  const query = validar(listarPatronosQuerySchema, req.query, res)
  if (!query) return

  const resultado = await patronoService.listar(query)
  res.json({ status: 'ok', data: resultado })
}

export const getPatronoById = async (req, res) => {
  const id = parsearId(req, res)
  if (!id) return

  const patrono = await patronoService.obtenerPorId(id)
  if (!patrono) {
    return res.status(404).json({ status: 'error', message: 'Patrono no encontrado' })
  }

  res.json({ status: 'ok', data: patrono })
}

export const createPatrono = async (req, res) => {
  const data = validar(createPatronoSchema, req.body, res)
  if (!data) return

  const patrono = await patronoService.crear(data)
  res.status(201).json({ status: 'ok', data: patrono })
}

export const updatePatrono = async (req, res) => {
  const id = parsearId(req, res)
  if (!id) return

  const data = validar(updatePatronoSchema, req.body, res)
  if (!data) return

  const patrono = await patronoService.actualizar(id, data)
  res.json({ status: 'ok', data: patrono })
}

export const desactivarPatrono = async (req, res) => {
  const id = parsearId(req, res)
  if (!id) return

  const patrono = await patronoService.desactivar(id)
  res.json({ status: 'ok', data: patrono })
}

export const activarPatrono = async (req, res) => {
  const id = parsearId(req, res)
  if (!id) return

  const patrono = await patronoService.activar(id)
  res.json({ status: 'ok', data: patrono })
}
