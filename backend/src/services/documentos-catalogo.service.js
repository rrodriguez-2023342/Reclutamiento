import prisma from '../config/prisma.js'
export const MARCADORES_DOCUMENTO = [
  {
    grupo: 'Colaborador',
    campos: [
      ['nombre_colaborador', 'Nombre completo'],
      ['edad_colaborador', 'Edad del colaborador en años'],
      ['correo_colaborador', 'Correo electrónico'],
      ['telefono_colaborador', 'Teléfono'],
      ['dpi', 'DPI'],
      ['dpi_extendido_en', 'Lugar de extensión del DPI'],
      ['nit', 'NIT'],
      ['igss', 'Número de afiliación IGSS'],
      ['direccion_colaborador', 'Dirección'],
      ['nacionalidad', 'Nacionalidad'],
      ['fecha_nacimiento', 'Fecha de nacimiento'],
      ['estado_civil', 'Estado civil'],
      ['sexo', 'Sexo'],
      ['fecha_contratacion', 'Fecha de contratación'],
      ['tipo_contrato', 'Tipo de contrato'],
      ['fecha_fin_contrato', 'Fecha de fin de contrato'],
      ['fecha_baja', 'Fecha de baja'],
      ['motivo_baja', 'Motivo de baja'],
      ['reingreso_baja', 'Elegible para reingreso'],
      ['puesto', 'Puesto'],
      ['puesto_descripcion', 'Descripción del puesto'],
      ['departamento', 'Departamento'],
      ['division', 'División'],
      ['patrono', 'Razón social del patrono'],
      ['patrono_representante_legal', 'Representante legal del patrono'],
      ['patrono_edad', 'Edad del patrono en años'],
      ['patrono_sexo', 'Sexo del patrono'],
      ['patrono_profesion', 'Profesión del patrono'],
      ['patrono_dpi', 'DPI del patrono'],
      ['patrono_dpi_extendido_en', 'Lugar de extensión del DPI del patrono'],
      ['numero_patronal', 'Número patronal'],
      ['salario', 'Sueldo mensual con moneda'],
      ['bonos', 'Bonos con moneda'],
      ['empresa_seguro_vida', 'Empresa del seguro de vida'],
      ['categoria_seguro_vida', 'Categoría del seguro de vida'],
      ['fecha_alta_seguro_vida', 'Fecha de alta del seguro de vida'],
      ['fecha_baja_seguro_vida', 'Fecha de baja del seguro de vida'],
      ['empresa_seguro_gastos_medicos', 'Empresa del seguro médico'],
      ['categoria_seguro_gastos_medicos', 'Categoría del seguro médico'],
      ['fecha_alta_seguro_gastos_medicos', 'Fecha de alta del seguro médico'],
      ['fecha_baja_seguro_gastos_medicos', 'Fecha de baja del seguro médico'],
    ],
  },
  {
    grupo: 'Empresa',
    campos: [
      ['empresa_nombre', 'Nombre de la empresa'],
      ['empresa_direccion', 'Dirección de la empresa'],
      ['empresa_telefono', 'Teléfono de la empresa'],
      ['empresa_correo', 'Correo de la empresa'],
      ['empresa_detalle', 'Detalle de la empresa'],
    ],
  },
  {
    grupo: 'Fecha actual',
    campos: [['fecha_actual', 'Fecha de generación del documento']],
  },
].map(({ grupo, campos }) => ({
  grupo,
  campos: campos.map(([marcador, descripcion]) => ({ marcador, descripcion })),
}))

const marcadoresAdmitidos = new Set(
  MARCADORES_DOCUMENTO.flatMap(({ campos }) => campos.map(({ marcador }) => marcador)),
)

const marcadoresAnteriores = new Set([
  'dpi_colaborador',
  'dpi_extendido_en_colaborador',
  'estado_civil_colaborador',
  'sexo_colaborador',
  'patrono_razon_social',
])

export const esMarcadorAdmitido = (marcador) =>
  marcadoresAdmitidos.has(marcador) || marcadoresAnteriores.has(marcador)

function formatearFecha(value) {
  if (!value) return ''
  const fecha = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(fecha.getTime())) return ''
  return new Intl.DateTimeFormat('es-GT', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(fecha)
}

function calcularEdad(value) {
  if (!value) return ''
  const nacimiento = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(nacimiento.getTime())) return ''
  const hoy = new Date()
  let edad = hoy.getUTCFullYear() - nacimiento.getUTCFullYear()
  const mes = hoy.getUTCMonth() - nacimiento.getUTCMonth()
  if (mes < 0 || (mes === 0 && hoy.getUTCDate() < nacimiento.getUTCDate())) edad -= 1
  return String(edad)
}

function traducirSexo(value) {
  return { MASCULINO: 'Masculino', FEMENINO: 'Femenino' }[value] || value || ''
}

