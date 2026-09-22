import { Router } from "express";
import { listarHistorialEmpresa } from "../controllers/historial-empresa.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { ADMIN_ROLE } from "../config/roles.constant.js";

const router = Router();

router.use(authenticate, authorize(ADMIN_ROLE));

router.get("/", listarHistorialEmpresa); // Listar historial de empresas

export default router;