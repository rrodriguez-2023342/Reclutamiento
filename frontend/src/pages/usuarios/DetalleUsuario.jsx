import { useEffect, useState } from "react";
import {
    ArrowLeft,
    Briefcase,
    CalendarDays,
    Clock,
    Eye,
    FileText,
    Key,
    Pencil,
    Power,
    Shield,
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
        SOLTERO: "Soltero(a)",
        CASADO: "Casado(a)",
        UNIDO: "Unido(a)",
        VIUDO: "Viudo(a)",
        DIVORCIADO: "Divorciado(a)",
        PRIMARIA: "Primaria",
        BASICOS: "Básicos",
        DIVERSIFICADO: "Diversificado",
        TECNICO: "Técnico",
        LICENCIATURA: "Licenciatura",
        MAESTRIA: "Maestría",
        OTRO: "Otro",
    };
    return traducciones[valor] || valor;
}

function isEmpty(valor) {
    return valor === null || valor === undefined || valor === "";
}

function formatCurrency(value, moneda = "QUETZAL") {
    if (value === null || value === undefined || value === "") return "—";
    const num = Number(value);
    if (Number.isNaN(num)) return "—";
    return num.toLocaleString("es-GT", {
        style: "currency",
        currency: moneda === "DOLAR" ? "USD" : "GTQ",
    });
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4"
            role="dialog"
            aria-modal="true"
        >
            <div className="w-full max-w-md rounded-[10px] border border-border bg-surface p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-text-main">{action.title}</h2>
                <p className="mt-2 text-text-soft">{action.description}</p>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-[8px] border border-border px-4 py-2.5 font-semibold text-text-main cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="rounded-[8px] bg-action px-4 py-2.5 font-bold text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
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
                <div className="rounded-[10px] border border-border bg-surface p-12 text-center text-text-soft shadow-none">
                    Cargando colaborador...
                </div>
            )}

            {!loading && error && (
                <div
                    role="alert"
                    className="rounded-[10px] border border-danger bg-danger-bg p-6 font-semibold text-danger"
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
                            className="flex h-11 cursor-pointer items-center gap-2 rounded-[10px] border border-border bg-surface px-4 font-semibold text-text-main transition hover:bg-neutral-bg"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Volver a colaboradores
                        </button>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => navigate(`/informes?colaborador=${usuario.id}`)}
                                className="flex h-12 cursor-pointer items-center gap-2 rounded-[10px] border border-border bg-surface px-4 font-bold text-text-main transition hover:bg-neutral-bg"
                            >
                                <FileText className="h-5 w-5" />
                                Generar documento
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(`/colaboradores/${usuario.id}/editar`)}
                                className="flex h-12 cursor-pointer items-center gap-2 rounded-[10px] bg-action px-5 font-bold text-white transition hover:bg-ink"
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
                                className="flex h-12 cursor-pointer items-center gap-2 rounded-[10px] border border-border bg-surface px-4 font-bold text-text-main transition hover:bg-neutral-bg"
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
                                className="flex h-12 cursor-pointer items-center gap-2 rounded-[10px] border border-border bg-surface px-4 font-bold text-text-main transition hover:bg-neutral-bg"
                            >
                                <Key className="h-5 w-5" />
                                Resetear contraseña
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <section className="rounded-[10px] border border-border bg-surface p-6 shadow-none sm:p-8">
                            <div className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[10px] bg-neutral-bg text-xl font-bold text-action">
                                        {initialsFromName(usuario.nombre)}
                                    </span>
                                    <div>
                                        <h1 className="text-2xl font-bold tracking-[-0.04em] text-text-main sm:text-3xl">
                                            {usuario.nombre}
                                        </h1>
                                        <p className="mt-2 text-text-soft">
                                            Información general del colaborador
                                        </p>
                                    </div>
                                </div>

                                <span
                                    className={`self-start rounded-full px-3 py-1 text-sm font-semibold ${usuario.activo ? "bg-success-bg text-success" : "bg-danger-bg text-danger"}`}
                                >
                                    {usuario.activo ? "Activo" : "Inactivo"}
                                </span>
                            </div>

                            <div className="mt-7 grid gap-5 sm:grid-cols-2">
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">Correo</p>
                                    <p className="mt-2 text-lg font-bold text-text-main">
                                        {usuario.correo || "—"}
                                    </p>
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">Usuario</p>
                                    <p className="mt-2 text-lg font-bold text-text-main">
                                        {usuario.usuario || "—"}
                                    </p>
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">Rol</p>
                                    <p className="mt-2 flex items-center gap-2 text-lg font-bold text-text-main">
                                        <Eye className="h-4 w-4 text-action" />
                                        {usuario.rol?.nombre || "Sin rol"}
                                    </p>
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">Estado</p>
                                    <p className="mt-2 text-lg font-bold text-text-main">
                                        {usuario.activo ? "Activo" : "Inactivo"}
                                    </p>
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">
                                        Fecha de creación
                                    </p>
                                    <p className="mt-2 flex items-center gap-2 text-lg font-bold text-text-main">
                                        <CalendarDays className="h-4 w-4 text-action" />
                                        {formatDate(usuario.creado_en)}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-[10px] border border-border bg-surface p-6 shadow-none sm:p-8">
                            <h2 className="text-lg font-bold text-text-main">
                                Datos personales
                            </h2>
                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">
                                        Fecha de nacimiento
                                    </p>
                                    <p
                                        className={`mt-2 text-lg font-bold ${isEmpty(usuario.fecha_nacimiento) ? "text-danger" : "text-text-main"}`}
                                    >
                                        {formatDate(usuario.fecha_nacimiento)}
                                    </p>
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">Edad</p>
                                    <p
                                        className={`mt-2 text-lg font-bold ${isEmpty(usuario.fecha_nacimiento) ? "text-danger" : "text-text-main"}`}
                                    >
                                        {calcularEdad(usuario.fecha_nacimiento)}
                                    </p>
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">
                                        Fecha de contratación
                                    </p>
                                    <p
                                        className={`mt-2 text-lg font-bold ${isEmpty(usuario.fecha_contratacion) ? "text-danger" : "text-text-main"}`}
                                    >
                                        {formatDate(usuario.fecha_contratacion)}
                                    </p>
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">
                                        Tipo de contrato
                                    </p>
                                    <p className="mt-2 text-lg font-bold text-text-main">
                                        {usuario.tipo_contrato === "DEFINIDO"
                                            ? "Definido"
                                            : "Indefinido"}
                                    </p>
                                    {usuario.tipo_contrato === "DEFINIDO" && (
                                        <p className="mt-2 text-sm text-text-soft">
                                            Finaliza:{" "}
                                            <span className="font-semibold text-text-main">
                                                {formatDate(usuario.fecha_fin_contrato)}
                                            </span>
                                        </p>
                                    )}
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">Sexo</p>
                                    <p
                                        className={`mt-2 text-lg font-bold ${isEmpty(usuario.sexo) ? "text-danger" : "text-text-main"}`}
                                    >
                                        {traducirEnum(usuario.sexo)}
                                    </p>
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">Estado civil</p>
                                    <p className="mt-2 text-lg font-bold text-text-main">
                                        {traducirEnum(usuario.estado_civil)}
                                    </p>
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">Nacionalidad</p>
                                    <p className="mt-2 text-lg font-bold text-text-main">
                                        {usuario.nacionalidad || "—"}
                                    </p>
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">Teléfono</p>
                                    <p className="mt-2 text-lg font-bold text-text-main">
                                        {usuario.telefono || "—"}
                                    </p>
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">Último grado cursado</p>
                                    <p className="mt-2 text-lg font-bold text-text-main">
                                        {traducirEnum(usuario.ultimo_grado_cursado)}
                                    </p>
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">DPI</p>
                                    <p
                                        className={`mt-2 text-lg font-bold ${isEmpty(usuario.dpi) ? "text-danger" : "text-text-main"}`}
                                    >
                                        {usuario.dpi || "—"}
                                    </p>
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">NIT</p>
                                    <p
                                        className={`mt-2 text-lg font-bold ${isEmpty(usuario.nit) ? "text-danger" : "text-text-main"}`}
                                    >
                                        {usuario.nit || "—"}
                                    </p>
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">
                                        No. de afiliación IGSS
                                    </p>
                                    <p
                                        className={`mt-2 text-lg font-bold ${isEmpty(usuario.numero_afiliacion_igss) ? "text-danger" : "text-text-main"}`}
                                    >
                                        {usuario.numero_afiliacion_igss || "—"}
                                    </p>
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">
                                        Extendido en
                                    </p>
                                    <p
                                        className={`mt-2 text-lg font-bold ${isEmpty(usuario.dpi_extendido_en) ? "text-danger" : "text-text-main"}`}
                                    >
                                        {usuario.dpi_extendido_en || "—"}
                                    </p>
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5 sm:col-span-2">
                                    <p className="text-sm font-semibold text-text-soft">
                                        Dirección
                                    </p>
                                    <p
                                        className={`mt-2 text-lg font-bold ${isEmpty(usuario.direccion) ? "text-danger" : "text-text-main"}`}
                                    >
                                        {usuario.direccion || "—"}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="mt-6 rounded-[10px] border border-border bg-surface p-6 shadow-none sm:p-8">
                            <h2 className="text-lg font-bold text-text-main">
                                Información bancaria
                            </h2>
                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">Banco</p>
                                    <p className="mt-2 text-lg font-bold text-text-main">{usuario.banco || "—"}</p>
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">Tipo de cuenta</p>
                                    <p className="mt-2 text-lg font-bold text-text-main">{usuario.tipo_cuenta_bancaria || "—"}</p>
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5 sm:col-span-2">
                                    <p className="text-sm font-semibold text-text-soft">No. de cuenta bancaria</p>
                                    <p className="mt-2 text-lg font-bold text-text-main">{usuario.numero_cuenta_bancaria || "—"}</p>
                                </div>
                            </div>
                        </section>

                        <section className="mt-6 rounded-[10px] border border-border bg-surface p-6 shadow-none sm:p-8">
                            <h2 className="text-lg font-bold text-text-main">
                                Contacto de emergencia
                            </h2>
                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">Nombre</p>
                                    <p className="mt-2 text-lg font-bold text-text-main">{usuario.contacto_emergencia_nombre || "—"}</p>
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">Teléfono</p>
                                    <p className="mt-2 text-lg font-bold text-text-main">{usuario.contacto_emergencia_telefono || "—"}</p>
                                </div>
                            </div>
                        </section>

                        {(usuario.fecha_baja || usuario.motivo_baja || usuario.notas_baja || usuario.reingreso_baja !== null) && (
                            <section className="mt-6 rounded-[10px] border border-border bg-surface p-6 shadow-none sm:p-8">
                                <h2 className="text-lg font-bold text-text-main">Datos de baja</h2>
                                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                    <div className="rounded-[8px] bg-neutral-bg p-5">
                                        <p className="text-sm font-semibold text-text-soft">Fecha de baja</p>
                                        <p className="mt-2 text-lg font-bold text-text-main">{formatDate(usuario.fecha_baja)}</p>
                                    </div>
                                    <div className="rounded-[8px] bg-neutral-bg p-5">
                                        <p className="text-sm font-semibold text-text-soft">Motivo</p>
                                        <p className="mt-2 text-lg font-bold text-text-main">{usuario.motivo_baja || "—"}</p>
                                    </div>
                                    <div className="rounded-[8px] bg-neutral-bg p-5">
                                        <p className="text-sm font-semibold text-text-soft">¿Puede reingresar?</p>
                                        <p className="mt-2 text-lg font-bold text-text-main">
                                            {usuario.reingreso_baja == null
                                                ? "—"
                                                : usuario.reingreso_baja
                                                  ? "Sí"
                                                  : "No"}
                                        </p>
                                    </div>
                                    <div className="rounded-[8px] bg-neutral-bg p-5 sm:col-span-2">
                                        <p className="text-sm font-semibold text-text-soft">Notas</p>
                                        <p className="mt-2 whitespace-pre-wrap text-text-main">{usuario.notas_baja || "—"}</p>
                                    </div>
                                </div>
                            </section>
                        )}

                        <section className="mt-6 rounded-[10px] border border-border bg-surface p-6 shadow-none sm:p-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-text-main">
                                    Empresa y patrono
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setShowHistorialEmpresa(true)}
                                    className="flex cursor-pointer items-center gap-2 rounded-[8px] bg-action px-4 py-2 text-sm font-bold text-white transition hover:bg-ink"
                                >
                                    <Clock className="h-4 w-4" />
                                    Ver historial
                                </button>
                            </div>
                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">
                                        Empresa
                                    </p>
                                    <p
                                        className={`mt-2 text-lg font-bold ${isEmpty(usuario.empresa) ? "text-danger" : "text-text-main"}`}
                                    >
                                        {usuario.empresa?.nombre_empresa || "Sin empresa"}
                                    </p>
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">
                                        Patrono
                                    </p>
                                    <p
                                        className={`mt-2 text-lg font-bold ${isEmpty(usuario.patrono) ? "text-danger" : "text-text-main"}`}
                                    >
                                        {usuario.patrono?.razon_social || "Sin patrono"}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="mt-6 rounded-[10px] border border-border bg-surface p-6 shadow-none sm:p-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-text-main">
                                    Información económica
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setShowHistorial(true)}
                                    className="flex cursor-pointer items-center gap-2 rounded-[8px] bg-action px-4 py-2 text-sm font-bold text-white transition hover:bg-ink"
                                >
                                    <Clock className="h-4 w-4" />
                                    Ver historial
                                </button>
                            </div>
                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">
                                        Sueldo Base
                                    </p>
                                    <p
                                        className={`mt-2 text-lg font-bold ${isEmpty(usuario.sueldo) ? "text-danger" : "text-text-main"}`}
                                    >
                                        {formatCurrency(usuario.sueldo, usuario.moneda_sueldo)}
                                    </p>
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">
                                        Bonificación decreto ley
                                    </p>
                                    <p
                                        className={`mt-2 text-lg font-bold ${isEmpty(usuario.bonos) ? "text-danger" : "text-text-main"}`}
                                    >
                                        {formatCurrency(usuario.bonos, usuario.moneda_sueldo)}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="mt-6 rounded-[10px] border border-border bg-surface p-6 shadow-none sm:p-8">
                            <div className="flex items-center gap-3">
                                <Shield className="h-6 w-6 text-action" />
                                <h2 className="text-lg font-bold text-text-main">Seguros</h2>
                            </div>
                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">
                                        Seguro de Gastos Médicos
                                    </p>
                                    <p
                                        className={`mt-2 text-lg font-bold ${!usuario.tiene_seguro_gastos_medicos ? "text-danger" : "text-text-main"}`}
                                    >
                                        {usuario.tiene_seguro_gastos_medicos ? "Sí" : "No"}
                                    </p>
                                    {usuario.tiene_seguro_gastos_medicos && (
                                        <>
                                            <p className="mt-2 text-sm text-text-soft">
                                                Empresa:{" "}
                                                <span className="font-semibold text-text-main">
                                                    {usuario.empresa_seguro_gastos_medicos || "—"}
                                                </span>
                                            </p>
                                            <p className="mt-2 text-sm text-text-soft">
                                                Modalidad:{" "}
                                                <span className="font-semibold text-text-main">
                                                    {usuario.tipo_seguro_gastos_medicos || "—"}
                                                </span>
                                            </p>
                                            <p className="mt-2 text-sm text-text-soft">
                                                Categoría:{" "}
                                                <span className="font-semibold text-text-main">
                                                    {usuario.categoria_seguro_gastos_medicos || "—"}
                                                </span>
                                            </p>
                                        </>
                                    )}
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">
                                        Seguro de Vida
                                    </p>
                                    <p
                                        className={`mt-2 text-lg font-bold ${!usuario.tiene_seguro_vida ? "text-danger" : "text-text-main"}`}
                                    >
                                        {usuario.tiene_seguro_vida ? "Sí" : "No"}
                                    </p>
                                    {usuario.tiene_seguro_vida && (
                                        <>
                                            <p className="mt-2 text-sm text-text-soft">
                                                Empresa:{" "}
                                                <span className="font-semibold text-text-main">
                                                    {usuario.empresa_seguro_vida || "—"}
                                                </span>
                                            </p>
                                            <p className="mt-2 text-sm text-text-soft">
                                                Categoría:{" "}
                                                <span className="font-semibold text-text-main">
                                                    {usuario.categoria_seguro_vida || "—"}
                                                </span>
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="mt-6 rounded-[10px] border border-border bg-surface p-6 shadow-none sm:p-8">
                            <div className="flex items-center gap-3">
                                <Briefcase className="h-6 w-6 text-action" />
                                <h2 className="text-lg font-bold text-text-main">Puesto</h2>
                            </div>
                            <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">Puesto</p>
                                    <p
                                        className={`mt-2 text-lg font-bold ${isEmpty(usuario.puesto) ? "text-danger" : "text-text-main"}`}
                                    >
                                        {usuario.puesto?.nombre || "Sin puesto"}
                                    </p>
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">Departamento</p>
                                    <p className="mt-2 text-lg font-bold text-text-main">
                                        {usuario.puesto?.departamento?.nombre || "—"}
                                    </p>
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">
                                        Descripción
                                    </p>
                                    <p
                                        className={`mt-2 text-lg font-bold ${isEmpty(usuario.puesto?.descripcion) ? "text-danger" : "text-text-main"}`}
                                    >
                                        {usuario.puesto?.descripcion || "—"}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
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
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!usuarioId) return;
        let active = true;
        getHistorialSueldo(usuarioId, { page, limit: 10 })
            .then((result) => {
                if (active) {
                    setData(result?.data || []);
                    setTotalPages(result?.totalPages || 1);
                }
            })
            .catch((requestError) => {
                if (active) {
                    setData([]);
                    setError(requestError.response?.data?.message || "No fue posible cargar el historial de sueldos.");
                }
            })
            .finally(() => active && setLoading(false));

        return () => {
            active = false;
        };
    }, [usuarioId, page]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4"
            role="dialog"
            aria-modal="true"
        >
            <div className="w-full max-w-5xl max-h-[80vh] overflow-hidden rounded-[10px] border border-border bg-surface shadow-2xl flex flex-col">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <h2 className="text-xl font-bold text-text-main">
                        Historial de sueldo base y bonificación decreto ley
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer text-text-soft transition hover:text-text-main"
                    >
                        ✕
                    </button>
                </div>

                <div className="overflow-auto flex-1 p-6">
                    {error && <p role="alert" className="mb-4 rounded-[8px] bg-danger-bg px-4 py-3 text-sm font-semibold text-danger">{error}</p>}
                    {loading ? (
                        <p className="text-center text-text-soft">Cargando historial...</p>
                    ) : data.length === 0 ? (
                        <p className="text-center text-text-soft">
                            No hay registros de cambios de sueldo base.
                        </p>
                    ) : (
                        <table className="w-full border-separate border-spacing-0 text-left text-sm">
                            <thead>
                                <tr className="text-base font-semibold text-text-soft">
                                    <th className="border-b border-border px-4 py-3">Fecha</th>
                                    <th className="border-b border-border px-4 py-3">
                                        Sueldo base anterior
                                    </th>
                                    <th className="border-b border-border px-4 py-3">
                                        Sueldo base nuevo
                                    </th>
                                    <th className="border-b border-border px-4 py-3">
                                        Bonificación anterior
                                    </th>
                                    <th className="border-b border-border px-4 py-3">
                                        Bonificación nuevo
                                    </th>
                                    <th className="border-b border-border px-4 py-3">
                                        Motivo
                                    </th>
                                    <th className="border-b border-border px-4 py-3">
                                        Cambiado por
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item) => (
                                    <tr key={item.id} className="text-text-main">
                                        <td className="border-b border-border px-4 py-3 whitespace-nowrap">
                                            {formatDate(item.fecha_cambio)}
                                        </td>
                                        <td className="border-b border-border px-4 py-3">
                                            {formatCurrency(item.sueldo_anterior)}
                                        </td>
                                        <td className="border-b border-border px-4 py-3 font-semibold">
                                            {formatCurrency(item.sueldo_nuevo)}
                                        </td>
                                        <td className="border-b border-border px-4 py-3">
                                            {formatCurrency(item.bonos_anterior)}
                                        </td>
                                        <td className="border-b border-border px-4 py-3 font-semibold">
                                            {formatCurrency(item.bonos_nuevo)}
                                        </td>
                                        <td className="border-b border-border px-4 py-3">
                                            {item.motivo}
                                        </td>
                                        <td className="border-b border-border px-4 py-3">
                                            {item.cambiado_por?.nombre || "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 border-t border-border px-6 py-4">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="cursor-pointer rounded-[8px] border border-border px-4 py-2 text-sm font-semibold text-text-main transition hover:bg-neutral-bg disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-text-soft">
                            Página {page} de {totalPages}
                        </span>
                        <button
                            type="button"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            className="cursor-pointer rounded-[8px] border border-border px-4 py-2 text-sm font-semibold text-text-main transition hover:bg-neutral-bg disabled:cursor-not-allowed disabled:opacity-60"
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
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!usuarioId) return;
        let active = true;
        getHistorialEmpresa(usuarioId, { page, limit: 10 })
            .then((result) => {
                if (active) {
                    setData(result?.data || []);
                    setTotalPages(result?.totalPages || 1);
                }
            })
            .catch((requestError) => {
                if (active) {
                    setData([]);
                    setError(requestError.response?.data?.message || "No fue posible cargar el historial de empresas.");
                }
            })
            .finally(() => active && setLoading(false));

        return () => {
            active = false;
        };
    }, [usuarioId, page]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4"
            role="dialog"
            aria-modal="true"
        >
            <div className="w-full max-w-5xl max-h-[80vh] overflow-hidden rounded-[10px] border border-border bg-surface shadow-2xl flex flex-col">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <h2 className="text-xl font-bold text-text-main">
                        Historial de cambios de empresa
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer text-text-soft transition hover:text-text-main"
                    >
                        ✕
                    </button>
                </div>

                <div className="overflow-auto flex-1 p-6">
                    {error && <p role="alert" className="mb-4 rounded-[8px] bg-danger-bg px-4 py-3 text-sm font-semibold text-danger">{error}</p>}
                    {loading ? (
                        <p className="text-center text-text-soft">Cargando historial...</p>
                    ) : data.length === 0 ? (
                        <p className="text-center text-text-soft">
                            No hay registros de cambios de empresa.
                        </p>
                    ) : (
                        <table className="w-full border-separate border-spacing-0 text-left text-sm">
                            <thead>
                                <tr className="text-base font-semibold text-text-soft">
                                    <th className="border-b border-border px-4 py-3">Fecha</th>
                                    <th className="border-b border-border px-4 py-3">
                                        Empresa anterior
                                    </th>
                                    <th className="border-b border-border px-4 py-3">
                                        Empresa nueva
                                    </th>
                                    <th className="border-b border-border px-4 py-3">
                                        Motivo
                                    </th>
                                    <th className="border-b border-border px-4 py-3">
                                        Cambiado por
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item) => (
                                    <tr key={item.id} className="text-text-main">
                                        <td className="border-b border-border px-4 py-3 whitespace-nowrap">
                                            {formatDate(item.fecha_cambio)}
                                        </td>
                                        <td className="border-b border-border px-4 py-3">
                                            {item.empresa_anterior?.nombre_empresa || "Sin empresa"}
                                        </td>
                                        <td className="border-b border-border px-4 py-3 font-semibold">
                                            {item.empresa_nuevo?.nombre_empresa || "Sin empresa"}
                                        </td>
                                        <td className="border-b border-border px-4 py-3">
                                            {item.motivo}
                                        </td>
                                        <td className="border-b border-border px-4 py-3">
                                            {item.cambiado_por?.nombre || "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 border-t border-border px-6 py-4">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => p - 1)}
                            className="cursor-pointer rounded-[8px] border border-border px-4 py-2 text-sm font-semibold text-text-main transition hover:bg-neutral-bg disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-text-soft">
                            Página {page} de {totalPages}
                        </span>
                        <button
                            type="button"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            className="cursor-pointer rounded-[8px] border border-border px-4 py-2 text-sm font-semibold text-text-main transition hover:bg-neutral-bg disabled:cursor-not-allowed disabled:opacity-60"
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
