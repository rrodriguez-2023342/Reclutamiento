import prisma from '../config/prisma.js'

class DashboardService {
  async obtenerResumen() {
    const [totalPostulantes, enProceso, plazas, ultimasSolicitudes] = await prisma.$transaction([
      prisma.postulante.count(),
      prisma.postulante.count({ where: { estado: 'EN_PROCESO' } }),
      prisma.postulante.findMany({ distinct: ['puesto_solicita'], select: { puesto_solicita: true } }),
      prisma.postulante.findMany({
        take: 4,
        orderBy: [{ fecha_registro: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          nombre_completo: true,
          puesto_solicita: true,
          estado: true,
          fecha_registro: true,
        },
      }),
    ])

    return {
      totalPostulantes,
      plazasSolicitadas: plazas.length,
      enProceso,
      ultimasSolicitudes,
    }
  }
}

export const dashboardService = new DashboardService()
