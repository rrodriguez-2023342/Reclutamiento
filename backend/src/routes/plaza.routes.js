import { Router } from "express";
import {
  listarPlazas,
  getPlazaById,
  createPlaza,
  updatePlaza,
  deletePlaza,
} from "../controllers/plaza.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", listarPlazas); // Listar todas las plazas
router.get("/:id", getPlazaById); // Obtener una plaza por su id
router.post("/", createPlaza); // Crear una nueva plaza
router.put("/:id", updatePlaza); // Actualizar una plaza existente
router.delete("/:id", deletePlaza); // Eliminar una plaza

export default router;
