import {
  etiquetasEstadoCivil,
  etiquetasSexo,
  etiquetasEstadoPostulante,
  etiquetasVivienda,
  etiquetasMedioEnterado,
  etiquetasParentesco,
  etiquetasNivelEducativo,
  etiquetasMotivoRetiro,
  etiquetasTipoDocumento,
} from "../../components/postulantes/etiquetas.js";
import { fechaExcel, siNo, texto, numero } from "../excel.js";

const etiquetasEstadoEducativo = {
  COMPLETA: "Completa",
  INCOMPLETA: "Incompleta",
};

function etiqueta(mapa) {
  return (valor) => (valor && mapa[valor]) || "";
}

function col(encabezado, obtener) {
  return { encabezado, obtener };
}

const AFILIACIONES = [
  ["gremial", "Gremial"],
  ["religiosa", "Religiosa"],
  ["politica", "Política"],
  ["deportiva", "Deportiva"],
  ["sociales", "Social"],
  ["civicos", "Cívica"],
  ["sindicales", "Sindical"],
  ["otros", "Otros"],
];

function columnasPostulante() {
  const columnas = [
    col("ID", (p) => numero(p.id)),
    col("Estado", etiqueta(etiquetasEstadoPostulante)),
    col("Fecha de postulación", (p) => fechaExcel(p.fecha_registro)),
    col("Digitalizado por", (p) => texto(p.usuario?.nombre)),
    col("Plaza aplicada", (p) => texto(p.plaza?.nombre)),
    col("Rechazado por", (p) => texto(p.rechazado_por_usuario?.nombre)),
    col("Fecha de rechazo", (p) => fechaExcel(p.fecha_rechazo)),
    col("Motivo de rechazo", (p) => texto(p.motivo_rechazo)),
    col("Contratado por", (p) => texto(p.contratado_por_usuario?.nombre)),
    col("Fecha de contratación", (p) => fechaExcel(p.fecha_contratacion)),

    col("Nombre completo", (p) => texto(p.nombre_completo)),
    col("Dirección", (p) => texto(p.direccion)),
    col("Lugar de nacimiento", (p) => texto(p.lugar_nacimiento)),
    col("Fecha de nacimiento", (p) => fechaExcel(p.fecha_nacimiento)),
    col("Teléfono", (p) => texto(p.telefono)),
    col("Correo electrónico", (p) => texto(p.correo)),
    col("Estado civil", etiqueta(etiquetasEstadoCivil)),
    col("Sexo", etiqueta(etiquetasSexo)),
    col("DPI", (p) => texto(p.dpi)),
    col("DPI extendido en", (p) => texto(p.dpi_extendido_en)),
    col("NIT", (p) => texto(p.nit)),
    col("No. afiliación IGSS", (p) => texto(p.igss)),
    col("Perfil de Facebook", (p) => texto(p.perfil_facebook)),
  ];

  for (const [clave, nombre] of AFILIACIONES) {
    columnas.push(
      col(`Afiliación ${nombre}`, (p) => siNo(p[`afiliacion_${clave}`])),
      col(
        `Afiliación ${nombre} (especificar)`,
        (p) => texto(p[`afiliacion_${clave}_especificar`]),
      ),
    );
  }

  columnas.push(
    col("¿Practica deporte?", (p) => siNo(p.practica_deporte)),
    col("¿Cuál deporte?", (p) => texto(p.deporte_cual)),
    col("¿Enfermedad de gravedad?", (p) => siNo(p.ha_estado_enfermo_gravedad)),
    col(
      "Enfermedad de gravedad (especificar)",
      (p) => texto(p.ha_estado_enfermo_gravedad_especificar),
    ),
    col("¿Toma medicamento?", (p) => siNo(p.toma_medicamento)),
    col(
      "Medicamento (especificar)",
      (p) => texto(p.toma_medicamento_especificar),
    ),
    col("¿Fuma o bebe?", (p) => siNo(p.fuma_o_bebe)),
    col("Frecuencia fumar/beber", (p) => texto(p.fuma_bebe_frecuencia)),
    col("¿Impedimento físico?", (p) => siNo(p.impedimento_fisico)),
    col(
      "Impedimento físico (especificar)",
      (p) => texto(p.impedimento_fisico_especificar),
    ),
    col("¿Estudia en la actualidad?", (p) => siNo(p.estudia_actualidad)),
    col("¿Qué estudia?", (p) => texto(p.estudia_que)),
    col("Establecimiento de estudio", (p) => texto(p.estudia_establecimiento)),
    col("Horario de estudio", (p) => texto(p.estudia_horario)),

    col(
      "¿Posee conocimientos técnicos?",
      (p) => siNo(p.posee_conocimientos_tecnicos),
    ),
    col(
      "Conocimientos técnicos (especificar)",
      (p) => texto(p.conocimientos_tecnicos_especificar),
    ),
    col("Equipo o maquinaria", (p) => texto(p.equipo_maquinaria)),
    col("Personas que dependen de usted", (p) => numero(p.personas_dependientes)),

    col("Fortaleza 1", (p) => texto(p.fortaleza_1)),
    col("Fortaleza 2", (p) => texto(p.fortaleza_2)),
    col("Fortaleza 3", (p) => texto(p.fortaleza_3)),
    col("Debilidad 1", (p) => texto(p.debilidad_1)),
    col("Debilidad 2", (p) => texto(p.debilidad_2)),
    col("Debilidad 3", (p) => texto(p.debilidad_3)),

    col("Total efectivo del hogar", (p) => numero(p.total_efectivo_hogar)),
    col("Tipo de vivienda", etiqueta(etiquetasVivienda)),
    col("Especificación de vivienda", (p) => texto(p.vivienda_otra_especificar)),
    col("Valor de vivienda", (p) => numero(p.vivienda_valor)),
    col("Renta de vivienda", (p) => numero(p.vivienda_renta_monto)),
    col("¿Vivienda asegurada?", (p) => siNo(p.vivienda_asegurada)),
    col("Monto seguro de vivienda", (p) => numero(p.vivienda_seguro_monto)),
    col("¿Tiene otro inmueble?", (p) => siNo(p.tiene_otro_inmueble)),
    col("Otro inmueble (especificar)", (p) => texto(p.otro_inmueble_especificar)),
    col("Monto de otro inmueble", (p) => numero(p.otro_inmueble_monto)),
    col("¿Tiene vehículo?", (p) => siNo(p.tiene_vehiculo)),
    col("Tipo de vehículo", (p) => texto(p.tipo_vehiculo)),
    col("Marca del vehículo", (p) => texto(p.vehiculo_marca)),
    col("Placa del vehículo", (p) => texto(p.vehiculo_placa)),
    col("Tipo de licencia", (p) => texto(p.licencia_tipo)),
    col("Número de licencia", (p) => texto(p.licencia_numero)),
    col("¿Vehículo asegurado?", (p) => siNo(p.vehiculo_asegurado)),
    col("Monto seguro de vehículo", (p) => numero(p.vehiculo_seguro_monto)),
    col("¿Ingresos adicionales?", (p) => siNo(p.ingresos_adicionales)),
    col("Monto de ingresos adicionales", (p) => numero(p.ingresos_adicionales_monto)),
    col("Motivo de ingresos adicionales", (p) => texto(p.ingresos_adicionales_motivo)),
    col("¿Cuenta bancaria?", (p) => siNo(p.tiene_cuenta_bancaria)),
    col("Banco", (p) => texto(p.banco)),
    col("Tipo de cuenta", (p) => texto(p.tipo_cuenta_bancaria)),
    col("Número de cuenta", (p) => texto(p.numero_cuenta_bancaria)),
    col("¿Deudas pendientes?", (p) => siNo(p.deudas_pendientes)),
    col("Monto de deudas", (p) => numero(p.deudas_monto)),
    col("Institución de deuda", (p) => texto(p.deudas_institucion)),
    col("Motivo de deuda", (p) => texto(p.deudas_motivo)),
    col("¿Tiene hipotecas?", (p) => siNo(p.tiene_hipotecas)),
    col("Motivo de hipoteca", (p) => texto(p.hipoteca_motivo)),
    col("Monto de hipoteca", (p) => numero(p.hipoteca_monto)),
    col("Institución de hipoteca", (p) => texto(p.hipoteca_institucion)),
    col("¿Otras deudas?", (p) => siNo(p.otras_deudas)),
    col("Motivo de otra deuda", (p) => texto(p.otra_deuda_motivo)),
    col("Monto de otra deuda", (p) => numero(p.otra_deuda_monto)),
    col("Institución de otra deuda", (p) => texto(p.otra_deuda_institucion)),
    col("¿Detenido por policía?", (p) => siNo(p.detenido_policia)),
    col("Motivo de detención", (p) => texto(p.detenido_motivo)),
    col("¿Procesado legalmente?", (p) => siNo(p.procesado_legalmente)),
    col("Motivo de proceso", (p) => texto(p.procesado_motivo)),
    col("¿Conoce a alguien detenido?", (p) => siNo(p.conoce_detenido_entorno)),
    col("Motivo del entorno", (p) => texto(p.conoce_detenido_motivo)),

    col("Salario al que aspira", (p) => numero(p.salario_aspira)),
    col("Fecha de inicio disponible", (p) => fechaExcel(p.fecha_inicio_disponible)),
    col("¿Horario extraordinario?", (p) => siNo(p.trabajar_extraordinario)),
    col("¿Turnos rotativos?", (p) => siNo(p.trabajar_turnos_rotativos)),
    col("Medio por el que se enteró", etiqueta(etiquetasMedioEnterado)),
    col("Medio (especificar)", (p) => texto(p.medio_enterado_especificar)),
    col("¿Parientes en la empresa?", (p) => siNo(p.tiene_parientes_empresa)),
    col("Nombre del pariente o amigo", (p) => texto(p.parientes_empresa_nombre)),
    col("¿Por qué le gustaría trabajar aquí?", (p) => texto(p.porque_gustaria_trabajar)),
    col("¿Por qué deberíamos contratarle?", (p) => texto(p.porque_deberiamoss_contratar)),
  );

  return columnas;
}

