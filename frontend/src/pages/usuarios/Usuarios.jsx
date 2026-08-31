import { useEffect, useState } from "react";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Eye,
    Key,
    Pencil,
    Plus,
    Power,
    Search,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import {
    activarUsuario,
    desactivarUsuario,
    getRoles,
    getUsuarios,
    resetPasswordUsuario,
} from "../../services/usuarios.service.js";

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

function Usuarios() {
    const location = useLocation();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [rolId, setRolId] = useState("");
    const [activa, setActiva] = useState("");
    const [page, setPage] = useState(1);
    const [result, setResult] = useState({
        data: [],
        total: 0,
        page: 1,
        totalPages: 1,
    });
    const [roles, setRoles] = useState([]);
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
        getRoles()
            .then((data) => active && setRoles(data || []))
            .catch(() => active && setRoles([]));
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;
        setLoading(true);
        getUsuarios({
            page,
            limit: PAGE_SIZE,
            ...(debouncedSearch && { q: debouncedSearch }),
            ...(rolId && { rol_id: Number(rolId) }),
            ...(activa !== "" && { activa: activa === "true" }),
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
                            "No fue posible cargar los usuarios.",
                    );
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [page, debouncedSearch, rolId, activa, refreshKey]);

    const firstItem = result.total === 0 ? 0 : (result.page - 1) * PAGE_SIZE + 1;
    const lastItem = Math.min(result.page * PAGE_SIZE, result.total);

    const handleToggleStatus = async () => {
        if (!modalAction || !modalAction.user) return;
        const { user } = modalAction;
        try {
            setActionLoading(true);
            if (user.activo) {
                await desactivarUsuario(user.id);
            } else {
                await activarUsuario(user.id);
            }
            setModalAction(null);
            setRefreshKey((current) => current + 1);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "No fue posible cambiar el estado del usuario.",
            );
            setModalAction(null);
        } finally {
            setActionLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!modalAction || !modalAction.user) return;
        try {
            setActionLoading(true);
            await resetPasswordUsuario(modalAction.user.id);
            setModalAction(null);
            setSuccessMessage("Se envió contraseña temporal al correo del usuario");
            setRefreshKey((current) => current + 1);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "No fue posible restablecer la contraseña.",
            );
            setModalAction(null);
        } finally {
            setActionLoading(false);
        }
    };

    const handleModalConfirm = () => {
        if (!modalAction) return;
        if (modalAction.type === "reset") {
            handleResetPassword();
            return;
        }
        handleToggleStatus();
    };

    return (
        <DashboardLayout title="Gestión de Usuarios">
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
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_220px_auto]">
                    <label className="flex h-14 items-center gap-3 rounded-2xl border border-[#dce3ee] px-4 text-[#65758f] focus-within:border-[#3162e9] focus-within:ring-2 focus-within:ring-[#3162e9]/15">
                        <Search className="h-5 w-5 shrink-0" />
                        <input
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setPage(1);
                            }}
                            placeholder="Buscar por nombre o correo"
                            className="w-full bg-transparent text-base outline-none placeholder:text-[#91a0b7]"
                        />
                    </label>

                    <div className="relative">
                        <select
                            aria-label="Filtrar por rol"
                            value={rolId}
                            onChange={(event) => {
                                setRolId(event.target.value);
                                setPage(1);
                            }}
                            className="h-14 w-full appearance-none rounded-2xl border border-[#dce3ee] bg-white px-4 pr-10 text-base font-semibold text-[#071b3b] outline-none transition focus:border-[#3162e9] focus:ring-2 focus:ring-[#3162e9]/15"
                        >
                            <option value="">Rol: Todos</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.nombre}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#65758f]" />
                    </div>

                    <div className="relative">
                        <select
                            aria-label="Filtrar por estado"
                            value={activa}
                            onChange={(event) => {
                                setActiva(event.target.value);
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
                        onClick={() => navigate("/usuarios/nuevo")}
                        className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#3162e9] px-6 font-bold text-white shadow-[0_7px_16px_rgba(49,98,233,0.18)] transition hover:bg-[#183fca]"
                    >
                        <Plus className="h-5 w-5" />
                        Nuevo Usuario
                    </button>
                </div>
            </section>

            <section className="mt-7 overflow-hidden rounded-[26px] bg-white shadow-[0_10px_24px_rgba(20,43,89,0.06)]">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px] border-separate border-spacing-0 text-left">
                        <thead>
                            <tr className="text-base font-semibold text-[#5b6e8b]">
                                <th className="border-b border-[#dfe5ee] px-6 py-5 font-semibold">
                                    Nombre
                                </th>
                                <th className="border-b border-[#dfe5ee] px-5 py-5 font-semibold">
                                    Correo
                                </th>
                                <th className="border-b border-[#dfe5ee] px-5 py-5 font-semibold">
                                    Rol
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
                                        Cargando usuarios...
                                    </td>
                                </tr>
                            )}

                            {!loading && !error && result.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-6 py-12 text-center text-[#65758f]"
                                    >
                                        No hay usuarios que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            )}

                            {!loading &&
                                result.data.map((usuario) => (
                                    <tr key={usuario.id} className="align-middle text-[#071b3b]">
                                        <td className="border-b border-[#eef2f8] px-6 py-4 font-semibold">
                                            {usuario.nombre}
                                        </td>
                                        <td className="border-b border-[#eef2f8] px-5 py-4 text-[#5b6e8b]">
                                            {usuario.correo}
                                        </td>
                                        <td className="border-b border-[#eef2f8] px-5 py-4">
                                            <span className="rounded-full bg-[#edf3ff] px-2.5 py-1 text-xs font-bold text-[#234db8]">
                                                {usuario.rol?.nombre || "Sin rol"}
                                            </span>
                                        </td>
                                        <td className="border-b border-[#eef2f8] px-5 py-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-bold ${usuario.activo ? "bg-[#c9f3dd] text-[#087947]" : "bg-[#f1f4f9] text-[#5b6e8b]"}`}
                                            >
                                                {usuario.activo ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td className="border-b border-[#eef2f8] px-5 py-4 text-[#5b6e8b]">
                                            {formatDate(usuario.creado_en)}
                                        </td>
                                        <td className="border-b border-[#eef2f8] px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/usuarios/${usuario.id}`)}
                                                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#dce3ee] bg-white text-[#071b3b] transition hover:bg-[#f0f4fa]"
                                                    aria-label={`Ver detalle de ${usuario.nombre}`}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(`/usuarios/${usuario.id}/editar`)
                                                    }
                                                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#dce3ee] bg-white text-[#071b3b] transition hover:bg-[#f0f4fa]"
                                                    aria-label={`Editar ${usuario.nombre}`}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setModalAction({
                                                            type: usuario.activo ? "desactivar" : "activar",
                                                            user: usuario,
                                                            title: usuario.activo
                                                                ? "Desactivar usuario"
                                                                : "Activar usuario",
                                                            description: usuario.activo
                                                                ? `¿Deseas desactivar a ${usuario.nombre}?`
                                                                : `¿Deseas activar a ${usuario.nombre}?`,
                                                            confirmText: usuario.activo
                                                                ? "Desactivar"
                                                                : "Activar",
                                                        })
                                                    }
                                                    disabled={actionLoading}
                                                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#dce3ee] bg-white text-[#071b3b] transition hover:bg-[#f0f4fa] disabled:cursor-not-allowed disabled:opacity-60"
                                                    aria-label={
                                                        usuario.activo
                                                            ? `Desactivar ${usuario.nombre}`
                                                            : `Activar ${usuario.nombre}`
                                                    }
                                                >
                                                    <Power className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setModalAction({
                                                            type: "reset",
                                                            user: usuario,
                                                            title: "Resetear contraseña",
                                                            description: `¿Deseas enviar una contraseña temporal a ${usuario.nombre}?`,
                                                            confirmText: "Enviar",
                                                        })
                                                    }
                                                    disabled={actionLoading}
                                                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#dce3ee] bg-white text-[#071b3b] transition hover:bg-[#f0f4fa] disabled:cursor-not-allowed disabled:opacity-60"
                                                    aria-label={`Resetear contraseña de ${usuario.nombre}`}
                                                >
                                                    <Key className="h-4 w-4" />
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
                    {result.total.toLocaleString("es-GT")} usuarios
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
                onConfirm={handleModalConfirm}
            />
        </DashboardLayout>
    );
}

export default Usuarios;
