import { listarHistorialQuerySchema } from "../validators/historial-sueldo.validator.js";
import { historialSueldoService } from "../services/historial-sueldo.service.js";

// Funcion para validar datos utilizando el esquema
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

// Controlador para listar el historial de sueldos
export const listarHistorial = async (req, res) => {
  const query = validar(listarHistorialQuerySchema, req.query, res);
  if (!query) return;

  const resultado = await historialSueldoService.listarPorUsuario(query);
  res.json({ status: "ok", data: resultado });
};
