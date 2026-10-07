import { Router } from 'express'
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from '../controllers/role.controller.js'
import { ADMIN_ROLE, RRHH_ROLE } from '../config/roles.constant.js'
import { authenticate, authorize } from '../middlewares/auth.middleware.js'

const router = Router()

// Todas las rutas de roles exigen: token JWT válido + rol Administrador o Recursos Humanos.
// Lectura disponible para ambos; escritura solo administrador.
// Sin token → 401. Con token pero sin rol permitido → 403.
router.use(authenticate, authorize(ADMIN_ROLE, RRHH_ROLE))

router.get('/', getRoles) // Listar todos los roles
router.get('/:id', getRoleById) // Obtener un rol por id
router.post('/', authorize(ADMIN_ROLE), createRole) // Crear un rol
router.put('/:id', authorize(ADMIN_ROLE), updateRole) // Actualizar un rol
router.delete('/:id', authorize(ADMIN_ROLE), deleteRole) // Eliminar un rol

export default router