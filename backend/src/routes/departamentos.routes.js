import { Router } from "express";
import {
  listarDepartamentos,
  obtenerDepartamento,
  crearDepartamento,
  actualizarDepartamento,
  desactivarDepartamento,
  activarDepartamento,
} from "../controllers/departamentos.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { ADMIN_ROLE } from "../config/roles.constant.js";

const router = Router();

router.use(authenticate, authorize(ADMIN_ROLE));

router.get("/", listarDepartamentos);
router.get("/nueva", (req, res) => res.json({ status: "ok", data: { esNueva: true } }));
router.get("/:id", obtenerDepartamento);
router.post("/", crearDepartamento);
router.put("/:id", actualizarDepartamento);
router.patch("/:id/desactivar", desactivarDepartamento);
router.patch("/:id/activar", activarDepartamento);

export default router;