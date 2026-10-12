import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  UsersRound,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { getPlazas, getPlazasExport } from "../../services/plazas.service.js";
import ExportarExcelButton from "../../components/ExportarExcelButton.jsx";
import { exportarExcel } from "../../utils/excel.js";
import { hojasPlaza } from "../../utils/exportaciones/generales.js";

const PAGE_SIZE = 6;

function StatusFilter({ value, onChange }) {
  return (
    <div className="relative">
      <select
        aria-label="Filtrar plazas por estado"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-14 w-full appearance-none rounded-[10px] border border-border bg-surface px-4 pr-10 text-base font-semibold text-text-main outline-none transition focus:border-action focus:ring-2 focus:ring-action/15"
      >
        <option value="">Estado</option>
        <option value="true">Activas</option>
        <option value="false">Inactivas</option>
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-soft"
      />
    </div>
  );
}

function MonedaFilter({ value, onChange }) {
  return (
    <div className="relative">
      <select
        aria-label="Filtrar plazas por tipo de moneda"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-14 w-full appearance-none rounded-[10px] border border-border bg-surface px-4 pr-10 text-base font-semibold text-text-main outline-none transition focus:border-action focus:ring-2 focus:ring-action/15"
      >
        <option value="">Monedas</option>
        <option value="QUETZAL">Quetzales</option>
        <option value="DOLAR">Dólares</option>
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-soft"
      />
    </div>
  );
}

const MONEDAS = {
  QUETZAL: { simbolo: "Q", locale: "es-GT" },
  DOLAR: { simbolo: "$", locale: "en-US" },
};

