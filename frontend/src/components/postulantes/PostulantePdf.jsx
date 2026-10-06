import { Download } from "lucide-react";
import {
  etiquetasEstadoCivil,
  etiquetasMedioEnterado,
  etiquetasMotivoRetiro,
  etiquetasNivelEducativo,
  etiquetasParentesco,
  etiquetasSexo,
  etiquetasVivienda,
} from "./etiquetas.js";

const DECLARACION =
  "DECLARO QUE TODOS LOS DATOS QUE HE PROPORCIONADO ANTERIORMENTE SON VERDADEROS Y AUTORIZO PARA QUE SEAN VERIFICADOS (A TRAVÉS DE INVESTIGACIONES ECONÓMICAS, REFERENCIAS CREDITICIAS, LABORALES, ENTRE OTRAS.) EN CASO DE SER EMPLEADO TENGO ENTENDIDO QUE CUALQUIER INFORMACIÓN FALSA QUE HUBIERE PODIDO DAR EN MI SOLICITUD O ENTREVISTA, ES CAUSA DE TERMINACIÓN DE RELACIÓN LABORAL SIN RESPONSABILIDAD DE LA EMPRESA.";

const escapeHtml = (value) =>
  String(value ?? "—").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
const text = (value) => value === null || value === undefined || value === "" ? "—" : value;
const yesNo = (value) => value === null || value === undefined ? "—" : value ? "Sí" : "No";
const date = (value) => {
  if (!value) return "—";
  const parsed = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? "—" : new Intl.DateTimeFormat("es-GT", { dateStyle: "long" }).format(parsed);
};
const amount = (value) => value === null || value === undefined || value === "" ? "—" : Number(value).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dpi = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length === 13 ? `${digits.slice(0, 4)}-${digits.slice(4, 9)}-${digits.slice(9)}` : text(value);
};
const detail = (label, value) => `<div class="detail"><b>${escapeHtml(label)}</b><span>${escapeHtml(value)}</span></div>`;
const table = (headers, rows) => `
  <div class="table-wrap"><table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
  <tbody>${rows.length ? rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${headers.length}" class="empty">Sin información registrada</td></tr>`}</tbody></table></div>`;
const section = (title, content) => `<section><h2>${escapeHtml(title)}</h2>${content}</section>`;
const jobCards = (jobs) => jobs.length
  ? `<div class="job-list">${jobs.map((item, index) => `<article class="job-card">
      <div class="job-title"><span>Experiencia ${index + 1}</span><strong>${escapeHtml(text(item.empresa))}</strong></div>
      <div class="job-grid">
        ${detail("Puesto", item.puesto)}${detail("Teléfono", item.telefono)}
        ${detail("Dirección", item.direccion)}${detail("Jefe inmediato", item.jefe_inmediato)}
        ${detail("Fecha de ingreso", date(item.fecha_ingreso))}${detail("Fecha de retiro", date(item.fecha_retiro))}
        ${detail("Salario inicial", amount(item.salario_inicial))}${detail("Salario final", amount(item.salario_final))}
        ${detail("Motivo de retiro", etiquetasMotivoRetiro[item.motivo_retiro] || "—")}${detail("Otro motivo", item.motivo_retiro === "OTRO" ? item.motivo_retiro_otro : "—")}
      </div>
      <div class="job-tasks"><b>Tareas realizadas</b><span>${escapeHtml(text(item.tareas_realizadas))}</span></div>
    </article>`).join("")}</div>`
  : '<div class="empty-box">Sin información laboral registrada</div>';

async function asDataUrl(url) {
  if (!url) return null;
  try {
    const blob = await fetch(url).then((response) => response.blob());
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function buildHtml(p, photo) {
  const affiliation = (value, description) => value === true && description ? `Sí (${description})` : yesNo(value);
  const photoHtml = photo
    ? `<img class="photo" src="${photo}" alt="Fotografía del postulante" />`
    : '<div class="no-photo">SIN<br/>FOTO</div>';
  const general = [
    detail("Nombre completo", p.nombre_completo), detail("Fecha de postulación", date(p.fecha_registro)),
    detail("Dirección", p.direccion), detail("Teléfono", p.telefono),
    detail("Lugar de nacimiento", p.lugar_nacimiento), detail("Fecha de nacimiento", date(p.fecha_nacimiento)),
    detail("Correo electrónico", p.correo), detail("Estado civil", etiquetasEstadoCivil[p.estado_civil] || "—"),
    detail("Sexo", etiquetasSexo[p.sexo] || "—"), detail("DPI / CUI", dpi(p.dpi)),
    detail("Extendido en", p.dpi_extendido_en), detail("NIT", p.nit), detail("No. afiliación IGSS", p.igss),
    detail("Perfil de Facebook", p.perfil_facebook), detail("Plaza solicitada", p.plaza?.nombre), detail("Salario al que aspira", amount(p.salario_aspira)),
  ].join("");
  const family = (p.datosFamiliares || []).map((item) => [etiquetasParentesco[item.parentesco] || item.parentesco, item.nombres_apellidos, item.edad, item.direccion, item.ocupacion, item.telefono]);
  const education = (p.educacionHistorial || []).map((item) => [etiquetasNivelEducativo[item.nivel] || item.nivel, item.estado === "INCOMPLETA" ? "Incompleta" : "Completa", item.establecimiento, item.ano_inicial, item.ano_final]);
  const languages = (p.idiomas || []).map((item) => [item.idioma, yesNo(item.habla), yesNo(item.lee), yesNo(item.escribe)]);
  const courses = (p.capacitaciones || []).map((item) => [item.nombre_curso, item.establecimiento_pais, item.tiempo_duracion, date(item.fecha_inicial), date(item.fecha_final)]);
  const jobs = p.experienciaLaboral || [];
  const references = (p.referenciasPersonales || []).map((item) => [item.nombre, item.direccion, item.telefono]);
  const documents = (p.documentos || []).map((item) => [item.tipo?.replaceAll("_", " "), item.nombre_archivo, date(item.fecha_subida)]);
  const health = [
    detail("Afiliación gremial", affiliation(p.afiliacion_gremial, p.afiliacion_gremial_especificar)), detail("Afiliación política", affiliation(p.afiliacion_politica, p.afiliacion_politica_especificar)),
    detail("Afiliación social", affiliation(p.afiliacion_sociales, p.afiliacion_sociales_especificar)), detail("Afiliación religiosa", affiliation(p.afiliacion_religiosa, p.afiliacion_religiosa_especificar)),
    detail("Afiliación cívica", affiliation(p.afiliacion_civicos, p.afiliacion_civicos_especificar)), detail("Afiliación sindical", affiliation(p.afiliacion_sindicales, p.afiliacion_sindicales_especificar)),
    detail("Afiliación deportiva", affiliation(p.afiliacion_deportiva, p.afiliacion_deportiva_especificar)), detail("Otras afiliaciones", affiliation(p.afiliacion_otros, p.afiliacion_otros_especificar)),
    detail("¿Practica deporte?", yesNo(p.practica_deporte)), detail("¿Cuál deporte?", p.deporte_cual),
    detail("¿Ha estado enfermo de gravedad?", affiliation(p.ha_estado_enfermo_gravedad, p.ha_estado_enfermo_gravedad_especificar)), detail("¿Toma medicamento?", affiliation(p.toma_medicamento, p.toma_medicamento_especificar)),
    detail("¿Fuma o bebe?", yesNo(p.fuma_o_bebe)), detail("Frecuencia", p.fuma_bebe_frecuencia),
    detail("¿Tiene impedimento físico?", affiliation(p.impedimento_fisico, p.impedimento_fisico_especificar)), detail("Personas que dependen de usted", p.personas_dependientes),
  ].join("");
  const economic = [
    detail("Total efectivo que aporta al hogar", amount(p.total_efectivo_hogar)), detail("Tipo de vivienda", etiquetasVivienda[p.vivienda_tipo] || "—"), detail("Valor de vivienda", amount(p.vivienda_valor)), detail("Renta de vivienda", amount(p.vivienda_renta_monto)), detail("Otra vivienda", p.vivienda_otra_especificar), detail("¿Vivienda asegurada?", yesNo(p.vivienda_asegurada)), detail("Monto seguro vivienda", amount(p.vivienda_seguro_monto)),
    detail("¿Tiene otro inmueble?", yesNo(p.tiene_otro_inmueble)), detail("Especificación inmueble", p.otro_inmueble_especificar), detail("Monto inmueble", amount(p.otro_inmueble_monto)),
    detail("¿Tiene vehículo?", yesNo(p.tiene_vehiculo)), detail("Tipo de vehículo", p.tipo_vehiculo), detail("Marca", p.vehiculo_marca), detail("Placa", p.vehiculo_placa), detail("Licencia tipo", p.licencia_tipo), detail("Número de licencia", p.licencia_numero), detail("¿Vehículo asegurado?", yesNo(p.vehiculo_asegurado)), detail("Monto seguro vehículo", amount(p.vehiculo_seguro_monto)),
    detail("¿Tiene ingresos adicionales?", yesNo(p.ingresos_adicionales)), detail("Monto ingresos adicionales", amount(p.ingresos_adicionales_monto)), detail("Motivo de ingresos adicionales", p.ingresos_adicionales_motivo),
    detail("¿Tiene cuenta bancaria?", yesNo(p.tiene_cuenta_bancaria)), detail("Banco", p.banco), detail("Tipo de cuenta", p.tipo_cuenta_bancaria), detail("Número de cuenta", p.numero_cuenta_bancaria),
    detail("¿Tiene deudas pendientes?", yesNo(p.deudas_pendientes)), detail("Motivo de deuda", p.deudas_motivo), detail("Monto de deuda", amount(p.deudas_monto)), detail("Institución o persona", p.deudas_institucion),
    detail("¿Tiene hipotecas?", yesNo(p.tiene_hipotecas)), detail("Motivo de hipoteca", p.hipoteca_motivo), detail("Monto de hipoteca", amount(p.hipoteca_monto)), detail("Institución o persona", p.hipoteca_institucion),
    detail("¿Tiene otras cuentas por pagar?", yesNo(p.otras_deudas)), detail("Motivo de otra cuenta", p.otra_deuda_motivo), detail("Monto de otra cuenta", amount(p.otra_deuda_monto)), detail("Institución o persona", p.otra_deuda_institucion),
    detail("¿Ha sido detenido por la policía?", yesNo(p.detenido_policia)), detail("Motivo", p.detenido_motivo), detail("¿Ha sido procesado legalmente?", yesNo(p.procesado_legalmente)), detail("Motivo", p.procesado_motivo), detail("¿Conoce alguien de su entorno que haya estado preso?", yesNo(p.conoce_detenido_entorno)), detail("Motivo", p.conoce_detenido_motivo),
  ].join("");
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Solicitud de empleo - ${escapeHtml(p.nombre_completo)}</title><style>
    @page { size: letter; margin: 13mm; } *{box-sizing:border-box} body{margin:0;color:#17233a;font:10pt Arial,sans-serif;line-height:1.35}.header{display:flex;justify-content:space-between;gap:20px;border-bottom:3px solid #315f9e;padding-bottom:12px}.header h1{margin:0;color:#173d70;font-size:20pt}.header p{margin:5px 0 0;color:#526277}.photo,.no-photo{width:100px;height:115px;border:1px solid #9aaabd;object-fit:cover}.no-photo{display:flex;align-items:center;justify-content:center;text-align:center;color:#718096;font-size:10pt;font-weight:bold}section{margin-top:18px;break-inside:avoid}h2{margin:0 0 9px;padding:6px 9px;background:#315f9e;color:white;font-size:11pt;letter-spacing:.02em}h3{margin:15px 0 7px;color:#304762;font-size:10pt}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:0;border:1px solid #b8c5d5}.detail{display:grid;grid-template-columns:43% 57%;min-height:28px;border-right:1px solid #c8d1dd;border-bottom:1px solid #c8d1dd}.detail b{padding:6px;background:#eef2f7;color:#304762}.detail span{padding:6px;overflow-wrap:anywhere}.table-wrap{overflow:hidden;border:1px solid #b8c5d5}table{width:100%;border-collapse:collapse;font-size:8.5pt}th{background:#e6edf6;color:#294766;font-weight:bold}th,td{padding:5px;border:1px solid #c8d1dd;text-align:left;vertical-align:top;overflow-wrap:anywhere}.empty,.empty-box{text-align:center;color:#667085;font-style:italic}.empty-box{border:1px solid #c8d1dd;padding:11px}.note{white-space:pre-wrap;border:1px solid #c8d1dd;padding:8px;min-height:34px}.job-list{display:grid;gap:12px}.job-card{border:1px solid #b8c5d5;break-inside:avoid}.job-title{display:flex;align-items:center;gap:9px;padding:7px 9px;background:#e6edf6;color:#173d70}.job-title span{font-size:8.5pt;font-weight:bold;text-transform:uppercase;letter-spacing:.04em}.job-title strong{font-size:11pt}.job-grid{display:grid;grid-template-columns:repeat(2,1fr)}.job-grid .detail:nth-child(odd){border-left:0}.job-tasks{display:grid;grid-template-columns:22% 78%;border-top:1px solid #c8d1dd}.job-tasks b{padding:6px;background:#eef2f7;color:#304762}.job-tasks span{padding:6px;white-space:pre-wrap;overflow-wrap:anywhere}.declaration{margin-top:30px;break-inside:avoid}.declaration p{margin:0;border:1px solid #718096;padding:12px;font-size:9.5pt;font-weight:bold;text-align:justify}.signature{width:52%;margin:82px 0 14px auto;border-top:1px solid #17233a;padding-top:5px;text-align:center}.footer{margin-top:12px;text-align:right;font-size:8pt;color:#667085}@media print{.header{break-inside:avoid}section{break-inside:avoid}}
  </style></head><body><header class="header"><div><h1>SOLICITUD DE EMPLEO</h1><p>Fecha de postulación: <b>${escapeHtml(date(p.fecha_registro))}</b></p><p>Expediente digital del postulante</p></div>${photoHtml}</header>
  ${section("1. DATOS GENERALES", `<div class="grid">${general}</div>`)}
  ${section("2. DATOS FAMILIARES", table(["Parentesco", "Nombres y apellidos", "Edad", "Dirección", "Ocupación", "Teléfono"], family))}
  ${section("INFORMACIÓN PERSONAL Y DE SALUD", `<div class="grid">${health}</div>`)}
  ${section("3. EDUCACIÓN", table(["Nivel", "Estado", "Establecimiento", "Año inicial", "Año final"], education) + `<h3>Estudios actuales</h3><div class="grid">${detail("¿Estudia actualmente?", yesNo(p.estudia_actualidad))}${detail("¿Qué estudia?", p.estudia_que)}${detail("Establecimiento", p.estudia_establecimiento)}${detail("Horario", p.estudia_horario)}</div><h3>Idiomas</h3>${table(["Idioma", "Habla", "Lee", "Escribe"], languages)}<h3>Formación adicional</h3>${table(["Curso o seminario", "Establecimiento / país", "Duración", "Inicio", "Final"], courses)}<div class="grid">${detail("¿Posee conocimientos técnicos?", yesNo(p.posee_conocimientos_tecnicos))}${detail("Especifique", p.conocimientos_tecnicos_especificar)}${detail("Equipo o maquinaria que sabe operar", p.equipo_maquinaria)}</div>`)}
  ${section("4. EXPERIENCIA LABORAL", jobCards(jobs))}
  ${section("FORTALEZAS Y DEBILIDADES", `<div class="grid">${detail("Fortaleza 1", p.fortaleza_1)}${detail("Debilidad 1", p.debilidad_1)}${detail("Fortaleza 2", p.fortaleza_2)}${detail("Debilidad 2", p.debilidad_2)}${detail("Fortaleza 3", p.fortaleza_3)}${detail("Debilidad 3", p.debilidad_3)}</div>`)}
  ${section("5. INFORMACIÓN SOCIOECONÓMICA", `<div class="grid">${economic}</div>`)}
  ${section("6. CONDICIONES DE TRABAJO", `<div class="grid">${detail("Puesto que solicita", p.plaza?.nombre)}${detail("Salario al que aspira", amount(p.salario_aspira))}${detail("Fecha en que puede empezar", date(p.fecha_inicio_disponible))}${detail("¿Podría trabajar fuera de la ciudad?", "—")}${detail("¿Trabajaría tiempo extraordinario?", yesNo(p.trabajar_extraordinario))}${detail("¿Trabajaría turnos rotativos?", yesNo(p.trabajar_turnos_rotativos))}</div>`)}
  ${section("7. REFERENCIAS PERSONALES (QUE NO SEAN PARIENTES)", table(["Nombre", "Dirección", "Teléfono"], references) + `<div class="grid">${detail("¿Tiene parientes o amigos trabajando en la empresa?", yesNo(p.tiene_parientes_empresa))}${detail("Nombre", p.parientes_empresa_nombre)}${detail("¿Cómo se enteró de la vacante?", etiquetasMedioEnterado[p.medio_enterado] || "—")}${detail("Especifique", p.medio_enterado_especificar)}</div><h3>¿Por qué le gustaría trabajar en nuestra empresa?</h3><div class="note">${escapeHtml(text(p.porque_gustaria_trabajar))}</div><h3>¿Por qué considera que lo(a) deberíamos contratar?</h3><div class="note">${escapeHtml(text(p.porque_deberiamoss_contratar))}</div>`)}
  ${section("DOCUMENTOS ADJUNTOS", table(["Tipo", "Archivo", "Fecha de carga"], documents))}
  <section class="declaration"><p>${escapeHtml(DECLARACION)}</p><div class="signature">Firma del postulante</div><div class="footer">Solicitud generada desde el sistema · ${escapeHtml(date(p.fecha_registro))}</div></section></body></html>`;
}

function PostulantePdf({ postulante, fotoUrl, onError }) {
  const handlePrint = async () => {
    const printWindow = window.open("", "_blank", "width=1100,height=900");
    if (!printWindow) return onError?.("El navegador bloqueó la ventana de impresión.");
    try {
      const photo = await asDataUrl(fotoUrl);
      printWindow.document.write(buildHtml(postulante, photo));
      printWindow.document.close();
      window.setTimeout(() => { printWindow.focus(); printWindow.print(); }, 300);
    } catch {
      printWindow.close();
      onError?.("No fue posible preparar el documento para imprimir.");
    }
  };
  return <button type="button" onClick={handlePrint} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#3162e9] px-4 py-3 font-bold text-white transition hover:bg-[#183fca]"><Download className="h-4 w-4" />Imprimir solicitud</button>;
}

export default PostulantePdf;
