import prisma from '../config/prisma.js'

// Servicio para obtener el resumen del dashboard
class DashboardService {
  // Obtiene el resumen del dashboard
  async obtenerResumen() {
    const [totalPostulantes, pendientes, totalPlazas, ultimasSolicitudes] = await prisma.$transaction([
      prisma.postulante.count(),
      prisma.postulante.count({ where: { estado: 'POSTULANTE' } }),
      prisma.plaza.count({ where: { activo: true } }),
      prisma.postulante.findMany({
        take: 4,
        orderBy: [{ fecha_registro: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          nombre_completo: true,
          plaza: { select: { nombre: true } },
          estado: true,
          fecha_registro: true,
        },
      }),
    ])

    return {
      totalPostulantes,
      plazasSolicitadas: totalPlazas,
      pendientes,
      ultimasSolicitudes,
    }
  }
}

export const dashboardService = new DashboardService()
