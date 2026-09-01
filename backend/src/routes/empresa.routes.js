import { Router } from 'express'
import {
  listarEmpresas,
  getEmpresaById,
  createEmpresa,
  updateEmpresa,
  desactivarEmpresa,
  activarEmpresa,
} from '../controllers/empresa.controller.js'
import { authenticate } from '../middlewares/auth.middleware.js'

const router = Router()

router.use(authenticate)

router.get('/', listarEmpresas) // Listar todas la empresas
router.get('/:id', getEmpresaById) // Obtener una empresa por su ID
router.post('/', createEmpresa) // Crear una nueva empresa
router.put('/:id', updateEmpresa) // Actualizar una empresa existente
router.patch('/:id/desactivar', desactivarEmpresa) // Desactivar una empresa
router.patch('/:id/activar', activarEmpresa) // Activar una empresa

export default router
