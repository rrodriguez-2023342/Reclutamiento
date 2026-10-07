import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  CircleAlert,
  Clock,
  Download,
  Pencil,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import PostulantePdf from "../../components/postulantes/PostulantePdf.jsx";
import {
  getPostulanteById,
  updateEstadoPostulante,
} from "../../services/postulantes.service.js";
import { getHistorialRechazo } from "../../services/historial-rechazo.service.js";
import {
  getDocumentos,
  descargarDocumento,
  eliminarDocumento,
  subirDocumento,
} from "../../services/documentos.service.js";
import api from "../../services/api.js";
import {
  etiquetasEstadoCivil,
  etiquetasEstadoPostulante,
  etiquetasMedioEnterado,
  etiquetasMotivoRetiro,
  etiquetasNivelEducativo,
  etiquetasParentesco,
  etiquetasSexo,
  etiquetasTipoDocumento,
  etiquetasVivienda,
  estilosEstadoPostulante,
  TIPOS_DOCUMENTO,
  acceptPorTipo,
} from "../../components/postulantes/etiquetas.js";

const sections = [
  "Datos Generales",
  "Datos Familiares",
  "Educación",
  "Experiencia Laboral",
  "Info Socioeconómica",
  "Condiciones de Trabajo",
  "Referencias Personales",
  "Documentos",
];
const transitions = {
  POSTULANTE: [
    {
      estado: "CONTRATADO",
      label: "Contratar",
      description: "El postulante quedará marcado como contratado.",
    },
    {
      estado: "RECHAZADO",
      label: "Rechazar",
      description: "El postulante quedará marcado como rechazado.",
    },
  ],
  RECHAZADO: [
    {
      estado: "POSTULANTE",
      label: "Reactivar postulación",
      description: "La postulación volverá al estado de postulante.",
    },
  ],
  CONTRATADO: [
    {
      estado: "POSTULANTE",
      label: "Devolver a postulante",
      description: "El postulante regresará al estado inicial del proceso.",
      requiereMotivo: true,
      devolucion: true,
    },
  ],
};
const text = (value) =>
  value === null || value === undefined || value === "" ? "—" : value;
const boolean = (value) =>
  value === null || value === undefined ? "—" : value ? "Sí" : "No";
const afiliacionDetalle = (valor, detalle) =>
  valor === true && detalle ? `Sí (${detalle})` : boolean(valor);
const date = (value) => {
  if (!value) return "—";
  const parsed = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(parsed.getTime())
    ? "—"
    : new Intl.DateTimeFormat("es-GT", { dateStyle: "long" }).format(parsed);
};
const decimal = (value) =>
  value === null || value === undefined || value === ""
    ? "—"
    : Number(value).toLocaleString("es-GT", { maximumFractionDigits: 2 });
const dpi = (value = "") => {
  const digits = String(value).replace(/\D/g, "");
  return digits.length === 13
    ? `${digits.slice(0, 4)}-${digits.slice(4, 9)}-${digits.slice(9)}`
    : text(value);
};
const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

