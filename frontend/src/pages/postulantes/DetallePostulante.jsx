import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, CircleAlert, UserRound } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import {
  getPostulanteById,
  updateEstadoPostulante,
} from "../../services/postulantes.service.js";
import {
  etiquetasEstadoCivil,
  etiquetasEstadoPostulante,
  etiquetasMedioEnterado,
  etiquetasMotivoRetiro,
  etiquetasNivelEducativo,
  etiquetasParentesco,
  etiquetasVivienda,
  estilosEstadoPostulante,
} from "../../components/postulantes/etiquetas.js";

const sections = [
  "Datos Generales",
  "Datos Familiares",
  "Educación",
  "Experiencia Laboral",
  "Info Socioeconómica",
  "Condiciones de Trabajo",
  "Referencias Personales",
];
const transitions = {
  PENDIENTE: [
    {
      estado: "EN_PROCESO",
      label: "Enviar a En Proceso",
      description: "El postulante pasará a la etapa de proceso.",
    },
  ],
  EN_PROCESO: [
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
      estado: "PENDIENTE",
      label: "Reactivar postulación",
      description: "La postulación volverá al estado pendiente.",
    },
  ],
  CONTRATADO: [],
};
const text = (value) =>
  value === null || value === undefined || value === "" ? "—" : value;