function formatSalary(value, tipoMoneda = "QUETZAL") {
  if (value === null || value === undefined || value === "") return null;
  const moneda = MONEDAS[tipoMoneda] || MONEDAS.QUETZAL;
  return `${moneda.simbolo}${Number(value).toLocaleString(moneda.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function salaryRange(plaza) {
  const minimum = formatSalary(plaza.salario_min, plaza.tipo_moneda);
  const maximum = formatSalary(plaza.salario_max, plaza.tipo_moneda);
  if (!minimum && !maximum) return "Salario no especificado";
  if (!minimum) return `Hasta ${maximum}`;
  if (!maximum) return `Desde ${minimum}`;
  return `${minimum} - ${maximum}`;
}

function Plazas() {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activa, setActiva] = useState("");
  const [tipoMoneda, setTipoMoneda] = useState("");
  const [plazas, setPlazas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.mensaje || "",
  );
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      300,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!successMessage) return undefined;
    const timer = window.setTimeout(() => setSuccessMessage(""), 5000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    let active = true;
    getPlazas({
      ...(debouncedSearch && { q: debouncedSearch }),
      ...(activa !== "" && { activo: activa === "true" }),
      ...(tipoMoneda && { tipo_moneda: tipoMoneda }),
    })
      .then((data) => {
        if (active) {
          setPlazas(data);
          setPage(1);
          setError("");
        }
      })
      .catch(
        (requestError) =>
          active &&
          setError(
            requestError.response?.data?.message ||
              "No fue posible cargar las plazas.",
          ),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [debouncedSearch, activa, tipoMoneda]);

  const totalPages = Math.max(1, Math.ceil(plazas.length / PAGE_SIZE));
  const visiblePlazas = plazas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const firstItem = plazas.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(page * PAGE_SIZE, plazas.length);

  const manejarExportar = async () => {
    const datos = await getPlazasExport({
      ...(debouncedSearch && { q: debouncedSearch }),
      ...(activa !== "" && { activo: activa === "true" }),
      ...(tipoMoneda && { tipo_moneda: tipoMoneda }),
    });
    exportarExcel({ filename: "plazas", hojas: hojasPlaza(datos) });
  };

  return (
    <DashboardLayout title="Plazas Activas">
      {successMessage && (
        <div
          role="status"
          className="mb-5 rounded-[10px] border border-border bg-success-bg px-5 py-4 font-semibold text-success"
        >
          {successMessage}
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-[10px] border border-danger bg-danger-bg px-5 py-4 font-semibold text-danger"
        >
          {error}
        </div>
      )}

      <section className="rounded-[10px] border border-border bg-surface p-5 shadow-none sm:p-6">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_220px_auto_auto]">
          <label className="flex h-14 items-center gap-3 rounded-[10px] border border-border px-4 text-text-soft focus-within:border-action focus-within:ring-2 focus-within:ring-action/15">
            <Search className="h-5 w-5 shrink-0" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Buscar plaza..."
              className="w-full bg-transparent text-base outline-none placeholder:text-text-soft"
            />
          </label>
          <StatusFilter
            value={activa}
            onChange={(value) => {
              setActiva(value);
              setPage(1);
            }}
          />
          <MonedaFilter
            value={tipoMoneda}
            onChange={(value) => {
              setTipoMoneda(value);
              setPage(1);
            }}
          />
          <button
            type="button"
            onClick={() => navigate("/plazas/nueva")}
            className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-action px-6 font-bold text-white shadow-none transition hover:bg-ink"
          >
            <Plus className="h-5 w-5" />
            Nueva Plaza
          </button>
          <ExportarExcelButton onExport={manejarExportar} />
        </div>
      </section>

      <section className="mt-7 grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
        {loading && (
          <p className="col-span-full py-16 text-center text-text-soft">
            Cargando plazas...
          </p>
        )}
        {!loading && !error && visiblePlazas.length === 0 && (
          <p className="col-span-full py-16 text-center text-text-soft">
            No hay plazas que coincidan con la búsqueda.
          </p>
        )}
        {!loading &&
          visiblePlazas.map((plaza) => (
            <button
              type="button"
              key={plaza.id}
              onClick={() => navigate(`/plazas/${plaza.id}`)}
              aria-label={`Ver información de ${plaza.nombre}`}
              className="group min-h-[306px] cursor-pointer rounded-[10px] border border-border bg-surface p-7 text-left shadow-none transition hover:-translate-y-1 hover:shadow-none focus:outline-none focus:ring-2 focus:ring-action"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-[10px] bg-neutral-bg text-action">
                  <BriefcaseBusiness className="h-7 w-7" strokeWidth={2} />
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${plaza.activo ? "bg-success-bg text-success" : "bg-danger-bg text-danger"}`}
                >
                  {plaza.activo ? "Abierta" : "Cerrada"}
                </span>
              </div>
              <div className="mt-6">
                <h2 className="text-[22px] font-bold tracking-[-0.035em] text-text-main">
                  {plaza.nombre}
                </h2>
                <p className="mt-1 line-clamp-1 text-base text-text-soft">
                  {plaza.descripcion || "Sin descripción"}
                </p>
              </div>
              <div className="mt-6 border-t border-border pt-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-base text-text-soft">
                    <UsersRound className="h-5 w-5" strokeWidth={1.8} />
                    {plaza._count?.postulantes || 0} postulantes
                  </span>
                  <span className="font-bold text-text-main">
                    {plaza.activo ? "Activa" : "Inactiva"}
                  </span>
                </div>
                <p className="mt-4 text-lg font-semibold text-action">
                  {salaryRange(plaza)}
                </p>
              </div>
            </button>
          ))}
      </section>

      <footer className="mt-7 flex flex-col gap-4 px-2 py-2 text-text-soft sm:flex-row sm:items-center sm:justify-between">
        <p>
          Mostrando {firstItem} a {lastItem} de{" "}
          {plazas.length.toLocaleString("es-GT")} plazas
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={loading || page <= 1}
            onClick={() => setPage((current) => current - 1)}
            className="flex h-11 cursor-pointer items-center gap-1 rounded-[10px] border border-border px-4 font-semibold text-text-main disabled:cursor-not-allowed disabled:opacity-45"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>
          <span className="flex h-11 min-w-11 items-center justify-center rounded-[8px] bg-action px-3 font-bold text-white">
            {page}
          </span>
          <button
            type="button"
            disabled={loading || page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="flex h-11 cursor-pointer items-center gap-1 rounded-[10px] border border-border px-4 font-semibold text-text-main disabled:cursor-not-allowed disabled:opacity-45"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </DashboardLayout>
  );
}

export default Plazas;
