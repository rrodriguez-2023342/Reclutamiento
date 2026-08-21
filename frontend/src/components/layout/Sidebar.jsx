import { BriefcaseBusiness, FileText, LayoutDashboard, Settings, UsersRound, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import UserMenu from './UserMenu.jsx'

const navigation = [{ label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' }, { label: 'Postulantes', icon: UsersRound, to: '/postulantes' }, { label: 'Plazas activas', icon: BriefcaseBusiness, to: '/plazas' }, { label: 'Informes y docs', icon: FileText, to: '/informes' }, { label: 'Configuración', icon: Settings, to: '/configuracion' }]

function Sidebar({ isOpen, onClose, onOpenProfile }) {
  return (
    <aside className={`fixed inset-y-0 left-0 z-20 flex w-[min(330px,86vw)] flex-col bg-[#1e3a8a] px-5 py-6 text-white shadow-2xl transition-transform duration-300 lg:w-[330px] lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center gap-4 px-3"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#3162e9]"><BriefcaseBusiness className="h-7 w-7" strokeWidth={2.2} /></div><div className="min-w-0"><p className="truncate text-[23px] font-extrabold leading-none tracking-[-0.045em]">RECLUTAMIENTO</p><p className="mt-1 text-sm text-[#b5c5ee]">Gestión de candidatos</p></div><button type="button" aria-label="Cerrar menú" onClick={onClose} className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/10 lg:hidden"><X className="h-6 w-6" /></button></div>
      <nav className="mt-10 space-y-2" aria-label="Navegación principal">{navigation.map(({ label, icon: Icon, to }) => <NavLink key={label} to={to} onClick={onClose} className={({ isActive }) => `flex h-14 items-center gap-4 rounded-2xl px-5 text-base font-semibold transition ${isActive ? 'bg-[#3162e9] text-white' : 'text-[#e1e9ff] hover:bg-white/10'}`}><Icon className="h-6 w-6" strokeWidth={2} />{label}</NavLink>)}</nav>
      <div className="mt-auto border-t border-white/10 pt-5"><UserMenu compact onClick={onOpenProfile} /></div>
    </aside>
  )
}

export default Sidebar
