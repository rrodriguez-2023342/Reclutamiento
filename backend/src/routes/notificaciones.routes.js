import { Router } from 'express'
import {
  listarNotificaciones,
  marcarNotificacionLeida,
  marcarNotificacionesLeidas,
} from '../controllers/notificaciones.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'

const router = Router()

router.use(authenticate)
router.get('/', listarNotificaciones)
router.patch('/leer-todas', marcarNotificacionesLeidas)
router.patch('/:id/leer', marcarNotificacionLeida)

export default router