function aplanar(postulantes, clave) {
  return postulantes.flatMap((postulante) =>
    (postulante[clave] || []).map((item) => ({
      ...item,
      postulante: postulante.nombre_completo,
    })),
  );
}

export function hojasPostulante(postulantes) {
  return [
    {
      nombre: "Postulantes",
      columnas: columnasPostulante(),
      filas: postulantes,
    },
    {
      nombre: "Familiares",
      columnas: [
        col("Postulante", (i) => texto(i.postulante)),
        col("Parentesco", etiqueta(etiquetasParentesco)),
        col("Nombres y apellidos", (i) => texto(i.nombres_apellidos)),
        col("Edad", (i) => numero(i.edad)),
        col("Dirección", (i) => texto(i.direccion)),
        col("Ocupación", (i) => texto(i.ocupacion)),
        col("Teléfono", (i) => texto(i.telefono)),
      ],
      filas: aplanar(postulantes, "datosFamiliares"),
    },
    {
      nombre: "Educación",
      columnas: [
        col("Postulante", (i) => texto(i.postulante)),
        col("Nivel", etiqueta(etiquetasNivelEducativo)),
        col("Estado", etiqueta(etiquetasEstadoEducativo)),
        col("Establecimiento", (i) => texto(i.establecimiento)),
        col("Año inicial", (i) => numero(i.ano_inicial)),
        col("Año final", (i) => numero(i.ano_final)),
      ],
      filas: aplanar(postulantes, "educacionHistorial"),
    },
    {
      nombre: "Idiomas",
      columnas: [
        col("Postulante", (i) => texto(i.postulante)),
        col("Idioma", (i) => texto(i.idioma)),
        col("Habla", (i) => siNo(i.habla)),
        col("Lee", (i) => siNo(i.lee)),
        col("Escribe", (i) => siNo(i.escribe)),
      ],
      filas: aplanar(postulantes, "idiomas"),
    },
    {
      nombre: "Capacitaciones",
      columnas: [
        col("Postulante", (i) => texto(i.postulante)),
        col("Curso o seminario", (i) => texto(i.nombre_curso)),
        col("Establecimiento o país", (i) => texto(i.establecimiento_pais)),
        col("Duración", (i) => texto(i.tiempo_duracion)),
        col("Fecha inicial", (i) => fechaExcel(i.fecha_inicial)),
        col("Fecha final", (i) => fechaExcel(i.fecha_final)),
      ],
      filas: aplanar(postulantes, "capacitaciones"),
    },
    {
      nombre: "Experiencia",
      columnas: [
        col("Postulante", (i) => texto(i.postulante)),
        col("Empresa", (i) => texto(i.empresa)),
        col("Dirección", (i) => texto(i.direccion)),
        col("Teléfono", (i) => texto(i.telefono)),
        col("Puesto", (i) => texto(i.puesto)),
        col("Jefe inmediato", (i) => texto(i.jefe_inmediato)),
        col("Fecha de ingreso", (i) => fechaExcel(i.fecha_ingreso)),
        col("Fecha de retiro", (i) => fechaExcel(i.fecha_retiro)),
        col("Salario inicial", (i) => numero(i.salario_inicial)),
        col("Salario final", (i) => numero(i.salario_final)),
        col("Tareas realizadas", (i) => texto(i.tareas_realizadas)),
        col("Motivo de retiro", etiqueta(etiquetasMotivoRetiro)),
        col("Motivo de retiro (otro)", (i) => texto(i.motivo_retiro_otro)),
      ],
      filas: aplanar(postulantes, "experienciaLaboral"),
    },
    {
      nombre: "Referencias",
      columnas: [
        col("Postulante", (i) => texto(i.postulante)),
        col("Nombre", (i) => texto(i.nombre)),
        col("Dirección", (i) => texto(i.direccion)),
        col("Teléfono", (i) => texto(i.telefono)),
      ],
      filas: aplanar(postulantes, "referenciasPersonales"),
    },
    {
      nombre: "Documentos",
      columnas: [
        col("Postulante", (i) => texto(i.postulante)),
        col("Tipo", etiqueta(etiquetasTipoDocumento)),
        col("Archivo", (i) => texto(i.nombre_archivo)),
        col("Tamaño (KB)", (i) => Math.round((i.tamano_bytes || 0) / 1024)),
        col("Tipo MIME", (i) => texto(i.mime_type)),
        col("Fecha de carga", (i) => fechaExcel(i.fecha_subida)),
      ],
      filas: aplanar(postulantes, "documentos"),
    },
  ];
}
