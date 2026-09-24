import { useEffect, useState } from "react";
import {
    ArrowLeft,
    CalendarDays,
    Clock,
    Eye,
    Key,
    Pencil,
    Power,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import {
    activarUsuario,
    desactivarUsuario,
    getUsuarioById,
    resetPasswordUsuario,
} from "../../services/usuarios.service.js";
import { getHistorialSueldo } from "../../services/historial-sueldo.service.js";
import { getHistorialEmpresa } from "../../services/historial-empresa.service.js";

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : new Intl.DateTimeFormat("es-GT", { dateStyle: "long" }).format(date);
}

function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return "—";
    const nacimiento = new Date(fechaNacimiento);
    if (Number.isNaN(nacimiento.getTime())) return "—";
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return `${edad} años`;
}

function traducirEnum(valor) {
    if (!valor) return "—";
    const traducciones = {
        MASCULINO: "Masculino",
        FEMENINO: "Femenino",
    };
    return traducciones[valor] || valor;
}

function isEmpty(valor) {
    return valor === null || valor === undefined || valor === "";
}

function formatCurrency(value) {
    if (value === null || value === undefined || value === "") return "—";
    const num = Number(value);
    if (Number.isNaN(num)) return "—";
    return num.toLocaleString("es-GT", { style: "currency", currency: "GTQ" });
}

