import { Router } from "express";
import { listarHistorial } from "../controllers/historial-sueldo.controller.js";
import { authenticate, authorize, scopeEmpresas } from "../middlewares/auth.middleware.js";
import { ADMIN_ROLE, RRHH_ROLE } from "../config/roles.constant.js";

const router = Router();

router.use(authenticate, authorize(ADMIN_ROLE, RRHH_ROLE), scopeEmpresas);

router.get("/", listarHistorial); // Listar el historial de los sueldos

export default router;
