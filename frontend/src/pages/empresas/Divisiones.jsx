import { useEffect, useRef, useState } from "react";
import {
    Building2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Plus,
    Search,
    X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { getDivisiones, getEmpresasForSelect } from "../../services/divisiones.service.js";

const PAGE_SIZE = 6;

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

function SearchableSelect({ placeholder, value, options, onChange }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const ref = useRef(null);
    const inputRef = useRef(null);

    const selected = options.find((option) => String(option.value) === String(value));
    const displayValue = selected ? selected.label : "";

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filtered = options.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase()),
    );

    const handleSelect = (val) => {
        onChange(val === value ? "" : val);
        setQuery("");
        setOpen(false);
    };

    return (
        <div ref={ref} className="relative">
            <div
                onClick={() => {
                    setOpen(true);
                    setTimeout(() => inputRef.current?.focus(), 0);
                }}
                className="flex h-14 cursor-pointer items-center rounded-2xl border border-[#dce3ee] bg-white px-4 text-base font-semibold text-[#071b3b] transition focus-within:border-[#3162e9] focus-within:ring-2 focus-within:ring-[#3162e9]/15"
            >
                <input
                    ref={inputRef}
                    value={open ? query : displayValue}
                    onChange={(event) => setQuery(event.target.value)}
                    onFocus={() => setOpen(true)}
                    placeholder={placeholder}
                    className="h-full w-full bg-transparent outline-none placeholder:text-[#91a0b7]"
                    readOnly={!open && !!displayValue}
                />
                {displayValue && !open && (
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onChange("");
                        }}
                        className="ml-1 cursor-pointer p-1 text-[#65758f] hover:text-[#071b3b]"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
                <ChevronDown className="ml-1 h-5 w-5 shrink-0 text-[#65758f]" />
            </div>
            {open && (
                <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-[#dce3ee] bg-white py-1 shadow-lg">
                    {filtered.length === 0 && (
                        <li className="px-4 py-3 text-sm text-[#91a0b7]">Sin resultados</li>
                    )}
                    {filtered.map((option) => (
                        <li
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={`cursor-pointer px-4 py-3 text-base transition hover:bg-[#f0f4fa] ${
                                String(option.value) === String(value)
                                    ? "bg-[#f0f4fa] font-semibold text-[#3162e9]"
                                    : "text-[#071b3b]"
                            }`}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function Divisiones() {
    const location = useLocation();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [activo, setActivo] = useState("");
    const [empresaId, setEmpresaId] = useState("");
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
    const [empresas, setEmpresas] = useState([]);

    useEffect(() => {
        getEmpresasForSelect().then(setEmpresas).catch(() => setEmpresas([]));
    }, []);

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
        getDivisiones({
            page,
            limit: PAGE_SIZE,
            ...(debouncedSearch && { q: debouncedSearch }),
            ...(activo !== "" && { activo: activo === "true" }),
            ...(empresaId && { empresa_id: empresaId }),
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
                            "No fue posible cargar las divisiones.",
                    );
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [page, debouncedSearch, activo, empresaId]);

    return (
        <DashboardLayout title="Divisiones">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-[-0.04em] text-[#071b3b] sm:text-3xl">
                            Divisiones
                        </h1>
                        <p className="mt-1 text-[#5b6e8b]">
                            Administra las divisiones de las empresas.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate("/empresas/divisiones/nueva")}
                        className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#3162e9] px-5 font-bold text-white transition hover:bg-[#183fca]"
                    >
                        <Plus className="h-5 w-5" />
                        Nueva División
                    </button>
                </div>

                {successMessage && (
                    <div
                        role="status"
                        className="mb-5 rounded-2xl border border-[#b9e8ce] bg-[#edfff4] px-5 py-4 font-semibold text-[#087947]"
                    >
                        {successMessage}
                    </div>
                )}

                <div className="rounded-[26px] bg-white shadow-[0_10px_24px_rgba(20,43,89,0.06)]">
                    <div className="border-b border-[#dce3ee] p-4 sm:px-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9ba8c2]" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar por nombre..."
                                    className="h-12 w-full rounded-xl border border-[#dce3ee] bg-white pl-12 pr-4 text-base text-[#071b3b] outline-none transition placeholder:text-[#9ba8c2] focus:border-[#3162e9] focus:ring-2 focus:ring-[#3162e9]/15"
                                />
                            </div>

                            <div className="w-full max-w-[200px]">
                                <SelectField ariaLabel="Estado de divisiones" value={activo} onChange={setActivo}>
                                    <option value="">Estado</option>
                                    <option value="true">Activas</option>
                                    <option value="false">Inactivas</option>
                                </SelectField>
                            </div>

                            <div className="w-full max-w-[260px]">
                                <SearchableSelect
                                    placeholder="Empresas"
                                    value={empresaId}
                                    options={empresas.map((empresa) => ({
                                        value: empresa.id,
                                        label: empresa.nombre_empresa,
                                    }))}
                                    onChange={setEmpresaId}
                                />
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-[#5b6e8b]">
                            Cargando divisiones…
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center text-red-600">
                            {error}
                        </div>
                    ) : result.data.length === 0 ? (
                        <div className="p-12 text-center text-[#5b6e8b]">
                            No se encontraron divisiones.
                        </div>
                    ) : (
                        <div className="grid gap-4 p-4 sm:px-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {result.data.map((division) => (
                                <article
                                    key={division.id}
                                    className="group relative rounded-[26px] border border-[#dce3ee] bg-white p-5 shadow-[0_10px_24px_rgba(20,43,89,0.06)] transition hover:border-[#3162e9] hover:shadow-[0_20px_40px_rgba(20,43,89,0.1)]"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="truncate text-lg font-bold text-[#071b3b]">
                                                {division.nombre}
                                            </h3>
                                            <p className="mt-1 truncate text-sm text-[#5b6e8b]">
                                                {division.empresa?.nombre_empresa || "Sin empresa"}
                                            </p>
                                            {division.descripcion && (
                                                <p className="mt-2 truncate text-sm text-[#5b6e8b]">
                                                    {division.descripcion}
                                                </p>
                                            )}
                                        </div>
                                        <span
                                            className={`ml-3 flex-shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                                                division.activo
                                                    ? "bg-[#c9f3dd] text-[#087947]"
                                                    : "bg-[#f1f4f9] text-[#5b6e8b]"
                                            }`}
                                        >
                                            {division.activo ? "Activa" : "Inactiva"}
                                        </span>
                                    </div>
                                    <div className="mt-4 flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/empresas/divisiones/${division.id}`)}
                                            className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-[#dce3ee] bg-white px-4 text-sm font-semibold text-[#071b3b] transition hover:bg-[#f0f4fa]"
                                        >
                                            <span className="hidden sm:inline">Ver</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/empresas/divisiones/${division.id}/editar`)}
                                            className="flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-[#3162e9] px-4 text-sm font-bold text-white transition hover:bg-[#183fca]"
                                        >
                                            Editar
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {result.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 border-t border-[#dce3ee] p-4">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="cursor-pointer rounded-xl border border-[#dce3ee] px-4 py-2 text-sm font-semibold text-[#071b3b] transition hover:bg-[#f0f4fa] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Anterior
                            </button>
                            <span className="text-sm text-[#5b6e8b]">
                                Página {result.page} de {result.totalPages}
                            </span>
                            <button
                                type="button"
                                disabled={page >= result.totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="cursor-pointer rounded-xl border border-[#dce3ee] px-4 py-2 text-sm font-semibold text-[#071b3b] transition hover:bg-[#f0f4fa] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Siguiente
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 text-center text-red-600">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default Divisiones;