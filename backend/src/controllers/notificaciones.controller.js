import { z } from 'zod'
import { notificacionesService } from '../services/notificaciones.service.js'

export const listarNotificaciones = async (req, res) => {
  const data = await notificacionesService.listar(req.userId)
  res.json({ status: 'ok', data })
}

export const marcarNotificacionLeida = async (req, res) => {
  const parsed = z.coerce.number().int().positive().safeParse(req.params.id)
  if (!parsed.success) {
    return res.status(400).json({ status: 'error', message: 'El identificador no es válido' })
  }
  await notificacionesService.marcarLeida(req.userId, parsed.data)
  res.json({ status: 'ok' })
}

export const marcarNotificacionesLeidas = async (req, res) => {
  await notificacionesService.marcarTodasLeidas(req.userId)
  res.json({ status: 'ok' })
}
