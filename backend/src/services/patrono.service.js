import prisma from '../config/prisma.js'

// Funcion para crear un error con un mensaje
function crearError(mensaje, status) {
  const error = new Error(mensaje)
  error.status = status
  return error
}

// Servicio para manejar las operaciones relacionadas con patronos
class PatronoService {
  // Listar patronos con paginacion y filtros opcionales
  async listar({ page = 1, limit = 10, q, activo }) {
    const where = {}

    if (activo !== undefined) {
      where.activo = activo
    }

    if (q) {
      where.OR = [
        { razon_social: { contains: q } },
        { representante_legal: { contains: q } },
        { nit: { contains: q } },
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

  // Crear un nuevo patrono, verificando que no exista otro con la misma razon social
  async crear(data) {
    const existente = await prisma.patrono.findUnique({
      where: { razon_social: data.razon_social },
    })
    if (existente) {
      throw crearError('Ya existe un patrono con esa razón social', 409)
    }

    const activo = data.activo !== undefined ? data.activo : true

    return prisma.patrono.create({
      data: {
        razon_social: data.razon_social,
        numero_patronal: data.numero_patronal || null,
        nit: data.nit || null,
        representante_legal: data.representante_legal || null,
        dpi_representante: data.dpi_representante || null,
        fecha_vencimiento_dpi: data.fecha_vencimiento_dpi ? new Date(data.fecha_vencimiento_dpi) : null,
        fecha_nacimiento: data.fecha_nacimiento ? new Date(data.fecha_nacimiento) : null,
        sexo: data.sexo || null,
        estado_civil: data.estado_civil || null,
        profesion: data.profesion || null,
        dpi_extendido_en: data.dpi_extendido_en || null,
        activo,
      },
    })
  }

  // Actualizar un patrono existente, verificando que no exista otro con la misma razon social
  async actualizar(id, data) {
    const patrono = await prisma.patrono.findUnique({ where: { id } })
    if (!patrono) {
      throw crearError('Patrono no encontrado', 404)
    }

    if (data.razon_social && data.razon_social !== patrono.razon_social) {
      const duplicado = await prisma.patrono.findFirst({
        where: { razon_social: data.razon_social, id: { not: id } },
      })
      if (duplicado) {
        throw crearError('Ya existe otro patrono con esa razón social', 409)
      }
    }

    return prisma.patrono.update({
      where: { id },
      data: {
        ...data,
        fecha_vencimiento_dpi: data.fecha_vencimiento_dpi !== undefined
          ? (data.fecha_vencimiento_dpi ? new Date(data.fecha_vencimiento_dpi) : null)
          : undefined,
        fecha_nacimiento: data.fecha_nacimiento !== undefined
          ? (data.fecha_nacimiento ? new Date(data.fecha_nacimiento) : null)
          : undefined,
      },
    })
  }

  // Desactivar un patrono
  async desactivar(id) {
    const patrono = await prisma.patrono.findUnique({
      where: { id },
      select: { id: true, razon_social: true, activo: true },
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

  // Activar un patrono
  async activar(id) {
    const patrono = await prisma.patrono.findUnique({
      where: { id },
      select: { id: true, razon_social: true, activo: true },
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
