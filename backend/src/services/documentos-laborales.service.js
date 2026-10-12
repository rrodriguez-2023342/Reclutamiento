import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import prisma from '../config/prisma.js'
import { ADMIN_ROLE, COLABORADOR_ROLE, RRHH_ROLE } from '../config/roles.constant.js'
import {
  esMarcadorAdmitido,
  MARCADORES_DOCUMENTO,
  obtenerDatosPlantilla,
} from './documentos-catalogo.service.js'

const STORAGE_ROOT = path.resolve('uploads', 'documentos')
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

function crearError(mensaje, status = 400) {
  const error = new Error(mensaje)
  error.status = status
  return error
}

function rutaPrivada(rutaRelativa) {
  const ruta = path.resolve(STORAGE_ROOT, rutaRelativa.replace(/[\\/]/g, path.sep))
  if (!ruta.startsWith(`${STORAGE_ROOT}${path.sep}`)) {
    throw crearError('La ruta solicitada no es válida', 400)
  }
  return ruta
}

function nombreSeguro(nombre) {
  const base = path.basename(nombre, path.extname(nombre))
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80)
  return base || 'documento'
}

function xmlATexto(texto) {
  return texto
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
}

function extraerMarcadores(zip) {
  const archivos = Object.keys(zip.files).filter((nombre) =>
    /^word\/(document|header\d+|footer\d+)\.xml$/.test(nombre),
  )
  const texto = archivos
    .map((nombre) => {
      const xml = zip.file(nombre)?.asText() || ''
      return [...xml.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)]
        .map((match) => xmlATexto(match[1]))
        .join('')
    })
    .join('\n')
  const marcadores = new Set()
  const regex = /{\s*[#/^]?\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*}/g
  for (const match of texto.matchAll(regex)) marcadores.add(match[1])
  return [...marcadores].sort()
}

function distanciaLevenshtein(a, b) {
  const fila = Array.from({ length: b.length + 1 }, (_, index) => index)
  for (let i = 1; i <= a.length; i += 1) {
    let anterior = fila[0]
    fila[0] = i
    for (let j = 1; j <= b.length; j += 1) {
      const actual = fila[j]
      fila[j] = Math.min(
        fila[j] + 1,
        fila[j - 1] + 1,
        anterior + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
      anterior = actual
    }
  }
  return fila[b.length]
}

function validarPlantilla(buffer) {
  let zip
  try {
    zip = new PizZip(buffer)
  } catch {
    throw crearError('El archivo no es un DOCX válido o está dañado')
  }
  if (!zip.file('word/document.xml')) {
    throw crearError('El archivo no contiene un documento Word válido')
  }

  let doc
  try {
    doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })
  } catch (error) {
    const problema = error.properties?.errors?.[0]
    const detalle = problema?.properties?.explanation || problema?.message
    throw crearError(
      `No se pudo interpretar la plantilla. Revisa que cada marcador tenga llaves completas y no esté separado por formato de Word.${detalle ? ` Detalle: ${detalle}` : ''}`,
    )
  }

  const marcadores = extraerMarcadores(zip)
  const conocidos = marcadores.filter(esMarcadorAdmitido)
  const desconocidos = marcadores
    .filter((marcador) => !esMarcadorAdmitido(marcador))
    .map((marcador) => {
      const disponibles = MARCADORES_DOCUMENTO.flatMap(({ campos }) =>
        campos.map(({ marcador: nombre }) => nombre),
      )
      const sugerido = disponibles
        .map((nombre) => ({ nombre, distancia: distanciaLevenshtein(marcador, nombre) }))
        .sort((a, b) => a.distancia - b.distancia)[0]
      return {
        marcador,
        sugerencia: sugerido?.distancia <= 4 ? sugerido.nombre : null,
      }
    })

  return { marcadores, conocidos, desconocidos, doc }
}

async function obtenerEmpresaUsuario(usuarioId) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { id: true, empresa_id: true, rol: { select: { nombre: true } } },
  })
  if (!usuario) throw crearError('Usuario no encontrado', 404)
  return usuario
}

