import { useEffect, useState } from "react";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Eye,
    Pencil,
    Plus,
    Power,
    Search,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import {
    activarEmpresa,
    desactivarEmpresa,
    getEmpresas,
} from "../../services/empresas.service.js";

const PAGE_SIZE = 10;

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : new Intl.DateTimeFormat("es-GT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(date);
}

function Modal({ action, loading, onClose, onConfirm }) {
    if (!action) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#071b3b]/45 p-4"
            role="dialog"
            aria-modal="true"
        >
            <div className="w-full max-w-md rounded-[26px] bg-white p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-[#071b3b]">{action.title}</h2>
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
                        {loading ? "Procesando..." : action.confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Empresas() {
    const location = useLocation();
    const navigate = useNavigate();
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
    const [modalAction, setModalAction] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

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
        setLoading(true);
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
    }, [page, debouncedSearch, activo, refreshKey]);

    const firstItem = result.total === 0 ? 0 : (result.page - 1) * PAGE_SIZE + 1;
    const lastItem = Math.min(result.page * PAGE_SIZE, result.total);

    const handleToggleStatus = async () => {
        if (!modalAction || !modalAction.empresa) return;
        const { empresa } = modalAction;
        try {
            setActionLoading(true);
            if (empresa.activo) {
                await desactivarEmpresa(empresa.id);
            } else {
                await activarEmpresa(empresa.id);
            }
            setModalAction(null);
            setRefreshKey((current) => current + 1);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "No fue posible cambiar el estado de la empresa.",
            );
            setModalAction(null);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <DashboardLayout title="Gestión de Empresas">
            {successMessage && (
                <div
                    role="status"
                    className="mb-5 rounded-2xl border border-[#b9e8ce] bg-[#edfff4] px-5 py-4 font-semibold text-[#087947]"
                >
                    {successMessage}
                </div>
            )}

            {error && (
                <div
                    role="alert"
                    className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-600"
                >
                    {error}
                </div>
            )}

            <section className="rounded-[26px] bg-white p-5 shadow-[0_10px_24px_rgba(20,43,89,0.06)] sm:p-6">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto]">
                    <label className="flex h-14 items-center gap-3 rounded-2xl border border-[#dce3ee] px-4 text-[#65758f] focus-within:border-[#3162e9] focus-within:ring-2 focus-within:ring-[#3162e9]/15">
                        <Search className="h-5 w-5 shrink-0" />
                        <input
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setPage(1);
                            }}
                            placeholder="Buscar por nombre o dirección"
                            className="w-full bg-transparent text-base outline-none placeholder:text-[#91a0b7]"
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
                            className="h-14 w-full appearance-none rounded-2xl border border-[#dce3ee] bg-white px-4 pr-10 text-base font-semibold text-[#071b3b] outline-none transition focus:border-[#3162e9] focus:ring-2 focus:ring-[#3162e9]/15"
                        >
                            <option value="">Estado: Todos</option>
                            <option value="true">Estado: Activas</option>
                            <option value="false">Estado: Inactivas</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#65758f]" />
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/empresas/nueva")}
                        className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#3162e9] px-6 font-bold text-white shadow-[0_7px_16px_rgba(49,98,233,0.18)] transition hover:bg-[#183fca]"
                    >
                        <Plus className="h-5 w-5" />
                        Nueva Empresa
                    </button>
                </div>
            </section>

            <section className="mt-7 overflow-hidden rounded-[26px] bg-white shadow-[0_10px_24px_rgba(20,43,89,0.06)]">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] border-separate border-spacing-0 text-left">
                        <thead>
                            <tr className="text-base font-semibold text-[#5b6e8b]">
                                <th className="border-b border-[#dfe5ee] px-6 py-5 font-semibold">
                                    Nombre
                                </th>
                                <th className="border-b border-[#dfe5ee] px-5 py-5 font-semibold">
                                    Dirección
                                </th>
                                <th className="border-b border-[#dfe5ee] px-5 py-5 font-semibold">
                                    Teléfono
                                </th>
                                <th className="border-b border-[#dfe5ee] px-5 py-5 font-semibold">
                                    Estado
                                </th>
                                <th className="border-b border-[#dfe5ee] px-5 py-5 font-semibold">
                                    Creado
                                </th>
                                <th className="border-b border-[#dfe5ee] px-6 py-5 text-right font-semibold">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-6 py-12 text-center text-[#65758f]"
                                    >
                                        Cargando empresas...
                                    </td>
                                </tr>
                            )}

                            {!loading && !error && result.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-6 py-12 text-center text-[#65758f]"
                                    >
                                        No hay empresas que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            )}

                            {!loading &&
                                result.data.map((empresa) => (
                                    <tr key={empresa.id} className="align-middle text-[#071b3b]">
                                        <td className="border-b border-[#eef2f8] px-6 py-4 font-semibold">
                                            {empresa.nombre}
                                        </td>
                                        <td className="border-b border-[#eef2f8] px-5 py-4 text-[#5b6e8b]">
                                            {empresa.direccion || "—"}
                                        </td>
                                        <td className="border-b border-[#eef2f8] px-5 py-4 text-[#5b6e8b]">
                                            {empresa.telefono || "—"}
                                        </td>
                                        <td className="border-b border-[#eef2f8] px-5 py-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-bold ${empresa.activo ? "bg-[#c9f3dd] text-[#087947]" : "bg-[#f1f4f9] text-[#5b6e8b]"}`}
                                            >
                                                {empresa.activo ? "Activa" : "Inactiva"}
                                            </span>
                                        </td>
                                        <td className="border-b border-[#eef2f8] px-5 py-4 text-[#5b6e8b]">
                                            {formatDate(empresa.creado_en)}
                                        </td>
                                        <td className="border-b border-[#eef2f8] px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/empresas/${empresa.id}`)}
                                                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#dce3ee] bg-white text-[#071b3b] transition hover:bg-[#f0f4fa]"
                                                    aria-label={`Ver detalle de ${empresa.nombre}`}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(`/empresas/${empresa.id}/editar`)
                                                    }
                                                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#dce3ee] bg-white text-[#071b3b] transition hover:bg-[#f0f4fa]"
                                                    aria-label={`Editar ${empresa.nombre}`}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setModalAction({
                                                            type: empresa.activo ? "desactivar" : "activar",
                                                            empresa: empresa,
                                                            title: empresa.activo
                                                                ? "Desactivar empresa"
                                                                : "Activar empresa",
                                                            description: empresa.activo
                                                                ? `¿Deseas desactivar a ${empresa.nombre}?`
                                                                : `¿Deseas activar a ${empresa.nombre}?`,
                                                            confirmText: empresa.activo
                                                                ? "Desactivar"
                                                                : "Activar",
                                                        })
                                                    }
                                                    disabled={actionLoading}
                                                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#dce3ee] bg-white text-[#071b3b] transition hover:bg-[#f0f4fa] disabled:cursor-not-allowed disabled:opacity-60"
                                                    aria-label={
                                                        empresa.activo
                                                            ? `Desactivar ${empresa.nombre}`
                                                            : `Activar ${empresa.nombre}`
                                                    }
                                                >
                                                    <Power className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <footer className="mt-7 flex flex-col gap-4 px-2 py-2 text-[#5b6e8b] sm:flex-row sm:items-center sm:justify-between">
              <p>
                Mostrando {firstItem} a {lastItem} de{" "}
                {result.total.toLocaleString("es-GT")} empresas
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={loading || result.page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="flex h-11 cursor-pointer items-center gap-1 rounded-2xl border border-[#dce3ee] px-4 font-semibold text-[#071b3b] disabled:cursor-not-allowed disabled:opacity-45"
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
                  onClick={() =>
                    setPage((current) => Math.min(result.totalPages, current + 1))
                  }
                  className="flex h-11 cursor-pointer items-center gap-1 rounded-2xl border border-[#dce3ee] px-4 font-semibold text-[#071b3b] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </footer>

            <Modal
              action={modalAction}
              loading={actionLoading}
              onClose={() => setModalAction(null)}
              onConfirm={handleToggleStatus}
            />
        </DashboardLayout>
    );
} 

export default Empresas;
