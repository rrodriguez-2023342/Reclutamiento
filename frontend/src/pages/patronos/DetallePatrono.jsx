import { useEffect, useState } from "react";
import {
    ArrowLeft,
    CalendarDays,
    UserRound,
    Pencil,
    Power,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import {
    activarPatrono,
    desactivarPatrono,
    getPatronoById,
} from "../../services/patronos.service.js";

function formatDate(value) {
    if (!value) return "\u2014";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "\u2014"
        : new Intl.DateTimeFormat("es-GT", { dateStyle: "long" }).format(date);
}

function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return "\u2014";
    const nacimiento = new Date(fechaNacimiento);
    if (Number.isNaN(nacimiento.getTime())) return "\u2014";
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return `${edad} años`;
}

function traducirEnum(valor) {
    if (!valor) return "\u2014";
    const traducciones = {
        MASCULINO: "Masculino",
        FEMENINO: "Femenino",
        PREFIERO_NO_DECIRLO: "Prefiero no decirlo",
        SOLTERO: "Soltero (a)",
        CASADO: "Casado (a)",
        UNIDO: "Unido (a)",
        VIUDO: "Viudo (a)",
        DIVORCIADO: "Divorciado (a)",
    };
    return traducciones[valor] || valor;
}

function isEmpty(valor) {
    return valor === null || valor === undefined || valor === "";
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

function DetallePatrono() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patrono, setPatrono] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modalAction, setModalAction] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        let active = true;
        getPatronoById(id)
            .then((data) => active && setPatrono(data))
            .catch((requestError) => {
                if (active) {
                    setError(
                        requestError.response?.data?.message ||
                            "No fue posible cargar el patrono.",
                    );
                }
            })
            .finally(() => active && setLoading(false));

        return () => {
            active = false;
        };
    }, [id]);

    const handleToggleStatus = async () => {
        if (!patrono) return;
        try {
            setActionLoading(true);
            const msg = patrono.activo
                ? "Patrono desactivado correctamente"
                : "Patrono activado correctamente";
            if (patrono.activo) {
                await desactivarPatrono(patrono.id);
            } else {
                await activarPatrono(patrono.id);
            }
            setModalAction(null);
            navigate("/patronos", { state: { mensaje: msg } });
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "No fue posible cambiar el estado del patrono.",
            );
            setModalAction(null);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <DashboardLayout title="Detalle de Patrono">
            {loading && (
                <div className="rounded-[10px] border border-border bg-surface p-12 text-center text-text-soft shadow-none">
                    Cargando patrono...
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
                        onClick={() => navigate("/patronos")}
                        className="ml-3 cursor-pointer underline"
                    >
                        Volver a patronos
                    </button>
                </div>
            )}

            {!loading && patrono && (
                <div className="mx-auto max-w-4xl">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <button
                            type="button"
                            onClick={() => navigate("/patronos")}
                            className="flex h-11 cursor-pointer items-center gap-2 rounded-[10px] border border-border bg-surface px-4 font-semibold text-text-main transition hover:bg-neutral-bg"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Volver a patronos
                        </button>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => navigate(`/patronos/${patrono.id}/editar`)}
                                className="flex h-12 cursor-pointer items-center gap-2 rounded-[10px] bg-action px-5 font-bold text-white transition hover:bg-ink"
                            >
                                <Pencil className="h-5 w-5" />
                                Editar
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setModalAction({
                                        type: patrono.activo ? "desactivar" : "activar",
                                        title: patrono.activo
                                            ? "Desactivar patrono"
                                            : "Activar patrono",
                                        description: patrono.activo
                                            ? `¿Deseas desactivar a ${patrono.razon_social}?`
                                            : `¿Deseas activar a ${patrono.razon_social}?`,
                                    })
                                }
                                className="flex h-12 cursor-pointer items-center gap-2 rounded-[10px] border border-border bg-surface px-4 font-bold text-text-main transition hover:bg-neutral-bg"
                            >
                                <Power className="h-5 w-5" />
                                {patrono.activo ? "Desactivar" : "Activar"}
                            </button>
                        </div>
                    </div>

                    <section className="rounded-[10px] border border-border bg-surface p-6 shadow-none sm:p-8">
                        <div className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[10px] bg-neutral-bg text-xl font-bold text-action">
                                    <UserRound className="h-7 w-7" />
                                </span>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-[-0.04em] text-text-main sm:text-3xl">
                                        {patrono.razon_social}
                                    </h1>
                                    <p className="mt-2 text-text-soft">
                                        Información general del patrono
                                    </p>
                                </div>
                            </div>

                            <span
                                className={`self-start rounded-full px-3 py-1 text-sm font-semibold ${patrono.activo ? "bg-success-bg text-success" : "bg-danger-bg text-danger"}`}
                            >
                                {patrono.activo ? "Activo" : "Inactivo"}
                            </span>
                        </div>

                        <div className="mt-7 grid gap-5 sm:grid-cols-2">
                            <div className="rounded-[8px] bg-neutral-bg p-5">
                                <p className="text-sm font-semibold text-text-soft">
                                    Razón Social
                                </p>
                                <p className="mt-2 text-lg font-bold text-text-main">
                                    {patrono.razon_social}
                                </p>
                            </div>
                            <div className="rounded-[8px] bg-neutral-bg p-5">
                                <p className="text-sm font-semibold text-text-soft">Estado</p>
                                <p className="mt-2 text-lg font-bold text-text-main">
                                    {patrono.activo ? "Activo" : "Inactivo"}
                                </p>
                            </div>
                            <div className="rounded-[8px] bg-neutral-bg p-5">
                                <p
                                    className={`text-sm font-semibold ${isEmpty(patrono.numero_patronal) ? "text-danger" : "text-text-soft"}`}
                                >
                                    Número Patronal
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(patrono.numero_patronal) ? "text-danger" : "text-text-main"}`}
                                >
                                    {patrono.numero_patronal || "\u2014"}
                                </p>
                            </div>
                            <div className="rounded-[8px] bg-neutral-bg p-5">
                                <p
                                    className={`text-sm font-semibold ${isEmpty(patrono.nit) ? "text-danger" : "text-text-soft"}`}
                                >
                                    NIT del Representante
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(patrono.nit) ? "text-danger" : "text-text-main"}`}
                                >
                                    {patrono.nit || "\u2014"}
                                </p>
                            </div>
                            <div className="rounded-[8px] bg-neutral-bg p-5">
                                <p
                                    className={`text-sm font-semibold ${isEmpty(patrono.representante_legal) ? "text-danger" : "text-text-soft"}`}
                                >
                                    Representante Legal
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(patrono.representante_legal) ? "text-danger" : "text-text-main"}`}
                                >
                                    {patrono.representante_legal || "\u2014"}
                                </p>
                            </div>
                            <div className="rounded-[8px] bg-neutral-bg p-5">
                                <p
                                    className={`text-sm font-semibold ${isEmpty(patrono.dpi_representante) ? "text-danger" : "text-text-soft"}`}
                                >
                                    DPI Representante
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(patrono.dpi_representante) ? "text-danger" : "text-text-main"}`}
                                >
                                    {patrono.dpi_representante || "\u2014"}
                                </p>
                            </div>
                            <div className="rounded-[8px] bg-neutral-bg p-5">
                                <p
                                    className={`text-sm font-semibold ${isEmpty(patrono.fecha_vencimiento_dpi) ? "text-danger" : "text-text-soft"}`}
                                >
                                    Vencimiento DPI del Representante
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(patrono.fecha_vencimiento_dpi) ? "text-danger" : "text-text-main"}`}
                                >
                                    {formatDate(patrono.fecha_vencimiento_dpi)}
                                </p>
                            </div>
                            <div className="rounded-[8px] bg-neutral-bg p-5">
                                <p
                                    className={`text-sm font-semibold ${isEmpty(patrono.fecha_nacimiento) ? "text-danger" : "text-text-soft"}`}
                                >
                                    Fecha de Nacimiento del Representante
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(patrono.fecha_nacimiento) ? "text-danger" : "text-text-main"}`}
                                >
                                    {formatDate(patrono.fecha_nacimiento)}
                                </p>
                            </div>
                            <div className="rounded-[8px] bg-neutral-bg p-5">
                                <p className="text-sm font-semibold text-text-soft">
                                    Edad del Representante
                                </p>
                                <p className="mt-2 text-lg font-bold text-text-main">
                                    {calcularEdad(patrono.fecha_nacimiento)}
                                </p>
                            </div>
                            <div className="rounded-[8px] bg-neutral-bg p-5">
                                <p
                                    className={`text-sm font-semibold ${isEmpty(patrono.sexo) ? "text-danger" : "text-text-soft"}`}
                                >
                                    Sexo del Representante
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(patrono.sexo) ? "text-danger" : "text-text-main"}`}
                                >
                                    {traducirEnum(patrono.sexo)}
                                </p>
                            </div>
                            <div className="rounded-[8px] bg-neutral-bg p-5">
                                <p
                                    className={`text-sm font-semibold ${isEmpty(patrono.estado_civil) ? "text-danger" : "text-text-soft"}`}
                                >
                                    Estado Civil del Representante
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(patrono.estado_civil) ? "text-danger" : "text-text-main"}`}
                                >
                                    {traducirEnum(patrono.estado_civil)}
                                </p>
                            </div>
                            <div className="rounded-[8px] bg-neutral-bg p-5">
                                <p
                                    className={`text-sm font-semibold ${isEmpty(patrono.profesion) ? "text-danger" : "text-text-soft"}`}
                                >
                                    Profesión del Representante
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(patrono.profesion) ? "text-danger" : "text-text-main"}`}
                                >
                                    {patrono.profesion || "\u2014"}
                                </p>
                            </div>
                            <div className="rounded-[8px] bg-neutral-bg p-5">
                                <p
                                    className={`text-sm font-semibold ${isEmpty(patrono.telefono) ? "text-danger" : "text-text-soft"}`}
                                >
                                    Teléfono del Representante
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(patrono.telefono) ? "text-danger" : "text-text-main"}`}
                                >
                                    {patrono.telefono || "\u2014"}
                                </p>
                            </div>
                            <div className="rounded-[8px] bg-neutral-bg p-5">
                                <p
                                    className={`text-sm font-semibold ${isEmpty(patrono.correo) ? "text-danger" : "text-text-soft"}`}
                                >
                                    Correo electrónico del Representante
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(patrono.correo) ? "text-danger" : "text-text-main"}`}
                                >
                                    {patrono.correo || "\u2014"}
                                </p>
                            </div>
                            <div className="rounded-[8px] bg-neutral-bg p-5">
                                <p
                                    className={`text-sm font-semibold ${isEmpty(patrono.dpi_extendido_en) ? "text-danger" : "text-text-soft"}`}
                                >
                                    DPI Extendido en
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(patrono.dpi_extendido_en) ? "text-danger" : "text-text-main"}`}
                                >
                                    {patrono.dpi_extendido_en || "\u2014"}
                                </p>
                            </div>
                            <div className="rounded-[8px] bg-neutral-bg p-5 sm:col-span-2">
                                <p
                                    className={`text-sm font-semibold ${isEmpty(patrono.direccion) ? "text-danger" : "text-text-soft"}`}
                                >
                                    Dirección fiscal patronal
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(patrono.direccion) ? "text-danger" : "text-text-main"}`}
                                >
                                    {patrono.direccion || "\u2014"}
                                </p>
                            </div>
                            <div className="rounded-[8px] bg-neutral-bg p-5 sm:col-span-2">
                                <p
                                    className={`text-sm font-semibold ${isEmpty(patrono.direccion_patente_comercio) ? "text-danger" : "text-text-soft"}`}
                                >
                                    Dirección de la patente de comercio
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(patrono.direccion_patente_comercio) ? "text-danger" : "text-text-main"}`}
                                >
                                    {patrono.direccion_patente_comercio || "\u2014"}
                                </p>
                            </div>
                            <div className="rounded-[8px] bg-neutral-bg p-5">
                                <p
                                    className={`text-sm font-semibold ${isEmpty(patrono.fecha_autorizacion_acta) ? "text-danger" : "text-text-soft"}`}
                                >
                                    Fecha de autorización de acta
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(patrono.fecha_autorizacion_acta) ? "text-danger" : "text-text-main"}`}
                                >
                                    {formatDate(patrono.fecha_autorizacion_acta)}
                                </p>
                            </div>
                            <div className="rounded-[8px] bg-neutral-bg p-5">
                                <p
                                    className={`text-sm font-semibold ${isEmpty(patrono.autorizada_por_notario) ? "text-danger" : "text-text-soft"}`}
                                >
                                    Autorizada por el notario
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(patrono.autorizada_por_notario) ? "text-danger" : "text-text-main"}`}
                                >
                                    {patrono.autorizada_por_notario || "\u2014"}
                                </p>
                            </div>
                            <div className="rounded-[8px] bg-neutral-bg p-5">
                                <p
                                    className={`text-sm font-semibold ${isEmpty(patrono.numero_registro) ? "text-danger" : "text-text-soft"}`}
                                >
                                    No. de registro
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(patrono.numero_registro) ? "text-danger" : "text-text-main"}`}
                                >
                                    {patrono.numero_registro || "\u2014"}
                                </p>
                            </div>
                            <div className="rounded-[8px] bg-neutral-bg p-5">
                                <p
                                    className={`text-sm font-semibold ${isEmpty(patrono.numero_folio) ? "text-danger" : "text-text-soft"}`}
                                >
                                    No. de folio
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(patrono.numero_folio) ? "text-danger" : "text-text-main"}`}
                                >
                                    {patrono.numero_folio || "\u2014"}
                                </p>
                            </div>
                            <div className="rounded-[8px] bg-neutral-bg p-5">
                                <p
                                    className={`text-sm font-semibold ${isEmpty(patrono.numero_libro) ? "text-danger" : "text-text-soft"}`}
                                >
                                    No. de libro
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(patrono.numero_libro) ? "text-danger" : "text-text-main"}`}
                                >
                                    {patrono.numero_libro || "\u2014"}
                                </p>
                            </div>
                            <div className="rounded-[8px] bg-neutral-bg p-5 sm:col-span-2">
                                <p className="text-sm font-semibold text-text-soft">
                                    Fecha de creación
                                </p>
                                <p className="mt-2 flex items-center gap-2 text-lg font-bold text-text-main">
                                    <CalendarDays className="h-4 w-4 text-action" />
                                    {formatDate(patrono.creado_en)}
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
                onConfirm={handleToggleStatus}
            />
        </DashboardLayout>
    );
}

export default DetallePatrono;
