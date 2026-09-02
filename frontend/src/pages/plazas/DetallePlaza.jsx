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

function formatSalary(value) {
  if (value === null || value === undefined || value === "")
    return "No especificado";
  return `Q${Number(value).toLocaleString("es-GT", { maximumFractionDigits: 0 })}`;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("es-GT", { dateStyle: "long" }).format(date);
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
        <div className="rounded-[26px] bg-white p-12 text-center text-[#5b6e8b] shadow-[0_10px_24px_rgba(20,43,89,0.06)]">
          Cargando plaza...
        </div>
      )}
      {!loading && error && (
        <div
          role="alert"
          className="rounded-[26px] border border-red-200 bg-red-50 p-6 font-semibold text-red-600"
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
              className="flex h-11 cursor-pointer items-center gap-2 rounded-2xl border border-[#dce3ee] bg-white px-4 font-semibold text-[#071b3b] transition hover:bg-[#f0f4fa]"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver a plazas
            </button>
            <button
              type="button"
              onClick={() => navigate(`/plazas/${plaza.id}/editar`)}
              className="flex h-12 cursor-pointer items-center gap-2 rounded-2xl bg-[#3162e9] px-5 font-bold text-white transition hover:bg-[#183fca]"
            >
              <Pencil className="h-5 w-5" />
              Editar plaza
            </button>
          </div>
          <section className="rounded-[26px] bg-white p-6 shadow-[0_10px_24px_rgba(20,43,89,0.06)] sm:p-8">
            <div className="flex flex-col gap-5 border-b border-[#dce3ee] pb-7 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f0f4fa] text-[#3162e9]">
                  <BriefcaseBusiness className="h-7 w-7" />
                </span>
                <div>
                  <h1 className="text-2xl font-bold tracking-[-0.04em] text-[#071b3b] sm:text-3xl">
                    {plaza.nombre}
                  </h1>
                  <p className="mt-2 text-[#5b6e8b]">
                    Información general de la plaza
                  </p>
                </div>
              </div>
              <span
                className={`self-start rounded-full px-3 py-1 text-sm font-semibold ${plaza.activo ? "bg-[#c9f3dd] text-[#087947]" : "bg-[#f1f4f9] text-[#5b6e8b]"}`}
              >
                {plaza.activo ? "Activa" : "Inactiva"}
              </span>
            </div>
            <div className="grid gap-5 py-7 sm:grid-cols-2">
              <div className="rounded-xl bg-[#f0f4fa] p-5">
                <p className="text-sm font-semibold text-[#5b6e8b]">
                  Salario mínimo
                </p>
                <p className="mt-2 text-xl font-bold text-[#3162e9]">
                  {formatSalary(plaza.salario_min)}
                </p>
              </div>
              <div className="rounded-xl bg-[#f0f4fa] p-5">
                <p className="text-sm font-semibold text-[#5b6e8b]">
                  Salario máximo
                </p>
                <p className="mt-2 text-xl font-bold text-[#3162e9]">
                  {formatSalary(plaza.salario_max)}
                </p>
              </div>
            </div>
            <div className="grid gap-7 sm:grid-cols-2">
              <div>
                <h2 className="text-lg font-bold text-[#071b3b]">
                  Descripción
                </h2>
                <p className="mt-3 whitespace-pre-line leading-7 text-[#5b6e8b]">
                  {plaza.descripcion || "No hay una descripción registrada."}
                </p>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#071b3b]">
                  Fecha de creación
                </h2>
                <p className="mt-3 flex items-center gap-2 text-[#5b6e8b]">
                  <CalendarDays className="h-5 w-5 text-[#3162e9]" />
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
