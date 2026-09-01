import prisma from '../config/prisma.js'
import { sendEstadoPostulanteEmail } from '../config/email.js'

// Constantes de estado y transiciones válidas para el flujo de postulantes
const ETIQUETAS_ESTADO = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En Proceso',
  CONTRATADO: 'Contratado',
  RECHAZADO: 'Rechazado',
}

// Transiciones válidas: desde un estado, a qué estados puede pasar
const TRANSICIONES_PERMITIDAS = {
  PENDIENTE: ['EN_PROCESO'],
  EN_PROCESO: ['CONTRATADO', 'RECHAZADO'],
  CONTRATADO: [],
  RECHAZADO: ['PENDIENTE'],
}

// Relaciones que se devuelven siempre al consultar un postulante
const INCLUDE_COMPLETO = {
  usuario: { select: { id: true, nombre: true, correo: true } },
  plaza: { select: { id: true, nombre: true, salario_min: true, salario_max: true } },
  empresa: { select: { id: true, nombre: true } },
  patrono: { select: { id: true, nombre: true } },
  datosFamiliares: true,
  educacionHistorial: true,
  idiomas: true,
  capacitaciones: true,
  experienciaLaboral: true,
  referenciasPersonales: true,
  documentos: {
    select: {
      id: true,
      tipo: true,
      nombre_archivo: true,
      mime_type: true,
      tamano_bytes: true,
      fecha_subida: true,
    },
  },
}

// Secciones hijas que se pueden actualizar en bloque
const SECCIONES_HIJAS = [
  ['datosFamiliares', 'datosFamiliares'],
  ['educacionHistorial', 'educacionHistorial'],
  ['idiomas', 'idioma'],
  ['capacitaciones', 'capacitacion'],
  ['experienciaLaboral', 'experienciaLaboral'],
  ['referenciasPersonales', 'referenciaPersonal'],
]

// Crea un Error con un código HTTP asociado
function crearError(mensaje, status) {
  const error = new Error(mensaje)
  error.status = status
  return error
}

