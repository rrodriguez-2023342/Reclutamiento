import prisma from "../config/prisma.js";

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

class HistorialRechazoService {
  async registrarRechazo({ postulante_id, motivo, rechazado_por }) {
    return prisma.historialRechazo.create({
      data: {
        postulante_id,
        motivo,
        rechazado_por,
      },
    });
  }

  async listarPorPostulante({ postulante_id, page = 1, limit = 20 }) {
    const where = { postulante_id };

    const [data, total] = await prisma.$transaction([
      prisma.historialRechazo.findMany({
        where,
        orderBy: { fecha_rechazo: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          rechazado_por_usuario: { select: { id: true, nombre: true } },
        },
      }),
      prisma.historialRechazo.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}

export const historialRechazoService = new HistorialRechazoService();