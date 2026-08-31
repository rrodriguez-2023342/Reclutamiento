import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Eye, Key, Pencil, Power } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import {
    activarUsuario,
    desactivarUsuario,
    getUsuarioById,
    resetPasswordUsuario,
} from "../../services/usuarios.service.js";

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : new Intl.DateTimeFormat("es-GT", { dateStyle: "long" }).format(date);
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

    useEffect(() => {
        let active = true;
        getUsuarioById(id)
            .then((data) => active && setUsuario(data))
            .catch((requestError) => {
                if (active) {
                    setError(
                        requestError.response?.data?.message ||
                            "No fue posible cargar el usuario.",
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
                ? "Usuario desactivado correctamente"
                : "Usuario activado correctamente";
            if (usuario.activo) {
                await desactivarUsuario(usuario.id);
            } else {
                await activarUsuario(usuario.id);
            }
            setSuccessMessage(msg);
            setModalAction(null);
            navigate("/usuarios", { state: { mensaje: msg } });
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
        if (!usuario) return;
        try {
            setActionLoading(true);
            await resetPasswordUsuario(usuario.id);
            setModalAction(null);
            setSuccessMessage("Se envió contraseña temporal al correo del usuario");
            navigate("/usuarios", {
                state: {
                mensaje: "Se envió contraseña temporal al correo del usuario",
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
        <DashboardLayout title="Detalle de Usuario">
            {loading && (
                <div className="rounded-[26px] bg-white p-12 text-center text-[#5b6e8b] shadow-[0_10px_24px_rgba(20,43,89,0.06)]">
                    Cargando usuario...
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
                        onClick={() => navigate("/usuarios")}
                        className="ml-3 cursor-pointer underline"
                    >
                        Volver a usuarios
                    </button>
                </div>
            )}

            {!loading && usuario && (
                <div className="mx-auto max-w-4xl">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <button
                            type="button"
                            onClick={() => navigate("/usuarios")}
                            className="flex h-11 cursor-pointer items-center gap-2 rounded-2xl border border-[#dce3ee] bg-white px-4 font-semibold text-[#071b3b] transition hover:bg-[#f0f4fa]"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Volver a usuarios
                        </button>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => navigate(`/usuarios/${usuario.id}/editar`)}
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
                                            ? "Desactivar usuario"
                                            : "Activar usuario",
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
                                        Información general del usuario
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
                            <div className="rounded-xl bg-[#f0f4fa] p-5 sm:col-span-2">
                                <p className="text-sm font-semibold text-[#5b6e8b]">
                                    Debe cambiar contraseña
                                </p>
                                <p className="mt-2 text-lg font-bold text-[#071b3b]">
                                    {usuario.mustChangePassword ? "Sí" : "No"}
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
        </DashboardLayout>
    );
}

export default DetalleUsuario;
