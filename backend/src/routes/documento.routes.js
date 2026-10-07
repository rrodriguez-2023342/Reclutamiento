import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import {
  subirDocumento,
  listarDocumentos,
  obtenerDocumento,
  descargarDocumento,
  eliminarDocumento,
  verFoto,
} from '../controllers/documento.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'
import { uploadDocumento } from '../config/multer.js'

const router = Router()

// Todas las rutas de documentos requieren autenticacion
router.use(authenticate)

// Crea el directorio del postulante antes de que multer intente escribir
function asegurarDirectorioPostulante(req, _res, next) {
  const dir = path.resolve('uploads', 'postulantes', String(req.params.id))
  fs.mkdirSync(dir, { recursive: true })
  next()
}

// Agrega un documento para el postulante con el ID especificadp
router.post('/:id/documentos', asegurarDirectorioPostulante, uploadDocumento.single('archivo'), subirDocumento)
router.get('/:id/foto', verFoto) // Ruta para obtener la foto del postulante
router.get('/:id/documentos', listarDocumentos) // Lista todos los documentos del postulante con el ID especificado
router.get('/:id/documentos/:tipo', obtenerDocumento) // Obtiene un documento especifico del postulante con el ID y tipo especificados
router.get('/:id/documentos/:tipo/descargar', descargarDocumento) // Descarga un documento especifico del postulante con el ID y tipo especificados
router.delete('/:id/documentos/:tipo', eliminarDocumento) // Elimina un documento especifico del postulante con el ID y tipo especificados

export default router