function initialsFromName(name = "") {
    return (
        name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() || "")
            .join("") || "U"
    );
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
                        {loading ? "Procesando..." : "Confirmar"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function DetalleUsuario() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modalAction, setModalAction] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [showHistorial, setShowHistorial] = useState(false);
    const [showHistorialEmpresa, setShowHistorialEmpresa] = useState(false);

    useEffect(() => {
        let active = true;
        getUsuarioById(id)
            .then((data) => active && setUsuario(data))
            .catch((requestError) => {
                if (active) {
                    setError(
                        requestError.response?.data?.message ||
                            "No fue posible cargar el colaborador.",
                    );
                }
            })
            .finally(() => active && setLoading(false));

        return () => {
            active = false;
        };
    }, [id]);

    const handleToggleStatus = async () => {
        if (!usuario) return;
        try {
            setActionLoading(true);
            const msg = usuario.activo
                ? "Colaborador desactivado correctamente"
                : "Colaborador activado correctamente";
            if (usuario.activo) {
                await desactivarUsuario(usuario.id);
            } else {
                await activarUsuario(usuario.id);
            }
            setSuccessMessage(msg);
            setModalAction(null);
            navigate("/colaboradores", { state: { mensaje: msg } });
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "No fue posible cambiar el estado del colaborador.",
            );
            setModalAction(null);
        } finally {
            setActionLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!usuario) return;
        try {
            setActionLoading(true);
            await resetPasswordUsuario(usuario.id);
            setModalAction(null);
            setSuccessMessage(
                "Se envió contraseña temporal al correo del colaborador",
            );
            navigate("/colaboradores", {
                state: {
                    mensaje: "Se envió contraseña temporal al correo del colaborador",
                },
            });
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

    const handleActionConfirm = () => {
        if (!modalAction) return;
        if (modalAction.type === "reset") {
            handleResetPassword();
            return;
        }
        handleToggleStatus();
    };

    return (
        <DashboardLayout title="Detalle de Colaborador">
            {loading && (
                <div className="rounded-[26px] bg-white p-12 text-center text-[#5b6e8b] shadow-[0_10px_24px_rgba(20,43,89,0.06)]">
                    Cargando colaborador...
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
                        onClick={() => navigate("/colaboradores")}
                        className="ml-3 cursor-pointer underline"
                    >
                        Volver a colaboradores
                    </button>
                </div>
            )}

            {!loading && usuario && (
                <div className="mx-auto max-w-4xl">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <button
                            type="button"
                            onClick={() => navigate("/colaboradores")}
                            className="flex h-11 cursor-pointer items-center gap-2 rounded-2xl border border-[#dce3ee] bg-white px-4 font-semibold text-[#071b3b] transition hover:bg-[#f0f4fa]"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Volver a colaboradores
                        </button>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => navigate(`/colaboradores/${usuario.id}/editar`)}
                                className="flex h-12 cursor-pointer items-center gap-2 rounded-2xl bg-[#3162e9] px-5 font-bold text-white transition hover:bg-[#183fca]"
                            >
                                <Pencil className="h-5 w-5" />
                                Editar
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setModalAction({
                                        type: usuario.activo ? "desactivar" : "activar",
                                        title: usuario.activo
                                            ? "Desactivar colaborador"
                                            : "Activar colaborador",
                                        description: usuario.activo
                                            ? `¿Deseas desactivar a ${usuario.nombre}?`
                                            : `¿Deseas activar a ${usuario.nombre}?`,
                                    })
                                }
                                className="flex h-12 cursor-pointer items-center gap-2 rounded-2xl border border-[#dce3ee] bg-white px-4 font-bold text-[#071b3b] transition hover:bg-[#f0f4fa]"
                            >
                                <Power className="h-5 w-5" />
                                {usuario.activo ? "Desactivar" : "Activar"}
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setModalAction({
                                        type: "reset",
                                        title: "Resetear contraseña",
                                        description: `¿Deseas enviar una contraseña temporal a ${usuario.nombre}?`,
                                    })
                                }
                                className="flex h-12 cursor-pointer items-center gap-2 rounded-2xl border border-[#dce3ee] bg-white px-4 font-bold text-[#071b3b] transition hover:bg-[#f0f4fa]"
                            >
                                <Key className="h-5 w-5" />
                                Resetear contraseña
                            </button>
                        </div>
                    </div>

                    <section className="rounded-[26px] bg-white p-6 shadow-[0_10px_24px_rgba(20,43,89,0.06)] sm:p-8">
                        <div className="flex flex-col gap-5 border-b border-[#dce3ee] pb-7 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#f0f4fa] text-xl font-bold text-[#3162e9]">
                                    {initialsFromName(usuario.nombre)}
                                </span>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-[-0.04em] text-[#071b3b] sm:text-3xl">
                                        {usuario.nombre}
                                    </h1>
                                    <p className="mt-2 text-[#5b6e8b]">
                                        Información general del colaborador
                                    </p>
                                </div>
                            </div>

                            <span
                                className={`self-start rounded-full px-3 py-1 text-sm font-semibold ${usuario.activo ? "bg-[#c9f3dd] text-[#087947]" : "bg-[#f1f4f9] text-[#5b6e8b]"}`}
                            >
                                {usuario.activo ? "Activo" : "Inactivo"}
                            </span>
                        </div>

                        <div className="mt-7 grid gap-5 sm:grid-cols-2">
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">Correo</p>
                                <p className="mt-2 text-lg font-bold text-[#071b3b]">
                                    {usuario.correo}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">Rol</p>
                                <p className="mt-2 flex items-center gap-2 text-lg font-bold text-[#071b3b]">
                                    <Eye className="h-4 w-4 text-[#3162e9]" />
                                    {usuario.rol?.nombre || "Sin rol"}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">Estado</p>
                                <p className="mt-2 text-lg font-bold text-[#071b3b]">
                                    {usuario.activo ? "Activo" : "Inactivo"}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">
                                    Fecha de creación
                                </p>
                                <p className="mt-2 flex items-center gap-2 text-lg font-bold text-[#071b3b]">
                                    <CalendarDays className="h-4 w-4 text-[#3162e9]" />
                                    {formatDate(usuario.creado_en)}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="mt-6 rounded-[26px] bg-white p-6 shadow-[0_10px_24px_rgba(20,43,89,0.06)] sm:p-8">
                        <h2 className="text-lg font-bold text-[#071b3b]">
                            Datos personales
                        </h2>
                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">
                                    Fecha de nacimiento
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(usuario.fecha_nacimiento) ? "text-[#df353c]" : "text-[#071b3b]"}`}
                                >
                                    {formatDate(usuario.fecha_nacimiento)}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">Edad</p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(usuario.fecha_nacimiento) ? "text-[#df353c]" : "text-[#071b3b]"}`}
                                >
                                    {calcularEdad(usuario.fecha_nacimiento)}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">Sexo</p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(usuario.sexo) ? "text-[#df353c]" : "text-[#071b3b]"}`}
                                >
                                    {traducirEnum(usuario.sexo)}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">DPI</p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(usuario.dpi) ? "text-[#df353c]" : "text-[#071b3b]"}`}
                                >
                                    {usuario.dpi || "—"}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">
                                    Extendido en
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(usuario.dpi_extendido_en) ? "text-[#df353c]" : "text-[#071b3b]"}`}
                                >
                                    {usuario.dpi_extendido_en || "—"}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5 sm:col-span-2">
                                <p className="text-sm font-semibold text-[#5b6e8b]">
                                    Dirección
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(usuario.direccion) ? "text-[#df353c]" : "text-[#071b3b]"}`}
                                >
                                    {usuario.direccion || "—"}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="mt-6 rounded-[26px] bg-white p-6 shadow-[0_10px_24px_rgba(20,43,89,0.06)] sm:p-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[#071b3b]">
                                Empresa y patrono
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowHistorialEmpresa(true)}
                                className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#3162e9] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#183fca]"
                            >
                                <Clock className="h-4 w-4" />
                                Ver historial
                            </button>
                        </div>
                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">Empresa</p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(usuario.empresa) ? "text-[#df353c]" : "text-[#071b3b]"}`}
                                >
                                    {usuario.empresa?.nombre_empresa || "Sin empresa"}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">Patrono</p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(usuario.patrono) ? "text-[#df353c]" : "text-[#071b3b]"}`}
                                >
                                    {usuario.patrono?.razon_social || "Sin patrono"}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="mt-6 rounded-[26px] bg-white p-6 shadow-[0_10px_24px_rgba(20,43,89,0.06)] sm:p-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[#071b3b]">
                                Información económica
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowHistorial(true)}
                                className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#3162e9] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#183fca]"
                            >
                                <Clock className="h-4 w-4" />
                                Ver historial
                            </button>
                        </div>
                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">
                                    Sueldo Base
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(usuario.sueldo) ? "text-[#df353c]" : "text-[#071b3b]"}`}
                                >
                                    {formatCurrency(usuario.sueldo)}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">
                                    Bonificación decreto ley
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(usuario.bonos) ? "text-[#df353c]" : "text-[#071b3b]"}`}
                                >
                                    {formatCurrency(usuario.bonos)}
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            <Modal
                action={modalAction}
                loading={actionLoading}
                onClose={() => setModalAction(null)}
                onConfirm={handleActionConfirm}
            />

            {showHistorial && (
                <HistorialSueldoModal
                    usuarioId={usuario?.id}
                    onClose={() => setShowHistorial(false)}
                />
            )}

            {showHistorialEmpresa && (
                <HistorialEmpresaModal
                    usuarioId={usuario?.id}
                    onClose={() => setShowHistorialEmpresa(false)}
                />
            )}
        </DashboardLayout>
    );
}

