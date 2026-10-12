import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Pencil,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { getPlazaById } from "../../services/plazas.service.js";

const MONEDAS = {
  QUETZAL: { simbolo: "Q", locale: "es-GT" },
  DOLAR: { simbolo: "$", locale: "en-US" },
};

function formatSalary(value, tipoMoneda = "QUETZAL") {
  if (value === null || value === undefined || value === "")
    return "No especificado";
  const moneda = MONEDAS[tipoMoneda] || MONEDAS.QUETZAL;
  return `${moneda.simbolo}${Number(value).toLocaleString(moneda.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("es-GT", { dateStyle: "long" }).format(date);
}

function isEmpty(valor) {
  return valor === null || valor === undefined || valor === "";
}

function DetallePlaza() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plaza, setPlaza] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getPlazaById(id)
      .then((data) => active && setPlaza(data))
      .catch(
        (requestError) =>
          active &&
          setError(
            requestError.response?.data?.message ||
              "No fue posible cargar la plaza.",
          ),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <DashboardLayout title="Detalle de Plaza">
      {loading && (
        <div className="rounded-[10px] border border-border bg-surface p-12 text-center text-text-soft shadow-none">
          Cargando plaza...
        </div>
      )}
      {!loading && error && (
        <div
          role="alert"
          className="rounded-[10px] border border-danger bg-danger-bg p-6 font-semibold text-danger"
        >
          {error}
          <button
            type="button"
            onClick={() => navigate("/plazas")}
            className="ml-3 cursor-pointer underline"
          >
            Volver a plazas
          </button>
        </div>
      )}
      {!loading && plaza && (
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => navigate("/plazas")}
              className="flex h-11 cursor-pointer items-center gap-2 rounded-[10px] border border-border bg-surface px-4 font-semibold text-text-main transition hover:bg-neutral-bg"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver a plazas
            </button>
            <button
              type="button"
              onClick={() => navigate(`/plazas/${plaza.id}/editar`)}
              className="flex h-12 cursor-pointer items-center gap-2 rounded-[10px] bg-action px-5 font-bold text-white transition hover:bg-ink"
            >
              <Pencil className="h-5 w-5" />
              Editar plaza
            </button>
          </div>
          <section className="rounded-[10px] border border-border bg-surface p-6 shadow-none sm:p-8">
            <div className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] bg-neutral-bg text-action">
                  <BriefcaseBusiness className="h-7 w-7" />
                </span>
                <div>
                  <h1 className="text-2xl font-bold tracking-[-0.04em] text-text-main sm:text-3xl">
                    {plaza.nombre}
                  </h1>
                  <p className="mt-2 text-text-soft">
                    Información general de la plaza
                  </p>
                </div>
              </div>
              <span
                className={`self-start rounded-full px-3 py-1 text-sm font-semibold ${plaza.activo ? "bg-success-bg text-success" : "bg-danger-bg text-danger"}`}
              >
                {plaza.activo ? "Activa" : "Inactiva"}
              </span>
            </div>
            <div className="grid gap-5 py-7 sm:grid-cols-2">
              <div className="rounded-[8px] bg-neutral-bg p-5">
                <p
                  className={`text-sm font-semibold ${isEmpty(plaza.salario_min) ? "text-danger" : "text-text-soft"}`}
                >
                  Percentil mínimo
                </p>
                <p
                  className={`mt-2 text-xl font-bold ${isEmpty(plaza.salario_min) ? "text-danger" : "text-action"}`}
                >
                  {formatSalary(plaza.salario_min, plaza.tipo_moneda)}
                </p>
              </div>
              <div className="rounded-[8px] bg-neutral-bg p-5">
                <p
                  className={`text-sm font-semibold ${isEmpty(plaza.salario_max) ? "text-danger" : "text-text-soft"}`}
                >
                  Percentil máximo
                </p>
                <p
                  className={`mt-2 text-xl font-bold ${isEmpty(plaza.salario_max) ? "text-danger" : "text-action"}`}
                >
                  {formatSalary(plaza.salario_max, plaza.tipo_moneda)}
                </p>
              </div>
            </div>
            <div className="grid gap-7 sm:grid-cols-2">
              <div>
                <h2
                  className={`text-lg font-bold ${isEmpty(plaza.descripcion) ? "text-danger" : "text-text-main"}`}
                >
                  Descripción
                </h2>
                <p
                  className={`mt-3 whitespace-pre-line leading-7 ${isEmpty(plaza.descripcion) ? "text-danger" : "text-text-soft"}`}
                >
                  {plaza.descripcion || "No hay una descripción registrada."}
                </p>
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-main">
                  Fecha de creación
                </h2>
                <p className="mt-3 flex items-center gap-2 text-text-soft">
                  <CalendarDays className="h-5 w-5 text-action" />
                  {formatDate(plaza.creado_en)}
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}

export default DetallePlaza;
