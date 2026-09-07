import { useEffect, useState } from "react";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Plus,
    Search,
    UserRound,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { getPatronos } from "../../services/patronos.service.js";

const PAGE_SIZE = 6;

function Patronos() {
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
        getPatronos({
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
                            "No fue posible cargar los patronos.",
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

    return (
        <DashboardLayout title="Gestión de Patronos">
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
                            <option value="true">Estado: Activos</option>
                            <option value="false">Estado: Inactivos</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#65758f]" />
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/patronos/nuevo")}
                        className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#3162e9] px-6 font-bold text-white shadow-[0_7px_16px_rgba(49,98,233,0.18)] transition hover:bg-[#183fca]"
                    >
                        <Plus className="h-5 w-5" />
                        Nuevo Patrono
                    </button>
                </div>
            </section>

            <section className="mt-7 grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
                {loading && (
                    <p className="col-span-full py-16 text-center text-[#65758f]">
                        Cargando patronos...
                    </p>
                )}
                {!loading && !error && result.data.length === 0 && (
                    <p className="col-span-full py-16 text-center text-[#65758f]">
                        No hay patronos que coincidan con la búsqueda.
                    </p>
                )}
                {!loading &&
                    result.data.map((patrono) => (
                        <button
                            type="button"
                            key={patrono.id}
                            onClick={() => navigate(`/patronos/${patrono.id}`)}
                            aria-label={`Ver información de ${patrono.nombre}`}
                            className="group min-h-[306px] cursor-pointer rounded-[26px] bg-white p-7 text-left shadow-[0_10px_24px_rgba(20,43,89,0.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(20,43,89,0.10)] focus:outline-none focus:ring-2 focus:ring-[#3162e9]"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0f4fa] text-[#2764ff]">
                                    <UserRound className="h-7 w-7" strokeWidth={2} />
                                </span>
                                <span
                                    className={`rounded-full px-3 py-1 text-sm font-semibold ${patrono.activo ? "bg-[#baf0d3] text-[#047a4e]" : "bg-[#f1f4f9] text-[#65758f]"}`}
                                >
                                    {patrono.activo ? "Activo" : "Inactivo"}
                                </span>
                            </div>
                            <div className="mt-6">
                                <h2 className="text-[22px] font-bold tracking-[-0.035em] text-[#071b3b]">
                                    {patrono.nombre}
                                </h2>
                                <p className="mt-1 line-clamp-1 text-base text-[#65758f]">
                                    {patrono.direccion || "Sin dirección"}
                                </p>
                            </div>
                            <div className="mt-6 border-t border-[#dce3ee] pt-5">
                                <span className="flex items-center gap-2 text-base text-[#65758f]">
                                    {patrono.telefono || "Sin teléfono"}
                                </span>
                            </div>
                        </button>
                    ))}
            </section>

            <footer className="mt-7 flex flex-col gap-4 px-2 py-2 text-[#5b6e8b] sm:flex-row sm:items-center sm:justify-between">
                <p>
                    Mostrando {firstItem} a {lastItem} de{" "}
                    {result.total.toLocaleString("es-GT")} patronos
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
        </DashboardLayout>
    );
}

export default Patronos;