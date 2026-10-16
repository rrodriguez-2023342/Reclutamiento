import { useEffect, useState } from "react";
import {
    ArrowLeft,
    Building2,
    CalendarDays,
    Pencil,
    Power,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import {
    activarEmpresa,
    desactivarEmpresa,
    getEmpresaById,
} from "../../services/empresas.service.js";

function formatDate(value) {
    if (!value) return "\u2014";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "\u2014"
        : new Intl.DateTimeFormat("es-GT", { dateStyle: "long" }).format(date);
}

function formatAniversario(value) {
    if (!value) return "\u2014";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "\u2014"
        : new Intl.DateTimeFormat("es-GT", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(date);
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

function DetalleEmpresa() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const esAdmin = authUser?.rol === "Administrador RHCorp";
    const [empresa, setEmpresa] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modalAction, setModalAction] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        let active = true;
        getEmpresaById(id)
            .then((data) => active && setEmpresa(data))
            .catch((requestError) => {
                if (active) {
                    setError(
                        requestError.response?.data?.message ||
                            "No fue posible cargar la empresa.",
                    );
                }
            })
            .finally(() => active && setLoading(false));

        return () => {
            active = false;
        };
    }, [id]);

    const handleToggleStatus = async () => {
        if (!empresa) return;
        try {
            setActionLoading(true);
            const msg = empresa.activo
                ? "Empresa desactivada correctamente"
                : "Empresa activada correctamente";
            if (empresa.activo) {
                await desactivarEmpresa(empresa.id);
            } else {
                await activarEmpresa(empresa.id);
            }
            setModalAction(null);
            navigate("/empresas", { state: { mensaje: msg } });
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
        <DashboardLayout title="Detalle de Empresa">
            {loading && (
                <div className="rounded-[10px] border border-border bg-surface p-12 text-center text-text-soft shadow-none">
                    Cargando empresa...
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
                        onClick={() => navigate("/empresas")}
                        className="ml-3 inline-flex min-h-10 cursor-pointer items-center px-1 underline"
                    >
                        Volver a empresas
                    </button>
                </div>
            )}

            {!loading && empresa && (
                <div className="mx-auto max-w-4xl">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <button
                            type="button"
                            onClick={() => navigate("/empresas")}
                            className="flex h-11 cursor-pointer items-center gap-2 rounded-[10px] border border-border bg-surface px-4 font-semibold text-text-main transition hover:bg-neutral-bg"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Volver a empresas
                        </button>

                        {esAdmin && (
                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate(`/empresas/${empresa.id}/editar`)}
                                    className="flex h-12 cursor-pointer items-center gap-2 rounded-[10px] bg-action px-5 font-bold text-white transition hover:bg-ink"
                                >
                                    <Pencil className="h-5 w-5" />
                                    Editar
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setModalAction({
                                            type: empresa.activo ? "desactivar" : "activar",
                                            title: empresa.activo
                                                ? "Desactivar empresa"
                                                : "Activar empresa",
                                            description: empresa.activo
                                                ? `¿Deseas desactivar a ${empresa.nombre_empresa}?`
                                                : `¿Deseas activar a ${empresa.nombre_empresa}?`,
                                        })
                                    }
                                    className="flex h-12 cursor-pointer items-center gap-2 rounded-[10px] border border-border bg-surface px-4 font-bold text-text-main transition hover:bg-neutral-bg"
                                >
                                    <Power className="h-5 w-5" />
                                    {empresa.activo ? "Desactivar" : "Activar"}
                                </button>
                            </div>
                        )}
                    </div>

                    <section className="rounded-[10px] border border-border bg-surface p-6 shadow-none sm:p-8">
                        <div className="flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[10px] bg-neutral-bg text-xl font-bold text-action">
                                    <Building2 className="h-7 w-7" />
                                </span>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-[-0.04em] text-text-main sm:text-3xl">
                                        {empresa.nombre_empresa}
                                    </h1>
                                    <p className="mt-2 text-text-soft">
                                        Información general de la empresa
                                    </p>
                                </div>
                            </div>

                            <span
                                className={`self-start rounded-full px-3 py-1 text-sm font-semibold ${empresa.activo ? "bg-success-bg text-success" : "bg-danger-bg text-danger"}`}
                            >
                                {empresa.activo ? "Activa" : "Inactiva"}
                            </span>
                        </div>

                        <div className="mt-7 grid gap-5 sm:grid-cols-2">
                            <div className="rounded-[8px] bg-neutral-bg p-5">
                                <p className="text-sm font-semibold text-text-soft">Nombre</p>
                                <p className="mt-2 text-lg font-bold text-text-main">
                                    {empresa.nombre_empresa}
                                </p>
                            </div>
                            <div className="rounded-[8px] bg-neutral-bg p-5">
                                <p className="text-sm font-semibold text-text-soft">Estado</p>
                                <p className="mt-2 text-lg font-bold text-text-main">
                                    {empresa.activo ? "Activa" : "Inactiva"}
                                </p>
                            </div>
                            <div className="rounded-[8px] bg-neutral-bg p-5 sm:col-span-2">
                                <p
                                    className={`text-sm font-semibold ${isEmpty(empresa.detalle_empresa) ? "text-danger" : "text-text-soft"}`}
                                >
                                    Detalle de la Empresa
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(empresa.detalle_empresa) ? "text-danger" : "text-text-main"}`}
                                >
                                    {empresa.detalle_empresa || "\u2014"}
                                </p>
                            </div>

                            <div className="rounded-[8px] bg-neutral-bg p-5">
                                <p
                                    className={`text-sm font-semibold ${isEmpty(empresa.direccion) ? "text-danger" : "text-text-soft"}`}
                                >
                                    Dirección
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(empresa.direccion) ? "text-danger" : "text-text-main"}`}
                                >
                                    {empresa.direccion || "\u2014"}
                                </p>
                            </div>

                            <div className="rounded-[8px] bg-neutral-bg p-5">
                                <p
                                    className={`text-sm font-semibold ${isEmpty(empresa.telefono) ? "text-danger" : "text-text-soft"}`}
                                >
                                    Teléfono
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(empresa.telefono) ? "text-danger" : "text-text-main"}`}
                                >
                                    {empresa.telefono || "\u2014"}
                                </p>
                            </div>

                            <div className="rounded-[8px] bg-neutral-bg p-5">
                                <p
                                    className={`text-sm font-semibold ${isEmpty(empresa.correo) ? "text-danger" : "text-text-soft"}`}
                                >
                                    Correo
                                </p>
                                <p
                                    className={`mt-2 text-lg font-bold ${isEmpty(empresa.correo) ? "text-danger" : "text-text-main"}`}
                                >
                                    {empresa.correo || "\u2014"}
                                </p>
                            </div>

                            <div className="rounded-[8px] bg-neutral-bg p-5 sm:col-span-2">
                                <p
                                    className={`text-sm font-semibold ${isEmpty(empresa.fecha_aniversario) ? "text-danger" : "text-text-soft"}`}
                                >
                                    Fecha de aniversario
                                </p>
                                <p
                                    className={`mt-2 flex items-center gap-2 text-lg font-bold ${isEmpty(empresa.fecha_aniversario) ? "text-danger" : "text-text-main"}`}
                                >
                                    <CalendarDays className="h-4 w-4 text-action" />
                                    {formatAniversario(empresa.fecha_aniversario)}
                                </p>
                            </div>
                            <div className="rounded-[8px] bg-neutral-bg p-5 sm:col-span-2">
                                <p className="text-sm font-semibold text-text-soft">
                                    Fecha de creación
                                </p>
                                <p className="mt-2 flex items-center gap-2 text-lg font-bold text-text-main">
                                    <CalendarDays className="h-4 w-4 text-action" />
                                    {formatDate(empresa.creado_en)}
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

export default DetalleEmpresa;
