import { documentoService } from '../services/documento.service.js'
import { documentosValidator } from '../validators/documentos.validator.js'

// Funcion para validar el tipo de documento
function validarTipo(tipo, res) {
  const parsed = documentosValidator.tipoUploadSchema.safeParse({ tipo })
  if (!parsed.success) {
    res.status(400).json({ status: 'error', message: parsed.error.issues[0].message })
    return null
  }
  return parsed.data.tipo
}

// Controlador para subir un documento
export const subirDocumento = async (req, res) => {
  const tipo = validarTipo(req.body.tipo, res)
  if (!tipo) return

  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No se envió ningún archivo' })
  }

  try {
    documentosValidator.validarTipoArchivo(tipo, req.file.mimetype)
    const resultado = await documentoService.subir(req.params.id, tipo, req.file)
    res.json({ status: 'ok', data: resultado })
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ status: 'error', message: error.message })
    }
    console.error('Error subiendo documento:', error)
    res.status(500).json({ status: 'error', message: 'Error interno al subir documento' })
  }
}

// Controlador para listar documentos
export const listarDocumentos = async (req, res) => {
  try {
    const documentos = await documentoService.listar(req.params.id)
    res.json({ status: 'ok', data: documentos })
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al listar documentos' })
  }
}

// Controlador para obtener un documento especifico
export const obtenerDocumento = async (req, res) => {
  try {
    const documento = await documentoService.obtenerPorTipo(req.params.id, req.params.tipo)
    if (!documento) {
      return res.status(404).json({ status: 'error', message: 'Documento no encontrado' })
    }
    res.json({ status: 'ok', data: documento })
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al obtener documento' })
  }
}

// Controlador para descargar un documento
export const descargarDocumento = async (req, res) => {
  try {
    const { documento, rutaAbsoluta } = await documentoService.descargar(req.params.id, req.params.tipo)
    res.setHeader('Content-Type', documento.mime_type)
    res.setHeader('Content-Disposition', `attachment; filename="${documento.nombre_archivo}"`)
    res.sendFile(rutaAbsoluta)
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ status: 'error', message: error.message })
    }
    res.status(500).json({ status: 'error', message: 'Error al descargar documento' })
  }
}

// Controlador para eliminar un documento
export const eliminarDocumento = async (req, res) => {
  try {
    await documentoService.eliminar(req.params.id, req.params.tipo)
    res.json({ status: 'ok', message: 'Documento eliminado correctamente' })
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ status: 'error', message: error.message })
    }
    res.status(500).json({ status: 'error', message: 'Error al eliminar documento' })
  }
}
