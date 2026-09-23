import { Router } from "express";
import { listarHistorialRechazo } from "../controllers/historial-rechazo.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { ADMIN_ROLE } from "../config/roles.constant.js";

const router = Router();

router.use(authenticate, authorize(ADMIN_ROLE));

router.get("/", listarHistorialRechazo); // Listar historial de rechazo

export default router;