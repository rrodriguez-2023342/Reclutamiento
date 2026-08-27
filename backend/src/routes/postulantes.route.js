import { Router } from 'express'
import {
  listarPostulantes,
  getPostulanteById,
  createPostulante,
  updatePostulante,
  updatePostulanteEstado,
} from '../controllers/postulantes.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'

const router = Router()

// Todas las rutas de postulantes exigen un token JWT válido.
router.use(authenticate)

router.get('/', listarPostulantes) // Listar con paginación, búsqueda y filtro por estado
router.get('/:id', getPostulanteById) // Obtener un postulante con todas sus secciones
router.post('/', createPostulante) // Crear un postulante con todo anidado
router.put('/:id', updatePostulante) // Actualizar campos generales y/o secciones
router.patch('/:id/estado', updatePostulanteEstado) // Cambiar estado del proceso

export default router
