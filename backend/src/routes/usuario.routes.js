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
  getEmpresasAsignadas,
  asignarEmpresas,
} from '../controllers/usuario.controller.js'
import { authenticate, authorize, scopeEmpresas } from '../middlewares/auth.middleware.js'
import { ADMIN_ROLE, RRHH_ROLE } from '../config/roles.constant.js'

const router = Router()

router.use(authenticate, authorize(ADMIN_ROLE, RRHH_ROLE), scopeEmpresas)

router.get('/', listarUsuarios) // Obtiene la lista de usuarios
router.get('/export', exportarUsuarios) // Exporta todos los usuarios filtrados con historiales
router.get('/:id', getUsuarioById) // Obtiene la informacion de un usuario por su ID
router.get('/:id/empresas', getEmpresasAsignadas) // Empresas asignadas a un usuario RH
router.put('/:id/empresas', authorize(ADMIN_ROLE), asignarEmpresas) // Asigna empresas a un usuario RH (solo admin)
router.post('/', createUsuario) // Crea un nuevo usuario 
router.put('/:id', updateUsuario) // Actualiza la informacion de un usuario por su ID
router.post('/:id/baja', registrarBajaUsuario) // Guarda los datos de baja del usuario
router.patch('/:id/desactivar', desactivarUsuario) // Desactiva un usuario mediante su ID
router.patch('/:id/activar', activarUsuario) // Activa un usuario mediante su ID
router.post('/:id/reset-password', resetPasswordUsuario) // Restable la contrasela de un usuario mediante su ID

export default router
