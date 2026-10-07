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
import { ADMIN_ROLE, RRHH_ROLE } from "../config/roles.constant.js";

const router = Router();

router.use(authenticate, authorize(ADMIN_ROLE, RRHH_ROLE));

router.get("/", listarPuestos);
router.get("/export", exportarPuestos);
router.get("/nueva", (req, res) => res.json({ status: "ok", data: { esNueva: true } }));
router.get("/:id", obtenerPuesto);
router.post("/", authorize(ADMIN_ROLE), crearPuesto);
router.put("/:id", authorize(ADMIN_ROLE), actualizarPuesto);
router.patch("/:id/desactivar", authorize(ADMIN_ROLE), desactivarPuesto);
router.patch("/:id/activar", authorize(ADMIN_ROLE), activarPuesto);

export default router;