import { useEffect, useState } from 'react'
import Header from '../components/layout/Header.jsx'
import ProfilePanel from '../components/layout/ProfilePanel.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'
import { useAuth } from '../hooks/useAuth.js'

function DashboardLayout({ children, title, headerSearch, locked = false }) {
  const { user } = useAuth()
  const esColaborador = user?.rol === 'Colaborador'
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const openProfile = () => setIsProfileOpen(true)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    const handleChange = (event) => setIsSidebarOpen(event.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#f6f8fc] font-sans text-[#071b3b]">
      {!esColaborador && <div className={locked ? 'pointer-events-none' : ''}><Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onOpenProfile={openProfile} /></div>}
      {!esColaborador && isSidebarOpen && <button type="button" aria-label="Cerrar menú" className="fixed inset-0 z-20 bg-[#071b3b]/40 cursor-pointer lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <div className={`min-h-dvh transition-[padding] duration-300 ${!esColaborador && isSidebarOpen ? 'lg:pl-[330px]' : 'lg:pl-0'}`}><div className={locked ? 'pointer-events-none' : ''}><Header title={title} headerSearch={headerSearch} isSidebarOpen={isSidebarOpen} showSidebarToggle={!esColaborador} onToggleSidebar={() => setIsSidebarOpen((isOpen) => !isOpen)} onOpenProfile={openProfile} /></div><main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">{children}</main></div>
      {!locked && <ProfilePanel isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />}
    </div>
  )
}

export default DashboardLayout
