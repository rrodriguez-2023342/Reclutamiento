import { Bell, Menu, PanelLeftClose } from 'lucide-react'
import UserMenu from './UserMenu.jsx'

function Header({ isSidebarOpen, onToggleSidebar, onOpenProfile }) {
  return (
    <header className="sticky top-0 z-10 flex h-[76px] items-center justify-between border-b border-[#dce3ee] bg-white px-4 sm:h-[86px] sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3"><button type="button" aria-label={isSidebarOpen ? 'Ocultar navegación' : 'Mostrar navegación'} aria-expanded={isSidebarOpen} onClick={onToggleSidebar} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[#1e3a8a] transition hover:bg-[#f1f4f9]">{isSidebarOpen ? <PanelLeftClose className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button><h1 className="truncate text-xl font-bold tracking-[-0.045em] text-[#071b3b] sm:text-[30px]">Resumen general</h1></div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-5"><button type="button" aria-label="Notificaciones" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f1f4f9] text-[#071b3b] transition hover:bg-[#e8edf6]"><Bell className="h-5 w-5" strokeWidth={2} /></button><div className="hidden border-l border-[#e1e6ef] pl-5 sm:block"><UserMenu onClick={onOpenProfile} /></div></div>
    </header>
  )
}

export default Header
