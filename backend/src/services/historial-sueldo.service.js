import prisma from "../config/prisma.js";

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

class HistorialSueldoService {
  // Registrar un cambio de sueldo/bonos en el historial
  async registrar({
    usuario_id,
    sueldo_anterior,
    sueldo_nuevo,
    bonos_anterior,
    bonos_nuevo,
    motivo,
    cambiado_por_id,
  }) {
    return prisma.historialSueldo.create({
      data: {
        usuario_id,
        sueldo_anterior: sueldo_anterior ?? null,
        sueldo_nuevo: sueldo_nuevo ?? null,
        bonos_anterior: bonos_anterior ?? null,
        bonos_nuevo: bonos_nuevo ?? null,
        motivo,
        cambiado_por_id: cambiado_por_id ?? null,
      },
    });
  }

  // Listar historial de sueldo de un usuario con paginación
  async listarPorUsuario({ usuario_id, page = 1, limit = 20 }) {
    const where = { usuario_id };

    const [data, total] = await prisma.$transaction([
      prisma.historialSueldo.findMany({
        where,
        orderBy: { fecha_cambio: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          cambiado_por: { select: { id: true, nombre: true } },
        },
      }),
      prisma.historialSueldo.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

export const historialSueldoService = new HistorialSueldoService();
