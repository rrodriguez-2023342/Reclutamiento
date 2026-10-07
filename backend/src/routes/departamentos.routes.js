import { Router } from "express";
import {
  listarDepartamentos,
  exportarDepartamentos,
  obtenerDepartamento,
  crearDepartamento,
  actualizarDepartamento,
  desactivarDepartamento,
  activarDepartamento,
} from "../controllers/departamentos.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { ADMIN_ROLE, RRHH_ROLE } from "../config/roles.constant.js";

const router = Router();

router.use(authenticate, authorize(ADMIN_ROLE, RRHH_ROLE));

router.get("/", listarDepartamentos);
router.get("/export", exportarDepartamentos);
router.get("/nueva", (req, res) => res.json({ status: "ok", data: { esNueva: true } }));
router.get("/:id", obtenerDepartamento);
router.post("/", authorize(ADMIN_ROLE), crearDepartamento);
router.put("/:id", authorize(ADMIN_ROLE), actualizarDepartamento);
router.patch("/:id/desactivar", authorize(ADMIN_ROLE), desactivarDepartamento);
router.patch("/:id/activar", authorize(ADMIN_ROLE), activarDepartamento);

export default router;