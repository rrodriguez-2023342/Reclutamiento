import { Router } from "express";
import {
  listarDivisiones,
  exportarDivisiones,
  obtenerDivision,
  crearDivision,
  actualizarDivision,
  desactivarDivision,
  activarDivision,
} from "../controllers/divisiones.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { ADMIN_ROLE, RRHH_ROLE } from "../config/roles.constant.js";

const router = Router();

router.use(authenticate, authorize(ADMIN_ROLE, RRHH_ROLE));

router.get("/", listarDivisiones);
router.get("/export", exportarDivisiones);
router.get("/nueva", (req, res) => res.json({ status: "ok", data: { esNueva: true } }));
router.get("/:id", obtenerDivision);
router.post("/", authorize(ADMIN_ROLE), crearDivision);
router.put("/:id", authorize(ADMIN_ROLE), actualizarDivision);
router.patch("/:id/desactivar", authorize(ADMIN_ROLE), desactivarDivision);
router.patch("/:id/activar", authorize(ADMIN_ROLE), activarDivision);

export default router;