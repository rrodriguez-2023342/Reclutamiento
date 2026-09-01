import { Router } from 'express'
import {
  listarPatronos,
  getPatronoById,
  createPatrono,
  updatePatrono,
  desactivarPatrono,
  activarPatrono,
} from '../controllers/patrono.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'

const router = Router()

router.use(authenticate)

router.get('/', listarPatronos) // Listar todos los patronos
router.get('/:id', getPatronoById) // Obtener un patrono por su ID
router.post('/', createPatrono) // Crear un nuevo patrono
router.put('/:id', updatePatrono) // Actualizar un patrono existente
router.patch('/:id/desactivar', desactivarPatrono) // Desactivar un patrono
router.patch('/:id/activar', activarPatrono) // Activar un patrono

export default router