function traducirEstadoCivil(value) {
  return {
    SOLTERO: 'Soltero(a)',
    CASADO: 'Casado(a)',
    UNIDO: 'Unido(a)',
    VIUDO: 'Viudo(a)',
    DIVORCIADO: 'Divorciado(a)',
  }[value] || value || ''
}

function formatearMoneda(value, moneda) {
  if (value === null || value === undefined) return ''
  const currency = moneda === 'DOLAR' ? 'USD' : 'GTQ'
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency,
  }).format(Number(value))
}

export async function obtenerDatosPlantilla(colaboradorId, empresaId) {
  const colaborador = await prisma.usuario.findUnique({
    where: { id: colaboradorId },
    include: {
      empresa: true,
      puesto: {
        include: {
          departamento: true,
          division: true,
        },
      },
      patrono: true,
    },
  })

  if (!colaborador) {
    const error = new Error('No se encontró el usuario de destino')
    error.status = 404
    throw error
  }

  const empresa = empresaId && colaborador.empresa?.id !== empresaId
    ? await prisma.empresa.findUnique({ where: { id: empresaId } })
    : colaborador.empresa

  return {
    nombre_colaborador: colaborador.nombre,
    edad_colaborador: calcularEdad(colaborador.fecha_nacimiento),
    correo_colaborador: colaborador.correo || '',
    telefono_colaborador: colaborador.telefono || '',
    dpi: colaborador.dpi || '',
    dpi_colaborador: colaborador.dpi || '',
    dpi_extendido_en: colaborador.dpi_extendido_en || '',
    dpi_extendido_en_colaborador: colaborador.dpi_extendido_en || '',
    nit: colaborador.nit || '',
    igss: colaborador.numero_afiliacion_igss || '',
    direccion_colaborador: colaborador.direccion || '',
    nacionalidad: colaborador.nacionalidad || '',
    fecha_nacimiento: formatearFecha(colaborador.fecha_nacimiento),
    estado_civil: traducirEstadoCivil(colaborador.estado_civil),
    estado_civil_colaborador: traducirEstadoCivil(colaborador.estado_civil),
    sexo: traducirSexo(colaborador.sexo),
    sexo_colaborador: traducirSexo(colaborador.sexo),
    fecha_contratacion: formatearFecha(colaborador.fecha_contratacion),
    tipo_contrato: colaborador.tipo_contrato || '',
    fecha_fin_contrato: formatearFecha(colaborador.fecha_fin_contrato),
    fecha_baja: formatearFecha(colaborador.fecha_baja),
    motivo_baja: colaborador.motivo_baja || '',
    reingreso_baja:
      colaborador.reingreso_baja === null || colaborador.reingreso_baja === undefined
        ? ''
        : colaborador.reingreso_baja
          ? 'Sí'
          : 'No',
    puesto: colaborador.puesto?.nombre || '',
    puesto_descripcion: colaborador.puesto?.descripcion || '',
    departamento: colaborador.puesto?.departamento?.nombre || '',
    division: colaborador.puesto?.division?.nombre || '',
    patrono: colaborador.patrono?.razon_social || '',
    patrono_razon_social: colaborador.patrono?.razon_social || '',
    patrono_representante_legal: colaborador.patrono?.representante_legal || '',
    patrono_edad: calcularEdad(colaborador.patrono?.fecha_nacimiento),
    patrono_sexo: traducirSexo(colaborador.patrono?.sexo),
    patrono_profesion: colaborador.patrono?.profesion || '',
    patrono_dpi: colaborador.patrono?.dpi || '',
    patrono_dpi_extendido_en: colaborador.patrono?.dpi_extendido_en || '',
    numero_patronal: colaborador.patrono?.numero_patronal || '',
    salario: formatearMoneda(colaborador.sueldo, colaborador.moneda_sueldo),
    bonos: formatearMoneda(colaborador.bonos, colaborador.moneda_sueldo),
    empresa_seguro_vida: colaborador.empresa_seguro_vida || '',
    categoria_seguro_vida: colaborador.categoria_seguro_vida || '',
    fecha_alta_seguro_vida: formatearFecha(colaborador.fecha_alta_seguro_vida),
    fecha_baja_seguro_vida: formatearFecha(colaborador.fecha_baja_seguro_vida),
    empresa_seguro_gastos_medicos: colaborador.empresa_seguro_gastos_medicos || '',
    categoria_seguro_gastos_medicos: colaborador.categoria_seguro_gastos_medicos || '',
    fecha_alta_seguro_gastos_medicos: formatearFecha(colaborador.fecha_alta_seguro_gastos_medicos),
    fecha_baja_seguro_gastos_medicos: formatearFecha(colaborador.fecha_baja_seguro_gastos_medicos),
    empresa_nombre: empresa?.nombre_empresa || '',
    empresa_direccion: empresa?.direccion || '',
    empresa_telefono: empresa?.telefono || '',
    empresa_correo: empresa?.correo || '',
    empresa_detalle: empresa?.detalle_empresa || '',
    fecha_actual: formatearFecha(new Date()),
  }
}
