import prisma from '../config/prisma.js'
import fs from 'fs'
import path from 'path'
import { documentosValidator } from '../validators/documentos.validator.js'

const UPLOAD_DIR = path.resolve('uploads', 'postulantes')

// Funciones auxiliares
function crearError(mensaje, status) {
  const error = new Error(mensaje)
  error.status = status
  return error
}

// Asegura que el directorio para el postulante exista, si no, lo crea
function asegurarDirectorio(postulanteId) {
  const dir = path.join(UPLOAD_DIR, String(postulanteId))
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

// Clase de servicio para manejar documentos
class DocumentoService {
  async listar(postulanteId) {
    const documentos = await prisma.documentoPostulante.findMany({
      where: { postulante_id: Number(postulanteId) },
      orderBy: { fecha_subida: 'desc' },
    })
    return documentos
  }

  async obtenerPorTipo(postulanteId, tipo) {
    return prisma.documentoPostulante.findUnique({
      where: {
        postulante_id_tipo: {
          postulante_id: Number(postulanteId),
          tipo,
        },
      },
    })
  }

  // Subir un documento para un postulante
  async subir(postulanteId, tipo, file) {
    const postulante = await prisma.postulante.findUnique({
      where: { id: Number(postulanteId) },
      select: { id: true, correo: true, nombre_completo: true },
    })
    if (!postulante) {
      throw crearError('Postulante no encontrado', 404)
    }

    // Validar mime type
    documentosValidator.validarTipoArchivo(tipo, file.mimetype)

    asegurarDirectorio(postulanteId)
    const rutaArchivo = path.resolve(file.path)

    if (!fs.existsSync(rutaArchivo)) {
      throw crearError('No fue posible guardar el archivo en el servidor', 500)
    }

    // Si ya existe, borrar el archivo anterior
    const existente = await this.obtenerPorTipo(postulanteId, tipo)
    if (existente) {
      const rutaExistente = path.resolve('uploads', existente.ruta)
      if (fs.existsSync(rutaExistente)) {
        fs.unlinkSync(rutaExistente)
      }
    }

    // Guardar en BD
    const documento = await prisma.documentoPostulante.upsert({
      where: {
        postulante_id_tipo: {
          postulante_id: Number(postulanteId),
          tipo,
        },
      },
      update: {
        nombre_archivo: file.originalname,
        ruta: path.relative(path.resolve('uploads'), rutaArchivo),
        mime_type: file.mimetype,
        tamano_bytes: file.size,
      },
      create: {
        postulante_id: Number(postulanteId),
        tipo,
        nombre_archivo: file.originalname,
        ruta: path.relative(path.resolve('uploads'), rutaArchivo),
        mime_type: file.mimetype,
        tamano_bytes: file.size,
      },
    })

    return { ...documento, postulante }
  }

  // Descargar un documento para un postulante
  async descargar(postulanteId, tipo) {
    const documento = await this.obtenerPorTipo(postulanteId, tipo)
    if (!documento) {
      throw crearError('Documento no encontrado', 404)
    }
    const rutaAbsoluta = path.resolve('uploads', documento.ruta)
    if (!fs.existsSync(rutaAbsoluta)) {
      throw crearError('Archivo físico no encontrado en el servidor', 404)
    }
    return { documento, rutaAbsoluta }
  }

  // Eliminar un documento para un postulante
  async eliminar(postulanteId, tipo) {
    const documento = await this.obtenerPorTipo(postulanteId, tipo)
    if (!documento) {
      throw crearError('Documento no encontrado', 404)
    }
    const rutaAbsoluta = path.resolve('uploads', documento.ruta)
    if (fs.existsSync(rutaAbsoluta)) {
      fs.unlinkSync(rutaAbsoluta)
    }
    await prisma.documentoPostulante.delete({
      where: { id: documento.id },
    })
    return { eliminado: true }
  }
}

export const documentoService = new DocumentoService()
