import prisma from '../config/prisma.js'

class NotificacionesService {
  async listar(usuarioId) {
    const [notificaciones, noLeidas] = await prisma.$transaction([
      prisma.notificacion.findMany({
        where: { usuario_id: usuarioId },
        orderBy: { creada_en: 'desc' },
        take: 100,
        select: {
          id: true,
          tipo: true,
          titulo: true,
          mensaje: true,
          enlace: true,
          entidad_id: true,
          leida_en: true,
          creada_en: true,
        },
      }),
      prisma.notificacion.count({ where: { usuario_id: usuarioId, leida_en: null } }),
    ])
    return { notificaciones, noLeidas }
  }

  async marcarLeida(usuarioId, notificacionId) {
    const resultado = await prisma.notificacion.updateMany({
      where: { id: notificacionId, usuario_id: usuarioId, leida_en: null },
      data: { leida_en: new Date() },
    })
    if (!resultado.count) {
      const existe = await prisma.notificacion.findFirst({
        where: { id: notificacionId, usuario_id: usuarioId },
        select: { id: true },
      })
      if (!existe) {
        const error = new Error('Notificación no encontrada')
        error.status = 404
        throw error
      }
    }
  }

  async marcarTodasLeidas(usuarioId) {
    await prisma.notificacion.updateMany({
      where: { usuario_id: usuarioId, leida_en: null },
      data: { leida_en: new Date() },
    })
  }
}

export const notificacionesService = new NotificacionesService()
