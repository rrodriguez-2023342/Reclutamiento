import { useEffect, useState } from "react";
import { CheckCircle2, UsersRound, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { getDashboardSummary } from "../../services/dashboard.service.js";

const statusStyles = {
  POSTULANTE: "bg-pending-bg text-pending",
  CONTRATADO: "bg-success-bg text-success",
  RECHAZADO: "bg-danger-bg text-danger",
};

const statusLabels = {
  POSTULANTE: "Postulante",
  CONTRATADO: "Contratado",
  RECHAZADO: "Rechazado",
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("es-GT").format(date);
}

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getDashboardSummary()
      .then((data) => {
        if (active) setSummary(data);
      })
      .catch((requestError) => {
        if (active)
          setError(
            requestError.response?.data?.message ||
              "No fue posible cargar el resumen.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const metrics = [
    {
      label: "Total postulantes",
      value: summary?.totalPostulantes,
      icon: UsersRound,
    },
    {
      label: "Total contratados",
      value: summary?.contratados,
      icon: CheckCircle2,
    },
    { label: "Total rechazados", value: summary?.rechazados, icon: XCircle },
  ];
  const applications = summary?.ultimasSolicitudes || [];

  return (
    <DashboardLayout>
      <section
        className="grid gap-5 md:grid-cols-3 lg:gap-6"
        aria-label="Indicadores generales"
      >
        {metrics.map(({ label, value, icon: Icon }) => (
          <article
            key={label}
            className="rounded-[10px] border border-border bg-surface px-7 py-7 shadow-none"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-base font-medium uppercase tracking-[0.01em] text-text-soft">
                {label}
              </p>
              <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-neutral-bg text-action">
                <Icon className="h-6 w-6" strokeWidth={2} />
              </div>
            </div>
            <p className="mt-4 text-5xl font-bold tracking-[-0.055em] text-text-main">
              {loading ? "—" : (value || 0).toLocaleString("es-GT")}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-7 rounded-[10px] border border-border bg-surface px-5 py-6 shadow-none sm:px-7 sm:py-7">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold tracking-[-0.04em] text-text-main sm:text-2xl">
            Últimas solicitudes ingresadas
          </h2>
          <Link
            to="/postulantes"
            className="inline-flex min-h-10 items-center px-2 text-sm font-semibold text-action transition hover:text-action"
          >
            Ver todas
          </Link>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-neutral-bg text-sm font-semibold text-text-soft">
                <th className="rounded-l-2xl px-5 py-4 font-semibold">
                  Postulante
                </th>
                <th className="px-5 py-4 font-semibold">Plaza aplicada</th>
                <th className="px-5 py-4 font-semibold">Estado</th>
                <th className="rounded-r-2xl px-5 py-4 font-semibold">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-5 py-12 text-center text-text-soft"
                  >
                    Cargando solicitudes…
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-5 py-12 text-center text-danger"
                  >
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && applications.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-5 py-12 text-center text-text-soft"
                  >
                    Aún no hay solicitudes registradas.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                applications.map((application) => (
                  <tr key={application.id} className="text-base">
                    <td className="border-b border-border px-5 py-5 font-semibold text-text-main">
                      {application.nombre_completo}
                    </td>
                    <td className="border-b border-border px-5 py-5 text-text-soft">
                      {application.plaza?.nombre || "—"}
                    </td>
                    <td className="border-b border-border px-5 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[application.estado] || "bg-neutral-bg text-text-soft"}`}
                      >
                        {statusLabels[application.estado] || application.estado}
                      </span>
                    </td>
                    <td className="border-b border-border px-5 py-5 text-text-soft">
                      {formatDate(application.fecha_registro)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardLayout>
  );
}

export default Dashboard;
