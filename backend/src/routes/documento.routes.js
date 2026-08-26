import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import {
  subirDocumento,
  listarDocumentos,
  obtenerDocumento,
  descargarDocumento,
  eliminarDocumento,
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

router.post('/:id/documentos', asegurarDirectorioPostulante, uploadDocumento.single('archivo'), subirDocumento)
router.get('/:id/documentos', listarDocumentos)
router.get('/:id/documentos/:tipo', obtenerDocumento)
router.get('/:id/documentos/:tipo/descargar', descargarDocumento)
router.delete('/:id/documentos/:tipo', eliminarDocumento)

export default router
