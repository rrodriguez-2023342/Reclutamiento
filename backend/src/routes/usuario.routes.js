import { Router } from 'express'
import {
  listarUsuarios,
  exportarUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  registrarBajaUsuario,
  desactivarUsuario,
  activarUsuario,
  resetPasswordUsuario,
} from '../controllers/usuario.controller.js'
import { authenticate, authorize } from '../middlewares/auth.middleware.js'
import { ADMIN_ROLE } from '../config/roles.constant.js'

const router = Router()

router.use(authenticate, authorize(ADMIN_ROLE))

router.get('/', listarUsuarios) // Obtiene la lista de usuarios
router.get('/export', exportarUsuarios) // Exporta todos los usuarios filtrados con historiales
router.get('/:id', getUsuarioById) // Obtiene la informacion de un usuario por su ID
router.post('/', createUsuario) // Crea un nuevo usuario 
router.put('/:id', updateUsuario) // Actualiza la informacion de un usuario por su ID
router.post('/:id/baja', registrarBajaUsuario) // Guarda los datos de baja del usuario
router.patch('/:id/desactivar', desactivarUsuario) // Desactiva un usuario mediante su ID
router.patch('/:id/activar', activarUsuario) // Activa un usuario mediante su ID
router.post('/:id/reset-password', resetPasswordUsuario) // Restable la contrasela de un usuario mediante su ID

export default router
