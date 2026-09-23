import { listarHistorialRechazoQuerySchema } from "../validators/historial-rechazo.validator.js";
import { historialRechazoService } from "../services/historial-rechazo.service.js";

// Funcion para validar datos utilizando esquema
function validar(schema, datos, res) {
  const parsed = schema.safeParse(datos);
  if (!parsed.success) {
    res.status(400).json({
      status: "error",
      message: parsed.error.issues[0].message,
    });
    return null;
  }
  return parsed.data;
}

// Controlador para listar el historial de rechazos
export const listarHistorialRechazo = async (req, res) => {
  const query = validar(listarHistorialRechazoQuerySchema, req.query, res);
  if (!query) return;

  const resultado = await historialRechazoService.listarPorPostulante(query);
  res.json({ status: "ok", data: resultado });
};