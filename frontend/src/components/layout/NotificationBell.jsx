import { Bell, CheckCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getNotificaciones,
  marcarTodasNotificacionesLeidas,
  marcarNotificacionLeida,
} from '../../services/notificaciones.service.js'

function hora(value) {
  return new Intl.DateTimeFormat('es-GT', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(value),
  )
}

function NotificationBell() {
  const navigate = useNavigate()
  const [abierto, setAbierto] = useState(false)
  const [notificaciones, setNotificaciones] = useState([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    let activo = true
    const cargar = async () => {
      try {
        const resultado = await getNotificaciones()
        if (!activo) return
        setNotificaciones(resultado.notificaciones)
        setNoLeidas(resultado.noLeidas)
        setError('')
      } catch {
        if (activo) setError('No se pudieron cargar las notificaciones.')
      }
    }
    cargar()
    const intervalo = window.setInterval(cargar, 30000)
    return () => {
      activo = false
      window.clearInterval(intervalo)
    }
  }, [])

  const abrirNotificacion = async (notificacion) => {
    setCargando(true)
    setError('')
    try {
      if (!notificacion.leida_en) {
        await marcarNotificacionLeida(notificacion.id)
        setNotificaciones((actuales) =>
          actuales.map((item) =>
            item.id === notificacion.id ? { ...item, leida_en: new Date().toISOString() } : item,
          ),
        )
        setNoLeidas((actual) => Math.max(0, actual - 1))
      }
      setAbierto(false)
      if (notificacion.enlace) navigate(notificacion.enlace)
    } catch {
      setError('No se pudo actualizar la notificación. Inténtalo de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  const marcarTodas = async () => {
    setCargando(true)
    setError('')
    try {
      await marcarTodasNotificacionesLeidas()
      const ahora = new Date().toISOString()
      setNotificaciones((actuales) =>
        actuales.map((item) => ({ ...item, leida_en: item.leida_en || ahora })),
      )
      setNoLeidas(0)
    } catch {
      setError('No se pudieron marcar como leídas.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Notificaciones${noLeidas ? `, ${noLeidas} sin leer` : ''}`}
        aria-expanded={abierto}
        onClick={() => setAbierto((actual) => !actual)}
        className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#f1f4f9] text-[#071b3b] transition hover:bg-[#e8edf6] cursor-pointer"
      >
        <Bell className="h-5 w-5" strokeWidth={2} />
        {noLeidas > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
            {noLeidas > 99 ? '99+' : noLeidas}
          </span>
        )}
      </button>
      {abierto && (
        <section className="absolute right-0 top-14 z-50 w-[min(380px,90vw)] rounded-2xl border border-[#dce3ee] bg-white p-4 text-[#071b3b] shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold">Notificaciones</h2>
            <button
              type="button"
              onClick={marcarTodas}
              disabled={!noLeidas || cargando}
              className="flex items-center gap-1 text-xs font-semibold text-[#3162e9] disabled:opacity-50"
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todas leídas
            </button>
          </div>
          {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
          <div className="mt-3 max-h-[60vh] space-y-2 overflow-y-auto">
            {!notificaciones.length && !error && (
              <p className="py-6 text-center text-sm text-[#65758f]">No tienes notificaciones.</p>
            )}
            {notificaciones.map((notificacion) => (
              <button
                key={notificacion.id}
                type="button"
                disabled={cargando}
                onClick={() => abrirNotificacion(notificacion)}
                className={`w-full rounded-xl p-3 text-left transition hover:bg-[#f1f4f9] ${notificacion.leida_en ? 'bg-white' : 'bg-blue-50'}`}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="font-semibold">{notificacion.titulo}</span>
                  {!notificacion.leida_en && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
                </span>
                <span className="mt-1 block text-sm text-[#5b6e8b]">{notificacion.mensaje}</span>
                <span className="mt-2 block text-xs text-[#8794a8]">{hora(notificacion.creada_en)}</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default NotificationBell
