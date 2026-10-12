import { useEffect, useState } from "react";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Eye,
    Pencil,
    Plus,
    Search,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import {
    getEmpresas,
    getEmpresasExport,
} from "../../services/empresas.service.js";
import ExportarExcelButton from "../../components/ExportarExcelButton.jsx";
import { exportarExcel } from "../../utils/excel.js";
import { hojasEmpresa } from "../../utils/exportaciones/generales.js";
import { useAuth } from "../../hooks/useAuth.js";

const PAGE_SIZE = 6;

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
    return Number.isNaN(date.getTime())
        ? "—"
        : new Intl.DateTimeFormat("es-GT").format(date);
}

function Empresas() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const esAdmin = authUser?.rol === "Administrador RHCorp";
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [activo, setActivo] = useState("");
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({
        data: [],
        total: 0,
        page: 1,
        totalPages: 1,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState(
        location.state?.mensaje || "",
    );

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
        getEmpresas({
            page,
            limit: PAGE_SIZE,
            ...(debouncedSearch && { q: debouncedSearch }),
            ...(activo !== "" && { activo: activo === "true" }),
        })
            .then((data) => {
                if (active) {
                    setResult(data || { data: [], total: 0, page: 1, totalPages: 1 });
                    setError("");
                }
            })
            .catch((requestError) => {
                if (active) {
                    setError(
                        requestError.response?.data?.message ||
                            "No fue posible cargar las empresas.",
                    );
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [page, debouncedSearch, activo]);

    const firstItem = result.total === 0 ? 0 : (result.page - 1) * PAGE_SIZE + 1;
    const lastItem = Math.min(result.page * PAGE_SIZE, result.total);

    const manejarExportar = async () => {
        const datos = await getEmpresasExport({
            ...(debouncedSearch && { q: debouncedSearch }),
            ...(activo !== "" && { activo: activo === "true" }),
        });
        exportarExcel({ filename: "empresas", hojas: hojasEmpresa(datos) });
    };

    return (
        <DashboardLayout title="Gestión de Empresas">
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
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
                    <label className="flex h-14 items-center gap-3 rounded-[10px] border border-border px-4 text-text-soft focus-within:border-action focus-within:ring-2 focus-within:ring-action/15">
                        <Search className="h-5 w-5 shrink-0" />
                        <input
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setPage(1);
                            }}
                            placeholder="Buscar por nombre de empresa"
                            className="w-full bg-transparent text-base outline-none placeholder:text-text-soft"
                        />
                    </label>

                    <div className="relative">
                        <select
                            aria-label="Filtrar por estado"
                            value={activo}
                            onChange={(event) => {
                                setActivo(event.target.value);
                                setPage(1);
                            }}
                            className="h-14 w-full appearance-none rounded-[10px] border border-border bg-surface px-4 pr-10 text-base font-semibold text-text-main outline-none transition focus:border-action focus:ring-2 focus:ring-action/15"
                        >
                            <option value="">Estado</option>
                            <option value="true">Activas</option>
                            <option value="false">Inactivas</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-soft" />
                    </div>

                    {esAdmin && (
                        <button
                            type="button"
                            onClick={() => navigate("/empresas/nueva")}
                            className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-action px-6 font-bold text-white shadow-none transition hover:bg-ink"
                        >
                            <Plus className="h-5 w-5" />
                            Nueva Empresa
                        </button>
                    )}
                    <ExportarExcelButton onExport={manejarExportar} />
                </div>
            </section>

            <section className="mt-7 overflow-hidden rounded-[10px] border border-border bg-surface shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[980px] border-separate border-spacing-0 text-left">
                        <thead>
                            <tr className="text-base font-semibold text-text-soft">
                                <th className="border-b border-border px-7 py-5 font-semibold">
                                    Nombre
                                </th>
                                <th className="border-b border-border px-5 py-5 font-semibold">
                                    Detalle
                                </th>
                                <th className="border-b border-border px-5 py-5 font-semibold">
                                    Teléfono
                                </th>
                                <th className="border-b border-border px-5 py-5 font-semibold">
                                    Correo
                                </th>
                                <th className="border-b border-border px-5 py-5 font-semibold">
                                    Estado
                                </th>
                                <th className="border-b border-border px-5 py-5 font-semibold">
                                    Creado
                                </th>
                                <th className="border-b border-border px-7 py-5 text-right font-semibold">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-7 py-14 text-center text-text-soft"
                                    >
                                        Cargando empresas…
                                    </td>
                                </tr>
                            )}
                            {!loading && error && (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-7 py-14 text-center text-danger"
                                    >
                                        {error}
                                    </td>
                                </tr>
                            )}
                            {!loading && !error && result.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-7 py-14 text-center text-text-soft"
                                    >
                                        No hay empresas que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            )}
                            {!loading &&
                                !error &&
                                result.data.map((empresa) => (
                                    <tr key={empresa.id} className="text-base">
                                        <td className="border-b border-border px-7 py-6 font-bold text-text-main">
                                            {empresa.nombre_empresa}
                                        </td>
                                        <td className="border-b border-border px-5 py-6 text-text-soft">
                                            <span className="block max-w-[320px] truncate">
                                                {empresa.detalle_empresa || "—"}
                                            </span>
                                        </td>
                                        <td className="border-b border-border px-5 py-6 text-text-soft">
                                            {empresa.telefono || "—"}
                                        </td>
                                        <td className="border-b border-border px-5 py-6 text-text-soft">
                                            {empresa.correo || "—"}
                                        </td>
                                        <td className="border-b border-border px-5 py-6">
                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${empresa.activo ? "bg-success-bg text-success" : "bg-danger-bg text-danger"}`}
                                            >
                                                {empresa.activo ? "Activa" : "Inactiva"}
                                            </span>
                                        </td>
                                        <td className="border-b border-border px-5 py-6 font-mono tabular-nums text-text-soft">
                                            {formatDate(empresa.creado_en)}
                                        </td>
                                        <td className="border-b border-border px-7 py-6">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/empresas/${empresa.id}`)}
                                                    aria-label={`Ver ${empresa.nombre_empresa}`}
                                                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-[8px] bg-neutral-bg text-text-main transition hover:bg-border"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </button>
                                                {esAdmin && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(`/empresas/${empresa.id}/editar`)
                                                        }
                                                        aria-label={`Editar ${empresa.nombre_empresa}`}
                                                        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-[8px] bg-neutral-bg text-text-main transition hover:bg-border"
                                                    >
                                                        <Pencil className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
                <footer className="flex flex-col gap-4 px-7 py-5 text-text-soft sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        Mostrando {firstItem} a {lastItem} de{" "}
                        {result.total.toLocaleString("es-GT")} empresas
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={loading || result.page <= 1}
                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                            className="flex h-11 cursor-pointer items-center gap-1 rounded-[10px] border border-border px-4 font-semibold text-text-main disabled:cursor-not-allowed disabled:opacity-45"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Anterior
                        </button>
                        <span className="flex h-11 min-w-11 items-center justify-center rounded-[8px] bg-action px-3 font-bold text-white">
                            {result.page}
                        </span>
                        <button
                            type="button"
                            disabled={loading || result.page >= result.totalPages}
                            onClick={() =>
                                setPage((current) => Math.min(result.totalPages, current + 1))
                            }
                            className="flex h-11 cursor-pointer items-center gap-1 rounded-[10px] border border-border px-4 font-semibold text-text-main disabled:cursor-not-allowed disabled:opacity-45"
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

export default Empresas;
