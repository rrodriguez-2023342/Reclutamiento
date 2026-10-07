import { Router } from 'express'
import {
  listarEmpresas,
  exportarEmpresas,
  getEmpresaById,
  createEmpresa,
  updateEmpresa,
  desactivarEmpresa,
  activarEmpresa,
} from '../controllers/empresa.controller.js'
import { authenticate, authorize, scopeEmpresas } from '../middlewares/auth.middleware.js'
import { ADMIN_ROLE, RRHH_ROLE } from '../config/roles.constant.js'

const router = Router()

router.use(authenticate, authorize(ADMIN_ROLE, RRHH_ROLE), scopeEmpresas)

router.get('/', listarEmpresas) // Listar todas la empresas
router.get('/export', exportarEmpresas) // Exportar todas las empresas filtradas
router.get('/:id', getEmpresaById) // Obtener una empresa por su ID
router.post('/', authorize(ADMIN_ROLE), createEmpresa) // Crear una nueva empresa
router.put('/:id', authorize(ADMIN_ROLE), updateEmpresa) // Actualizar una empresa existente
router.patch('/:id/desactivar', authorize(ADMIN_ROLE), desactivarEmpresa) // Desactivar una empresa
router.patch('/:id/activar', authorize(ADMIN_ROLE), activarEmpresa) // Activar una empresa

export default router
