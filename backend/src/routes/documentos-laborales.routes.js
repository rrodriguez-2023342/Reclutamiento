import { Router } from 'express'
import {
  actualizarTipoDocumento,
  cambiarEstadoPlantilla,
  crearSolicitudDocumento,
  crearTipoDocumento,
  descargarDocumentoGenerado,
  descargarPlantilla,
  generarDocumento,
  listarDestinosGeneracion,
  listarMarcadores,
  listarMisDocumentosDirectos,
  listarMisSolicitudes,
  listarSolicitudes,
  listarTiposDocumento,
  listarVersionesPlantilla,
  marcarSolicitudEnProceso,
  obtenerSolicitud,
  previsualizarDocumento,
  rechazarSolicitud,
  subirPlantilla,
} from '../controllers/documentos-laborales.controller.js'
import { authenticate, authorize } from '../middlewares/auth.middleware.js'
import { ADMIN_ROLE, COLABORADOR_ROLE, RRHH_ROLE } from '../config/roles.constant.js'
import { uploadPlantilla } from '../config/multer-documentos.js'

const router = Router()
const gestores = [ADMIN_ROLE, RRHH_ROLE]
const todosLosRoles = [ADMIN_ROLE, RRHH_ROLE, COLABORADOR_ROLE]

router.use(authenticate)

router.get('/campos', authorize(...gestores), listarMarcadores)
router.get('/destinos-generacion', authorize(...gestores), listarDestinosGeneracion)
router.get('/tipos', authorize(...todosLosRoles), listarTiposDocumento)
router.post('/tipos', authorize(...gestores), crearTipoDocumento)
router.patch('/tipos/:tipoDocumentoId', authorize(...gestores), actualizarTipoDocumento)
router.get('/tipos/:tipoDocumentoId/plantillas', authorize(...gestores), listarVersionesPlantilla)
router.post('/tipos/:tipoDocumentoId/plantillas', authorize(...gestores), uploadPlantilla.single('archivo'), subirPlantilla)
router.patch('/plantillas/:plantillaId/estado', authorize(...gestores), cambiarEstadoPlantilla)
router.get('/plantillas/:plantillaId/descargar', authorize(...gestores), descargarPlantilla)

router.post('/solicitudes', authorize(COLABORADOR_ROLE), crearSolicitudDocumento)
router.get('/solicitudes/mias', authorize(COLABORADOR_ROLE), listarMisSolicitudes)
router.get('/solicitudes', authorize(...gestores), listarSolicitudes)
router.get('/solicitudes/:solicitudId', authorize(...todosLosRoles), obtenerSolicitud)
router.patch('/solicitudes/:solicitudId/en-proceso', authorize(...gestores), marcarSolicitudEnProceso)
router.post('/solicitudes/:solicitudId/rechazar', authorize(...gestores), rechazarSolicitud)

router.post('/previsualizar', authorize(...gestores), previsualizarDocumento)
router.post('/generar', authorize(...gestores), generarDocumento)
router.get('/generados/directos/mios', authorize(...gestores), listarMisDocumentosDirectos)
router.get('/generados/:documentoId/descargar', authorize(...gestores), descargarDocumentoGenerado)

export default router