function HistorialSueldoModal({ usuarioId, onClose }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!usuarioId) return;
        let active = true;
        setLoading(true);
        getHistorialSueldo(usuarioId, { page, limit: 10 })
            .then((result) => {
                if (active) {
                    setData(result?.data || []);
                    setTotalPages(result?.totalPages || 1);
                }
            })
            .catch(() => {
                if (active) setData([]);
            })
            .finally(() => active && setLoading(false));

        return () => {
            active = false;
        };
    }, [usuarioId, page]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#071b3b]/45 p-4"
            role="dialog"
            aria-modal="true"
        >
            <div className="w-full max-w-5xl max-h-[80vh] overflow-hidden rounded-[26px] bg-white shadow-2xl flex flex-col">
                <div className="flex items-center justify-between border-b border-[#dce3ee] px-6 py-4">
                    <h2 className="text-xl font-bold text-[#071b3b]">
                        Historial de sueldo base y bonificación decreto ley
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer text-[#5b6e8b] transition hover:text-[#071b3b]"
                    >
                        ✕
                    </button>
                </div>

                <div className="overflow-auto flex-1 p-6">
                    {loading ? (
                        <p className="text-center text-[#5b6e8b]">Cargando historial...</p>
                    ) : data.length === 0 ? (
                        <p className="text-center text-[#5b6e8b]">
                            No hay registros de cambios de sueldo base.
                        </p>
                    ) : (
                        <table className="w-full border-separate border-spacing-0 text-left text-sm">
                            <thead>
                                <tr className="text-base font-semibold text-[#5b6e8b]">
                                    <th className="border-b border-[#dfe5ee] px-4 py-3">Fecha</th>
                                    <th className="border-b border-[#dfe5ee] px-4 py-3">
                                        Sueldo base anterior
                                    </th>
                                    <th className="border-b border-[#dfe5ee] px-4 py-3">
                                        Sueldo base nuevo
                                    </th>
                                    <th className="border-b border-[#dfe5ee] px-4 py-3">
                                        Bonificación anterior
                                    </th>
                                    <th className="border-b border-[#dfe5ee] px-4 py-3">
                                        Bonificación nuevo
                                    </th>
                                    <th className="border-b border-[#dfe5ee] px-4 py-3">
                                        Motivo
                                    </th>
                                    <th className="border-b border-[#dfe5ee] px-4 py-3">
                                        Cambiado por
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item) => (
                                    <tr key={item.id} className="text-[#071b3b]">
                                        <td className="border-b border-[#dfe5ee] px-4 py-3 whitespace-nowrap">
                                            {formatDate(item.fecha_cambio)}
                                        </td>
                                        <td className="border-b border-[#dfe5ee] px-4 py-3">
                                            {formatCurrency(item.sueldo_anterior)}
                                        </td>
                                        <td className="border-b border-[#dfe5ee] px-4 py-3 font-semibold">
                                            {formatCurrency(item.sueldo_nuevo)}
                                        </td>
                                        <td className="border-b border-[#dfe5ee] px-4 py-3">
                                            {formatCurrency(item.bonos_anterior)}
                                        </td>
                                        <td className="border-b border-[#dfe5ee] px-4 py-3 font-semibold">
                                            {formatCurrency(item.bonos_nuevo)}
                                        </td>
                                        <td className="border-b border-[#dfe5ee] px-4 py-3">
                                            {item.motivo}
                                        </td>
                                        <td className="border-b border-[#dfe5ee] px-4 py-3">
                                            {item.cambiado_por?.nombre || "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 border-t border-[#dce3ee] px-6 py-4">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="cursor-pointer rounded-xl border border-[#dce3ee] px-4 py-2 text-sm font-semibold text-[#071b3b] transition hover:bg-[#f0f4fa] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-[#5b6e8b]">
                            Página {page} de {totalPages}
                        </span>
                        <button
                            type="button"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            className="cursor-pointer rounded-xl border border-[#dce3ee] px-4 py-2 text-sm font-semibold text-[#071b3b] transition hover:bg-[#f0f4fa] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function HistorialEmpresaModal({ usuarioId, onClose }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!usuarioId) return;
        let active = true;
        setLoading(true);
        getHistorialEmpresa(usuarioId, { page, limit: 10 })
            .then((result) => {
                if (active) {
                    setData(result?.data || []);
                    setTotalPages(result?.totalPages || 1);
                }
            })
            .catch(() => {
                if (active) setData([]);
            })
            .finally(() => active && setLoading(false));

        return () => {
            active = false;
        };
    }, [usuarioId, page]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#071b3b]/45 p-4"
            role="dialog"
            aria-modal="true"
        >
            <div className="w-full max-w-5xl max-h-[80vh] overflow-hidden rounded-[26px] bg-white shadow-2xl flex flex-col">
                <div className="flex items-center justify-between border-b border-[#dce3ee] px-6 py-4">
                    <h2 className="text-xl font-bold text-[#071b3b]">
                        Historial de cambios de empresa
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer text-[#5b6e8b] transition hover:text-[#071b3b]"
                    >
                        ✕
                    </button>
                </div>

                <div className="overflow-auto flex-1 p-6">
                    {loading ? (
                        <p className="text-center text-[#5b6e8b]">Cargando historial...</p>
                    ) : data.length === 0 ? (
                        <p className="text-center text-[#5b6e8b]">
                            No hay registros de cambios de empresa.
                        </p>
                    ) : (
                        <table className="w-full border-separate border-spacing-0 text-left text-sm">
                            <thead>
                                <tr className="text-base font-semibold text-[#5b6e8b]">
                                    <th className="border-b border-[#dfe5ee] px-4 py-3">Fecha</th>
                                    <th className="border-b border-[#dfe5ee] px-4 py-3">
                                        Empresa anterior
                                    </th>
                                    <th className="border-b border-[#dfe5ee] px-4 py-3">
                                        Empresa nueva
                                    </th>
                                    <th className="border-b border-[#dfe5ee] px-4 py-3">
                                        Motivo
                                    </th>
                                    <th className="border-b border-[#dfe5ee] px-4 py-3">
                                        Cambiado por
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item) => (
                                    <tr key={item.id} className="text-[#071b3b]">
                                        <td className="border-b border-[#dfe5ee] px-4 py-3 whitespace-nowrap">
                                            {formatDate(item.fecha_cambio)}
                                        </td>
                                        <td className="border-b border-[#dfe5ee] px-4 py-3">
                                            {item.empresa_anterior?.nombre_empresa || "Sin empresa"}
                                        </td>
                                        <td className="border-b border-[#dfe5ee] px-4 py-3 font-semibold">
                                            {item.empresa_nuevo?.nombre_empresa || "Sin empresa"}
                                        </td>
                                        <td className="border-b border-[#dfe5ee] px-4 py-3">
                                            {item.motivo}
                                        </td>
                                        <td className="border-b border-[#dfe5ee] px-4 py-3">
                                            {item.cambiado_por?.nombre || "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 border-t border-[#dce3ee] px-6 py-4">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="cursor-pointer rounded-xl border border-[#dce3ee] px-4 py-2 text-sm font-semibold text-[#071b3b] transition hover:bg-[#f0f4fa] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-[#5b6e8b]">
                            Página {page} de {totalPages}
                        </span>
                        <button
                            type="button"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            className="cursor-pointer rounded-xl border border-[#dce3ee] px-4 py-2 text-sm font-semibold text-[#071b3b] transition hover:bg-[#f0f4fa] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DetalleUsuario;
