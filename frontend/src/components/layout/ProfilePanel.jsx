import { LogOut, Mail, ShieldCheck, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js'

const initialsFromName = (name = '') => name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || 'US'

function ProfilePanel({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const name = user?.nombre || 'Usuario'

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
      navigate('/login', { replace: true })
    }
  }

  return (
    <>
      {isOpen && <button type="button" aria-label="Cerrar perfil" className="fixed cursor-pointer inset-0 z-30 bg-[#071b3b]/30" onClick={onClose} />}
      <aside aria-hidden={!isOpen} className={`fixed inset-y-0 right-0 z-40 flex w-full max-w-[390px] flex-col bg-white p-6 shadow-[-16px_0_40px_rgba(20,43,89,0.14)] transition-transform duration-300 sm:p-7 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between"><h2 className="text-2xl font-bold tracking-[-0.04em] text-[#071b3b]">Mi perfil</h2><button type="button" aria-label="Cerrar perfil" onClick={onClose} className="flex h-10 w-10 items-center cursor-pointer justify-center rounded-xl text-[#526782] transition hover:bg-[#f0f4fa]"><X className="h-6 w-6" /></button></div>
        <div className="mt-8 flex flex-col items-center border-b border-[#e2e7f0] pb-7 text-center"><div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1e3a8a] text-xl font-bold text-white">{initialsFromName(name)}</div><p className="mt-4 text-xl font-bold text-[#071b3b]">{name}</p><p className="mt-1 text-sm font-medium text-[#315cf5]">{user?.rol || 'Sin rol'}</p></div>
        <dl className="mt-7 space-y-5"><div className="flex gap-3"><Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#3162e9]" /><div><dt className="text-sm text-[#65738c]">Correo electrónico</dt><dd className="mt-1 break-all font-semibold text-[#071b3b]">{user?.correo || 'No disponible'}</dd></div></div><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#3162e9]" /><div><dt className="text-sm text-[#65738c]">Rol</dt><dd className="mt-1 font-semibold text-[#071b3b]">{user?.rol || 'No disponible'}</dd></div></div></dl>
        <button type="button" disabled={isLoggingOut} onClick={handleLogout} className="mt-auto cursor-pointer flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#1e3a8a] px-5 py-3 font-semibold text-white transition hover:bg-[#182f70] disabled:cursor-not-allowed disabled:opacity-60"><LogOut className="h-5 w-5" />{isLoggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}</button>
      </aside>
    </>
  )
}

export default ProfilePanel
