import { useState } from 'react'
import Header from '../components/layout/Header.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'

function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => (
    typeof window !== 'undefined' && window.innerWidth >= 1024
  ))

  const toggleSidebar = () => setIsSidebarOpen((isOpen) => !isOpen)

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#f6f8fc] font-sans text-[#071b3b]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && <button type="button" aria-label="Cerrar menú" className="fixed inset-0 z-10 bg-[#071b3b]/40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <div className={`min-h-dvh transition-[padding] duration-300 ${isSidebarOpen ? 'lg:pl-[330px]' : 'lg:pl-0'}`}>
        <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
        <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout
