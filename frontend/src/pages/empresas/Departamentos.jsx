import { useEffect, useRef, useState } from "react";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Eye,
    Pencil,
    Plus,
    Search,
    X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import {
    getDepartamentos,
    getDepartamentosExport,
} from "../../services/departamentos.service.js";
import ExportarExcelButton from "../../components/ExportarExcelButton.jsx";
import { exportarExcel } from "../../utils/excel.js";
import { hojasDepartamento } from "../../utils/exportaciones/generales.js";

const PAGE_SIZE = 6;

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

export function SearchableSelect({ placeholder, value, options, onChange }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const ref = useRef(null);
    const inputRef = useRef(null);

    const selected = options.find(
        (option) => String(option.value) === String(value),
    );
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

function Departamentos() {
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
        setLoading(true);
        getDepartamentos({
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
                            "No fue posible cargar los departamentos.",
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
        const datos = await getDepartamentosExport({
            ...(debouncedSearch && { q: debouncedSearch }),
            ...(activo !== "" && { activo: activo === "true" }),
        });
        exportarExcel({
            filename: "departamentos",
            hojas: hojasDepartamento(datos),
        });
    };

    return (
        <DashboardLayout title="Departamentos">
            <div className="mx-auto max-w-7xl py-8">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-[-0.04em] text-[#071b3b] sm:text-3xl">
                            Departamentos
                        </h1>
                        <p className="mt-1 text-[#5b6e8b]">
                            Administra los departamentos disponibles para los puestos.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        {esAdmin && (
                            <button
                                type="button"
                                onClick={() => navigate("/empresas/departamentos/nueva")}
                                className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#3162e9] px-5 font-bold text-white transition hover:bg-[#183fca]"
                            >
                                <Plus className="h-5 w-5" />
                                Nuevo Departamento
                            </button>
                        )}
                        <ExportarExcelButton onExport={manejarExportar} compacto />
                    </div>
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
                                <SelectField
                                    ariaLabel="Estado de departamentos"
                                    value={activo}
                                    onChange={setActivo}
                                >
                                    <option value="">Estados</option>
                                    <option value="true">Activos</option>
                                    <option value="false">Inactivos</option>
                                </SelectField>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] border-separate border-spacing-0 text-left">
                            <thead>
                                <tr className="text-base font-semibold text-[#5b6e8b]">
                                    <th className="border-b border-[#dfe5ee] px-7 py-5 font-semibold">
                                        Nombre
                                    </th>
                                    <th className="border-b border-[#dfe5ee] px-5 py-5 font-semibold">
                                        Descripción
                                    </th>
                                    <th className="border-b border-[#dfe5ee] px-5 py-5 font-semibold">
                                        Estado
                                    </th>
                                    <th className="border-b border-[#dfe5ee] px-5 py-5 font-semibold">
                                        Creado
                                    </th>
                                    <th className="border-b border-[#dfe5ee] px-7 py-5 text-right font-semibold">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-7 py-14 text-center text-[#5b6e8b]"
                                        >
                                            Cargando departamentos…
                                        </td>
                                    </tr>
                                )}
                                {!loading && error && (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-7 py-14 text-center text-[#df353c]"
                                        >
                                            {error}
                                        </td>
                                    </tr>
                                )}
                                {!loading && !error && result.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-7 py-14 text-center text-[#5b6e8b]"
                                        >
                                            No se encontraron departamentos.
                                        </td>
                                    </tr>
                                )}
                                {!loading &&
                                    !error &&
                                    result.data.map((departamento) => (
                                        <tr key={departamento.id} className="text-base">
                                            <td className="border-b border-[#dfe5ee] px-7 py-6 font-bold text-[#071b3b]">
                                                {departamento.nombre}
                                            </td>
                                            <td className="border-b border-[#dfe5ee] px-5 py-6 text-[#5b6e8b]">
                                                <span className="block max-w-[360px] truncate">
                                                    {departamento.descripcion || "—"}
                                                </span>
                                            </td>
                                            <td className="border-b border-[#dfe5ee] px-5 py-6">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${departamento.activo ? "bg-[#c9f3dd] text-[#087947]" : "bg-[#f1f4f9] text-[#5b6e8b]"}`}
                                                >
                                                    {departamento.activo ? "Activo" : "Inactivo"}
                                                </span>
                                            </td>
                                            <td className="border-b border-[#dfe5ee] px-5 py-6 text-[#5b6e8b]">
                                                {formatDate(departamento.creado_en)}
                                            </td>
                                            <td className="border-b border-[#dfe5ee] px-7 py-6">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/empresas/departamentos/${departamento.id}`,
                                                            )
                                                        }
                                                        aria-label={`Ver ${departamento.nombre}`}
                                                        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-[#f1f4f9] text-[#071b3b] transition hover:bg-[#e4ebf6]"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </button>
                                                    {esAdmin && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                navigate(
                                                                    `/empresas/departamentos/${departamento.id}/editar`,
                                                                )
                                                            }
                                                            aria-label={`Editar ${departamento.nombre}`}
                                                            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-[#f1f4f9] text-[#071b3b] transition hover:bg-[#e4ebf6]"
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

                    <footer className="flex flex-col gap-4 px-7 py-5 text-[#5b6e8b] sm:flex-row sm:items-center sm:justify-between">
                        <p>
                            Mostrando {firstItem} a {lastItem} de{" "}
                            {result.total.toLocaleString("es-GT")} departamentos
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            <button
                                type="button"
                                disabled={loading || result.page <= 1}
                                onClick={() => setPage((current) => Math.max(1, current - 1))}
                                className="flex h-11 cursor-pointer items-center gap-1 rounded-2xl border border-[#dce3ee] px-4 font-semibold text-[#071b3b] disabled:cursor-not-allowed disabled:opacity-45"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Anterior</span>
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
                                <span className="hidden sm:inline">Siguiente</span>
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default Departamentos;