import { listarHistorialEmpresaQuerySchema } from "../validators/historial-empresa.validator.js";
import { historialEmpresaService } from "../services/historial-empresa.service.js";
import prisma from "../config/prisma.js";

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

  // Alcance limitado (RRHH): el usuario debe estar en sus empresas asignadas
  if (Array.isArray(req.empresaIds)) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: query.usuario_id },
      select: { empresa_id: true },
    });
    if (!usuario || !req.empresaIds.includes(usuario.empresa_id)) {
      return res
        .status(404)
        .json({ status: "error", message: "Usuario no encontrado" });
    }
  }

  const resultado = await historialEmpresaService.listarPorUsuario(query);
  res.json({ status: "ok", data: resultado });
};