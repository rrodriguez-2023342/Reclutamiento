import { z } from 'zod'
import {
  actualizarTipoDocumentoSchema,
  crearSolicitudDocumentoSchema,
  crearTipoDocumentoSchema,
  generarDocumentoSchema,
  listarSolicitudesSchema,
  listarTiposSchema,
  rechazarSolicitudSchema,
  subirPlantillaSchema,
} from '../validators/documentos.validator.js'
import { documentosLaboralesService } from '../services/documentos-laborales.service.js'

function validar(schema, data) {
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    const error = new Error(parsed.error.issues[0].message)
    error.status = 400
    throw error
  }
  return parsed.data
}

function identidad(req) {
  return { userId: req.userId, rol: req.userRol }
}

function idParam(req, campo) {
  const parsed = z.coerce.number().int().positive().safeParse(req.params[campo])
  if (!parsed.success) {
    const error = new Error('El identificador no es válido')
    error.status = 400
    throw error
  }
  return parsed.data
}

export const listarMarcadores = async (_req, res) => {
  res.json({ status: 'ok', data: await documentosLaboralesService.listarMarcadores() })
}

export const listarDestinosGeneracion = async (req, res) => {
  const data = await documentosLaboralesService.listarDestinosGeneracion(identidad(req))
  res.json({ status: 'ok', data })
}

export const listarTiposDocumento = async (req, res) => {
  const filtros = validar(listarTiposSchema, req.query)
  const data = await documentosLaboralesService.listarTipos({
    ...identidad(req),
    empresaId: filtros.empresa_id,
    activo: filtros.activo === undefined ? undefined : filtros.activo === 'true',
  })
  res.json({ status: 'ok', data })
}

export const crearTipoDocumento = async (req, res) => {
  const data = validar(crearTipoDocumentoSchema, req.body)
  const tipo = await documentosLaboralesService.crearTipo({ ...identidad(req), data })
  res.status(201).json({ status: 'ok', data: tipo })
}

export const actualizarTipoDocumento = async (req, res) => {
  const data = validar(actualizarTipoDocumentoSchema, req.body)
  const tipo = await documentosLaboralesService.actualizarTipo({
    ...identidad(req),
    tipoDocumentoId: idParam(req, 'tipoDocumentoId'),
    data,
  })
  res.json({ status: 'ok', data: tipo })
}

export const listarVersionesPlantilla = async (req, res) => {
  const data = await documentosLaboralesService.listarVersiones({
    ...identidad(req),
    tipoDocumentoId: idParam(req, 'tipoDocumentoId'),
  })
  res.json({ status: 'ok', data })
}

export const subirPlantilla = async (req, res) => {
  if (!req.file) {
    const error = new Error('Seleccione un archivo .docx de hasta 2 MB')
    error.status = 400
    throw error
  }
  const { notas_cambio: notasCambio } = validar(subirPlantillaSchema, req.body)
  const data = await documentosLaboralesService.subirPlantilla({
    ...identidad(req),
    tipoDocumentoId: idParam(req, 'tipoDocumentoId'),
    file: req.file,
    notasCambio,
  })
  res.status(201).json({ status: 'ok', data })
}

export const cambiarEstadoPlantilla = async (req, res) => {
  const { estado } = validar(
    z.object({ estado: z.enum(['ACTIVA', 'INACTIVA', 'OBSOLETA']) }),
    req.body,
  )
  const data = await documentosLaboralesService.cambiarEstadoPlantilla({
    ...identidad(req),
    plantillaId: idParam(req, 'plantillaId'),
    estado,
  })
  res.json({ status: 'ok', data })
}

export const eliminarVersionPlantilla = async (req, res) => {
  const data = await documentosLaboralesService.eliminarVersionPlantilla({
    ...identidad(req),
    plantillaId: idParam(req, 'plantillaId'),
  })
  res.json({ status: 'ok', data })
}

function descargar(res, next, ruta, nombre) {
  res.download(ruta, nombre, (error) => {
    if (error && !res.headersSent) next(error)
  })
}

export const descargarPlantilla = async (req, res, next) => {
  const archivo = await documentosLaboralesService.descargarPlantilla({
    ...identidad(req),
    plantillaId: idParam(req, 'plantillaId'),
  })
  descargar(res, next, archivo.ruta, archivo.nombre)
}

