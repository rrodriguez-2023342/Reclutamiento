import prisma from '../config/prisma.js'

// Funcion para crear un error con un mensaje
function crearError(mensaje, status) {
  const error = new Error(mensaje)
  error.status = status
  return error
}

// Convierte una fecha string a Date usando año fijo 2000 (para aniversarios)
function convertirAFechaAniversario(fechaStr) {
  const fecha = new Date(fechaStr)
  return new Date(2000, fecha.getMonth(), fecha.getDate())
}

function normalizarDatosEmpresa(data) {
  const resultado = { ...data }

  for (const campo of ['detalle_empresa', 'direccion', 'telefono', 'correo']) {
    if (resultado[campo] === undefined) continue
    resultado[campo] = resultado[campo] === '' ? null : resultado[campo]
  }

  if (resultado.fecha_aniversario !== undefined) {
    resultado.fecha_aniversario = resultado.fecha_aniversario
      ? convertirAFechaAniversario(resultado.fecha_aniversario)
      : null
  }

  return resultado
}

// Construye el filtro where compartido entre listado y exportación
function construirWhere({ q, activo, empresa_ids } = {}) {
  const where = {}

  // Alcance por empresa (Recursos Humanos): array = limitar, null = sin limite
  if (Array.isArray(empresa_ids)) {
    where.id = { in: empresa_ids }
  }

  if (activo !== undefined) {
    where.activo = activo
  }

  if (q) {
    where.OR = [
      { nombre_empresa: { contains: q } },
    ]
  }

  return where
}

// Servicio para manejar las operaciones relacionadas con empresas
class EmpresaService {
  // Listar empresas con paginacion y filtros opcionales
  async listar({ page = 1, limit = 10, ...filtros }) {
    const where = construirWhere(filtros)

    const [data, total] = await prisma.$transaction([
      prisma.empresa.findMany({
        where,
        orderBy: { nombre_empresa: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.empresa.count({ where }),
    ])

    return { data, total, page, totalPages: Math.ceil(total / limit) || 1 }
  }

  // Exportar todas las empresas filtradas (sin paginar)
  async exportar(filtros) {
    return prisma.empresa.findMany({
      where: construirWhere(filtros),
      orderBy: { nombre_empresa: 'asc' },
    })
  }

  // Obtener una empresa por su ID
  async obtenerPorId(id) {
    return prisma.empresa.findUnique({ where: { id } })
  }

  // Crear una nueva empresa, verificando que no exista otra con el mismo nombre
  async crear(data) {
    const existente = await prisma.empresa.findUnique({
      where: { nombre_empresa: data.nombre_empresa },
    })
    if (existente) {
      throw crearError('Ya existe una empresa con ese nombre', 409)
    }

    const activo = data.activo !== undefined ? data.activo : true

    const datosNormalizados = normalizarDatosEmpresa({
      ...data,
      detalle_empresa: data.detalle_empresa ?? null,
      direccion: data.direccion ?? null,
      telefono: data.telefono ?? null,
      correo: data.correo ?? null,
      fecha_aniversario: data.fecha_aniversario ?? null,
      activo,
    })

    return prisma.empresa.create({
      data: {
        nombre_empresa: datosNormalizados.nombre_empresa,
        detalle_empresa: datosNormalizados.detalle_empresa,
        direccion: datosNormalizados.direccion,
        telefono: datosNormalizados.telefono,
        correo: datosNormalizados.correo,
        fecha_aniversario: datosNormalizados.fecha_aniversario,
        activo: datosNormalizados.activo,
      },
    })
  }

  //Actualizar una empresa existente, verificando que no exista otra con el mismo nombre
  async actualizar(id, data) {
    const empresa = await prisma.empresa.findUnique({ where: { id } })
    if (!empresa) {
      throw crearError('Empresa no encontrada', 404)
    }

    if (data.nombre_empresa && data.nombre_empresa !== empresa.nombre_empresa) {
      const duplicado = await prisma.empresa.findFirst({
        where: { nombre_empresa: data.nombre_empresa, id: { not: id } },
      })
      if (duplicado) {
        throw crearError('Ya existe otra empresa con ese nombre', 409)
      }
    }

    const datosActualizacion = normalizarDatosEmpresa(data)

    return prisma.empresa.update({
      where: { id },
      data: datosActualizacion,
    })
  }

  // Desactivar una empresa
  async desactivar(id) {
    const empresa = await prisma.empresa.findUnique({
      where: { id },
      select: { id: true, nombre_empresa: true, activo: true },
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
      select: { id: true, nombre_empresa: true, activo: true },
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
