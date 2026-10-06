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
import { ADMIN_ROLE } from "../config/roles.constant.js";

const router = Router();

router.use(authenticate, authorize(ADMIN_ROLE));

router.get("/", listarDivisiones);
router.get("/export", exportarDivisiones);
router.get("/nueva", (req, res) => res.json({ status: "ok", data: { esNueva: true } }));
router.get("/:id", obtenerDivision);
router.post("/", crearDivision);
router.put("/:id", actualizarDivision);
router.patch("/:id/desactivar", desactivarDivision);
router.patch("/:id/activar", activarDivision);

export default router;