async function verificarEmpresa(userId, rol, empresaId) {
  if (rol === ADMIN_ROLE) return
  if (!empresaId) throw crearError('El recurso no tiene una empresa asignada', 403)
  if (rol === RRHH_ROLE) {
    const asignacion = await prisma.usuarioEmpresa.findUnique({
      where: { usuario_id_empresa_id: { usuario_id: userId, empresa_id: empresaId } },
      select: { usuario_id: true },
    })
    if (!asignacion) throw crearError('No tiene permiso sobre esta empresa', 403)
    return
  }
  const usuario = await obtenerEmpresaUsuario(userId)
  if (rol !== COLABORADOR_ROLE || usuario.rol.nombre !== COLABORADOR_ROLE || usuario.empresa_id !== empresaId) {
    throw crearError('No tiene permiso para acceder a este recurso', 403)
  }
}

async function obtenerTipo(tipoDocumentoId) {
  const tipo = await prisma.tipoDocumentoLaboral.findUnique({
    where: { id: tipoDocumentoId },
    include: { empresa: { select: { id: true, nombre_empresa: true } } },
  })
  if (!tipo) throw crearError('Tipo de documento no encontrado', 404)
  return tipo
}

async function obtenerTipoDisponible(tipoDocumentoId, empresaId, soloActivos = true) {
  const tipo = await prisma.tipoDocumentoLaboral.findFirst({
    where: {
      id: tipoDocumentoId,
      ...(soloActivos ? { activo: true } : {}),
      OR: [{ empresa_id: null }, { empresa_id: empresaId }],
    },
  })
  if (!tipo) throw crearError('El tipo de documento no está disponible para esta empresa', 404)
  return tipo
}

async function obtenerDestinoDocumento(destinoId, empresaId, actorRol) {
  const destino = await prisma.usuario.findUnique({
    where: { id: destinoId },
    select: {
      id: true,
      empresa_id: true,
      rol: { select: { nombre: true } },
      empresas_asignadas: { select: { empresa_id: true } },
    },
  })
  const rolesPermitidos = [COLABORADOR_ROLE, RRHH_ROLE, ADMIN_ROLE]
  if (!destino || !rolesPermitidos.includes(destino.rol.nombre)) {
    throw crearError('No se encontró el usuario de destino', 404)
  }
  if (destino.rol.nombre === ADMIN_ROLE && actorRol !== ADMIN_ROLE && destino.empresa_id === null) {
    throw crearError('Solo un administrador puede generar documentos para un usuario Administrador RHCorp', 403)
  }

  const perteneceAEmpresa =
    destino.empresa_id === empresaId ||
    destino.empresas_asignadas.some((asignacion) => asignacion.empresa_id === empresaId)
  if (!perteneceAEmpresa && !(destino.rol.nombre === ADMIN_ROLE && actorRol === ADMIN_ROLE)) {
    throw crearError('El usuario de destino no pertenece a la empresa seleccionada', 403)
  }
  if (destino.rol.nombre === COLABORADOR_ROLE && destino.empresa_id !== empresaId) {
    throw crearError('No se encontró el colaborador de esta empresa', 404)
  }
  return destino
}

async function obtenerVersion(plantillaId, tipoDocumentoId) {
  const plantilla = await prisma.plantillaDocumento.findFirst({
    where: { id: plantillaId, tipo_documento_id: tipoDocumentoId },
  })
  if (!plantilla) throw crearError('La versión seleccionada no pertenece a este tipo de documento', 404)
  return plantilla
}

function respuestaTipo(tipo) {
  return {
    id: tipo.id,
    empresa_id: tipo.empresa_id,
    empresa: tipo.empresa,
    clave: tipo.clave,
    nombre: tipo.nombre,
    descripcion: tipo.descripcion,
    activo: tipo.activo,
    creado_en: tipo.creado_en,
  }
}

function respuestaPlantilla(plantilla) {
  return {
    id: plantilla.id,
    tipo_documento_id: plantilla.tipo_documento_id,
    version: plantilla.version,
    nombre_archivo: plantilla.nombre_archivo,
    tamano_bytes: plantilla.tamano_bytes,
    notas_cambio: plantilla.notas_cambio,
    marcadores: JSON.parse(plantilla.marcadores),
    estado: plantilla.estado,
    creada_en: plantilla.creada_en,
    creada_por: plantilla.creada_por,
  }
}

function respuestaSolicitud(solicitud) {
  return {
    ...solicitud,
    documento: solicitud.documento
      ? {
          id: solicitud.documento.id,
          nombre_archivo: solicitud.documento.nombre_archivo,
          generado_en: solicitud.documento.generado_en,
        }
      : null,
  }
}

