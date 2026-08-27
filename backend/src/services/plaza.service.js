import prisma from '../config/prisma.js'

// Funcion para crear un error con mensaje y status
function crearError(mensaje, status) {
  const error = new Error(mensaje)
  error.status = status
  return error
}

// Servicio para manejar las plazas
class PlazaService {
  // Listar todas las plazas con filtros opcionales
  async listar({ q, activa } = {}) {
    const where = {}

    if (activa !== undefined) {
      where.activa = activa
    }

    if (q) {
      where.OR = [
        { nombre: { contains: q } },
        { descripcion: { contains: q } },
      ]
    }

    return prisma.plaza.findMany({
      where,
      orderBy: { nombre: 'asc' },
      include: {
        _count: { select: { postulantes: true } },
      },
    })
  }

  // Obtener una plaza por su id
  async obtenerPorId(id) {
    return prisma.plaza.findUnique({ where: { id } })
  }

  // Crear una nueva plaza
  async crear(data) {
    const existente = await prisma.plaza.findUnique({ where: { nombre: data.nombre } })
    if (existente) {
      throw crearError('Ya existe una plaza con ese nombre', 409)
    }

    return prisma.plaza.create({ data })
  }

  // Actualizar una plaza existente
  async actualizar(id, data) {
    const plaza = await prisma.plaza.findUnique({ where: { id } })
    if (!plaza) {
      throw crearError('Plaza no encontrada', 404)
    }

    if (data.nombre && data.nombre !== plaza.nombre) {
      const duplicada = await prisma.plaza.findFirst({
        where: { nombre: data.nombre, id: { not: id } },
      })
      if (duplicada) {
        throw crearError('Ya existe otra plaza con ese nombre', 409)
      }
    }

    return prisma.plaza.update({ where: { id }, data })
  }

  // Eliminar una plaza
  async eliminar(id) {
    const plaza = await prisma.plaza.findUnique({
      where: { id },
      select: { id: true, postulantes: { select: { id: true }, take: 1 } },
    })

    if (!plaza) {
      throw crearError('Plaza no encontrada', 404)
    }

    if (plaza.postulantes.length > 0) {
      throw crearError('No se puede eliminar: hay postulantes asociados a esta plaza', 409)
    }

    return prisma.plaza.delete({ where: { id } })
  }
}

export const plazaService = new PlazaService()
