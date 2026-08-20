import { Router } from 'express'
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from '../controllers/role.controller.js'
import { ADMIN_ROLE } from '../config/roles.constant.js'
import { authenticate, authorize } from '../middlewares/auth.middleware.js'

const router = Router()

// Todas las rutas de roles exigen: token JWT válido + rol Administrador.
// Sin token → 401. Con token pero sin rol admin → 403.
router.use(authenticate, authorize(ADMIN_ROLE))

router.get('/', getRoles) // Listar todos los roles
router.get('/:id', getRoleById) // Obtener un rol por id
router.post('/', createRole) // Crear un rol
router.put('/:id', updateRole) // Actualizar un rol
router.delete('/:id', deleteRole) // Eliminar un rol

export default router