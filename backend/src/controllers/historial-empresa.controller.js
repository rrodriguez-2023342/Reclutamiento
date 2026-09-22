import { listarHistorialEmpresaQuerySchema } from "../validators/historial-empresa.validator.js";
import { historialEmpresaService } from "../services/historial-empresa.service.js";

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

// Controlador para listar el historial de empresas
export const listarHistorialEmpresa = async (req, res) => {
  const query = validar(listarHistorialEmpresaQuerySchema, req.query, res);
  if (!query) return;

  const resultado = await historialEmpresaService.listarPorUsuario(query);
  res.json({ status: "ok", data: resultado });
};