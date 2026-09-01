import prisma from '../config/prisma.js'

// Funcion par crear errores personalizados con status
function crearError(mensaje, status) {
  const error = new Error(mensaje)
  error.status = status
  return error
}

// Servicio para manejar operaciones relacionadas con patronos
class PatronoService {
  // Listar patronos con paginacion, busqueda y filtro por estado
  async listar({ page = 1, limit = 10, q, activa }) {
    const where = {}

    if (activa !== undefined) {
      where.activo = activa
    }

    if (q) {
      where.OR = [
        { nombre: { contains: q } },
        { direccion: { contains: q } },
      ]
    }

    const [data, total] = await prisma.$transaction([
      prisma.patrono.findMany({
        where,
        orderBy: [{ creado_en: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.patrono.count({ where }),
    ])

    return { data, total, page, totalPages: Math.ceil(total / limit) || 1 }
  }

  // Obtener un patrono por su ID
  async obtenerPorId(id) {
    return prisma.patrono.findUnique({ where: { id } })
  }

  // Crear un nuevo patrono, verificando que no exista otro con el mismo nombre
  async crear(data) {
    const existente = await prisma.patrono.findUnique({
      where: { nombre: data.nombre },
    })
    if (existente) {
      throw crearError('Ya existe un patrono con ese nombre', 409)
    }

    const activo = data.activo !== undefined ? data.activo : true

    return prisma.patrono.create({
      data: {
        nombre: data.nombre,
        direccion: data.direccion || null,
        telefono: data.telefono || null,
        activo,
      },
    })
  }

  // Actualizar un patrono existente, verificando que no exista otro con el mismo nombre
  async actualizar(id, data) {
    const patrono = await prisma.patrono.findUnique({ where: { id } })
    if (!patrono) {
      throw crearError('Patrono no encontrado', 404)
    }

    if (data.nombre && data.nombre !== patrono.nombre) {
      const duplicado = await prisma.patrono.findFirst({
        where: { nombre: data.nombre, id: { not: id } },
      })
      if (duplicado) {
        throw crearError('Ya existe otro patrono con ese nombre', 409)
      }
    }

    return prisma.patrono.update({
      where: { id },
      data,
    })
  }

  // Desactivar un patrono, verificando que este activo
  async desactivar(id) {
    const patrono = await prisma.patrono.findUnique({
      where: { id },
      select: { id: true, nombre: true, activo: true },
    })
    if (!patrono) {
      throw crearError('Patrono no encontrado', 404)
    }
    if (!patrono.activo) {
      throw crearError('El patrono ya está desactivado', 400)
    }

    return prisma.patrono.update({
      where: { id },
      data: { activo: false },
    })
  }

  // Activar un patrono, verificando que este desactivado
  async activar(id) {
    const patrono = await prisma.patrono.findUnique({
      where: { id },
      select: { id: true, nombre: true, activo: true },
    })
    if (!patrono) {
      throw crearError('Patrono no encontrado', 404)
    }
    if (patrono.activo) {
      throw crearError('El patrono ya está activo', 400)
    }

    return prisma.patrono.update({
      where: { id },
      data: { activo: true },
    })
  }
}

export const patronoService = new PatronoService()
