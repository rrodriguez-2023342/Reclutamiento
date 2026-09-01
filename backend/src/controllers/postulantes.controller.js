import {
  createPostulanteSchema,
  updatePostulanteSchema,
  updateEstadoSchema,
  listarQuerySchema,
} from '../validators/postulantes.validator.js'
import { postulanteService } from '../services/postulantes.service.js'

// Valida los datos con el schema recibido
function validar(schema, datos, res) {
  const parsed = schema.safeParse(datos)

  if (!parsed.success) {
    res.status(400).json({
      status: 'error',
      message: parsed.error.issues[0].message,
    })
    return null
  }

  return parsed.data
}

// Convierte y valida el :id 
function parsearId(req, res) {
  const id = Number(req.params.id)

  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ status: 'error', message: 'Id inválido' })
    return null
  }

  return id
}

// Lista postulantes con paginación, búsqueda y filtro por estado
export const listarPostulantes = async (req, res) => {
  const query = validar(listarQuerySchema, req.query, res)
  if (!query) return

  const resultado = await postulanteService.listar(query)
  res.json({ status: 'ok', data: resultado })
}

export const getPostulanteById = async (req, res) => {
  const id = parsearId(req, res)
  if (!id) return

  const postulante = await postulanteService.obtenerPorId(id)

  if (!postulante) {
    return res.status(404).json({ status: 'error', message: 'Postulante no encontrado' })
  }

  res.json({ status: 'ok', data: postulante })
}

// Crea un postulante con todas sus secciones anidadas
export const createPostulante = async (req, res) => {
  const data = validar(createPostulanteSchema, req.body, res)
  if (!data) return

  const postulante = await postulanteService.crear(data, req.userId)
  res.status(201).json({ status: 'ok', data: postulante })
}

// Actualiza un postulante
export const updatePostulante = async (req, res) => {
  const id = parsearId(req, res)
  if (!id) return

  const data = validar(updatePostulanteSchema, req.body, res)
  if (!data) return

  const postulante = await postulanteService.actualizar(id, data)
  res.json({ status: 'ok', data: postulante })
}

// Cambia el estado del proceso del postulante
export const updatePostulanteEstado = async (req, res) => {
  const id = parsearId(req, res)
  if (!id) return

  const data = validar(updateEstadoSchema, req.body, res)
  if (!data) return

  const postulante = await postulanteService.cambiarEstado(id, data.estado, {
    empresa_id: data.empresa_id,
    patrono_id: data.patrono_id,
  })
  res.json({ status: 'ok', data: postulante })
}
