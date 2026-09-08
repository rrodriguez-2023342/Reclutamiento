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
        SOLTERO: "Soltero (a)",
        CASADO: "Casado (a)",
        UNIDO: "Unido (a)",
        VIUDO: "Viudo (a)",
        DIVORCIADO: "Divorciado (a)",
    };
    return traducciones[valor] || valor;
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
                <div className="rounded-[26px] bg-white p-12 text-center text-[#5b6e8b] shadow-[0_10px_24px_rgba(20,43,89,0.06)]">
                    Cargando patrono...
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
                            className="flex h-11 cursor-pointer items-center gap-2 rounded-2xl border border-[#dce3ee] bg-white px-4 font-semibold text-[#071b3b] transition hover:bg-[#f0f4fa]"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Volver a patronos
                        </button>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => navigate(`/patronos/${patrono.id}/editar`)}
                                className="flex h-12 cursor-pointer items-center gap-2 rounded-2xl bg-[#3162e9] px-5 font-bold text-white transition hover:bg-[#183fca]"
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
                                className="flex h-12 cursor-pointer items-center gap-2 rounded-2xl border border-[#dce3ee] bg-white px-4 font-bold text-[#071b3b] transition hover:bg-[#f0f4fa]"
                            >
                                <Power className="h-5 w-5" />
                                {patrono.activo ? "Desactivar" : "Activar"}
                            </button>
                        </div>
                    </div>

                    <section className="rounded-[26px] bg-white p-6 shadow-[0_10px_24px_rgba(20,43,89,0.06)] sm:p-8">
                        <div className="flex flex-col gap-5 border-b border-[#dce3ee] pb-7 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#f0f4fa] text-xl font-bold text-[#3162e9]">
                                    <UserRound className="h-7 w-7" />
                                </span>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-[-0.04em] text-[#071b3b] sm:text-3xl">
                                        {patrono.razon_social}
                                    </h1>
                                    <p className="mt-2 text-[#5b6e8b]">
                                        Información general del patrono
                                    </p>
                                </div>
                            </div>

                            <span
                                className={`self-start rounded-full px-3 py-1 text-sm font-semibold ${patrono.activo ? "bg-[#c9f3dd] text-[#087947]" : "bg-[#f1f4f9] text-[#5b6e8b]"}`}
                            >
                                {patrono.activo ? "Activo" : "Inactivo"}
                            </span>
                        </div>

                        <div className="mt-7 grid gap-5 sm:grid-cols-2">
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">
                                    Razón Social
                                </p>
                                <p className="mt-2 text-lg font-bold text-[#071b3b]">
                                    {patrono.razon_social}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">Estado</p>
                                <p className="mt-2 text-lg font-bold text-[#071b3b]">
                                    {patrono.activo ? "Activo" : "Inactivo"}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">
                                    Número Patronal
                                </p>
                                <p className="mt-2 text-lg font-bold text-[#071b3b]">
                                    {patrono.numero_patronal || "\u2014"}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">NIT</p>
                                <p className="mt-2 text-lg font-bold text-[#071b3b]">
                                    {patrono.nit || "\u2014"}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">
                                    Representante Legal
                                </p>
                                <p className="mt-2 text-lg font-bold text-[#071b3b]">
                                    {patrono.representante_legal || "\u2014"}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">
                                    DPI Representante
                                </p>
                                <p className="mt-2 text-lg font-bold text-[#071b3b]">
                                    {patrono.dpi_representante || "\u2014"}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">
                                    Vencimiento DPI
                                </p>
                                <p className="mt-2 text-lg font-bold text-[#071b3b]">
                                    {formatDate(patrono.fecha_vencimiento_dpi)}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">
                                    Fecha de Nacimiento
                                </p>
                                <p className="mt-2 text-lg font-bold text-[#071b3b]">
                                    {formatDate(patrono.fecha_nacimiento)}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">Edad</p>
                                <p className="mt-2 text-lg font-bold text-[#071b3b]">
                                    {calcularEdad(patrono.fecha_nacimiento)}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">Sexo</p>
                                <p className="mt-2 text-lg font-bold text-[#071b3b]">
                                    {traducirEnum(patrono.sexo)}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">
                                    Estado Civil
                                </p>
                                <p className="mt-2 text-lg font-bold text-[#071b3b]">
                                    {traducirEnum(patrono.estado_civil)}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">
                                    Profesión
                                </p>
                                <p className="mt-2 text-lg font-bold text-[#071b3b]">
                                    {patrono.profesion || "\u2014"}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">
                                    DPI Extendido en
                                </p>
                                <p className="mt-2 text-lg font-bold text-[#071b3b]">
                                    {patrono.dpi_extendido_en || "\u2014"}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5 sm:col-span-2">
                                <p className="text-sm font-semibold text-[#5b6e8b]">
                                    Fecha de creación
                                </p>
                                <p className="mt-2 flex items-center gap-2 text-lg font-bold text-[#071b3b]">
                                    <CalendarDays className="h-4 w-4 text-[#3162e9]" />
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