function Details({ items }) {
  return (
    <dl className="grid gap-x-8 gap-y-7 sm:grid-cols-2 xl:grid-cols-3">
      {items.map(([label, value, rawValue]) => {
        const empty =
          rawValue === null || rawValue === undefined || rawValue === "";
        return (
          <div key={label}>
            <dt
              className={`text-sm ${
                empty ? "text-[#df353c]" : "text-[#5b6e8b]"
              }`}
            >
              {label}
            </dt>
            <dd
              className={`mt-1 break-words font-semibold ${
                empty ? "text-[#df353c]" : "text-[#071b3b]"
              }`}
            >
              {value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
function Empty({ name }) {
  return (
    <p className="rounded-2xl bg-[#f0f4fa] px-5 py-7 text-[#5b6e8b]">
      Aún no hay información registrada para «{name}» en este expediente.
    </p>
  );
}
function MiniTable({ headers, rows, name }) {
  return rows.length === 0 ? (
    <Empty name={name} />
  ) : (
    <div className="overflow-x-auto rounded-xl border border-[#dfe5ee]">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-[#f0f4fa] text-[#5b6e8b]">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="whitespace-nowrap px-4 py-3 font-medium"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-[#dfe5ee]">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="whitespace-nowrap px-4 py-3 text-[#071b3b]"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Modal({ action, onClose, onConfirm, loading, motivo, setMotivo }) {
  if (!action) return null;
  const esRechazo = action.estado === "RECHAZADO";
  const pideMotivo = esRechazo || action.requiereMotivo;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#071b3b]/45 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-[26px] bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-[#071b3b]">{action.label}</h2>
        <p className="mt-2 text-[#5b6e8b]">{action.description}</p>
        {pideMotivo && (
          <div className="mt-4">
            <label className="block text-sm font-semibold text-[#5b6e8b]">
              {esRechazo ? "Motivo del rechazo" : "Motivo de la devolución"}{" "}
              <span className="text-[#df353c]">*</span>
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={4}
              placeholder={
                esRechazo
                  ? "Describe el motivo del rechazo..."
                  : "Describe el motivo de la devolución..."
              }
              className="mt-2 w-full rounded-xl border border-[#dce3ee] px-4 py-3 text-base text-[#071b3b] outline-none transition focus:border-[#3162e9] focus:ring-2 focus:ring-[#3162e9]/15 resize-none"
            />
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-[#dce3ee] px-4 py-2.5 font-semibold text-[#071b3b] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading || (pideMotivo && !motivo.trim())}
            className="rounded-xl bg-[#3162e9] px-4 py-2.5 font-bold text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Actualizando…" : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionContent({ section, p, onReload }) {
  const title = `Detalles del Candidato - ${sections[section]}`;
  if (section === 0)
    return (
      <>
        <h2 className="text-2xl font-bold text-[#071b3b]">{title}</h2>
        <div className="mt-8">
          <Details
            items={[
              ["Nombre completo", text(p.nombre_completo), p.nombre_completo],
              ["Dirección actual", text(p.direccion), p.direccion],
              [
                "Lugar y fecha de nacimiento",
                `${text(p.lugar_nacimiento)}, ${date(p.fecha_nacimiento)}`,
                p.lugar_nacimiento,
              ],
              ["DPI / CUI", dpi(p.dpi), p.dpi],
              ["NIT", text(p.nit), p.nit],
              ["No. afiliación I.G.S.S.", text(p.igss), p.igss],
              ["Correo electrónico", text(p.correo), p.correo],
              ["Teléfono", text(p.telefono), p.telefono],
              [
                "Estado civil",
                etiquetasEstadoCivil[p.estado_civil] || "—",
                p.estado_civil,
              ],
              ["Sexo", etiquetasSexo[p.sexo] || "—", p.sexo],
              ["Extendido en", text(p.dpi_extendido_en), p.dpi_extendido_en],
              [
                "Perfil de Facebook",
                text(p.perfil_facebook),
                p.perfil_facebook,
              ],
            ]}
          />
        </div>
      </>
    );
  if (section === 1)
    return (
      <>
        <h2 className="text-2xl font-bold text-[#071b3b]">{title}</h2>
        <div className="mt-8">
          <MiniTable
            name={sections[section]}
            headers={[
              "Parentesco",
              "Nombres y apellidos",
              "Edad",
              "Dirección",
              "Ocupación",
              "Teléfono",
            ]}
            rows={(p.datosFamiliares || []).map((item) => [
              etiquetasParentesco[item.parentesco] || item.parentesco,
              text(item.nombres_apellidos),
              text(item.edad),
              text(item.direccion),
              text(item.ocupacion),
              text(item.telefono),
            ])}
          />
        </div>
      </>
    );
  if (section === 2)
    return (
      <>
        <h2 className="text-2xl font-bold text-[#071b3b]">{title}</h2>
        <div className="mt-8 space-y-8">
          <div>
            <h3 className="mb-3 font-bold text-[#071b3b]">
              Historial académico
            </h3>
            <MiniTable
              name="Educación"
              headers={[
                "Nivel",
                "Estado",
                "Establecimiento",
                "Año inicial",
                "Año final",
              ]}
              rows={(p.educacionHistorial || []).map((item) => [
                etiquetasNivelEducativo[item.nivel] || item.nivel,
                item.estado === "INCOMPLETA" ? "Incompleta" : "Completa",
                text(item.establecimiento),
                text(item.ano_inicial),
                text(item.ano_final),
              ])}
            />
          </div>
          <div>
            <h3 className="mb-3 font-bold text-[#071b3b]">Idiomas</h3>
            <MiniTable
              name="Idiomas"
              headers={["Idioma", "Habla", "Lee", "Escribe"]}
              rows={(p.idiomas || []).map((item) => [
                item.idioma,
                boolean(item.habla),
                boolean(item.lee),
                boolean(item.escribe),
              ])}
            />
          </div>
          <div>
            <h3 className="mb-3 font-bold text-[#071b3b]">Capacitaciones</h3>
            <MiniTable
              name="Capacitaciones"
              headers={[
                "Curso",
                "Establecimiento / país",
                "Duración",
                "Fecha inicial",
                "Fecha final",
              ]}
              rows={(p.capacitaciones || []).map((item) => [
                item.nombre_curso,
                text(item.establecimiento_pais),
                text(item.tiempo_duracion),
                date(item.fecha_inicial),
                date(item.fecha_final),
              ])}
            />
          </div>
          <div>
            <h3 className="mb-3 font-bold text-[#071b3b]">Estudios actuales</h3>
            <Details
              items={[
                [
                  "¿Estudia en la actualidad?",
                  boolean(p.estudia_actualidad),
                  p.estudia_actualidad,
                ],
                ["¿Qué estudia?", text(p.estudia_que), p.estudia_que],
                [
                  "Establecimiento",
                  text(p.estudia_establecimiento),
                  p.estudia_establecimiento,
                ],
                ["Horario", text(p.estudia_horario), p.estudia_horario],
              ]}
            />
          </div>
          <div>
            <h3 className="mb-3 font-bold text-[#071b3b]">
              Conocimientos técnicos
            </h3>
            <Details
              items={[
                [
                  "¿Posee conocimientos técnicos?",
                  boolean(p.posee_conocimientos_tecnicos),
                  p.posee_conocimientos_tecnicos,
                ],
                [
                  "Especifique",
                  text(p.conocimientos_tecnicos_especificar),
                  p.conocimientos_tecnicos_especificar,
                ],
              ]}
            />
          </div>
          <div>
            <h3 className="mb-3 font-bold text-[#071b3b]">
              Equipo o maquinaria
            </h3>
            <Details
              items={[
                [
                  "Equipo o maquinaria que sabe operar",
                  text(p.equipo_maquinaria),
                  p.equipo_maquinaria,
                ],
              ]}
            />
          </div>
        </div>
      </>
    );
  if (section === 3)
    return (
      <>
        <h2 className="text-2xl font-bold text-[#071b3b]">{title}</h2>
        <div className="mt-8">
          <MiniTable
            name={sections[section]}
            headers={[
              "Empresa",
              "Puesto",
              "Ingreso",
              "Retiro",
              "Salario final",
              "Motivo",
              "Motivo otro",
            ]}
            rows={(p.experienciaLaboral || []).map((item) => [
              item.empresa,
              item.puesto,
              date(item.fecha_ingreso),
              date(item.fecha_retiro),
              decimal(item.salario_final),
              etiquetasMotivoRetiro[item.motivo_retiro] || "—",
              item.motivo_retiro === "OTRO"
                ? text(item.motivo_retiro_otro)
                : "—",
            ])}
          />
        </div>
      </>
    );
  if (section === 4)
    return (
      <>
        <h2 className="text-2xl font-bold text-[#071b3b]">{title}</h2>
        <div className="mt-8">
          <Details
            items={[
              [
                "Afiliación gremial",
                afiliacionDetalle(
                  p.afiliacion_gremial,
                  p.afiliacion_gremial_especificar,
                ),
                p.afiliacion_gremial,
              ],
              [
                "Afiliación política",
                afiliacionDetalle(
                  p.afiliacion_politica,
                  p.afiliacion_politica_especificar,
                ),
                p.afiliacion_politica,
              ],
              [
                "Afiliación social",
                afiliacionDetalle(
                  p.afiliacion_sociales,
                  p.afiliacion_sociales_especificar,
                ),
                p.afiliacion_sociales,
              ],
              [
                "Afiliación religiosa",
                afiliacionDetalle(
                  p.afiliacion_religiosa,
                  p.afiliacion_religiosa_especificar,
                ),
                p.afiliacion_religiosa,
              ],
              [
                "Afiliación cívica",
                afiliacionDetalle(
                  p.afiliacion_civicos,
                  p.afiliacion_civicos_especificar,
                ),
                p.afiliacion_civicos,
              ],
              [
                "Afiliación sindical",
                afiliacionDetalle(
                  p.afiliacion_sindicales,
                  p.afiliacion_sindicales_especificar,
                ),
                p.afiliacion_sindicales,
              ],
              [
                "Afiliación deportiva",
                afiliacionDetalle(
                  p.afiliacion_deportiva,
                  p.afiliacion_deportiva_especificar,
                ),
                p.afiliacion_deportiva,
              ],
              [
                "Otras afiliaciones",
                afiliacionDetalle(
                  p.afiliacion_otros,
                  p.afiliacion_otros_especificar,
                ),
                p.afiliacion_otros,
              ],
              [
                "Practica deporte",
                boolean(p.practica_deporte),
                p.practica_deporte,
              ],
              ["Deporte", text(p.deporte_cual), p.deporte_cual],
              [
                "Enfermedad grave",
                afiliacionDetalle(
                  p.ha_estado_enfermo_gravedad,
                  p.ha_estado_enfermo_gravedad_especificar,
                ),
                p.ha_estado_enfermo_gravedad,
              ],
              [
                "Toma medicamento",
                afiliacionDetalle(
                  p.toma_medicamento,
                  p.toma_medicamento_especificar,
                ),
                p.toma_medicamento,
              ],
              ["Fuma o bebe", boolean(p.fuma_o_bebe), p.fuma_o_bebe],
              [
                "Frecuencia",
                text(p.fuma_bebe_frecuencia),
                p.fuma_bebe_frecuencia,
              ],
              [
                "Impedimento físico",
                afiliacionDetalle(
                  p.impedimento_fisico,
                  p.impedimento_fisico_especificar,
                ),
                p.impedimento_fisico,
              ],
              [
                "Dependientes",
                p.personas_dependientes === null ||
                p.personas_dependientes === undefined
                  ? "—"
                  : `${p.personas_dependientes} personas`,
                p.personas_dependientes,
              ],
              [
                "Total efectivo hogar",
                decimal(p.total_efectivo_hogar),
                p.total_efectivo_hogar,
              ],
              [
                "Tipo de vivienda",
                etiquetasVivienda[p.vivienda_tipo] || "—",
                p.vivienda_tipo,
              ],
              ...(p.vivienda_tipo === "OTRA"
                ? [
                    [
                      "Especificación vivienda",
                      text(p.vivienda_otra_especificar),
                      p.vivienda_otra_especificar,
                    ],
                  ]
                : []),
              ...(p.vivienda_tipo === "PROPIA"
                ? [
                    [
                      "Valor vivienda",
                      decimal(p.vivienda_valor),
                      p.vivienda_valor,
                    ],
                  ]
                : []),
              ...(p.vivienda_tipo === "ALQUILADA"
                ? [
                    [
                      "Renta vivienda",
                      decimal(p.vivienda_renta_monto),
                      p.vivienda_renta_monto,
                    ],
                  ]
                : []),
              [
                "¿Vivienda asegurada?",
                boolean(p.vivienda_asegurada),
                p.vivienda_asegurada,
              ],
              ...(p.vivienda_asegurada === true
                ? [
                    [
                      "Monto seguro vivienda",
                      decimal(p.vivienda_seguro_monto),
                      p.vivienda_seguro_monto,
                    ],
                  ]
                : []),
              [
                "¿Tiene otro inmueble?",
                boolean(p.tiene_otro_inmueble),
                p.tiene_otro_inmueble,
              ],
              ...(p.tiene_otro_inmueble === true
                ? [
                    [
                      "Especificación inmueble",
                      text(p.otro_inmueble_especificar),
                      p.otro_inmueble_especificar,
                    ],
                    [
                      "Monto inmueble",
                      decimal(p.otro_inmueble_monto),
                      p.otro_inmueble_monto,
                    ],
                  ]
                : []),
              ["Tiene vehículo", boolean(p.tiene_vehiculo), p.tiene_vehiculo],
              ...(p.tiene_vehiculo === true
                ? [
                    ["Tipo de vehículo", text(p.tipo_vehiculo), p.tipo_vehiculo],
                    ["Marca", text(p.vehiculo_marca), p.vehiculo_marca],
                    ["Placa", text(p.vehiculo_placa), p.vehiculo_placa],
                    ["Tipo licencia", text(p.licencia_tipo), p.licencia_tipo],
                    [
                      "Número licencia",
                      text(p.licencia_numero),
                      p.licencia_numero,
                    ],
                    [
                      "¿Vehículo asegurado?",
                      boolean(p.vehiculo_asegurado),
                      p.vehiculo_asegurado,
                    ],
                    ...(p.vehiculo_asegurado === true
                      ? [
                          [
                            "Monto seguro",
                            decimal(p.vehiculo_seguro_monto),
                            p.vehiculo_seguro_monto,
                          ],
                        ]
                      : []),
                  ]
                : []),
              [
                "Ingresos adicionales",
                boolean(p.ingresos_adicionales),
                p.ingresos_adicionales,
              ],
              ...(p.ingresos_adicionales === true
                ? [
                    [
                      "Monto ingresos adicionales",
                      decimal(p.ingresos_adicionales_monto),
                      p.ingresos_adicionales_monto,
                    ],
                    [
                      "Motivo ingresos adicionales",
                      text(p.ingresos_adicionales_motivo),
                      p.ingresos_adicionales_motivo,
                    ],
                  ]
                : []),
              [
                "Cuenta bancaria",
                boolean(p.tiene_cuenta_bancaria),
                p.tiene_cuenta_bancaria,
              ],
              ...(p.tiene_cuenta_bancaria === true
                ? [
                    [
                      "Tipo de cuenta",
                      text(p.tipo_cuenta_bancaria),
                      p.tipo_cuenta_bancaria,
                    ],
                    ["Banco", text(p.banco), p.banco],
                    [
                      "No. de cuenta",
                      text(p.numero_cuenta_bancaria),
                      p.numero_cuenta_bancaria,
                    ],
                  ]
                : []),
              [
                "Deudas pendientes",
                boolean(p.deudas_pendientes),
                p.deudas_pendientes,
              ],
              ["Monto deudas", decimal(p.deudas_monto), p.deudas_monto],
              [
                "Institución deuda",
                text(p.deudas_institucion),
                p.deudas_institucion,
              ],
              ["Motivo deuda", text(p.deudas_motivo), p.deudas_motivo],
              ["Hipotecas", boolean(p.tiene_hipotecas), p.tiene_hipotecas],
              ...(p.tiene_hipotecas === true
                ? [
                    ["Motivo hipoteca", text(p.hipoteca_motivo), p.hipoteca_motivo],
                    ["Monto hipoteca", decimal(p.hipoteca_monto), p.hipoteca_monto],
                    [
                      "Institución hipoteca",
                      text(p.hipoteca_institucion),
                      p.hipoteca_institucion,
                    ],
                  ]
                : []),
              ["Otras deudas", boolean(p.otras_deudas), p.otras_deudas],
              ...(p.otras_deudas === true
                ? [
                    [
                      "Motivo otra deuda",
                      text(p.otra_deuda_motivo),
                      p.otra_deuda_motivo,
                    ],
                    [
                      "Monto otra deuda",
                      decimal(p.otra_deuda_monto),
                      p.otra_deuda_monto,
                    ],
                    [
                      "Institución otra deuda",
                      text(p.otra_deuda_institucion),
                      p.otra_deuda_institucion,
                    ],
                  ]
                : []),
              [
                "Detenido por policía",
                boolean(p.detenido_policia),
                p.detenido_policia,
              ],
              ...(p.detenido_policia === true
                ? [
                    ["Motivo detención", text(p.detenido_motivo), p.detenido_motivo],
                  ]
                : []),
              [
                "Procesado legalmente",
                boolean(p.procesado_legalmente),
                p.procesado_legalmente,
              ],
              ...(p.procesado_legalmente === true
                ? [
                    ["Motivo proceso", text(p.procesado_motivo), p.procesado_motivo],
                  ]
                : []),
              [
                "Conoce a alguien detenido/preso",
                boolean(p.conoce_detenido_entorno),
                p.conoce_detenido_entorno,
              ],
              ...(p.conoce_detenido_entorno === true
                ? [
                    [
                      "Motivo entorno",
                      text(p.conoce_detenido_motivo),
                      p.conoce_detenido_motivo,
                    ],
                  ]
                : []),
            ]}
          />
        </div>
      </>
    );
  if (section === 5)
    return (
      <>
        <h2 className="text-2xl font-bold text-[#071b3b]">{title}</h2>
        <div className="mt-8">
          <Details
            items={[
              ["Plaza aplicada", text(p.plaza?.nombre), p.plaza?.nombre],
              ["Salario aspirado", decimal(p.salario_aspira), p.salario_aspira],
              [
                "Inicio disponible",
                date(p.fecha_inicio_disponible),
                p.fecha_inicio_disponible,
              ],
              [
                "Tiempo extraordinario",
                boolean(p.trabajar_extraordinario),
                p.trabajar_extraordinario,
              ],
              [
                "Turnos rotativos",
                boolean(p.trabajar_turnos_rotativos),
                p.trabajar_turnos_rotativos,
              ],
              [
                "Medio por el que se enteró",
                etiquetasMedioEnterado[p.medio_enterado] || "—",
                p.medio_enterado,
              ],
              ...(p.medio_enterado
                ? [
                    [
                      "Especificación medio",
                      text(p.medio_enterado_especificar),
                      p.medio_enterado_especificar,
                    ],
                  ]
                : []),
              [
                "Parientes/amigos en la empresa",
                boolean(p.tiene_parientes_empresa),
                p.tiene_parientes_empresa,
              ],
              ...(p.tiene_parientes_empresa === true
                ? [
                    [
                      "Nombre pariente/amigo",
                      text(p.parientes_empresa_nombre),
                      p.parientes_empresa_nombre,
                    ],
                  ]
                : []),
              [
                "Por qué desea trabajar",
                text(p.porque_gustaria_trabajar),
                p.porque_gustaria_trabajar,
              ],
              [
                "Por qué contratarle",
                text(p.porque_deberiamoss_contratar),
                p.porque_deberiamoss_contratar,
              ],
              [
                "Fortalezas",
                [p.fortaleza_1, p.fortaleza_2, p.fortaleza_3]
                  .filter(Boolean)
                  .join(" · ") || "—",
                p.fortaleza_1 || p.fortaleza_2 || p.fortaleza_3,
              ],
              [
                "Debilidades",
                [p.debilidad_1, p.debilidad_2, p.debilidad_3]
                  .filter(Boolean)
                  .join(" · ") || "—",
                p.debilidad_1 || p.debilidad_2 || p.debilidad_3,
              ],
            ]}
          />
        </div>
      </>
    );
  if (section === 6)
    return (
      <>
        <h2 className="text-2xl font-bold text-[#071b3b]">{title}</h2>
        <div className="mt-8">
          <MiniTable
            name={sections[section]}
            headers={["Nombre", "Teléfono", "Dirección"]}
            rows={(p.referenciasPersonales || []).map((item) => [
              item.nombre,
              item.telefono,
              text(item.direccion),
            ])}
          />
        </div>
      </>
    );
  return <DocumentosSection p={p} onReload={onReload} />;
}

function DocumentosSection({ p, onReload }) {
  const [documentos, setDocumentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [eliminando, setEliminando] = useState(null);
  const [subiendo, setSubiendo] = useState(null);

  useEffect(() => {
    let active = true;
    getDocumentos(p.id)
      .then((data) => {
        if (active) setDocumentos(data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setCargando(false);
      });
    return () => {
      active = false;
    };
  }, [p.id]);

  const handleDescargar = async (tipo) => {
    try {
      const blob = await descargarDocumento(p.id, tipo);
      const doc = documentos.find((d) => d.tipo === tipo);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = doc?.nombre_archivo || tipo;
      window.document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch {
      alert("No fue posible descargar el documento.");
    }
  };

  const handleEliminar = async (tipo) => {
    if (!window.confirm("¿Está seguro de eliminar este documento?")) return;
    setEliminando(tipo);
    try {
      await eliminarDocumento(p.id, tipo);
      setDocumentos((prev) => prev.filter((d) => d.tipo !== tipo));
      onReload?.();
    } catch {
      alert("No fue posible eliminar el documento.");
    } finally {
      setEliminando(null);
    }
  };

  const handleSubir = async (tipo, file) => {
    if (!file) return;
    setSubiendo(tipo);
    try {
      await subirDocumento(p.id, tipo, file);
      const docs = await getDocumentos(p.id);
      setDocumentos(docs);
      onReload?.();
    } catch (error) {
      if (error.response?.status === 413) {
        alert(
          error.response.data?.message ||
            "El archivo excede el límite máximo de 2MB",
        );
      } else {
        alert("No fue posible subir el documento.");
      }
    } finally {
      setSubiendo(null);
    }
  };

  if (cargando) {
    return (
      <>
        <h2 className="text-2xl font-bold text-[#071b3b]">
          Detalles del Candidato - Documentos
        </h2>
        <p className="mt-8 text-[#5b6e8b]">Cargando documentos…</p>
      </>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-[#071b3b]">
        Detalles del Candidato - Documentos
      </h2>
      <div className="mt-8 space-y-4">
        {TIPOS_DOCUMENTO.map((tipo) => {
          const doc = documentos.find((d) => d.tipo === tipo);
          const esFoto = tipo === "FOTO";
          return (
            <div
              key={tipo}
              className="flex flex-col gap-3 rounded-xl border border-[#dfe5ee] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                {doc ? (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c9f3dd] text-[#087947]">
                    <Check className="h-4 w-4" />
                  </span>
                ) : (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ffe0e2] text-[#df353c]">
                    <X className="h-4 w-4" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#071b3b]">
                    {etiquetasTipoDocumento[tipo]}
                  </p>
                  {doc ? (
                    <p className="mt-0.5 text-xs text-[#5b6e8b] truncate max-w-[300px]">
                      {doc.nombre_archivo} ·{" "}
                      {(doc.tamano_bytes / 1024).toFixed(0)} KB
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-[#5b6e8b]">No subido</p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
                {doc && esFoto && doc.mime_type?.startsWith("image/") && (
                  <span className="text-xs text-[#5b6e8b] italic">
                    Foto cargada
                  </span>
                )}
                {doc && (
                  <button
                    type="button"
                    onClick={() => handleDescargar(tipo)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#dce3ee] px-3 py-2 text-xs font-semibold text-[#071b3b] transition hover:bg-[#f6f8fc]"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Descargar
                  </button>
                )}
                {doc && (
                  <button
                    type="button"
                    onClick={() => handleEliminar(tipo)}
                    disabled={eliminando === tipo}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#dce3ee] px-3 py-2 text-xs font-semibold text-[#df353c] transition hover:bg-[#ffe0e2] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {eliminando === tipo ? "…" : "Eliminar"}
                  </button>
                )}
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#3162e9] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#183fca]">
                  <Upload className="h-3.5 w-3.5" />
                  {subiendo === tipo
                    ? "Subiendo…"
                    : doc
                      ? "Reemplazar"
                      : "Subir"}
                  <input
                    type="file"
                    accept={acceptPorTipo[tipo]}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          alert("El archivo excede 5 MB");
                          e.target.value = "";
                          return;
                        }
                        handleSubir(tipo, file);
                        e.target.value = "";
                      }
                    }}
                    disabled={subiendo === tipo}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function DetallePostulante() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();
  const esAdmin = authUser?.rol === "Administrador RHCorp";
  const esRRHH = authUser?.rol === "Recursos Humanos";
  const [postulante, setPostulante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(location.state?.mensaje || "");
  const [action, setAction] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [section, setSection] = useState(0);
  const [fotoUrl, setFotoUrl] = useState(null);
  const [motivoAccion, setMotivoAccion] = useState("");
  const [showHistorialRechazo, setShowHistorialRechazo] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setPostulante(await getPostulanteById(id));
      try {
        const response = await api.get(`/postulantes/${id}/foto`, {
          responseType: "blob",
        });
        setFotoUrl(URL.createObjectURL(response.data));
      } catch {
        setFotoUrl(null);
      }
    } catch (requestError) {
      setError(
        requestError.response?.status === 404
          ? "Postulante no encontrado"
          : "No fue posible cargar la ficha del postulante.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  useEffect(() => {
    if (!success) return undefined;
    const timer = window.setTimeout(() => {
      setSuccess("");
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [success]);
  useEffect(() => {
    return () => {
      if (fotoUrl) URL.revokeObjectURL(fotoUrl);
    };
  }, [fotoUrl]);
  const confirm = async () => {
    if (!action) return;
    setUpdating(true);
    try {
      const payload = { estado: action.estado };
      if (action.estado === "RECHAZADO") {
        payload.motivo_rechazo = motivoAccion.trim();
      }
      if (action.requiereMotivo) {
        payload.motivo_devolucion = motivoAccion.trim();
      }
      const resultado = await updateEstadoPostulante(id, payload);
      setAction(null);
      setMotivoAccion("");
      if (action.estado === "CONTRATADO") {
        navigate("/colaboradores/nuevo", {
          state: {
            postulante: {
              nombre: postulante.nombre_completo,
              correo: postulante.correo,
              dpi: postulante.dpi,
              dpi_extendido_en: postulante.dpi_extendido_en,
              nit: postulante.nit,
              direccion: postulante.direccion,
              estado_civil: postulante.estado_civil,
              telefono: postulante.telefono,
              fecha_nacimiento: postulante.fecha_nacimiento,
              sueldo: postulante.salario_aspira,
              moneda_sueldo: postulante.plaza?.tipo_moneda,
              fecha_contratacion: resultado.fecha_contratacion,
              empresa_id: postulante.usuario?.empresa?.id,
              patrono_id: postulante.usuario?.patrono?.id,
              sexo: postulante.sexo,
              banco: postulante.banco,
              tipo_cuenta_bancaria: postulante.tipo_cuenta_bancaria,
              numero_cuenta_bancaria: postulante.numero_cuenta_bancaria,
              educacionHistorial: postulante.educacionHistorial,
              datosFamiliares: postulante.datosFamiliares,
            },
          },
        });
        return;
      }
      setSuccess("Estado actualizado correctamente");
      await load();
    } catch (requestError) {
      setAction(null);
      setMotivoAccion("");
      setError(
        requestError.response?.data?.message ||
          "No fue posible actualizar el estado.",
      );
    } finally {
      setUpdating(false);
    }
  };
  if (loading)
    return (
      <DashboardLayout title="Ficha del Candidato">
        <div className="rounded-[26px] bg-white p-12 text-center text-[#5b6e8b] shadow-[0_10px_24px_rgba(20,43,89,0.06)]">
          Cargando ficha del postulante…
        </div>
      </DashboardLayout>
    );
  if (error || !postulante)
    return (
      <DashboardLayout title="Ficha del Candidato">
        <section className="rounded-[26px] bg-white p-10 text-center shadow-[0_10px_24px_rgba(20,43,89,0.06)]">
          <CircleAlert className="mx-auto h-10 w-10 text-[#df353c]" />
          <h2 className="mt-4 text-xl font-bold text-[#071b3b]">
            {error || "Postulante no encontrado"}
          </h2>
          <button
            type="button"
            onClick={() => navigate("/postulantes")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#3162e9] px-5 py-3 font-bold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al listado
          </button>
        </section>
      </DashboardLayout>
    );
  const p = postulante;
  const actions = (transitions[p.estado] || []).filter((item) => {
    if (!item.devolucion) return true;
    if (esAdmin) return true;
    return esRRHH && p.contratado_por_usuario?.id === authUser?.id;
  });
  return (
    <DashboardLayout title="Ficha del Candidato">
      <Modal
        action={action}
        onClose={() => {
          setAction(null);
          setMotivoAccion("");
        }}
        onConfirm={confirm}
        loading={updating}
        motivo={motivoAccion}
        setMotivo={setMotivoAccion}
      />

      {showHistorialRechazo && (
        <HistorialRechazoModal
          postulanteId={postulante?.id}
          onClose={() => setShowHistorialRechazo(false)}
        />
      )}

      {success && (
        <div
          role="status"
          className="mb-5 rounded-2xl border border-[#b9e8ce] bg-[#edfff4] px-5 py-4 font-semibold text-[#087947]"
        >
          {success}
        </div>
      )}
      <section className="rounded-[26px] bg-white p-6 shadow-[0_10px_24px_rgba(20,43,89,0.06)] sm:p-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt={p.nombre_completo}
                className="h-20 w-20 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#e7f0ff] text-2xl font-bold text-[#1e3a8a]">
                {initials(p.nombre_completo) || <UserRound />}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-[-0.04em] text-[#071b3b] sm:text-3xl">
                  {p.nombre_completo}
                </h1>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${estilosEstadoPostulante[p.estado]}`}
                >
                  {etiquetasEstadoPostulante[p.estado]}
                </span>
              </div>
              <p className="mt-2 text-[#5b6e8b]">
                Candidato aplicando para:{" "}
                <span className="font-semibold text-[#3162e9]">
                  {p.plaza?.nombre || "—"}
                </span>{" "}
                · Registrado el {date(p.fecha_registro)}
              </p>
              {p.estado === "RECHAZADO" && p.motivo_rechazo && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-[#df353c]">
                    Motivo de rechazo
                    {p.fecha_rechazo ? ` — ${date(p.fecha_rechazo)}` : ""}
                  </p>
                  {p.rechazado_por_usuario && (
                    <p className="mt-1 text-sm text-[#5b6e8b]">
                      Rechazado por:{" "}
                      <span className="font-semibold text-[#071b3b]">
                        {p.rechazado_por_usuario.nombre}
                      </span>
                    </p>
                  )}
                  <p className="mt-1 text-sm text-[#071b3b]">
                    {p.motivo_rechazo}
                  </p>
                </div>
              )}
              {p.estado === "POSTULANTE" && p.motivo_devolucion && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-[#a86b00]">
                    Devuelto a postulante
                    {p.fecha_devolucion ? ` — ${date(p.fecha_devolucion)}` : ""}
                  </p>
                  {p.devuelto_por_usuario && (
                    <p className="mt-1 text-sm text-[#5b6e8b]">
                      Devuelto por:{" "}
                      <span className="font-semibold text-[#071b3b]">
                        {p.devuelto_por_usuario.nombre}
                      </span>
                    </p>
                  )}
                  <p className="mt-1 text-sm text-[#071b3b]">
                    {p.motivo_devolucion}
                  </p>
                </div>
              )}
              {p.estado === "CONTRATADO" && (
                <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-4">
                  <p className="text-sm font-semibold text-[#087947]">
                    Contratado el{" "}
                    {p.fecha_contratacion ? date(p.fecha_contratacion) : "—"}
                  </p>
                  {p.contratado_por_usuario && (
                    <p className="mt-1 text-sm text-[#5b6e8b]">
                      Contratado por:{" "}
                      <span className="font-semibold text-[#071b3b]">
                        {p.contratado_por_usuario.nombre}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <PostulantePdf
              postulante={p}
              fotoUrl={fotoUrl}
              onError={setError}
            />
            <button
              type="button"
              onClick={() => navigate("/postulantes")}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#dce3ee] px-4 py-3 font-semibold text-[#071b3b]"
            >
              <ArrowLeft className="h-4 w-4" />
              Regresar
            </button>
            <button
              type="button"
              onClick={() => navigate(`/postulantes/${p.id}/editar`)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#dce3ee] px-4 py-3 font-semibold text-[#071b3b] transition hover:bg-[#f6f8fc]"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </button>
            <button
              type="button"
              onClick={() => setShowHistorialRechazo(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#3162e9] px-4 py-3 font-bold text-white transition hover:bg-[#183fca]"
            >
              <Clock className="h-4 w-4" />
              Ver historial
            </button>
            {actions.map((item) => (
              <button
                key={item.estado}
                type="button"
                onClick={() => setAction(item)}
                className="cursor-pointer rounded-xl bg-[#3162e9] px-4 py-3 font-bold text-white transition hover:bg-[#183fca]"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>
      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(250px,0.34fr)_minmax(0,1fr)]">
        <nav
          className="flex flex-wrap gap-2 lg:block lg:space-y-2"
          aria-label="Secciones de la ficha"
        >
          {sections.map((name, index) => (
            <button
              type="button"
              key={name}
              onClick={() => setSection(index)}
              className={`rounded-2xl px-6 py-4 text-left font-medium transition lg:block lg:w-full ${section === index ? "bg-white font-semibold text-[#315cf5] shadow-[0_10px_24px_rgba(20,43,89,0.06)]" : "text-[#5b6e8b] cursor-pointer hover:bg-white/70"}`}
            >
              {index + 1}. {name}
            </button>
          ))}
        </nav>
        <section className="min-h-[430px] rounded-[26px] bg-white p-6 shadow-[0_10px_24px_rgba(20,43,89,0.06)] sm:p-10">
          <SectionContent section={section} p={p} onReload={load} />
          <div className="mt-10 rounded-2xl bg-[#f0f4fa] px-5 py-4 text-sm text-[#5b6e8b]">
            Esta solicitud fue digitalizada por{" "}
            <span className="font-semibold text-[#071b3b]">
              {p.usuario?.nombre || "—"}
            </span>{" "}
            el {date(p.fecha_registro)}.
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default DetallePostulante;

function HistorialRechazoModal({ postulanteId, onClose }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!postulanteId) return;
    let active = true;
    setLoading(true);
    getHistorialRechazo(postulanteId, { page, limit: 10 })
      .then((result) => {
        if (active) {
          setData(result?.data || []);
          setTotalPages(result?.totalPages || 1);
        }
      })
      .catch(() => {
        if (active) setData([]);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [postulanteId, page]);

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "—"
      : new Intl.DateTimeFormat("es-GT", { dateStyle: "medium" }).format(date);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#071b3b]/45 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-3xl max-h-[80vh] overflow-hidden rounded-[26px] bg-white shadow-2xl flex flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-[#dce3ee] px-6 py-4">
          <h2 className="text-base sm:text-xl font-bold text-[#071b3b]">
            Historial de rechazos
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 cursor-pointer text-[#5b6e8b] transition hover:text-[#071b3b]"
          >
            ✕
          </button>
        </div>

        <div className="overflow-auto flex-1 p-6">
          {loading ? (
            <p className="text-center text-[#5b6e8b]">Cargando historial...</p>
          ) : data.length === 0 ? (
            <p className="text-center text-[#5b6e8b]">
              No hay registros de rechazos.
            </p>
          ) : (
            <table className="w-full min-w-[520px] border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr className="text-base font-semibold text-[#5b6e8b]">
                  <th className="border-b border-[#dfe5ee] px-4 py-3">
                    Fecha Rechazo
                  </th>
                  <th className="border-b border-[#dfe5ee] px-4 py-3">
                    Motivo
                  </th>
                  <th className="border-b border-[#dfe5ee] px-4 py-3">
                    Rechazado por
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="text-[#071b3b]">
                    <td className="border-b border-[#dfe5ee] px-4 py-3 whitespace-nowrap">
                      {formatDate(item.fecha_rechazo)}
                    </td>
                    <td className="border-b border-[#dfe5ee] px-4 py-3 max-w-[200px] truncate">
                      {item.motivo}
                    </td>
                    <td className="border-b border-[#dfe5ee] px-4 py-3">
                      {item.rechazado_por_usuario?.nombre || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:gap-3 sm:text-sm border-t border-[#dce3ee] px-6 py-4">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="cursor-pointer rounded-xl border border-[#dce3ee] px-4 py-2 text-sm font-semibold text-[#071b3b] transition hover:bg-[#f0f4fa] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Anterior
            </button>
            <span className="text-sm text-[#5b6e8b]">
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="cursor-pointer rounded-xl border border-[#dce3ee] px-4 py-2 text-sm font-semibold text-[#071b3b] transition hover:bg-[#f0f4fa] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
