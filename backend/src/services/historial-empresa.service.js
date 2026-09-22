import prisma from "../config/prisma.js";

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

class HistorialEmpresaService {
  // Registrar un cambio de empresa en el historial
  async registrar({
    usuario_id,
    empresa_anterior_id,
    empresa_nuevo_id,
    motivo,
    cambiado_por_id,
  }) {
    return prisma.historialEmpresa.create({
      data: {
        usuario_id,
        empresa_anterior_id: empresa_anterior_id ?? null,
        empresa_nuevo_id: empresa_nuevo_id ?? null,
        motivo,
        cambiado_por_id: cambiado_por_id ?? null,
      },
    });
  }

  // Listar historial empresa de un usuario con paginacion
  async listarPorUsuario({ usuario_id, page = 1, limit = 20 }) {
    const where = { usuario_id };

    const [data, total] = await prisma.$transaction([
      prisma.historialEmpresa.findMany({
        where,
        orderBy: { fecha_cambio: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          empresa_anterior: { select: { id: true, nombre_empresa: true } },
          empresa_nuevo: { select: { id: true, nombre_empresa: true } },
          cambiado_por: { select: { id: true, nombre: true } },
        },
      }),
      prisma.historialEmpresa.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

export const historialEmpresaService = new HistorialEmpresaService();