import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  Pencil,
  Plus,
  Search,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import {
  getPlazasPostulantes,
  getPostulantes,
} from "../../services/postulantes.service.js";

const PAGE_SIZE = 6;

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "EN_PROCESO", label: "En proceso" },
  { value: "CONTRATADO", label: "Contratado" },
  { value: "RECHAZADO", label: "Rechazado" },
];

const statusStyles = {
  PENDIENTE: "bg-[#fff0bd] text-[#a86b00]",
  EN_PROCESO: "bg-[#d9ebff] text-[#2765d9]",
  CONTRATADO: "bg-[#c9f3dd] text-[#087947]",
  RECHAZADO: "bg-[#ffe0e2] text-[#df353c]",
};

const statusLabels = Object.fromEntries(
  STATUS_OPTIONS.slice(1).map(({ value, label }) => [value, label]),
);

function formatDpi(dpi = "") {
  const digits = String(dpi).replace(/\D/g, "");
  return digits.length === 13
    ? `${digits.slice(0, 4)}-${digits.slice(4, 9)}-${digits.slice(9)}`
    : dpi;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("es-GT").format(date);
}

function SelectField({ ariaLabel, value, onChange, children }) {
  return (
    <div className="relative">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-14 w-full appearance-none rounded-2xl border border-[#dce3ee] bg-white px-4 pr-10 text-base font-semibold text-[#071b3b] outline-none transition focus:border-[#3162e9] focus:ring-2 focus:ring-[#3162e9]/15"
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#65758f]"
      />
    </div>
  );
}

function Postulantes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [estado, setEstado] = useState("");
  const [puesto, setPuesto] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({
    data: [],
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [plazas, setPlazas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.mensaje || "",
  );

  useEffect(() => {
    if (!successMessage) return undefined;
    const timer = window.setTimeout(() => setSuccessMessage(""), 5000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      300,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    getPlazasPostulantes()
      .then((data) => active && setPlazas(data))
      .catch(() => active && setPlazas([]));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    getPostulantes({
      page,
      limit: PAGE_SIZE,
      ...(debouncedSearch && { q: debouncedSearch }),
      ...(estado && { estado }),
      ...(puesto && { puesto }),
    })
      .then((data) => {
        if (active) {
          setResult(data);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active)
          setError(
            requestError.response?.data?.message ||
              "No fue posible cargar los postulantes.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, debouncedSearch, estado, puesto]);

  const firstItem = result.total === 0 ? 0 : (result.page - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(result.page * PAGE_SIZE, result.total);
  const updateSearch = (value) => {
    setSearch(value);
    setPage(1);
    setLoading(true);
  };
  const updateEstado = (value) => {
    setEstado(value);
    setPage(1);
    setLoading(true);
  };
  const updatePuesto = (value) => {
    setPuesto(value);
    setPage(1);
    setLoading(true);
  };
  const goToPage = (nextPage) => {
    setPage(nextPage);
    setLoading(true);
  };

  return (
    <DashboardLayout
      title="Gestión de Postulantes"
      headerSearch={{
        value: search,
        onChange: updateSearch,
        placeholder: "Buscar postulante...",
      }}
    >
      {successMessage && (
        <div
          role="status"
          className="mb-5 rounded-2xl border border-[#b9e8ce] bg-[#edfff4] px-5 py-4 font-semibold text-[#087947]"
        >
          {successMessage}
        </div>
      )}
      <section className="rounded-[26px] bg-white p-5 shadow-[0_10px_24px_rgba(20,43,89,0.06)] sm:p-6">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_192px_176px_232px]">
          <label className="flex h-14 items-center gap-3 rounded-2xl border border-[#dce3ee] px-4 text-[#65758f] focus-within:border-[#3162e9] focus-within:ring-2 focus-within:ring-[#3162e9]/15">
            <Search className="h-5 w-5 shrink-0" />
            <input
              value={search}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Buscar por nombre o DPI..."
              className="w-full bg-transparent text-base outline-none placeholder:text-[#7787a2]"
            />
          </label>
          <SelectField
            ariaLabel="Filtrar por estado"
            value={estado}
            onChange={updateEstado}
          >
            {STATUS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                Estado: {label}
              </option>
            ))}
          </SelectField>
          <SelectField
            ariaLabel="Filtrar por plaza"
            value={puesto}
            onChange={updatePuesto}
          >
            <option value="">Plaza: Todas</option>
            {plazas.map((plaza) => (
              <option key={plaza} value={plaza}>
                {plaza}
              </option>
            ))}
          </SelectField>
          <button
            type="button"
            onClick={() => navigate("/postulantes/nuevo")}
            className="flex h-14 items-center justify-center gap-2 cursor-pointer rounded-2xl bg-[#3162e9] px-5 text-base font-bold text-white transition hover:bg-[#183fca]"
          >
            <Plus className="h-5 w-5" />
            Nuevo Postulante
          </button>
        </div>
      </section>

      <section className="mt-7 overflow-hidden rounded-[26px] bg-white shadow-[0_10px_24px_rgba(20,43,89,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-separate border-spacing-0 text-left">
            <thead>
              <tr className="text-base font-medium text-[#5b6e8b]">
                <th className="border-b border-[#dfe5ee] px-7 py-5 font-medium">
                  Nombre Completo
                </th>
                <th className="border-b border-[#dfe5ee] px-5 py-5 font-medium">
                  DPI (Guatemala)
                </th>
                <th className="border-b border-[#dfe5ee] px-5 py-5 font-medium">
                  Plaza Aplicada
                </th>
                <th className="border-b border-[#dfe5ee] px-5 py-5 font-medium">
                  Estado
                </th>
                <th className="border-b border-[#dfe5ee] px-5 py-5 font-medium">
                  Registro
                </th>
                <th className="border-b border-[#dfe5ee] px-7 py-5 text-right font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-7 py-14 text-center text-[#5b6e8b]"
                  >
                    Cargando postulantes…
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-7 py-14 text-center text-[#df353c]"
                  >
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && result.data.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-7 py-14 text-center text-[#5b6e8b]"
                  >
                    No hay postulantes que coincidan con los filtros.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                result.data.map((postulante) => (
                  <tr key={postulante.id} className="text-base">
                    <td className="border-b border-[#dfe5ee] px-7 py-6 font-bold text-[#071b3b]">
                      {postulante.nombre_completo}
                    </td>
                    <td className="border-b border-[#dfe5ee] px-5 py-6 text-[#5b6e8b]">
                      {formatDpi(postulante.dpi)}
                    </td>
                    <td className="border-b border-[#dfe5ee] px-5 py-6 text-[#5b6e8b]">
                      {postulante.puesto_solicita}
                    </td>
                    <td className="border-b border-[#dfe5ee] px-5 py-6">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusStyles[postulante.estado] || "bg-[#f1f4f9] text-[#5b6e8b]"}`}
                      >
                        {statusLabels[postulante.estado] || postulante.estado}
                      </span>
                    </td>
                    <td className="border-b border-[#dfe5ee] px-5 py-6 text-[#5b6e8b]">
                      {formatDate(postulante.fecha_registro)}
                    </td>
                    <td className="border-b border-[#dfe5ee] px-7 py-6">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/postulantes/${postulante.id}`)
                          }
                          aria-label={`Ver ${postulante.nombre_completo}`}
                          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-[#f1f4f9] text-[#071b3b] transition hover:bg-[#e4ebf6]"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/postulantes/${postulante.id}/editar`)
                          }
                          aria-label={`Editar ${postulante.nombre_completo}`}
                          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-[#f1f4f9] text-[#071b3b] transition hover:bg-[#e4ebf6]"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <footer className="flex flex-col gap-4 px-7 py-5 text-[#5b6e8b] sm:flex-row sm:items-center sm:justify-between">
          <p>
            Mostrando {firstItem} a {lastItem} de{" "}
            {result.total.toLocaleString("es-GT")} postulantes
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loading || result.page <= 1}
              onClick={() => goToPage(result.page - 1)}
              className="flex h-11 items-center gap-1 rounded-2xl border border-[#dce3ee] px-4 font-semibold text-[#071b3b] cursor-pointer disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>
            <span className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-[#3162e9] px-3 font-bold text-white">
              {result.page}
            </span>
            <button
              type="button"
              disabled={loading || result.page >= result.totalPages}
              onClick={() => goToPage(result.page + 1)}
              className="flex h-11 items-center gap-1 rounded-2xl border border-[#dce3ee] px-4 font-semibold text-[#071b3b] cursor-pointer disabled:cursor-not-allowed disabled:opacity-45"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </footer>
      </section>
    </DashboardLayout>
  );
}

export default Postulantes;
