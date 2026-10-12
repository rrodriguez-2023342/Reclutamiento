import { useEffect, useId, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, ChevronDown, ClipboardList, Copy, FilePlus2, FileText, Search, Settings2, Sparkles, Trash2, X } from 'lucide-react'
import DashboardLayout from '../../layouts/DashboardLayout.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { getEmpresas } from '../../services/usuarios.service.js'
import {
  actualizarTipoDocumento,
  cambiarEstadoPlantilla,
  crearTipoDocumento,
  descargarDocumentoGenerado,
  descargarPlantilla,
  eliminarDocumentoGenerado,
  eliminarVersionPlantilla,
  getDestinosDocumento,
  getDocumentosGenerados,
  generarDocumento,
  getCamposDocumento,
  getMisSolicitudes,
  getSolicitudes,
  getSolicitud,
  getTiposDocumento,
  getVersionesPlantilla,
  ponerSolicitudEnProceso,
  previsualizarDocumento,
  rechazarSolicitud,
  solicitarDocumento,
  subirPlantilla,
} from '../../services/documentos-laborales.service.js'

const ADMIN = 'Administrador RHCorp'
const RRHH = 'Recursos Humanos'
const COLABORADOR = 'Colaborador'
const ESTADOS = [
  ['PENDIENTE', 'Pendiente'],
  ['EN_PROCESO', 'En proceso'],
  ['GENERADO', 'Generado'],
  ['RECHAZADA', 'Rechazada'],
]

function fecha(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium' }).format(new Date(value))
}

function estadoLabel(estado) {
  return ESTADOS.find(([value]) => value === estado)?.[1] || estado
}

