import { Router } from 'express'
import { obtenerResumenDashboard } from '../controllers/dashboard.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'

const router = Router()

router.use(authenticate)
router.get('/', obtenerResumenDashboard)

export default router