export const crearSolicitudDocumento = async (req, res) => {
  const data = validar(crearSolicitudDocumentoSchema, req.body)
  const solicitud = await documentosLaboralesService.crearSolicitud({
    userId: req.userId,
    tipoDocumentoId: data.tipo_documento_id,
    comentario: data.comentario,
  })
  res.status(201).json({ status: 'ok', data: solicitud })
}

export const listarMisSolicitudes = async (req, res) => {
  const data = await documentosLaboralesService.listarMisSolicitudes(req.userId)
  res.json({ status: 'ok', data })
}

export const listarMisDocumentosDirectos = async (req, res) => {
  const data = await documentosLaboralesService.listarMisDocumentosDirectos(req.userId)
  res.json({ status: 'ok', data })
}

export const listarDocumentosGenerados = async (req, res) => {
  const filtros = validar(z.object({ empresa_id: z.coerce.number().int().positive().optional() }), req.query)
  const data = await documentosLaboralesService.listarDocumentosGenerados({
    ...identidad(req),
    empresaId: filtros.empresa_id,
  })
  res.json({ status: 'ok', data })
}

export const eliminarDocumentoGenerado = async (req, res) => {
  const data = await documentosLaboralesService.eliminarDocumentoGenerado({
    ...identidad(req),
    documentoId: idParam(req, 'documentoId'),
  })
  res.json({ status: 'ok', data })
}

export const listarSolicitudes = async (req, res) => {
  const filtros = validar(listarSolicitudesSchema, req.query)
  const data = await documentosLaboralesService.listarSolicitudes({
    ...identidad(req),
    filtros,
  })
  res.json({ status: 'ok', data })
}

export const obtenerSolicitud = async (req, res) => {
  const data = await documentosLaboralesService.obtenerSolicitud({
    ...identidad(req),
    solicitudId: idParam(req, 'solicitudId'),
  })
  res.json({ status: 'ok', data })
}

export const marcarSolicitudEnProceso = async (req, res) => {
  const solicitudId = idParam(req, 'solicitudId')
  await documentosLaboralesService.obtenerSolicitud({
    ...identidad(req),
    solicitudId,
  })
  await documentosLaboralesService.iniciarSolicitud({ userId: req.userId, solicitudId })
  res.json({ status: 'ok', data: { id: solicitudId, estado: 'EN_PROCESO' } })
}

export const rechazarSolicitud = async (req, res) => {
  const { motivo } = validar(rechazarSolicitudSchema, req.body)
  const data = await documentosLaboralesService.rechazarSolicitud({
    ...identidad(req),
    solicitudId: idParam(req, 'solicitudId'),
    motivo,
  })
  res.json({ status: 'ok', data })
}

export const previsualizarDocumento = async (req, res) => {
  const data = validar(generarDocumentoSchema, req.body)
  const archivo = await documentosLaboralesService.previsualizar({
    ...identidad(req),
    solicitudId: data.solicitud_id,
    tipoDocumentoId: data.tipo_documento_id,
    plantillaId: data.plantilla_id,
    colaboradorId: data.colaborador_id,
    empresaId: data.empresa_id,
  })
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
  res.setHeader('Content-Disposition', `inline; filename="${archivo.nombre}"`)
  res.setHeader('Cache-Control', 'private, no-store')
  res.send(archivo.buffer)
}

export const generarDocumento = async (req, res) => {
  const data = validar(generarDocumentoSchema, req.body)
  const documento = await documentosLaboralesService.generar({
    ...identidad(req),
    solicitudId: data.solicitud_id,
    tipoDocumentoId: data.tipo_documento_id,
    plantillaId: data.plantilla_id,
    colaboradorId: data.colaborador_id,
    empresaId: data.empresa_id,
  })
  res.status(201).json({ status: 'ok', data: documento })
}

export const descargarDocumentoGenerado = async (req, res, next) => {
  const archivo = await documentosLaboralesService.descargarGenerado({
    ...identidad(req),
    documentoId: idParam(req, 'documentoId'),
  })
  descargar(res, next, archivo.ruta, archivo.nombre)
}