async function obtenerUsuariosRH(empresaId) {
  const usuarios = await prisma.usuario.findMany({
    where: {
      activo: true,
      rol: { nombre: RRHH_ROLE },
      OR: [
        { empresa_id: empresaId },
        { empresas_asignadas: { some: { empresa_id: empresaId } } },
      ],
    },
    select: { id: true },
  })
  return usuarios.map(({ id }) => id)
}

async function notificarColaborador(tx, colaboradorId, solicitudId, tipo, mensaje, titulo) {
  await tx.notificacion.create({
    data: {
      usuario_id: colaboradorId,
      tipo,
      titulo: titulo || 'Actualización de solicitud de documento',
      mensaje,
      enlace: `/informes?solicitud=${solicitudId}`,
      entidad_id: solicitudId,
    },
  })
}

async function compilarDocumento(plantilla, colaboradorId, empresaId) {
  const ruta = rutaPrivada(plantilla.ruta_archivo)
  const buffer = await fs.readFile(ruta)
  const validacion = validarPlantilla(buffer)
  if (validacion.desconocidos.length) {
    const lista = validacion.desconocidos.map(({ marcador }) => `{${marcador}}`).join(', ')
    throw crearError(`La plantilla contiene marcadores no reconocidos: ${lista}. Corrige la plantilla antes de generar el documento`)
  }
  const datos = await obtenerDatosPlantilla(colaboradorId, empresaId)
  try {
    validacion.doc.render(datos)
    return validacion.doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    })
  } catch (error) {
    const detalle = error.properties?.errors?.[0]?.properties?.explanation || error.message
    throw crearError(`No fue posible generar el documento. Revisa los marcadores y la estructura de la plantilla. ${detalle}`)
  }
}

class DocumentosLaboralesService {
  async listarMarcadores() {
    return MARCADORES_DOCUMENTO
  }

