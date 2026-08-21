import { BriefcaseBusiness, CalendarDays, UsersRound } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'

const metrics = [
  { label: 'Total postulantes', value: '1,482', icon: UsersRound },
  { label: 'Plazas activas', value: '18', icon: BriefcaseBusiness },
  { label: 'Entrevistas hoy', value: '7', icon: CalendarDays },
]

const applications = [
  { applicant: 'Alejandro Gómez', position: 'Gerente de Operaciones', status: 'Contratado', date: '15/10/2026' },
  { applicant: 'Sofía Lorenzana', position: 'Secretaria Ejecutiva', status: 'En proceso', date: '15/10/2026' },
  { applicant: 'DPI: 2981-30012-0101', position: 'Asistente de Contabilidad', status: 'Pendiente', date: '14/10/2026' },
  { applicant: 'Estuardo Lemus', position: 'Desarrollador Backend', status: 'Rechazado', date: '12/10/2026' },
]

const statusStyles = {
  Contratado: 'bg-[#c9f3dd] text-[#087947]',
  'En proceso': 'bg-[#d9ebff] text-[#2765d9]',
  Pendiente: 'bg-[#fff0bd] text-[#a86b00]',
  Rechazado: 'bg-[#ffe0e2] text-[#df353c]',
}

function Dashboard() {
  return (
    <DashboardLayout>
      <section className="grid gap-5 md:grid-cols-3 lg:gap-6" aria-label="Indicadores generales">
        {metrics.map(({ label, value, icon: Icon }) => (
          <article key={label} className="rounded-[26px] bg-white px-7 py-7 shadow-[0_10px_24px_rgba(20,43,89,0.06)]">
            <div className="flex items-start justify-between gap-4"><p className="text-base font-medium uppercase tracking-[0.01em] text-[#5b6e8b]">{label}</p><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0f4fa] text-[#3162e9]"><Icon className="h-6 w-6" strokeWidth={2} /></div></div>
            <p className="mt-4 text-5xl font-bold tracking-[-0.055em] text-[#071b3b]">{value}</p>
          </article>
        ))}
      </section>

      <section className="mt-7 rounded-[26px] bg-white px-5 py-6 shadow-[0_10px_24px_rgba(20,43,89,0.06)] sm:px-7 sm:py-7">
        <div className="flex items-center justify-between gap-4"><h2 className="text-xl font-bold tracking-[-0.04em] text-[#071b3b] sm:text-2xl">Últimas solicitudes ingresadas</h2><button type="button" className="text-sm font-semibold text-[#315cf5] cursor-pointer transition hover:text-[#183fca]">Ver todas</button></div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left">
            <thead><tr className="bg-[#f0f4fa] text-sm font-medium text-[#5b6e8b]"><th className="rounded-l-2xl px-5 py-4 font-medium">Postulante</th><th className="px-5 py-4 font-medium">Plaza aplicada</th><th className="px-5 py-4 font-medium">Estado</th><th className="rounded-r-2xl px-5 py-4 font-medium">Fecha</th></tr></thead>
            <tbody>{applications.map(({ applicant, position, status, date }) => (<tr key={`${applicant}-${date}`} className="text-base"><td className="border-b border-[#dfe5ee] px-5 py-5 font-semibold text-[#071b3b]">{applicant}</td><td className="border-b border-[#dfe5ee] px-5 py-5 text-[#5b6e8b]">{position}</td><td className="border-b border-[#dfe5ee] px-5 py-5"><span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[status]}`}>{status}</span></td><td className="border-b border-[#dfe5ee] px-5 py-5 text-[#5b6e8b]">{date}</td></tr>))}</tbody>
          </table>
        </div>
      </section>
    </DashboardLayout>
  )
}

export default Dashboard
