import { dashboardService } from '../services/dashboard.service.js'

export const obtenerResumenDashboard = async (req, res) => {
  const resumen = await dashboardService.obtenerResumen()
  res.json({ status: 'ok', data: resumen })
}