  async listarDestinosGeneracion({ userId, rol }) {
    if (rol !== ADMIN_ROLE && rol !== RRHH_ROLE) {
      throw crearError('No tiene permiso para generar documentos', 403)
    }
    const empresasIds = rol === RRHH_ROLE
      ? (await prisma.usuarioEmpresa.findMany({
          where: { usuario_id: userId },
          select: { empresa_id: true },
        })).map(({ empresa_id }) => empresa_id)
      : null
    const usuarios = await prisma.usuario.findMany({
      where: {
        rol: { nombre: { in: [COLABORADOR_ROLE, RRHH_ROLE, ADMIN_ROLE] } },
        ...(empresasIds
          ? {
              OR: [
                { empresa_id: { in: empresasIds } },
                { empresas_asignadas: { some: { empresa_id: { in: empresasIds } } } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        nombre: true,
        empresa_id: true,
        rol: { select: { nombre: true } },
        empresa: { select: { id: true, nombre_empresa: true } },
        empresas_asignadas: {
          select: {
            empresa_id: true,
            empresa: { select: { id: true, nombre_empresa: true } },
          },
        },
      },
      orderBy: [{ nombre: 'asc' }, { id: 'asc' }],
    })
    return usuarios.map((usuario) => ({
      id: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.rol.nombre,
      empresa_id: usuario.empresa_id,
      empresa: usuario.empresa,
      empresas_asignadas: usuario.empresas_asignadas.map(({ empresa_id, empresa }) => ({
        empresa_id,
        empresa,
      })),
    }))
  }

  async listarTipos({ userId, rol, empresaId, activo }) {
    let empresaFiltro = empresaId
    if (rol === COLABORADOR_ROLE) {
      const usuario = await obtenerEmpresaUsuario(userId)
      if (usuario.rol.nombre !== COLABORADOR_ROLE || !usuario.empresa_id) {
        throw crearError('El colaborador no tiene una empresa asignada', 403)
      }
      empresaFiltro = usuario.empresa_id
    } else if (rol === RRHH_ROLE) {
      if (empresaFiltro) await verificarEmpresa(userId, rol, empresaFiltro)
      else {
        const asignaciones = await prisma.usuarioEmpresa.findMany({
          where: { usuario_id: userId },
          select: { empresa_id: true },
        })
        const empresasIds = asignaciones.map(({ empresa_id }) => empresa_id)
        return prisma.tipoDocumentoLaboral.findMany({
          where: {
            ...(activo === undefined ? {} : { activo }),
            OR: [{ empresa_id: null }, { empresa_id: { in: empresasIds } }],
          },
          include: { empresa: { select: { id: true, nombre_empresa: true } } },
          orderBy: [{ nombre: 'asc' }, { id: 'asc' }],
        }).then((tipos) => tipos.map(respuestaTipo))
      }
    }
    const where = {
      ...(activo === undefined ? {} : { activo }),
      ...(rol === ADMIN_ROLE && empresaFiltro === undefined
        ? {}
        : { OR: [{ empresa_id: null }, { empresa_id: empresaFiltro }] }),
    }
    const tipos = await prisma.tipoDocumentoLaboral.findMany({
      where,
      include: { empresa: { select: { id: true, nombre_empresa: true } } },
      orderBy: [{ nombre: 'asc' }, { id: 'asc' }],
    })
    return tipos.map(respuestaTipo)
  }

  async crearTipo({ userId, rol, data }) {
    let empresaId = data.empresa_id ?? null
    if (rol === RRHH_ROLE) {
      if (!empresaId) throw crearError('Seleccione la empresa para este tipo de documento')
      await verificarEmpresa(userId, rol, empresaId)
    } else if (rol !== ADMIN_ROLE) {
      throw crearError('No tiene permiso para crear tipos de documento', 403)
    }
    if (empresaId && !(await prisma.empresa.findUnique({ where: { id: empresaId }, select: { id: true } }))) {
      throw crearError('La empresa seleccionada no existe', 404)
    }
    const duplicado = await prisma.tipoDocumentoLaboral.findFirst({
      where: { empresa_id: empresaId, clave: data.clave },
      select: { id: true },
    })
    if (duplicado) throw crearError('Ya existe un tipo de documento con esa clave en este alcance', 409)
    const tipo = await prisma.tipoDocumentoLaboral.create({
      data: {
        empresa_id: empresaId,
        clave: data.clave,
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        creado_por_id: userId,
      },
      include: { empresa: { select: { id: true, nombre_empresa: true } } },
    })
    return respuestaTipo(tipo)
  }

  async actualizarTipo({ userId, rol, tipoDocumentoId, data }) {
    const tipo = await obtenerTipo(tipoDocumentoId)
    await verificarEmpresa(userId, rol, tipo.empresa_id)
    if (rol === COLABORADOR_ROLE) throw crearError('No tiene permiso para modificar tipos de documento', 403)
    const actualizado = await prisma.tipoDocumentoLaboral.update({
      where: { id: tipo.id },
      data,
      include: { empresa: { select: { id: true, nombre_empresa: true } } },
    })
    return respuestaTipo(actualizado)
  }

  async listarVersiones({ userId, rol, tipoDocumentoId }) {
    const tipo = await obtenerTipo(tipoDocumentoId)
    if (!(rol === RRHH_ROLE && tipo.empresa_id === null)) {
      await verificarEmpresa(userId, rol, tipo.empresa_id)
    }
    const versiones = await prisma.plantillaDocumento.findMany({
      where: { tipo_documento_id: tipo.id },
      include: { creada_por: { select: { id: true, nombre: true } } },
      orderBy: { version: 'desc' },
    })
    return versiones.map(respuestaPlantilla)
  }

  async subirPlantilla({ userId, rol, tipoDocumentoId, file, notasCambio }) {
    const tipo = await obtenerTipo(tipoDocumentoId)
    await verificarEmpresa(userId, rol, tipo.empresa_id)
    if (rol === COLABORADOR_ROLE) throw crearError('No tiene permiso para subir plantillas', 403)
    if (!file || file.mimetype !== DOCX_MIME || !file.originalname.toLowerCase().endsWith('.docx')) {
      throw crearError('Seleccione un archivo Word .docx válido')
    }
    const validacion = validarPlantilla(file.buffer)
    const ultimaVersion = await prisma.plantillaDocumento.findFirst({
      where: { tipo_documento_id: tipo.id },
      orderBy: { version: 'desc' },
      select: { version: true },
    })
    const version = (ultimaVersion?.version || 0) + 1
    const idArchivo = crypto.randomUUID()
    const nombreArchivo = `${idArchivo}.docx`
    const rutaRelativa = path.posix.join('plantillas', String(tipo.id), nombreArchivo)
    const ruta = rutaPrivada(rutaRelativa)
    await fs.mkdir(path.dirname(ruta), { recursive: true })
    await fs.writeFile(ruta, file.buffer, { flag: 'wx' })
    try {
      const plantilla = await prisma.plantillaDocumento.create({
        data: {
          tipo_documento_id: tipo.id,
          version,
          nombre_archivo: nombreSeguro(file.originalname) + '.docx',
          ruta_archivo: rutaRelativa,
          tamano_bytes: file.size,
          sha256: crypto.createHash('sha256').update(file.buffer).digest('hex'),
          notas_cambio: notasCambio || null,
          marcadores: JSON.stringify(validacion.marcadores),
          creada_por_id: userId,
        },
        include: { creada_por: { select: { id: true, nombre: true } } },
      })
      return {
        plantilla: respuestaPlantilla(plantilla),
        validacion: {
          reconocidos: validacion.conocidos,
          desconocidos: validacion.desconocidos,
          advertencias: validacion.desconocidos.length
            ? ['Los marcadores desconocidos se guardaron para revisión, pero impiden generar este documento hasta corregir la plantilla.']
            : [],
        },
      }
    } catch (error) {
      await fs.unlink(ruta).catch(() => {})
      if (error.code === 'P2002') {
        throw crearError('Otra versión se guardó al mismo tiempo. Vuelva a subir el archivo para crear la siguiente versión.', 409)
      }
      throw error
    }
  }

  async cambiarEstadoPlantilla({ userId, rol, plantillaId, estado }) {
    const plantilla = await prisma.plantillaDocumento.findUnique({
      where: { id: plantillaId },
      include: { tipo_documento: true },
    })
    if (!plantilla) throw crearError('Versión de plantilla no encontrada', 404)
    await verificarEmpresa(userId, rol, plantilla.tipo_documento.empresa_id)
    if (rol === COLABORADOR_ROLE) throw crearError('No tiene permiso para modificar plantillas', 403)
    const updated = await prisma.plantillaDocumento.update({
      where: { id: plantillaId },
      data: { estado },
      include: { creada_por: { select: { id: true, nombre: true } } },
    })
    return respuestaPlantilla(updated)
  }

  async descargarPlantilla({ userId, rol, plantillaId }) {
    const plantilla = await prisma.plantillaDocumento.findUnique({
      where: { id: plantillaId },
      include: { tipo_documento: true },
    })
    if (!plantilla) throw crearError('Versión de plantilla no encontrada', 404)
    if (!(rol === RRHH_ROLE && plantilla.tipo_documento.empresa_id === null)) {
      await verificarEmpresa(userId, rol, plantilla.tipo_documento.empresa_id)
    }
    const ruta = rutaPrivada(plantilla.ruta_archivo)
    return { ruta, nombre: plantilla.nombre_archivo }
  }

  async crearSolicitud({ userId, tipoDocumentoId, comentario }) {
    const usuario = await obtenerEmpresaUsuario(userId)
    if (usuario.rol.nombre !== COLABORADOR_ROLE || !usuario.empresa_id) {
      throw crearError('Solo un colaborador con empresa asignada puede solicitar documentos', 403)
    }
    const tipo = await obtenerTipoDisponible(tipoDocumentoId, usuario.empresa_id)
    const recursosHumanosIds = await obtenerUsuariosRH(usuario.empresa_id)
    if (!recursosHumanosIds.length) {
      throw crearError('No hay usuarios activos de Recursos Humanos asignados a tu empresa para recibir la solicitud', 409)
    }
    const solicitud = await prisma.$transaction(async (tx) => {
      const nuevaSolicitud = await tx.solicitudDocumento.create({
        data: {
          tipo_documento_id: tipo.id,
          colaborador_id: userId,
          empresa_id: usuario.empresa_id,
          comentario: comentario || null,
        },
        include: {
          tipo_documento: { select: { nombre: true } },
          colaborador: { select: { nombre: true } },
        },
      })
      await tx.notificacion.createMany({
        data: recursosHumanosIds.map((usuario_id) => ({
          usuario_id,
          tipo: 'SOLICITUD_DOCUMENTO',
          titulo: 'Nueva solicitud de documento',
          mensaje: `${nuevaSolicitud.colaborador.nombre} solicitó: ${tipo.nombre}.`,
          enlace: `/informes?solicitud=${nuevaSolicitud.id}`,
          entidad_id: nuevaSolicitud.id,
        })),
      })
      return nuevaSolicitud
    })
    return respuestaSolicitud({ ...solicitud, documento: null })
  }

  async listarMisSolicitudes(userId) {
    const solicitudes = await prisma.solicitudDocumento.findMany({
      where: { colaborador_id: userId },
      include: {
        tipo_documento: { select: { id: true, nombre: true } },
        documento: { select: { id: true, nombre_archivo: true, generado_en: true } },
      },
      orderBy: { solicitada_en: 'desc' },
    })
    return solicitudes.map(respuestaSolicitud)
  }

  async listarMisDocumentosDirectos(userId) {
    return prisma.documentoGenerado.findMany({
      where: { colaborador_id: userId, solicitud_id: null },
      select: {
        id: true,
        nombre_archivo: true,
        generado_en: true,
        plantilla: {
          select: {
            tipo_documento: { select: { nombre: true } },
          },
        },
      },
      orderBy: { generado_en: 'desc' },
    }).then((documentos) => documentos.map(({ plantilla, ...documento }) => ({
      ...documento,
      tipo_documento: plantilla.tipo_documento,
    })))
  }

  async listarSolicitudes({ userId, rol, filtros }) {
    if (rol !== ADMIN_ROLE && rol !== RRHH_ROLE) {
      throw crearError('No tiene permiso para listar solicitudes de otras personas', 403)
    }
    const scope =
      rol === ADMIN_ROLE
        ? {}
        : { empresa_id: { in: (await prisma.usuarioEmpresa.findMany({
            where: { usuario_id: userId },
            select: { empresa_id: true },
          })).map(({ empresa_id }) => empresa_id) } }
    if (filtros.colaborador_id) {
      const target = await prisma.usuario.findUnique({
        where: { id: filtros.colaborador_id },
        select: { empresa_id: true, rol: { select: { nombre: true } } },
      })
      if (!target || target.rol.nombre !== COLABORADOR_ROLE) throw crearError('Colaborador no encontrado', 404)
      if (rol === RRHH_ROLE) await verificarEmpresa(userId, rol, target.empresa_id)
    }
    if (filtros.empresa_id && rol === RRHH_ROLE) {
      await verificarEmpresa(userId, rol, filtros.empresa_id)
    }
    const solicitudes = await prisma.solicitudDocumento.findMany({
      where: {
        ...scope,
        ...(filtros.empresa_id ? { empresa_id: filtros.empresa_id } : {}),
        ...(filtros.estado ? { estado: filtros.estado } : {}),
        ...(filtros.tipo_documento_id ? { tipo_documento_id: filtros.tipo_documento_id } : {}),
        ...(filtros.colaborador_id ? { colaborador_id: filtros.colaborador_id } : {}),
      },
      include: {
        tipo_documento: { select: { id: true, nombre: true } },
        colaborador: { select: { id: true, nombre: true } },
        empresa: { select: { id: true, nombre_empresa: true } },
        atendida_por: { select: { id: true, nombre: true } },
        documento: { select: { id: true, nombre_archivo: true, generado_en: true } },
      },
      orderBy: { solicitada_en: 'desc' },
    })
    return solicitudes.map(respuestaSolicitud)
  }

  async obtenerSolicitud({ userId, rol, solicitudId }) {
    const solicitud = await prisma.solicitudDocumento.findUnique({
      where: { id: solicitudId },
      include: {
        tipo_documento: { select: { id: true, nombre: true } },
        colaborador: { select: { id: true, nombre: true } },
        empresa: { select: { id: true, nombre_empresa: true } },
        documento: { select: { id: true, nombre_archivo: true, generado_en: true } },
      },
    })
    if (!solicitud) throw crearError('Solicitud no encontrada', 404)
    if (rol === COLABORADOR_ROLE) {
      if (solicitud.colaborador_id !== userId) throw crearError('Solicitud no encontrada', 404)
    } else {
      await verificarEmpresa(userId, rol, solicitud.empresa_id)
    }
    return respuestaSolicitud(solicitud)
  }

  async iniciarSolicitud({ userId, solicitudId }) {
    const solicitud = await prisma.solicitudDocumento.findUnique({
      where: { id: solicitudId },
      select: { id: true, estado: true },
    })
    if (!solicitud) throw crearError('Solicitud no encontrada', 404)
    if (!['PENDIENTE', 'EN_PROCESO'].includes(solicitud.estado)) {
      throw crearError('La solicitud ya fue atendida', 409)
    }
    const actualizado = await prisma.solicitudDocumento.updateMany({
      where: { id: solicitudId, estado: solicitud.estado },
      data: { estado: 'EN_PROCESO', atendida_por_id: userId, atendida_en: new Date() },
    })
    if (!actualizado.count) {
      throw crearError('La solicitud cambió mientras se procesaba. Actualice la bandeja.', 409)
    }
  }

  async rechazarSolicitud({ userId, rol, solicitudId, motivo }) {
    const solicitud = await prisma.solicitudDocumento.findUnique({ where: { id: solicitudId } })
    if (!solicitud) throw crearError('Solicitud no encontrada', 404)
    await verificarEmpresa(userId, rol, solicitud.empresa_id)
    if (!['PENDIENTE', 'EN_PROCESO'].includes(solicitud.estado)) {
      throw crearError('La solicitud ya fue atendida', 409)
    }
    await prisma.$transaction(async (tx) => {
      const resultado = await tx.solicitudDocumento.updateMany({
        where: { id: solicitudId, estado: solicitud.estado },
        data: {
          estado: 'RECHAZADA',
          motivo_rechazo: motivo,
          atendida_por_id: userId,
          atendida_en: new Date(),
        },
      })
      if (!resultado.count) throw crearError('La solicitud cambió mientras se procesaba. Actualice la bandeja.', 409)
      await tx.notificacion.create({
        data: {
          usuario_id: solicitud.colaborador_id,
          tipo: 'SOLICITUD_DOCUMENTO_RECHAZADA',
          titulo: 'Actualización de solicitud de documento',
          mensaje: `La solicitud fue rechazada. Motivo: ${motivo}`,
          enlace: `/informes?solicitud=${solicitud.id}`,
          entidad_id: solicitud.id,
        },
      })
    })
    return { id: solicitud.id, estado: 'RECHAZADA' }
  }

  async prepararGeneracion({ userId, rol, plantillaId, solicitudId, tipoDocumentoId, colaboradorId, empresaId: empresaSolicitadaId }) {
    let solicitud = null
    let tipoId = tipoDocumentoId
    let destinoId = colaboradorId
    let destinoRol
    let empresaId
    if (solicitudId) {
      solicitud = await prisma.solicitudDocumento.findUnique({ where: { id: solicitudId } })
      if (!solicitud) throw crearError('Solicitud no encontrada', 404)
      await verificarEmpresa(userId, rol, solicitud.empresa_id)
      if (!['PENDIENTE', 'EN_PROCESO'].includes(solicitud.estado)) {
        throw crearError('La solicitud ya fue atendida', 409)
      }
      tipoId = solicitud.tipo_documento_id
      destinoId = solicitud.colaborador_id
      destinoRol = COLABORADOR_ROLE
      empresaId = solicitud.empresa_id
    } else {
      if (!tipoId || !destinoId) throw crearError('Faltan datos del documento')
      const destino = await prisma.usuario.findUnique({
        where: { id: destinoId },
        select: {
          empresa_id: true,
          rol: { select: { nombre: true } },
          empresas_asignadas: { select: { empresa_id: true } },
        },
      })
      const rolDestino = destino?.rol.nombre
      if (!destino || ![COLABORADOR_ROLE, RRHH_ROLE, ADMIN_ROLE].includes(rolDestino)) {
        throw crearError('Usuario de destino no encontrado', 404)
      }
      destinoRol = rolDestino
      if (rolDestino === COLABORADOR_ROLE) {
        empresaId = destino.empresa_id
        if (empresaSolicitadaId && empresaSolicitadaId !== empresaId) {
          throw crearError('El colaborador no pertenece a la empresa seleccionada', 403)
        }
      } else if (rolDestino === ADMIN_ROLE && rol !== ADMIN_ROLE && destino.empresa_id === null) {
        throw crearError('Solo un administrador puede generar documentos para un usuario Administrador RHCorp', 403)
      } else {
        const empresasDestino = [
          ...(destino.empresa_id ? [destino.empresa_id] : []),
          ...destino.empresas_asignadas.map(({ empresa_id }) => empresa_id),
        ]
        empresaId = empresaSolicitadaId || destino.empresa_id || (empresasDestino.length === 1 ? empresasDestino[0] : undefined)
        if (empresaId && !empresasDestino.includes(empresaId) && !(rolDestino === ADMIN_ROLE && rol === ADMIN_ROLE)) {
          throw crearError('El usuario de destino no pertenece a la empresa seleccionada', 403)
        }
        if (!empresaId) {
          throw crearError('Seleccione una empresa para el documento de este usuario', 400)
        }
      }
      await verificarEmpresa(userId, rol, empresaId)
    }
    await obtenerDestinoDocumento(destinoId, empresaId, rol)
    const tipo = await obtenerTipoDisponible(tipoId, empresaId, false)
    const plantilla = await obtenerVersion(plantillaId, tipo.id)
    const datos = {
      solicitud,
      tipo,
      plantilla,
      colaboradorId: destinoId,
      destinoRol,
      empresaId,
    }
    return datos
  }

  async previsualizar(args) {
    const contexto = await this.prepararGeneracion(args)
    const buffer = await compilarDocumento(contexto.plantilla, contexto.colaboradorId, contexto.empresaId)
    return { buffer, nombre: `vista-previa-v${contexto.plantilla.version}.docx` }
  }

  async generar(args) {
    const contexto = await this.prepararGeneracion(args)
    if (contexto.solicitud) {
      await this.iniciarSolicitud({ userId: args.userId, solicitudId: contexto.solicitud.id })
    }
    const buffer = await compilarDocumento(contexto.plantilla, contexto.colaboradorId, contexto.empresaId)
    const marcaTiempo = new Date().toISOString().slice(0, 10)
    const nombre = `${nombreSeguro(contexto.tipo.nombre)}-${contexto.colaboradorId}-${marcaTiempo}.docx`
    const rutaRelativa = path.posix.join(
      'generados',
      String(contexto.empresaId),
      `${crypto.randomUUID()}.docx`,
    )
    const ruta = rutaPrivada(rutaRelativa)
    await fs.mkdir(path.dirname(ruta), { recursive: true })
    await fs.writeFile(ruta, buffer, { flag: 'wx' })
    try {
      const documento = await prisma.$transaction(async (tx) => {
        if (contexto.solicitud) {
          const actualizado = await tx.solicitudDocumento.updateMany({
            where: {
              id: contexto.solicitud.id,
              estado: 'EN_PROCESO',
              atendida_por_id: args.userId,
            },
            data: { estado: 'GENERADO', atendida_en: new Date() },
          })
          if (!actualizado.count) throw crearError('La solicitud cambió mientras se generaba el documento', 409)
        }
        const documento = await tx.documentoGenerado.create({
          data: {
            solicitud_id: contexto.solicitud?.id || null,
            plantilla_id: contexto.plantilla.id,
            colaborador_id: contexto.colaboradorId,
            empresa_id: contexto.empresaId,
            generado_por_id: args.userId,
            nombre_archivo: nombre,
            ruta_archivo: rutaRelativa,
            tamano_bytes: buffer.length,
            sha256: crypto.createHash('sha256').update(buffer).digest('hex'),
          },
          select: {
            id: true,
            nombre_archivo: true,
            generado_en: true,
            solicitud_id: true,
            colaborador_id: true,
          },
        })
        if (contexto.solicitud) {
          await notificarColaborador(
            tx,
            contexto.colaboradorId,
            contexto.solicitud.id,
            'DOCUMENTO_GENERADO',
            `Tu documento "${contexto.tipo.nombre}" está listo. Pasa a Recursos Humanos para recogerlo.`,
            'Tu documento está listo',
          )
        } else {
          const esColaborador = contexto.destinoRol === COLABORADOR_ROLE
          await tx.notificacion.create({
            data: {
              usuario_id: contexto.colaboradorId,
              tipo: 'DOCUMENTO_GENERADO',
              titulo: esColaborador ? 'Tu documento está listo' : 'Documento listo para descargar',
              mensaje: esColaborador
                ? `Tu documento "${contexto.tipo.nombre}" está listo. Pasa a Recursos Humanos para recogerlo.`
                : `Se generó el documento "${contexto.tipo.nombre}" para ti.`,
              enlace: '/informes',
              entidad_id: documento.id,
            },
          })
        }
        return documento
      })
      return documento
    } catch (error) {
      await fs.unlink(ruta).catch(() => {})
      throw error
    }
  }

  async descargarGenerado({ userId, rol, documentoId }) {
    if (rol === COLABORADOR_ROLE) {
      throw crearError('Los colaboradores deben recoger sus documentos en Recursos Humanos', 403)
    }
    const documento = await prisma.documentoGenerado.findUnique({
      where: { id: documentoId },
    })
    if (!documento) throw crearError('Documento generado no encontrado', 404)
    await verificarEmpresa(userId, rol, documento.empresa_id)
    const ruta = rutaPrivada(documento.ruta_archivo)
    return { ruta, nombre: documento.nombre_archivo }
  }
}

export const documentosLaboralesService = new DocumentosLaboralesService()
export { DOCX_MIME }
