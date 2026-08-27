import prisma from '../config/prisma.js'

class DashboardService {
  async obtenerResumen() {
    const [totalPostulantes, enProceso, totalPlazas, ultimasSolicitudes] = await prisma.$transaction([
      prisma.postulante.count(),
      prisma.postulante.count({ where: { estado: 'EN_PROCESO' } }),
      prisma.plaza.count({ where: { activa: true } }),
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
      enProceso,
      ultimasSolicitudes,
    }
  }
}

export const dashboardService = new DashboardService()