function Badge({ estado }) {
  const color = {
    PENDIENTE: 'bg-amber-100 text-amber-800',
    EN_PROCESO: 'bg-blue-100 text-blue-800',
    GENERADO: 'bg-emerald-100 text-emerald-800',
    RECHAZADA: 'bg-red-100 text-red-800',
    ACTIVA: 'bg-emerald-100 text-emerald-800',
    INACTIVA: 'bg-slate-100 text-slate-700',
    OBSOLETA: 'bg-amber-100 text-amber-800',
  }[estado] || 'bg-slate-100 text-slate-700'
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${color}`}>{estadoLabel(estado)}</span>
}

function guardarBlob(blob, nombre) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nombre
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function Panel({ title, children, action }) {
  return (
    <section className="rounded-3xl border border-[#e5eaf2] bg-white p-5 shadow-[0_10px_30px_rgba(20,43,89,0.05)] sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#eef1f6] pb-4">
        <h2 className="text-lg font-bold tracking-[-0.03em] text-[#071b3b] sm:text-xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function SearchableSelect({ value, options, placeholder, onChange, disabled = false }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)
  const optionsId = useId()
  const selected = options.find((option) => String(option.value) === String(value))
  const filtered = options.filter((option) =>
    option.label.toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es')),
  )

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  const choose = (option) => {
    onChange(option.value)
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <div className={`flex min-h-11 items-center gap-2 rounded-xl border border-[#dce3ee] bg-white px-3 transition focus-within:border-[#3162e9] focus-within:ring-2 focus-within:ring-[#3162e9]/10 ${disabled ? 'cursor-not-allowed bg-slate-50 opacity-60' : ''}`}>
        <input
          role="combobox"
          aria-expanded={open}
          aria-controls={optionsId}
          aria-autocomplete="list"
          value={open ? query : selected?.label || ''}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => !disabled && setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setOpen(false)
            if (event.key === 'Enter' && open && filtered.length === 1) {
              event.preventDefault()
              choose(filtered[0])
            }
          }}
          placeholder={placeholder}
          readOnly={disabled}
          disabled={disabled}
          className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-[#071b3b] outline-none placeholder:text-[#8290a5]"
        />
        {selected && !disabled && (
          <button type="button" aria-label="Limpiar selección" onClick={() => { onChange(''); setQuery(''); setOpen(false) }} className="rounded p-1 text-[#8290a5] hover:bg-slate-100 hover:text-[#33445f]">
            <X className="h-4 w-4" />
          </button>
        )}
        <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-[#8290a5]" />
      </div>
      {open && !disabled && (
        <ul id={optionsId} role="listbox" className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-[#dce3ee] bg-white py-1 shadow-lg">
          {!filtered.length && <li className="px-3 py-2.5 text-sm text-[#8290a5]">Sin resultados</li>}
          {filtered.map((option) => (
            <li key={option.value} role="option" aria-selected={String(option.value) === String(value)}>
              <button type="button" onClick={() => choose(option)} className={`w-full px-3 py-2.5 text-left text-sm hover:bg-[#f0f4fa] ${String(option.value) === String(value) ? 'font-semibold text-[#3162e9]' : 'text-[#33445f]'}`}>
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function PasoNav({ items, active, onChange }) {
  return (
    <nav
      aria-label="Secciones de documentos"
      className={`grid gap-2 ${items.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 xl:grid-cols-4'}`}
    >
      {items.map(({ id, label, description, icon: Icon, count }) => {
        const seleccionado = active === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-current={seleccionado ? 'page' : undefined}
            className={`flex min-h-[76px] items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
              seleccionado
                ? 'border-[#3162e9] bg-[#eef4ff] ring-2 ring-[#3162e9]/10'
                : 'border-[#e5eaf2] bg-white hover:border-[#b9c9e5] hover:bg-[#f9fbff]'
            }`}
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${seleccionado ? 'bg-[#3162e9] text-white' : 'bg-[#f1f4f9] text-[#50627e]'}`}>
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 font-bold text-[#071b3b]">
                {label}
                {count > 0 && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">{count}</span>}
              </span>
              <span className="mt-0.5 block text-xs text-[#65758f]">{description}</span>
            </span>
            <ArrowRight className={`h-4 w-4 shrink-0 ${seleccionado ? 'text-[#3162e9]' : 'text-[#a4afc0]'}`} />
          </button>
        )
      })}
    </nav>
  )
}

function Informes() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const colaborador = user?.rol === COLABORADOR
  const admin = user?.rol === ADMIN
  const [tab, setTab] = useState(() => (
    colaborador
      ? 'disponibles'
      : new URLSearchParams(window.location.search).has('colaborador')
        ? 'directo'
        : 'solicitudes'
  ))
  const [tipos, setTipos] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [empresaFiltro, setEmpresaFiltro] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(true)
  const [refresh, setRefresh] = useState(0)
  const [campos, setCampos] = useState([])
  const [busquedaCampo, setBusquedaCampo] = useState('')
  const [nuevoTipo, setNuevoTipo] = useState({ clave: '', nombre: '', descripcion: '', empresa_id: '' })
  const [tipoSeleccionado, setTipoSeleccionado] = useState('')
  const [nombreTipoEditado, setNombreTipoEditado] = useState('')
  const [descripcionTipoEditada, setDescripcionTipoEditada] = useState('')
  const [versiones, setVersiones] = useState([])
  const [versionesDirectas, setVersionesDirectas] = useState([])
  const [archivo, setArchivo] = useState(null)
  const [notasCambio, setNotasCambio] = useState('')
  const [resultadoSubida, setResultadoSubida] = useState(null)
  const [solicitudes, setSolicitudes] = useState([])
  const [documentosGenerados, setDocumentosGenerados] = useState([])
  const [misSolicitudes, setMisSolicitudes] = useState([])
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroColaborador, setFiltroColaborador] = useState('')
  const [seleccionada, setSeleccionada] = useState(null)
  const [plantillaId, setPlantillaId] = useState('')
  const [preview, setPreview] = useState(null)
  const [rechazoMotivo, setRechazoMotivo] = useState('')
  const [colaboradores, setColaboradores] = useState([])
  const [directoEmpresa, setDirectoEmpresa] = useState('')
  const [directoColaborador, setDirectoColaborador] = useState(
    new URLSearchParams(location.search).get('colaborador') || '',
  )
  const [directoTipo, setDirectoTipo] = useState('')
  const [directoPlantilla, setDirectoPlantilla] = useState('')
  const [comentariosSolicitud, setComentariosSolicitud] = useState({})
  const previewRef = useRef(null)
  const solicitudEnlace = new URLSearchParams(location.search).get('solicitud')
  const activeTab = solicitudEnlace
    ? colaborador
      ? 'mis-solicitudes'
      : 'solicitudes'
    : tab

  const cambiarTab = (nuevoTab) => {
    setTab(nuevoTab)
    setPreview(null)
    if (solicitudEnlace && nuevoTab !== activeTab) {
      navigate('/informes', { replace: true })
    }
  }

  useEffect(() => {
    let activo = true
    Promise.all([
      getTiposDocumento(colaborador ? { activo: true } : {}),
      colaborador ? Promise.resolve([]) : getEmpresas(),
      colaborador ? getMisSolicitudes() : Promise.resolve([]),
      colaborador ? Promise.resolve([]) : getCamposDocumento(),
    ])
      .then(([tiposData, empresasData, solicitudesData, camposData]) => {
        if (!activo) return
        setTipos(tiposData)
        setEmpresas(empresasData || [])
        setMisSolicitudes(solicitudesData)
        setCampos(camposData)
        if (tiposData.length) {
          const tipoInicial = tiposData.find((tipo) => tipo.activo) || tiposData[0]
          setTipoSeleccionado((actual) => actual || String(tipoInicial.id))
          setDirectoTipo((actual) => actual || String(tipoInicial.id))
          setNombreTipoEditado((actual) => actual || tipoInicial.nombre)
          setDescripcionTipoEditada((actual) => actual || tipoInicial.descripcion || '')
        }
      })
      .catch((err) => {
        if (activo) setError(err.response?.data?.message || 'No se pudo cargar el módulo de documentos.')
      })
      .finally(() => activo && setCargando(false))
    return () => {
      activo = false
    }
  }, [colaborador, refresh])

  useEffect(() => {
    if (colaborador || !empresaFiltro) return
    let activo = true
    getTiposDocumento({ empresa_id: empresaFiltro })
      .then((data) => activo && setTipos(data))
      .catch((err) => activo && setError(err.response?.data?.message || 'No se pudieron cargar los tipos.'))
    return () => {
      activo = false
    }
  }, [empresaFiltro, colaborador])

  useEffect(() => {
    if (colaborador || activeTab !== 'solicitudes') return
    let activo = true
    getSolicitudes({
      ...(filtroEstado ? { estado: filtroEstado } : {}),
      ...(filtroTipo ? { tipo_documento_id: filtroTipo } : {}),
      ...(filtroColaborador ? { colaborador_id: filtroColaborador } : {}),
      ...(empresaFiltro ? { empresa_id: empresaFiltro } : {}),
    })
      .then((data) => activo && setSolicitudes(data))
      .catch((err) => activo && setError(err.response?.data?.message || 'No se pudieron cargar las solicitudes.'))
    return () => {
      activo = false
    }
  }, [colaborador, activeTab, filtroEstado, filtroTipo, filtroColaborador, empresaFiltro, refresh])

  useEffect(() => {
    if (colaborador || activeTab !== 'documentos-generados') return
    let activo = true
    getDocumentosGenerados(empresaFiltro ? { empresa_id: empresaFiltro } : {})
      .then((data) => activo && setDocumentosGenerados(data))
      .catch((err) => activo && setError(err.response?.data?.message || 'No se pudieron cargar los documentos generados.'))
    return () => {
      activo = false
    }
  }, [colaborador, activeTab, empresaFiltro, refresh])

  useEffect(() => {
    if (colaborador) return
    let activo = true
    getDestinosDocumento()
      .then((lista) => {
        if (!activo) return
        setColaboradores(lista)
      })
      .catch((err) => activo && setError(err.response?.data?.message || 'No se pudieron cargar los colaboradores.'))
    return () => {
      activo = false
    }
  }, [colaborador])

  const tipoActivo = tipos.find((tipo) => String(tipo.id) === tipoSeleccionado)

  useEffect(() => {
    if (!tipoSeleccionado || colaborador || activeTab !== 'plantillas') return
    let activo = true
    getVersionesPlantilla(tipoSeleccionado)
      .then((data) => {
        if (!activo) return
        setVersiones(data)
        const principal = data.find((item) => item.estado === 'ACTIVA') || data[0]
        setDirectoPlantilla((current) => current || (principal ? String(principal.id) : ''))
      })
      .catch((err) => activo && setError(err.response?.data?.message || 'No se pudieron cargar las versiones.'))
    return () => {
      activo = false
    }
  }, [tipoSeleccionado, colaborador, activeTab, refresh])

  useEffect(() => {
    if (!solicitudEnlace || colaborador) return
    let activo = true
    getSolicitud(solicitudEnlace)
      .then((data) => {
        if (!activo) return
        setSeleccionada(data)
        setPreview(null)
        setPlantillaId('')
      })
      .catch((err) => activo && setError(err.response?.data?.message || 'No se pudo abrir la solicitud.'))
    return () => {
      activo = false
    }
  }, [solicitudEnlace, colaborador])

  useEffect(() => {
    if (colaborador || !directoTipo) return
    let activo = true
    getVersionesPlantilla(directoTipo)
      .then((data) => {
        if (!activo) return
        setVersionesDirectas(data)
        const principal = data.find((item) => item.estado === 'ACTIVA') || data[0]
        setDirectoPlantilla(principal ? String(principal.id) : '')
      })
      .catch((err) => activo && setError(err.response?.data?.message || 'No se pudieron cargar las versiones de generación directa.'))
    return () => {
      activo = false
    }
  }, [directoTipo, colaborador, refresh])

  useEffect(() => {
    if (!seleccionada || colaborador || activeTab !== 'solicitudes') return
    let activo = true
    getVersionesPlantilla(seleccionada.tipo_documento_id)
      .then(async (data) => {
        if (!activo) return
        setVersiones(data)
        const principal = data.find((item) => item.estado === 'ACTIVA') || data[0]
        const id = seleccionada.documento?.plantilla_id
          ? String(seleccionada.documento.plantilla_id)
          : principal
            ? String(principal.id)
            : ''
        setPlantillaId(id)
        if (seleccionada.estado === 'PENDIENTE') {
          await ponerSolicitudEnProceso(seleccionada.id)
          if (activo) setRefresh((actual) => actual + 1)
        }
      })
      .catch((err) => activo && setError(err.response?.data?.message || 'No se pudieron cargar las versiones.'))
    return () => {
      activo = false
    }
  }, [seleccionada, colaborador, activeTab])

  useEffect(() => {
    if (
      colaborador ||
      activeTab !== 'solicitudes' ||
      !seleccionada ||
      seleccionada.estado === 'GENERADO' ||
      seleccionada.estado === 'RECHAZADA' ||
      !plantillaId
    ) {
      return
    }
    let activo = true
    const body = seleccionada.id
      ? { solicitud_id: seleccionada.id, plantilla_id: Number(plantillaId) }
      : null
    if (!body) return undefined
    previsualizarDocumento(body)
      .then((blob) => activo && setPreview({ blob }))
      .catch((err) => {
        if (activo) {
          setPreview(null)
          setError(err.response?.data?.message || 'No se pudo generar la vista previa.')
        }
      })
    return () => {
      activo = false
    }
  }, [seleccionada, plantillaId, colaborador, activeTab])

  useEffect(() => {
    if (!preview?.blob || !previewRef.current) return undefined
    let activo = true
    const contenedor = previewRef.current
    contenedor.replaceChildren()
    preview.blob.arrayBuffer().then(async (buffer) => {
      if (!activo) return undefined
      const { renderAsync } = await import('docx-preview')
      if (activo) return renderAsync(buffer, contenedor)
      return undefined
    }).catch(() => {
      if (activo) setError('No se pudo mostrar la vista previa de Word.')
    })
    return () => {
      activo = false
      contenedor.replaceChildren()
    }
  }, [preview?.blob])

  const ejecutar = async (accion, confirmacion) => {
    setCargando(true)
    setError('')
    setMensaje('')
    try {
      const resultado = await accion()
      if (confirmacion) setMensaje(confirmacion)
      return resultado
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo completar la operación.')
      return null
    } finally {
      setCargando(false)
    }
  }

  const crearTipo = async (event) => {
    event.preventDefault()
    if (!admin && !nuevoTipo.empresa_id) {
      setError('Selecciona una empresa para el tipo de documento.')
      return
    }
    const resultado = await ejecutar(
      () => crearTipoDocumento({
        ...nuevoTipo,
        empresa_id: nuevoTipo.empresa_id ? Number(nuevoTipo.empresa_id) : null,
      }),
      'Tipo de documento creado.',
    )
    if (resultado) {
      setNuevoTipo({ clave: '', nombre: '', descripcion: '', empresa_id: '' })
      setRefresh((actual) => actual + 1)
    }
  }

  const subirNuevaPlantilla = async (event) => {
    event.preventDefault()
    if (!archivo || !tipoSeleccionado) return
    const resultado = await ejecutar(
      () => subirPlantilla(tipoSeleccionado, archivo, notasCambio),
      'Se guardó la nueva versión de la plantilla.',
    )
    if (resultado) {
      setResultadoSubida(resultado.validacion)
      setArchivo(null)
      setNotasCambio('')
      event.target.reset()
      setRefresh((actual) => actual + 1)
    }
  }

  const solicitar = async (tipoId) => {
    const resultado = await ejecutar(
      () => solicitarDocumento({
        tipo_documento_id: tipoId,
        comentario: comentariosSolicitud[tipoId] || undefined,
      }),
      'Solicitud enviada a Recursos Humanos.',
    )
    if (resultado) {
      setComentariosSolicitud((actuales) => ({ ...actuales, [tipoId]: '' }))
      setRefresh((actual) => actual + 1)
    }
  }

  const descargar = async (id, nombre) => {
    const blob = await ejecutar(() => descargarDocumentoGenerado(id))
    if (blob) guardarBlob(blob, nombre || 'documento.docx')
  }

  const eliminarVersion = async (version) => {
    if (!window.confirm(`¿Quieres retirar la versión ${version.version}? Se conservarán el archivo y el historial; los documentos ya generados no cambiarán.`)) return
    const resultado = await ejecutar(
      () => eliminarVersionPlantilla(version.id),
      'Versión retirada del catálogo. El archivo se conserva en el historial.',
    )
    if (resultado) setRefresh((actual) => actual + 1)
  }

  const eliminarDocumento = async (documento) => {
    if (!window.confirm(`¿Quieres retirar "${documento.nombre_archivo}"? Se conservarán el archivo y el registro histórico.`)) return
    const resultado = await ejecutar(
      () => eliminarDocumentoGenerado(documento.id),
      'Documento retirado de la lista. El archivo se conserva de forma privada.',
    )
    if (resultado) {
      setDocumentosGenerados((actuales) => actuales.filter((item) => item.id !== documento.id))
      setSeleccionada((actual) => actual?.documento?.id === documento.id ? { ...actual, documento: null } : actual)
      setRefresh((actual) => actual + 1)
    }
  }

  const obtenerPreviewDirecto = async (tipoId, colaboradorId, versionId) => {
    setPreview(null)
    const blob = await ejecutar(() => previsualizarDocumento({
      tipo_documento_id: Number(tipoId),
      colaborador_id: Number(colaboradorId),
      plantilla_id: Number(versionId),
      empresa_id: Number(empresaDirecta),
    }))
    if (blob) setPreview({ blob })
  }

  const generarDirecto = async () => {
    const resultado = await ejecutar(
      () => generarDocumento({
        tipo_documento_id: Number(directoTipo),
        colaborador_id: Number(directoColaborador),
        plantilla_id: Number(directoPlantilla),
        empresa_id: Number(empresaDirecta),
      }),
      'Documento generado.',
    )
    if (resultado) await descargar(resultado.id, resultado.nombre_archivo)
  }

  const atenderSolicitud = async () => {
    if (!seleccionada || !plantillaId) return
    const documento = await ejecutar(
      () => generarDocumento({
        solicitud_id: seleccionada.id,
        plantilla_id: Number(plantillaId),
      }),
      'Documento generado y entregado al colaborador.',
    )
    if (documento) {
      setSeleccionada((actual) => ({
        ...actual,
        estado: 'GENERADO',
        documento: { id: documento.id, nombre_archivo: documento.nombre_archivo },
      }))
      setRefresh((actual) => actual + 1)
      await descargar(documento.id, documento.nombre_archivo)
    }
  }

  const rechazar = async () => {
    if (!seleccionada || !rechazoMotivo.trim()) {
      setError('Escribe el motivo del rechazo.')
      return
    }
    const resultado = await ejecutar(
      () => rechazarSolicitud(seleccionada.id, rechazoMotivo.trim()),
      'Solicitud rechazada y colaborador notificado.',
    )
    if (resultado) {
      setSeleccionada((actual) => ({ ...actual, estado: 'RECHAZADA', motivo_rechazo: rechazoMotivo }))
      setRechazoMotivo('')
      setRefresh((actual) => actual + 1)
    }
  }

  const copiarMarcador = async (marcador) => {
    try {
      await navigator.clipboard.writeText(`{${marcador}}`)
      setMensaje(`Se copió {${marcador}}.`)
    } catch {
      setError('No se pudo copiar el marcador. Selecciónalo y cópialo manualmente.')
    }
  }

  const camposFiltrados = campos.map((grupo) => ({
    ...grupo,
    campos: grupo.campos.filter((campo) =>
      `${campo.marcador} ${campo.descripcion}`.toLowerCase().includes(busquedaCampo.toLowerCase()),
    ),
  })).filter((grupo) => grupo.campos.length)

  const versionesDisponibles = versiones
  const tiposActivos = tipos.filter((tipo) => tipo.activo)
  const solicitudesPendientes = solicitudes.filter((item) => item.estado === 'PENDIENTE' || item.estado === 'EN_PROCESO').length
  const colaboradoresVisibles = colaboradores.filter((item) =>
    item.rol === COLABORADOR || item.rol === RRHH || item.rol === ADMIN
      ? (item.rol === ADMIN && admin)
        || [item.empresa_id, ...(item.empresas_asignadas || []).map(({ empresa_id }) => empresa_id)]
          .some((id) => id && (!empresaFiltro || String(id) === String(empresaFiltro)))
      : false,
  )
  const colaboradoresSolicitudes = colaboradoresVisibles.filter((item) => item.rol === COLABORADOR)
  const destinoDirecto = colaboradoresVisibles.find((item) => String(item.id) === directoColaborador)
  const empresaDirecta = directoEmpresa
    || destinoDirecto?.empresa_id
    || destinoDirecto?.empresas_asignadas?.[0]?.empresa_id
    || (destinoDirecto?.rol === ADMIN ? empresaFiltro : '')
  const empresasDestinoIds = destinoDirecto
    ? destinoDirecto.rol === ADMIN && admin && !destinoDirecto.empresa_id
      ? empresas.map(({ id }) => id)
      : [...new Set([
          ...(destinoDirecto.empresa_id ? [destinoDirecto.empresa_id] : []),
          ...(destinoDirecto.empresas_asignadas || []).map(({ empresa_id }) => empresa_id),
        ])]
    : []
  const empresasDestino = empresas.filter((empresa) => empresasDestinoIds.includes(empresa.id))
  const tiposDirectos = tiposActivos.filter((tipo) =>
    !tipo.empresa_id || String(tipo.empresa_id) === String(empresaDirecta),
  )
  const tipoDirectoValido = tiposDirectos.some((tipo) => String(tipo.id) === String(directoTipo))
  const cambiarDestinoDirecto = (id) => {
    const destino = colaboradoresVisibles.find((item) => String(item.id) === id)
    const empresaInicial = destino?.empresa_id
      || destino?.empresas_asignadas?.[0]?.empresa_id
      || (destino?.rol === ADMIN ? empresaFiltro : '')
      || ''
    setDirectoColaborador(id)
    setDirectoEmpresa(String(empresaInicial))
    setDirectoTipo('')
    setDirectoPlantilla('')
    setPreview(null)
    if (admin && empresaInicial) setEmpresaFiltro(String(empresaInicial))
  }
  const cambiarEmpresaDirecta = (id) => {
    setDirectoEmpresa(id)
    setDirectoTipo('')
    setDirectoPlantilla('')
    setPreview(null)
    if (admin) setEmpresaFiltro(id)
  }

  return (
    <DashboardLayout title={colaborador ? 'Solicitar documentos' : 'Gestión de documentos'}>
      <div className="mx-auto max-w-[1440px] space-y-6">
        <header className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#102957] via-[#1d4389] to-[#3162e9] p-6 text-white shadow-[0_18px_38px_rgba(29,67,137,0.18)] sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-blue-100">
                <Sparkles className="h-4 w-4" />
                {colaborador ? 'Tus documentos, en un solo lugar' : admin ? 'Administración global' : 'Espacio de Recursos Humanos'}
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                {colaborador ? 'Solicita y consulta tus documentos' : 'Documentos laborales'}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                {colaborador
              ? 'Solicita un documento disponible y revisa su estado. Cuando esté listo, pasa a Recursos Humanos para recogerlo.'
                  : 'Atiende solicitudes, administra plantillas Word y genera documentos con los datos del colaborador.'}
              </p>
            </div>
            <div className="flex gap-3">
              {colaborador ? (
                <>
                  <div className="min-w-24 rounded-2xl bg-white/10 px-4 py-3">
                    <span className="block text-2xl font-extrabold">{misSolicitudes.filter((item) => item.estado === 'PENDIENTE' || item.estado === 'EN_PROCESO').length}</span>
                    <span className="text-xs text-blue-100">En trámite</span>
                  </div>
                  <div className="min-w-24 rounded-2xl bg-white/10 px-4 py-3">
                    <span className="block text-2xl font-extrabold">{misSolicitudes.filter((item) => item.estado === 'GENERADO').length}</span>
                    <span className="text-xs text-blue-100">Listos</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="min-w-24 rounded-2xl bg-white/10 px-4 py-3">
                    <span className="block text-2xl font-extrabold">{tiposActivos.length}</span>
                    <span className="text-xs text-blue-100">Tipos activos</span>
                  </div>
                  <div className="min-w-24 rounded-2xl bg-white/10 px-4 py-3">
                    <span className="block text-2xl font-extrabold">{solicitudesPendientes}</span>
                    <span className="text-xs text-blue-100">Por atender</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {error && <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">{error}</p>}
        {mensaje && <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">{mensaje}</p>}
        {cargando && <p className="rounded-xl bg-white px-4 py-3 text-sm text-[#5b6e8b] shadow-sm">Cargando información...</p>}

        {colaborador ? (
          <>
            <PasoNav
              active={activeTab}
              onChange={cambiarTab}
              items={[
                { id: 'disponibles', label: 'Solicitar documento', description: 'Ver lo que puedes pedir', icon: FilePlus2 },
                { id: 'mis-solicitudes', label: 'Mis solicitudes', description: 'Consultar el estado', icon: ClipboardList },
              ]}
            />
            {activeTab === 'disponibles' ? (
              <Panel title="Documentos disponibles">
                <div className="grid gap-4 lg:grid-cols-2">
                  {tiposActivos.map((tipo) => (
                    <article key={tipo.id} className="rounded-2xl border border-[#dce3ee] p-5">
                      <h3 className="font-bold">{tipo.nombre}</h3>
                      <p className="mt-2 text-sm text-[#5b6e8b]">{tipo.descripcion || 'Solicita este documento a Recursos Humanos.'}</p>
                      <label className="mt-4 block text-sm font-semibold">
                        Comentario opcional
                        <textarea value={comentariosSolicitud[tipo.id] || ''} onChange={(event) => setComentariosSolicitud((actuales) => ({ ...actuales, [tipo.id]: event.target.value }))} maxLength={5000} className="mt-1 w-full rounded-xl border border-[#dce3ee] p-3" rows={2} />
                      </label>
                      <button type="button" disabled={cargando} onClick={() => solicitar(tipo.id)} className="mt-3 rounded-xl bg-[#3162e9] px-4 py-2.5 font-bold text-white disabled:opacity-50">Solicitar</button>
                    </article>
                  ))}
                </div>
                {!tiposActivos.length && <p className="py-8 text-center text-[#65758f]">No hay documentos disponibles para tu empresa.</p>}
              </Panel>
            ) : activeTab === 'mis-solicitudes' ? (
              <Panel title="Mis solicitudes">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead><tr className="border-b text-[#65758f]"><th className="p-3">Documento</th><th className="p-3">Fecha</th><th className="p-3">Estado</th><th className="p-3">Detalle</th><th className="p-3">Siguiente paso</th></tr></thead>
                    <tbody>{misSolicitudes.map((item) => (
                      <tr key={item.id} className="border-b border-[#eef1f6]">
                        <td className="p-3 font-semibold">{item.tipo_documento.nombre}</td>
                        <td className="p-3">{fecha(item.solicitada_en)}</td>
                        <td className="p-3"><Badge estado={item.estado} /></td>
                        <td className="p-3 text-[#5b6e8b]">{item.motivo_rechazo || item.comentario || '—'}</td>
                        <td className="p-3">{item.estado === 'GENERADO' ? <span className="font-medium text-emerald-800">Pasa a Recursos Humanos para recogerlo</span> : '—'}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                {!misSolicitudes.length && <p className="py-8 text-center text-[#65758f]">Todavía no tienes solicitudes.</p>}
              </Panel>
            ) : null}
          </>
        ) : (
          <>
            <PasoNav
              active={activeTab}
              onChange={cambiarTab}
              items={[
                { id: 'solicitudes', label: 'Solicitudes', description: 'Revisar y entregar documentos', icon: ClipboardList, count: solicitudesPendientes },
                { id: 'documentos-generados', label: 'Documentos generados', description: 'Consultar, descargar o retirar entregas', icon: FileText },
                { id: 'plantillas', label: 'Tipos y plantillas', description: 'Configurar documentos y versiones', icon: Settings2 },
                { id: 'directo', label: 'Generación directa', description: 'Crear sin solicitud previa', icon: FilePlus2 },
                { id: 'campos', label: 'Campos disponibles', description: 'Marcadores para Word', icon: FileText },
              ]}
            />

            {activeTab === 'plantillas' && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm leading-6 text-blue-900">
                  <strong className="block text-base">Configura primero el tipo de documento y después su plantilla.</strong>
                  <span>Las versiones anteriores se conservan. Puedes activar una versión nueva sin perder el historial.</span>
                </div>
                <div className="grid items-start gap-5 xl:grid-cols-[minmax(300px,0.8fr)_minmax(420px,1.2fr)]">
                <Panel title="Tipos de documento">
                  {admin && (
                    <label className="mb-4 block text-sm font-semibold">
                      Filtrar empresa
                      <div className="mt-1">
                        <SearchableSelect value={String(empresaFiltro)} onChange={setEmpresaFiltro} placeholder="Todas las empresas" options={[
                          { value: '', label: 'Todas las empresas' },
                          ...empresas.map((empresa) => ({ value: String(empresa.id), label: empresa.nombre_empresa })),
                        ]} />
                      </div>
                    </label>
                  )}
                  <div className="space-y-2">
                    {tipos.map((tipo) => (
                      <div key={tipo.id} className={`flex items-center justify-between gap-2 rounded-xl border p-3 ${tipoSeleccionado === String(tipo.id) ? 'border-[#3162e9] bg-blue-50' : 'border-[#dce3ee]'}`}>
                        <button type="button" onClick={() => { setTipoSeleccionado(String(tipo.id)); setNombreTipoEditado(tipo.nombre); setDescripcionTipoEditada(tipo.descripcion || ''); setResultadoSubida(null) }} className="min-w-0 flex-1 text-left">
                          <span className="block truncate font-bold">{tipo.nombre}</span>
                          <span className="text-xs text-[#65758f]">{tipo.empresa?.nombre_empresa || 'Global'} · {tipo.clave}</span>
                        </button>
                        <div className="flex items-center gap-2">
                          <Badge estado={tipo.activo ? 'ACTIVA' : 'INACTIVA'} />
                          {(admin || tipo.empresa_id) && (
                            <button type="button" disabled={cargando} onClick={async () => {
                              const actualizado = await ejecutar(() => actualizarTipoDocumento(tipo.id, { activo: !tipo.activo }), 'Se actualizó el tipo de documento.')
                              if (actualizado) setRefresh((actual) => actual + 1)
                            }} className="text-xs font-bold text-[#3162e9]">{tipo.activo ? 'Desactivar' : 'Activar'}</button>
                          )}
                        </div>
                      </div>
                    ))}
                    {!tipos.length && <p className="py-5 text-center text-sm text-[#65758f]">No hay tipos de documento.</p>}
                  </div>
                  <form onSubmit={crearTipo} className="mt-6 space-y-3 border-t border-[#e5eaf2] pt-5">
                    <h3 className="font-bold">Crear tipo de documento</h3>
                    <input required maxLength={80} placeholder="Clave (ej. CONSTANCIA_LABORAL)" value={nuevoTipo.clave} onChange={(event) => setNuevoTipo({ ...nuevoTipo, clave: event.target.value })} className="w-full rounded-xl border border-[#dce3ee] p-3" />
                    <input required maxLength={150} placeholder="Nombre visible" value={nuevoTipo.nombre} onChange={(event) => setNuevoTipo({ ...nuevoTipo, nombre: event.target.value })} className="w-full rounded-xl border border-[#dce3ee] p-3" />
                    <textarea maxLength={5000} placeholder="Descripción opcional" value={nuevoTipo.descripcion} onChange={(event) => setNuevoTipo({ ...nuevoTipo, descripcion: event.target.value })} className="w-full rounded-xl border border-[#dce3ee] p-3" rows={2} />
                    {admin ? (
                      <SearchableSelect value={nuevoTipo.empresa_id} onChange={(empresa_id) => setNuevoTipo({ ...nuevoTipo, empresa_id })} placeholder="Global o empresa" options={[
                        { value: '', label: 'Global (visible a todas las empresas)' },
                        ...empresas.map((empresa) => ({ value: String(empresa.id), label: empresa.nombre_empresa })),
                      ]} />
                    ) : (
                      <SearchableSelect value={nuevoTipo.empresa_id} onChange={(empresa_id) => setNuevoTipo({ ...nuevoTipo, empresa_id })} placeholder="Selecciona una empresa" options={[
                        { value: '', label: 'Selecciona una empresa' },
                        ...empresas.map((empresa) => ({ value: String(empresa.id), label: empresa.nombre_empresa })),
                      ]} />
                    )}
                    <button disabled={cargando} className="rounded-xl bg-[#3162e9] px-4 py-2.5 font-bold text-white disabled:opacity-50">Crear tipo</button>
                  </form>
                  {tipoActivo && (admin || tipoActivo.empresa_id) && (
                    <form onSubmit={async (event) => {
                      event.preventDefault()
                      const resultado = await ejecutar(
                        () => actualizarTipoDocumento(tipoActivo.id, {
                          nombre: nombreTipoEditado,
                          descripcion: descripcionTipoEditada || null,
                        }),
                        'Tipo de documento actualizado.',
                      )
                      if (resultado) setRefresh((actual) => actual + 1)
                    }} className="mt-6 space-y-3 border-t border-[#e5eaf2] pt-5">
                      <h3 className="font-bold">Editar tipo seleccionado</h3>
                      <input required maxLength={150} value={nombreTipoEditado} onChange={(event) => setNombreTipoEditado(event.target.value)} className="w-full rounded-xl border border-[#dce3ee] p-3" />
                      <textarea maxLength={5000} value={descripcionTipoEditada} onChange={(event) => setDescripcionTipoEditada(event.target.value)} className="w-full rounded-xl border border-[#dce3ee] p-3" rows={2} />
                      <button disabled={cargando} className="rounded-xl border border-[#3162e9] px-4 py-2.5 font-bold text-[#3162e9] disabled:opacity-50">Guardar cambios</button>
                    </form>
                  )}
                </Panel>

                <div className="space-y-6">
                  <Panel title={tipoActivo ? `Plantillas: ${tipoActivo.nombre}` : 'Plantillas'}>
                    {tipoActivo && (
                      <>
                        {(admin || tipoActivo.empresa_id) ? (
                          <form onSubmit={subirNuevaPlantilla} className="grid gap-3 rounded-2xl bg-[#f6f8fc] p-4 md:grid-cols-2">
                          <label className="text-sm font-semibold">Plantilla Word (.docx, máximo 2 MB)
                            <input required type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setArchivo(event.target.files?.[0] || null)} className="mt-2 block w-full text-sm" />
                          </label>
                          <label className="text-sm font-semibold">Notas del cambio
                            <textarea value={notasCambio} onChange={(event) => setNotasCambio(event.target.value)} maxLength={5000} rows={2} className="mt-2 w-full rounded-xl border border-[#dce3ee] p-3" />
                          </label>
                          <button disabled={cargando || !archivo} className="rounded-xl bg-[#3162e9] px-4 py-2.5 font-bold text-white disabled:opacity-50 md:col-span-2">Subir nueva versión inmutable</button>
                          </form>
                        ) : (
                          <p className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800">Esta plantilla es global y está en modo de solo lectura. Solicita al Administrador RHCorp los cambios.</p>
                        )}
                        {resultadoSubida && (
                          <div className="mt-4 rounded-xl border border-[#dce3ee] p-4">
                            <h3 className="font-bold">Validación de la versión</h3>
                            <p className="mt-2 text-sm text-[#5b6e8b]">Marcadores reconocidos: {resultadoSubida.reconocidos.join(', ') || 'ninguno'}</p>
                            {resultadoSubida.desconocidos.length > 0 && <ul className="mt-2 list-inside list-disc text-sm text-amber-800">{resultadoSubida.desconocidos.map((item) => <li key={item.marcador}>{`{${item.marcador}}`}{item.sugerencia ? ` — ¿Quisiste decir {${item.sugerencia}}?` : ''}</li>)}</ul>}
                            {resultadoSubida.advertencias.map((item) => <p key={item} className="mt-2 text-sm text-amber-800">{item}</p>)}
                          </div>
                        )}
                        <div className="mt-5 space-y-2">
                          {versiones.map((version) => (
                            <article key={version.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dce3ee] p-4">
                              <div>
                                <p className="font-bold">Versión {version.version} <Badge estado={version.estado} /></p>
                                <p className="mt-1 text-xs text-[#65758f]">{fecha(version.creada_en)} · {version.creada_por?.nombre || 'Usuario'}</p>
                                {version.notas_cambio && <p className="mt-1 text-sm text-[#5b6e8b]">{version.notas_cambio}</p>}
                                <p className="mt-1 text-xs text-[#65758f]">Marcadores: {version.marcadores.join(', ') || 'ninguno'}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <button type="button" onClick={async () => {
                                  const blob = await ejecutar(() => descargarPlantilla(version.id))
                                  if (blob) guardarBlob(blob, version.nombre_archivo)
                                }} className="text-sm font-bold text-[#3162e9]">Descargar original</button>
                                {(admin || tipoActivo.empresa_id) && (
                                <>
                                  <SearchableSelect value={version.estado} placeholder="Estado de versión" options={[
                                    { value: 'ACTIVA', label: 'Activa' },
                                    { value: 'INACTIVA', label: 'Inactiva' },
                                    { value: 'OBSOLETA', label: 'Obsoleta' },
                                  ]} onChange={async (estado) => {
                                    const actualizado = await ejecutar(() => cambiarEstadoPlantilla(version.id, estado), 'Estado de versión actualizado.')
                                    if (actualizado) setRefresh((actual) => actual + 1)
                                  }} />
                                  <button type="button" disabled={cargando} onClick={() => eliminarVersion(version)} aria-label={`Eliminar versión ${version.version}`} title="Retirar versión" className="rounded-lg border border-red-200 p-2 text-red-700 transition hover:bg-red-50 disabled:opacity-50">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                                )}
                              </div>
                            </article>
                          ))}
                          {!versiones.length && <p className="py-5 text-center text-sm text-[#65758f]">Aún no hay versiones. Sube el primer archivo Word.</p>}
                        </div>
                      </>
                    )}
                    {!tipoActivo && <p className="text-sm text-[#65758f]">Selecciona un tipo de documento.</p>}
                  </Panel>
                </div>
              </div>
              </div>
            )}

            {activeTab === 'solicitudes' && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm leading-6 text-blue-900">
                  <strong className="block text-base">Cómo atender una solicitud</strong>
                  <span>Selecciona una solicitud, revisa los datos, elige la versión correcta, verifica la vista previa y luego genera o rechaza con un motivo.</span>
                </div>
                <div className="grid items-start gap-5 xl:grid-cols-[minmax(340px,0.9fr)_minmax(400px,1.1fr)]">
                <Panel title={`Solicitudes recibidas${solicitudesPendientes ? ` · ${solicitudesPendientes} por atender` : ''}`}>
                  {admin && (
                    <label className="mb-3 block text-sm font-semibold text-[#33445f]">
                      Empresa
                      <div className="mt-1">
                        <SearchableSelect value={String(empresaFiltro)} onChange={setEmpresaFiltro} placeholder="Todas las empresas" options={[
                          { value: '', label: 'Todas las empresas' },
                          ...empresas.map((empresa) => ({ value: String(empresa.id), label: empresa.nombre_empresa })),
                        ]} />
                      </div>
                    </label>
                  )}
                  <div className="mb-4 grid gap-3 sm:grid-cols-3">
                    <label className="text-xs font-semibold text-[#65758f]">Estado
                      <div className="mt-1"><SearchableSelect value={filtroEstado} onChange={setFiltroEstado} placeholder="Todos los estados" options={[
                        { value: '', label: 'Todos' },
                        ...ESTADOS.map(([value, label]) => ({ value, label })),
                      ]} /></div>
                    </label>
                    <label className="text-xs font-semibold text-[#65758f]">Tipo de documento
                      <div className="mt-1"><SearchableSelect value={String(filtroTipo)} onChange={setFiltroTipo} placeholder="Todos los documentos" options={[
                        { value: '', label: 'Todos' },
                        ...tipos.map((tipo) => ({ value: String(tipo.id), label: tipo.nombre })),
                      ]} /></div>
                    </label>
                    <label className="text-xs font-semibold text-[#65758f]">Colaborador
                      <div className="mt-1"><SearchableSelect value={String(filtroColaborador)} onChange={setFiltroColaborador} placeholder="Todos los colaboradores" options={[
                        { value: '', label: 'Todos' },
                        ...colaboradoresSolicitudes.map((item) => ({ value: String(item.id), label: item.nombre })),
                      ]} /></div>
                    </label>
                  </div>
                  <div className="max-h-[70vh] space-y-2 overflow-y-auto">
                    {solicitudes.map((solicitud) => (
                      <button key={solicitud.id} type="button" onClick={() => { setSeleccionada(solicitud); setPreview(null); setPlantillaId('') }} className={`w-full rounded-2xl border p-4 text-left transition ${seleccionada?.id === solicitud.id ? 'border-[#3162e9] bg-blue-50 shadow-sm' : 'border-[#e5eaf2] hover:border-[#b9c9e5] hover:bg-[#f9fbff]'}`}>
                        <span className="flex flex-wrap items-center justify-between gap-2"><strong className="text-[#071b3b]">{solicitud.colaborador.nombre}</strong><Badge estado={solicitud.estado} /></span>
                        <span className="mt-1 block text-sm font-medium text-[#33445f]">{solicitud.tipo_documento.nombre}</span>
                        <span className="mt-1 block text-xs text-[#65758f]">{solicitud.empresa.nombre_empresa} · Recibida {fecha(solicitud.solicitada_en)}</span>
                      </button>
                    ))}
                    {!solicitudes.length && <div className="rounded-2xl border border-dashed border-[#d5deea] px-5 py-10 text-center"><ClipboardList className="mx-auto h-8 w-8 text-[#97a6bb]" /><p className="mt-3 font-semibold text-[#33445f]">No hay solicitudes para mostrar</p><p className="mt-1 text-sm text-[#65758f]">Prueba cambiando los filtros o vuelve cuando llegue una solicitud nueva.</p></div>}
                  </div>
                </Panel>
                <Panel title={seleccionada ? `Revisar solicitud #${seleccionada.id}` : 'Detalle y entrega'}>
                  {seleccionada ? (
                    <div className="space-y-4">
                      <div className="grid gap-3 rounded-2xl bg-[#f6f8fc] p-4 text-sm sm:grid-cols-2">
                        <p><span className="block text-xs font-semibold uppercase tracking-wide text-[#8290a5]">Colaborador</span><strong>{seleccionada.colaborador.nombre}</strong></p>
                        <p><span className="block text-xs font-semibold uppercase tracking-wide text-[#8290a5]">Documento</span><strong>{seleccionada.tipo_documento.nombre}</strong></p>
                        <p><span className="block text-xs font-semibold uppercase tracking-wide text-[#8290a5]">Empresa</span><strong>{seleccionada.empresa.nombre_empresa}</strong></p>
                        <p><span className="block text-xs font-semibold uppercase tracking-wide text-[#8290a5]">Fecha de solicitud</span><strong>{fecha(seleccionada.solicitada_en)}</strong></p>
                        {seleccionada.comentario && <p className="sm:col-span-2"><span className="block text-xs font-semibold uppercase tracking-wide text-[#8290a5]">Comentario</span>{seleccionada.comentario}</p>}
                        {seleccionada.motivo_rechazo && <p className="text-red-700 sm:col-span-2"><span className="block text-xs font-semibold uppercase tracking-wide">Motivo de rechazo</span>{seleccionada.motivo_rechazo}</p>}
                      </div>
                      {seleccionada.estado === 'GENERADO' ? (
                        seleccionada.documento
                          ? <button type="button" onClick={() => descargar(seleccionada.documento.id, seleccionada.documento.nombre_archivo)} className="rounded-xl bg-[#3162e9] px-4 py-2.5 font-bold text-white">Descargar documento entregado</button>
                          : <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">El archivo fue retirado de la lista de documentos disponibles. El registro de la entrega se conserva en el historial.</p>
                      ) : seleccionada.estado !== 'RECHAZADA' ? (
                        <>
                          <label className="block text-sm font-semibold text-[#33445f]">1. Elige la versión de plantilla
                            <div className="mt-1"><SearchableSelect value={String(plantillaId)} onChange={(value) => { setPlantillaId(value); setPreview(null) }} placeholder="Selecciona una versión" options={[
                              { value: '', label: 'Selecciona una versión' },
                              ...versionesDisponibles.map((version) => ({ value: String(version.id), label: `v${version.version} · ${version.estado}${version.creada_en ? ` · ${fecha(version.creada_en)}` : ''}` })),
                            ]} /></div>
                          </label>
                          <p className="text-xs leading-5 text-[#65758f]">La vista previa usa los datos actuales del colaborador y cambia al seleccionar otra versión.</p>
                          {!preview?.blob && plantillaId && seleccionada.estado !== 'GENERADO' && <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800">Preparando la vista previa del documento...</p>}
                          {preview?.blob && <div className="overflow-hidden rounded-2xl border border-[#dce3ee]"><div className="border-b border-[#e5eaf2] bg-[#f6f8fc] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#65758f]">2. Vista previa</div><div ref={previewRef} className="docx-preview max-h-[70vh] overflow-auto bg-slate-100 p-3" /></div>}
                          <div className="flex flex-wrap gap-3">
                            <button type="button" disabled={!plantillaId || !preview?.blob || cargando} onClick={atenderSolicitud} className="inline-flex items-center gap-2 rounded-xl bg-[#3162e9] px-4 py-2.5 font-bold text-white shadow-sm transition hover:bg-[#244fc7] disabled:cursor-not-allowed disabled:opacity-50"><Check className="h-4 w-4" />3. Generar y entregar</button>
                          </div>
                          <div className="border-t border-[#eef1f6] pt-4">
                            <label className="block text-sm font-semibold text-[#33445f]">¿Necesitas rechazar esta solicitud?
                              <input value={rechazoMotivo} onChange={(event) => setRechazoMotivo(event.target.value)} placeholder="Explica brevemente el motivo para el colaborador" maxLength={5000} className="mt-2 w-full rounded-xl border border-[#dce3ee] p-3 font-normal" />
                            </label>
                            <button type="button" disabled={cargando || !rechazoMotivo.trim()} onClick={rechazar} className="mt-3 rounded-xl border border-red-200 px-4 py-2.5 font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">Rechazar y notificar</button>
                          </div>
                        </>
                      ) : <p className="text-sm text-[#65758f]">La solicitud fue rechazada.</p>}
                    </div>
                  ) : <p className="text-sm text-[#65758f]">Selecciona una solicitud para revisar sus datos.</p>}
                </Panel>
              </div>
              </div>
            )}

            {activeTab === 'documentos-generados' && (
              <Panel title="Documentos generados">
                {admin && (
                  <label className="mb-4 block max-w-md text-sm font-semibold text-[#33445f]">
                    Filtrar empresa
                    <div className="mt-1"><SearchableSelect value={String(empresaFiltro)} onChange={setEmpresaFiltro} placeholder="Todas las empresas" options={[
                      { value: '', label: 'Todas las empresas' },
                      ...empresas.map((empresa) => ({ value: String(empresa.id), label: empresa.nombre_empresa })),
                    ]} /></div>
                  </label>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead><tr className="border-b text-[#65758f]"><th className="p-3">Documento</th><th className="p-3">Destinatario</th><th className="p-3">Empresa</th><th className="p-3">Generado</th><th className="p-3">Acciones</th></tr></thead>
                    <tbody>{documentosGenerados.map((documento) => (
                      <tr key={documento.id} className="border-b border-[#eef1f6]">
                        <td className="p-3"><strong className="block">{documento.tipo_documento.nombre}</strong><span className="text-xs text-[#65758f]">Versión {documento.version_plantilla}</span></td>
                        <td className="p-3">{documento.colaborador.nombre}</td>
                        <td className="p-3">{documento.empresa.nombre_empresa}</td>
                        <td className="p-3">{fecha(documento.generado_en)}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <button type="button" onClick={() => descargar(documento.id, documento.nombre_archivo)} className="font-bold text-[#3162e9]">Descargar</button>
                            <button type="button" disabled={cargando} onClick={() => eliminarDocumento(documento)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50">
                              <Trash2 className="h-3.5 w-3.5" />Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                {!documentosGenerados.length && <p className="py-8 text-center text-sm text-[#65758f]">No hay documentos generados para mostrar.</p>}
              </Panel>
            )}

            {activeTab === 'campos' && (
              <Panel title="Campos disponibles">
                <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <h3 className="font-bold text-blue-950">Cómo insertar un campo en Word</h3>
                  <ol className="mt-2 grid gap-2 text-sm leading-5 text-blue-900 md:grid-cols-3">
                    <li><strong>1.</strong> Busca el dato que necesitas.</li>
                    <li><strong>2.</strong> Copia el marcador completo, por ejemplo <code className="rounded bg-white px-1.5 py-0.5">{'{nombre_colaborador}'}</code>.</li>
                    <li><strong>3.</strong> Pégalo en Word sin cambiarle el texto ni el formato a la mitad.</li>
                  </ol>
                </div>
                <label className="relative mb-5 block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8290a5]" />
                  <input value={busquedaCampo} onChange={(event) => setBusquedaCampo(event.target.value)} placeholder="Buscar por nombre o marcador" className="w-full rounded-xl border border-[#dce3ee] bg-white py-3 pl-10 pr-4 outline-none transition focus:border-[#3162e9] focus:ring-2 focus:ring-[#3162e9]/10" />
                </label>
                <div className="grid gap-4 lg:grid-cols-2">
                  {camposFiltrados.map((grupo) => (
                    <section key={grupo.grupo} className="overflow-hidden rounded-2xl border border-[#e5eaf2]">
                      <h3 className="border-b border-[#e5eaf2] bg-[#f6f8fc] px-4 py-3 font-bold text-[#33445f]">{grupo.grupo}<span className="ml-2 text-xs font-medium text-[#8290a5]">{grupo.campos.length} campos</span></h3>
                      <ul className="divide-y divide-[#eef1f6] px-4">
                        {grupo.campos.map((campo) => (
                          <li key={campo.marcador} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                            <span className="min-w-0">
                              <span className="block font-medium text-[#33445f]">{campo.descripcion}</span>
                              <code className="mt-1 inline-block rounded-md bg-[#eef4ff] px-2 py-1 text-xs font-semibold text-[#1e3a8a]">{`{${campo.marcador}}`}</code>
                            </span>
                            <button type="button" onClick={() => copiarMarcador(campo.marcador)} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#dce3ee] px-3 py-2 text-xs font-bold text-[#3162e9] transition hover:border-[#3162e9] hover:bg-blue-50"><Copy className="h-3.5 w-3.5" />Copiar</button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                  {!camposFiltrados.length && <p className="rounded-2xl border border-dashed border-[#d5deea] py-10 text-center text-sm text-[#65758f]">No hay campos que coincidan con la búsqueda.</p>}
                </div>
              </Panel>
            )}

            {activeTab === 'directo' && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950">
                  <strong className="block text-base">Genera un documento sin solicitud previa.</strong>
                  <span>Úsalo cuando Recursos Humanos necesite preparar un documento por iniciativa propia. El colaborador recibirá una notificación cuando esté listo.</span>
                </div>
                <Panel title="1. Selecciona al colaborador, el documento y la versión">
                  {admin && (
                    <label className="mb-4 block text-sm font-semibold">Filtrar tipos por empresa
                      <div className="mt-1"><SearchableSelect value={String(empresaFiltro)} onChange={setEmpresaFiltro} placeholder="Todas las empresas" options={[
                        { value: '', label: 'Todas las empresas' },
                        ...empresas.map((empresa) => ({ value: String(empresa.id), label: empresa.nombre_empresa })),
                      ]} /></div>
                    </label>
                  )}
                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="text-sm font-semibold text-[#33445f]">Persona destinataria
                      <div className="mt-1"><SearchableSelect value={directoColaborador} onChange={cambiarDestinoDirecto} placeholder="Busca por nombre o rol" options={[
                        { value: '', label: 'Selecciona una persona' },
                        ...colaboradoresVisibles.map((item) => ({ value: String(item.id), label: `${item.nombre} · ${item.rol}` })),
                      ]} /></div>
                    </label>
                    <label className="text-sm font-semibold text-[#33445f]">Empresa del documento
                      <div className="mt-1"><SearchableSelect value={String(empresaDirecta)} onChange={cambiarEmpresaDirecta} placeholder="Selecciona una empresa" disabled={!destinoDirecto} options={[
                        { value: '', label: 'Selecciona una empresa' },
                        ...empresasDestino.map((empresa) => ({ value: String(empresa.id), label: empresa.nombre_empresa })),
                      ]} /></div>
                      <span className="mt-1 block text-xs font-normal text-[#65758f]">Si la persona no tiene empresa asignada, selecciona aquí la empresa que aparecerá en el documento.</span>
                    </label>
                    <label className="text-sm font-semibold text-[#33445f]">Tipo de documento
                      <div className="mt-1"><SearchableSelect value={String(directoTipo)} onChange={(value) => { setDirectoTipo(value); setDirectoPlantilla('') }} placeholder="Selecciona documento" options={[
                        { value: '', label: 'Selecciona documento' },
                        ...tiposDirectos.map((tipo) => ({ value: String(tipo.id), label: tipo.nombre })),
                      ]} /></div>
                    </label>
                    <label className="text-sm font-semibold text-[#33445f] md:col-span-3">Versión de plantilla
                      <div className="mt-1"><SearchableSelect value={String(directoPlantilla)} onChange={(value) => { setDirectoPlantilla(value); setPreview(null) }} placeholder="Selecciona versión" options={[
                        { value: '', label: 'Selecciona versión' },
                        ...versionesDirectas.map((version) => ({ value: String(version.id), label: `v${version.version} · ${version.estado}` })),
                      ]} /></div>
                    </label>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button type="button" disabled={!directoColaborador || !empresaDirecta || !tipoDirectoValido || !directoPlantilla || cargando} onClick={() => obtenerPreviewDirecto(directoTipo, directoColaborador, directoPlantilla)} className="rounded-xl border border-[#3162e9] px-4 py-2.5 font-bold text-[#3162e9] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50">2. Previsualizar</button>
                    <button type="button" disabled={!directoColaborador || !empresaDirecta || !tipoDirectoValido || !directoPlantilla || cargando} onClick={generarDirecto} className="rounded-xl bg-[#3162e9] px-4 py-2.5 font-bold text-white shadow-sm transition hover:bg-[#244fc7] disabled:cursor-not-allowed disabled:opacity-50">3. Generar y entregar</button>
                  </div>
                  {preview?.blob && <div className="mt-5 overflow-hidden rounded-2xl border border-[#dce3ee]"><div className="border-b border-[#e5eaf2] bg-[#f6f8fc] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#65758f]">Vista previa</div><div ref={previewRef} className="docx-preview max-h-[70vh] overflow-auto bg-slate-100 p-3" /></div>}
                </Panel>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Informes
