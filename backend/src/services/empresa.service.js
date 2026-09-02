import prisma from '../config/prisma.js'

// Funcion para crear un error con un mensaje
function crearError(mensaje, status) {
  const error = new Error(mensaje)
  error.status = status
  return error
}

// Servicio para manejar las operaciones relacionadas con empresas
class EmpresaService {
  // Listar empresas con paginacion y filtros opcionales
  async listar({ page = 1, limit = 10, q, activo }) {
    const where = {}

    if (activo !== undefined) {
      where.activo = activo
    }

    if (q) {
      where.OR = [
        { nombre: { contains: q } },
        { direccion: { contains: q } },
      ]
    }

    const [data, total] = await prisma.$transaction([
      prisma.empresa.findMany({
        where,
        orderBy: [{ creado_en: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.empresa.count({ where }),
    ])

    return { data, total, page, totalPages: Math.ceil(total / limit) || 1 }
  }

  // Obtener una empresa por su ID
  async obtenerPorId(id) {
    return prisma.empresa.findUnique({ where: { id } })
  }

  // Crear una nueva empresa, verificando que no exista otra con el mismo nombre
  async crear(data) {
    const existente = await prisma.empresa.findUnique({
      where: { nombre: data.nombre },
    })
    if (existente) {
      throw crearError('Ya existe una empresa con ese nombre', 409)
    }

    const activo = data.activo !== undefined ? data.activo : true

    return prisma.empresa.create({
      data: {
        nombre: data.nombre,
        direccion: data.direccion || null,
        telefono: data.telefono || null,
        activo,
      },
    })
  }

  //Actualizar una empresa existente, verificando que no exista otra con el mismo nombre
  async actualizar(id, data) {
    const empresa = await prisma.empresa.findUnique({ where: { id } })
    if (!empresa) {
      throw crearError('Empresa no encontrada', 404)
    }

    if (data.nombre && data.nombre !== empresa.nombre) {
      const duplicado = await prisma.empresa.findFirst({
        where: { nombre: data.nombre, id: { not: id } },
      })
      if (duplicado) {
        throw crearError('Ya existe otra empresa con ese nombre', 409)
      }
    }

    return prisma.empresa.update({
      where: { id },
      data,
    })
  }

  // Desactivar una empresa
  async desactivar(id) {
    const empresa = await prisma.empresa.findUnique({
      where: { id },
      select: { id: true, nombre: true, activo: true },
    })
    if (!empresa) {
      throw crearError('Empresa no encontrada', 404)
    }
    if (!empresa.activo) {
      throw crearError('La empresa ya está desactivada', 400)
    }

    return prisma.empresa.update({
      where: { id },
      data: { activo: false },
    })
  }

  // Activar una empresa
  async activar(id) {
    const empresa = await prisma.empresa.findUnique({
      where: { id },
      select: { id: true, nombre: true, activo: true },
    })
    if (!empresa) {
      throw crearError('Empresa no encontrada', 404)
    }
    if (empresa.activo) {
      throw crearError('La empresa ya está activa', 400)
    }

    return prisma.empresa.update({
      where: { id },
      data: { activo: true },
    })
  }
}

export const empresaService = new EmpresaService()
