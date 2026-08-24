import { useEffect, useState } from 'react'
import { BriefcaseBusiness, CircleDot, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { getDashboardSummary } from '../../services/dashboard.service.js'

const statusStyles = {
  PENDIENTE: 'bg-[#fff0bd] text-[#a86b00]',
  EN_PROCESO: 'bg-[#d9ebff] text-[#2765d9]',
  CONTRATADO: 'bg-[#c9f3dd] text-[#087947]',
  RECHAZADO: 'bg-[#ffe0e2] text-[#df353c]',
}

const statusLabels = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En proceso',
  CONTRATADO: 'Contratado',
  RECHAZADO: 'Rechazado',
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`)
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('es-GT').format(date)
}

function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    getDashboardSummary()
      .then((data) => { if (active) setSummary(data) })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'No fue posible cargar el resumen.')
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [])

  const metrics = [
    { label: 'Total postulantes', value: summary?.totalPostulantes, icon: UsersRound },
    { label: 'Plazas solicitadas', value: summary?.plazasSolicitadas, icon: BriefcaseBusiness },
    { label: 'En proceso', value: summary?.enProceso, icon: CircleDot },
  ]
  const applications = summary?.ultimasSolicitudes || []

  return (
    <DashboardLayout>
      <section className="grid gap-5 md:grid-cols-3 lg:gap-6" aria-label="Indicadores generales">
        {metrics.map(({ label, value, icon: Icon }) => (
          <article key={label} className="rounded-[26px] bg-white px-7 py-7 shadow-[0_10px_24px_rgba(20,43,89,0.06)]">
            <div className="flex items-start justify-between gap-4"><p className="text-base font-medium uppercase tracking-[0.01em] text-[#5b6e8b]">{label}</p><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0f4fa] text-[#3162e9]"><Icon className="h-6 w-6" strokeWidth={2} /></div></div>
            <p className="mt-4 text-5xl font-bold tracking-[-0.055em] text-[#071b3b]">{loading ? '—' : (value || 0).toLocaleString('es-GT')}</p>
          </article>
        ))}
      </section>

      <section className="mt-7 rounded-[26px] bg-white px-5 py-6 shadow-[0_10px_24px_rgba(20,43,89,0.06)] sm:px-7 sm:py-7">
        <div className="flex items-center justify-between gap-4"><h2 className="text-xl font-bold tracking-[-0.04em] text-[#071b3b] sm:text-2xl">Últimas solicitudes ingresadas</h2><Link to="/postulantes" className="text-sm font-semibold text-[#315cf5] transition hover:text-[#183fca]">Ver todas</Link></div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left">
            <thead><tr className="bg-[#f0f4fa] text-sm font-medium text-[#5b6e8b]"><th className="rounded-l-2xl px-5 py-4 font-medium">Postulante</th><th className="px-5 py-4 font-medium">Plaza aplicada</th><th className="px-5 py-4 font-medium">Estado</th><th className="rounded-r-2xl px-5 py-4 font-medium">Fecha</th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan="4" className="px-5 py-12 text-center text-[#5b6e8b]">Cargando solicitudes…</td></tr>}
              {!loading && error && <tr><td colSpan="4" className="px-5 py-12 text-center text-[#df353c]">{error}</td></tr>}
              {!loading && !error && applications.length === 0 && <tr><td colSpan="4" className="px-5 py-12 text-center text-[#5b6e8b]">Aún no hay solicitudes registradas.</td></tr>}
              {!loading && !error && applications.map((application) => (<tr key={application.id} className="text-base"><td className="border-b border-[#dfe5ee] px-5 py-5 font-semibold text-[#071b3b]">{application.nombre_completo}</td><td className="border-b border-[#dfe5ee] px-5 py-5 text-[#5b6e8b]">{application.puesto_solicita}</td><td className="border-b border-[#dfe5ee] px-5 py-5"><span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[application.estado] || 'bg-[#f1f4f9] text-[#5b6e8b]'}`}>{statusLabels[application.estado] || application.estado}</span></td><td className="border-b border-[#dfe5ee] px-5 py-5 text-[#5b6e8b]">{formatDate(application.fecha_registro)}</td></tr>))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardLayout>
  )
}

export default Dashboard
