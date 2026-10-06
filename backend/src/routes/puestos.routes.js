import { Router } from "express";
import {
  listarPuestos,
  exportarPuestos,
  obtenerPuesto,
  crearPuesto,
  actualizarPuesto,
  desactivarPuesto,
  activarPuesto,
} from "../controllers/puestos.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { ADMIN_ROLE } from "../config/roles.constant.js";

const router = Router();

router.use(authenticate, authorize(ADMIN_ROLE));

router.get("/", listarPuestos);
router.get("/export", exportarPuestos);
router.get("/nueva", (req, res) => res.json({ status: "ok", data: { esNueva: true } }));
router.get("/:id", obtenerPuesto);
router.post("/", crearPuesto);
router.put("/:id", actualizarPuesto);
router.patch("/:id/desactivar", desactivarPuesto);
router.patch("/:id/activar", activarPuesto);

export default router;