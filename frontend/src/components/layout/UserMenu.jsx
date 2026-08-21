import { useAuth } from '../../hooks/useAuth.js'

const initialsFromName = (name = '') => name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || 'US'

function UserMenu({ compact = false }) {
  const { user } = useAuth()
  const name = user?.nombre || 'Usuario'
  const role = user?.rol || 'Sin rol'

  return (
    <div className="flex items-center gap-3">
      <div className={`flex shrink-0 items-center justify-center rounded-full font-bold ${compact ? 'h-11 w-11 bg-[#274ba3] text-sm text-white' : 'h-12 w-12 bg-[#1e3a8a] text-sm text-white'}`}>{initialsFromName(name)}</div>
      <div className="min-w-0"><p className={`truncate font-bold ${compact ? 'text-base text-white' : 'text-base text-[#071b3b]'}`}>{name}</p><p className={`mt-0.5 text-sm ${compact ? 'text-[#b5c5ee]' : 'text-[#315cf5]'}`}>{role}</p></div>
    </div>
  )
}

export default UserMenu