class PostulanteService {
  // Lista paginada con búsqueda (nombre, DPI, correo, plaza) y filtro por estado y plaza
  async listar({ page = 1, limit = 10, q, estado, plaza_id }) {
    const where = {}

    if (estado) {
      where.estado = estado
    }

    if (q) {
      where.OR = [
        { nombre_completo: { contains: q } },
        { dpi: { contains: q } },
        { correo: { contains: q } },
        { plaza: { nombre: { contains: q } } },
      ]
    }

    if (plaza_id) {
      where.plaza_id = plaza_id
    }

    const [data, total] = await prisma.$transaction([
      prisma.postulante.findMany({
        where,
        include: {
          usuario: { select: { id: true, nombre: true } },
          plaza: { select: { id: true, nombre: true } },
          empresa: { select: { id: true, nombre: true } },
          patrono: { select: { id: true, nombre: true } },
        },
        orderBy: [{ fecha_registro: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.postulante.count({ where }),
    ])

    return { data, total, page, totalPages: Math.ceil(total / limit) || 1 }
  }

  // Devuelve un postulante con todas sus secciones. null si no existe
  obtenerPorId(id) {
    return prisma.postulante.findUnique({
      where: { id },
      include: INCLUDE_COMPLETO,
    })
  }

  // Crea un postulante con todas sus secciones anidadas en una sola transacción
  async crear(data, usuarioId) {
    const existente = await prisma.postulante.findUnique({ where: { dpi: data.dpi } })
    if (existente) {
      throw crearError('Ya existe un postulante registrado con ese DPI', 409)
    }

    const {
      datosFamiliares = [],
      educacionHistorial = [],
      idiomas = [],
      capacitaciones = [],
      experienciaLaboral = [],
      referenciasPersonales = [],
      ...generales
    } = data

    const creado = await prisma.postulante.create({
      data: {
        ...generales,
        usuario_id: usuarioId,
        estado: 'PENDIENTE',
        fecha_registro: new Date(),
        datosFamiliares: { create: datosFamiliares },
        educacionHistorial: { create: educacionHistorial },
        idiomas: { create: idiomas },
        capacitaciones: { create: capacitaciones },
        experienciaLaboral: { create: experienciaLaboral },
        referenciasPersonales: { create: referenciasPersonales },
      },
      include: INCLUDE_COMPLETO,
    })

    return creado
  }

  // Actualiza campos generales y/o reemplaza secciones completas dentro de una transacción
  async actualizar(id, data) {
    const postulante = await prisma.postulante.findUnique({ where: { id }, select: { id: true, dpi: true } })
    if (!postulante) {
      throw crearError('Postulante no encontrado', 404)
    }

    if (data.dpi && data.dpi !== postulante.dpi) {
      const duplicado = await prisma.postulante.findFirst({ where: { dpi: data.dpi, id: { not: id } } })
      if (duplicado) {
        throw crearError('Ya existe otro postulante registrado con ese DPI', 409)
      }
    }

    const { datosFamiliares, educacionHistorial, idiomas, capacitaciones, experienciaLaboral, referenciasPersonales, ...generales } = data

    await prisma.$transaction(async (tx) => {
      // Campos generales del postulante
      if (Object.keys(generales).length > 0) {
        await tx.postulante.update({ where: { id }, data: generales })
      }

      // Cada sección enviada sustituye por completo la existente
      for (const [clavePayload, modelo] of SECCIONES_HIJAS) {
        const items = data[clavePayload]
        if (!Array.isArray(items)) continue

        await tx[modelo].deleteMany({ where: { postulante_id: id } })
        if (items.length > 0) {
          await tx[modelo].createMany({
            data: items.map((item) => ({ ...item, postulante_id: id })),
          })
        }
      }
    })

    return this.obtenerPorId(id)
  }

  // Cambia el estado validando la transición y notifica por correo al postulante
  async cambiarEstado(id, nuevoEstado, extras = {}) {
    const postulante = await prisma.postulante.findUnique({ where: { id }, select: { id: true, estado: true } })
    if (!postulante) {
      throw crearError('Postulante no encontrado', 404)
    }

    const permitidos = TRANSICIONES_PERMITIDAS[postulante.estado] ?? []

    if (!permitidos.includes(nuevoEstado)) {
      const actual = ETIQUETAS_ESTADO[postulante.estado]

      if (permitidos.length === 0) {
        throw crearError(`El postulante está en estado "${actual}" (estado final) y no admite más cambios`, 400)
      }

      const destinos = permitidos.map((estado) => `"${ETIQUETAS_ESTADO[estado]}"`).join(' o ')
      throw crearError(`Transición inválida: desde "${actual}" solo puede pasar a ${destinos}`, 400)
    }

    // Guarda el nuevo estado y, si es una re-aplicación, actualiza la fecha de registro
    const data = { estado: nuevoEstado }
    if (postulante.estado === 'RECHAZADO' && nuevoEstado === 'PENDIENTE') {
      data.fecha_registro = new Date()
    }

    // Si se contrata, asignar empresa y patrono
    if (nuevoEstado === 'CONTRATADO') {
      if (extras.empresa_id) data.empresa_id = extras.empresa_id
      if (extras.patrono_id) data.patrono_id = extras.patrono_id
    }

    const actualizado = await prisma.postulante.update({
      where: { id },
      data,
      select: { id: true, estado: true, fecha_registro: true, nombre_completo: true, correo: true },
    })

    // El correo es un aviso complementario: si falla el envío NO se revierte el cambio de estado
    let correoEnviado = false
    try {
      await sendEstadoPostulanteEmail(actualizado.correo, actualizado.nombre_completo, nuevoEstado)
      correoEnviado = true
    } catch (errorCorreo) {
      console.error('No fue posible enviar el correo de cambio de estado:', errorCorreo.message)
    }

    return { ...actualizado, correoEnviado }
  }
}

// Singleton
export const postulanteService = new PostulanteService()