const boolean = (value) =>
  value === null || value === undefined ? "—" : value ? "Sí" : "No";
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
      {items.map(([label, value]) => (
        <div key={label}>
          <dt className="text-sm text-[#5b6e8b]">{label}</dt>
          <dd className="mt-1 break-words font-semibold text-[#071b3b]">
            {value}
          </dd>
        </div>
      ))}
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
function Modal({ action, onClose, onConfirm, loading }) {
  if (!action) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#071b3b]/45 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-[26px] bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-[#071b3b]">{action.label}</h2>
        <p className="mt-2 text-[#5b6e8b]">{action.description}</p>
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
            disabled={loading}
            className="rounded-xl bg-[#3162e9] px-4 py-2.5 font-bold text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Actualizando…" : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionContent({ section, p }) {
  const title = `Detalles del Candidato - ${sections[section]}`;
  if (section === 0)
    return (
      <>
        <h2 className="text-2xl font-bold text-[#071b3b]">{title}</h2>
        <div className="mt-8">
          <Details
            items={[
              ["Nombre completo", text(p.nombre_completo)],
              ["Dirección actual", text(p.direccion)],
              [
                "Lugar y fecha de nacimiento",
                `${text(p.lugar_nacimiento)}, ${date(p.fecha_nacimiento)}`,
              ],
              ["DPI / CUI", dpi(p.dpi)],
              ["NIT", text(p.nit)],
              ["No. afiliación I.G.S.S.", text(p.igss)],
              ["Correo electrónico", text(p.correo)],
              ["Teléfono", text(p.telefono)],
              ["Estado civil", etiquetasEstadoCivil[p.estado_civil] || "—"],
              ["Extendido en", text(p.dpi_extendido_en)],
              ["Perfil de Facebook", text(p.perfil_facebook)],
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
              headers={["Nivel", "Establecimiento", "Año inicial", "Año final"]}
              rows={(p.educacionHistorial || []).map((item) => [
                etiquetasNivelEducativo[item.nivel] || item.nivel,
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
            ]}
            rows={(p.experienciaLaboral || []).map((item) => [
              item.empresa,
              item.puesto,
              date(item.fecha_ingreso),
              date(item.fecha_retiro),
              decimal(item.salario_final),
              etiquetasMotivoRetiro[item.motivo_retiro] || "—",
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
              ["Afiliación gremial", boolean(p.afiliacion_gremial)],
              ["Afiliación religiosa", boolean(p.afiliacion_religiosa)],
              ["Afiliación política", boolean(p.afiliacion_politica)],
              ["Afiliación deportiva", boolean(p.afiliacion_deportiva)],
              ["Practica deporte", boolean(p.practica_deporte)],
              ["Deporte", text(p.deporte_cual)],
              ["Enfermedad grave", boolean(p.ha_estado_enfermo_gravedad)],
              ["Toma medicamento", boolean(p.toma_medicamento)],
              ["Fuma o bebe", boolean(p.fuma_o_bebe)],
              ["Frecuencia", text(p.fuma_bebe_frecuencia)],
              ["Impedimento físico", boolean(p.impedimento_fisico)],
              [
                "Dependientes",
                p.personas_dependientes === null ||
                p.personas_dependientes === undefined
                  ? "—"
                  : `${p.personas_dependientes} personas`,
              ],
              ["Total efectivo hogar", decimal(p.total_efectivo_hogar)],
              ["Tipo de vivienda", etiquetasVivienda[p.vivienda_tipo] || "—"],
              ["Valor vivienda", decimal(p.vivienda_valor)],
              ["Renta vivienda", decimal(p.vivienda_renta_monto)],
              ["Tiene vehículo", boolean(p.tiene_vehiculo)],
              ["Tipo licencia", text(p.licencia_tipo)],
              ["Número licencia", text(p.licencia_numero)],
              ["Deudas pendientes", boolean(p.deudas_pendientes)],
              ["Monto deudas", decimal(p.deudas_monto)],
              ["Institución deuda", text(p.deudas_institucion)],
              ["Detenido por policía", boolean(p.detenido_policia)],
              ["Procesado legalmente", boolean(p.procesado_legalmente)],
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
              ["Puesto solicitado", text(p.puesto_solicita)],
              ["Salario aspirado", decimal(p.salario_aspira)],
              ["Inicio disponible", date(p.fecha_inicio_disponible)],
              ["Tiempo extraordinario", boolean(p.trabajar_extraordinario)],
              ["Turnos rotativos", boolean(p.trabajar_turnos_rotativos)],
              [
                "Medio por el que se enteró",
                etiquetasMedioEnterado[p.medio_enterado] || "—",
              ],
              ["Por qué desea trabajar", text(p.porque_gustaria_trabajar)],
              ["Por qué contratarle", text(p.porque_deberiamoss_contratar)],
              [
                "Fortalezas",
                [p.fortaleza_1, p.fortaleza_2, p.fortaleza_3]
                  .filter(Boolean)
                  .join(" · ") || "—",
              ],
              [
                "Debilidades",
                [p.debilidad_1, p.debilidad_2, p.debilidad_3]
                  .filter(Boolean)
                  .join(" · ") || "—",
              ],
            ]}
          />
        </div>
      </>
    );
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
}

function DetallePostulante() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [postulante, setPostulante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(location.state?.mensaje || "");
  const [avisoCorreo, setAvisoCorreo] = useState(false);
  const [action, setAction] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [section, setSection] = useState(0);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setPostulante(await getPostulanteById(id));
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
      setAvisoCorreo(false);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [success]);
  const confirm = async () => {
    if (!action) return;
    setUpdating(true);
    try {
      const resultado = await updateEstadoPostulante(id, action.estado);
      setAction(null);
      setSuccess("Estado actualizado correctamente");
      setAvisoCorreo(resultado?.correoEnviado === false);
      await load();
    } catch (requestError) {
      setAction(null);
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
  const actions = transitions[p.estado] || [];
  return (
    <DashboardLayout title="Ficha del Candidato">
      <Modal
        action={action}
        onClose={() => setAction(null)}
        onConfirm={confirm}
        loading={updating}
      />
      {success && (
        <div
          role="status"
          className="mb-5 rounded-2xl border border-[#b9e8ce] bg-[#edfff4] px-5 py-4 font-semibold text-[#087947]"
        >
          {success}
        </div>
      )}
      {success && avisoCorreo && (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-[#f3e0ae] bg-[#fffaeb] px-5 py-4 font-semibold text-[#a86b00]"
        >
          No se pudo enviar el correo de notificación al postulante; el cambio
          de estado quedó guardado.
        </div>
      )}
      <section className="rounded-[26px] bg-white p-6 shadow-[0_10px_24px_rgba(20,43,89,0.06)] sm:p-7">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#e7f0ff] text-2xl font-bold text-[#1e3a8a]">
              {initials(p.nombre_completo) || <UserRound />}
            </div>
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
                  {p.puesto_solicita}
                </span>{" "}
                · Registrado el {date(p.fecha_registro)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate("/postulantes")}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#dce3ee] px-4 py-3 font-semibold text-[#071b3b]"
            >
              <ArrowLeft className="h-4 w-4" />
              Regresar
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
            {p.estado === "CONTRATADO" && (
              <span className="self-center text-sm font-semibold text-[#087947]">
                Proceso finalizado
              </span>
            )}
          </div>
        </div>
      </section>
      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(250px,0.34fr)_minmax(0,1fr)]">
        <nav
          className="flex gap-2 overflow-x-auto lg:block lg:space-y-2"
          aria-label="Secciones de la ficha"
        >
          {sections.map((name, index) => (
            <button
              type="button"
              key={name}
              onClick={() => setSection(index)}
              className={`min-w-max rounded-2xl px-6 py-4 text-left font-medium transition lg:block lg:w-full ${section === index ? "bg-white font-semibold text-[#315cf5] shadow-[0_10px_24px_rgba(20,43,89,0.06)]" : "text-[#5b6e8b] cursor-pointer hover:bg-white/70"}`}
            >
              {index + 1}. {name}
            </button>
          ))}
        </nav>
        <section className="min-h-[430px] rounded-[26px] bg-white p-6 shadow-[0_10px_24px_rgba(20,43,89,0.06)] sm:p-10">
          <SectionContent section={section} p={p} />
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
