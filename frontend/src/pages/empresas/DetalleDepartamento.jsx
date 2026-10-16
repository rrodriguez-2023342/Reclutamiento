import { useCallback, useEffect, useState } from "react";
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
    activarDepartamento,
    desactivarDepartamento,
    getDepartamentoById,
} from "../../services/departamentos.service.js";

function formatDate(value) {
    if (!value) return "---";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "---"
        : new Intl.DateTimeFormat("es-GT", { dateStyle: "long" }).format(date);
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

function DetalleDepartamento() {
    const { id } = useParams();
    console.log("DEBUG DetalleDepartamento - useParams id:", id, typeof id);
    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const esAdmin = authUser?.rol === "Administrador RHCorp";
    const [departamento, setDepartamento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modalAction, setModalAction] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [success, setSuccess] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getDepartamentoById(id);
            setDepartamento(data);
        } catch {
            setError("No fue posible recargar el departamento.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        let active = true;
        getDepartamentoById(id)
            .then((data) => active && setDepartamento(data))
            .catch((requestError) => {
                if (active) {
                    setError(
                        requestError.response?.data?.message ||
                            "No fue posible cargar el departamento.",
                    );
                }
            })
            .finally(() => active && setLoading(false));

        return () => {
            active = false;
        };
    }, [id]);

    useEffect(() => {
        if (!success) return;
        const timer = window.setTimeout(() => setSuccess(""), 5000);
        return () => window.clearTimeout(timer);
    }, [success]);

    const handleToggleStatus = async () => {
        if (!departamento) return;
        try {
            setActionLoading(true);
            const msg = departamento.activo
                ? "Departamento desactivado correctamente"
                : "Departamento activado correctamente";
            if (departamento.activo) {
                await desactivarDepartamento(departamento.id);
            } else {
                await activarDepartamento(departamento.id);
            }
            setModalAction(null);
            setSuccess(msg);
            await load();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "No fue posible cambiar el estado del departamento.",
            );
            setModalAction(null);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Detalle de Departamento">
                <section className="rounded-[10px] border border-border bg-surface p-10 text-center shadow-none">
                    <h2 className="text-xl font-bold text-danger">Error</h2>
                    <p className="mt-2 text-text-soft">
                        {error || "Departamento no encontrado"}
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/empresas/departamentos")}
                        className="mt-4 cursor-pointer rounded-[10px] border border-border px-4 py-4 font-semibold text-text-main transition hover:bg-neutral-bg"
                    >
                        Volver a departamentos
                    </button>
                </section>
            </DashboardLayout>
        );
    }

    if (error || !departamento) {
        return (
            <DashboardLayout title="Detalle de Departamento">
                <section className="rounded-[10px] border border-border bg-surface p-10 text-center shadow-none">
                    <h2 className="text-xl font-bold text-danger">Error</h2>
                    <p className="mt-2 text-text-soft">
                        {error || "Departamento no encontrado"}
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/empresas/departamentos")}
                        className="mt-4 cursor-pointer rounded-[10px] border border-border px-4 py-4 font-semibold text-text-main transition hover:bg-neutral-bg"
                    >
                        Volver a departamentos
                    </button>
                </section>
            </DashboardLayout>
        );
    }

    return (
        <>
            <DashboardLayout title="Detalle de Departamento">
                {loading && (
                    <div className="rounded-[10px] border border-border bg-surface p-12 text-center text-text-soft shadow-none">
                        Cargando departamento...
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
                            onClick={() => navigate("/empresas/departamentos")}
                            className="ml-3 inline-flex min-h-10 cursor-pointer items-center px-1 underline"
                        >
                            Volver a departamentos
                        </button>
                    </div>
                )}

                {!loading && departamento && (
                    <div className="mx-auto max-w-4xl">
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                            <button
                                type="button"
                                onClick={() => navigate("/empresas/departamentos")}
                                className="flex h-11 cursor-pointer items-center gap-2 rounded-[10px] border border-border bg-surface px-4 font-semibold text-text-main transition hover:bg-neutral-bg"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                Volver a departamentos
                            </button>

                            {esAdmin && (
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/empresas/departamentos/${departamento.id}/editar`,
                                            )
                                        }
                                        className="flex h-12 cursor-pointer items-center gap-2 rounded-[10px] bg-action px-5 font-bold text-white transition hover:bg-ink"
                                    >
                                        <Pencil className="h-5 w-5" />
                                        Editar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setModalAction({
                                                type: departamento.activo ? "desactivar" : "activar",
                                                title: departamento.activo
                                                    ? "Desactivar departamento"
                                                    : "Activar departamento",
                                                description: departamento.activo
                                                    ? `Deseas desactivar a ${departamento.nombre}?`
                                                    : `Deseas activar a ${departamento.nombre}?`,
                                            })
                                        }
                                        className="flex h-12 cursor-pointer items-center gap-2 rounded-[10px] border border-border bg-surface px-4 font-bold text-text-main transition hover:bg-neutral-bg"
                                    >
                                        <Power className="h-5 w-5" />
                                        {departamento.activo ? "Desactivar" : "Activar"}
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
                                            {departamento.nombre}
                                        </h1>
                                        <p className="mt-2 text-text-soft">
                                            Informacion del departamento
                                        </p>
                                    </div>
                                </div>

                                <span
                                    className={`self-start rounded-full px-3 py-1 text-sm font-semibold ${departamento.activo ? "bg-success-bg text-success" : "bg-danger-bg text-danger"}`}
                                >
                                    {departamento.activo ? "Activo" : "Inactivo"}
                                </span>
                            </div>

                            <div className="mt-7 grid gap-5 sm:grid-cols-2">
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">Nombre</p>
                                    <p className="mt-2 text-lg font-bold text-text-main">
                                        {departamento.nombre}
                                    </p>
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5">
                                    <p className="text-sm font-semibold text-text-soft">Estado</p>
                                    <p className="mt-2 text-lg font-bold text-text-main">
                                        {departamento.activo ? "Activo" : "Inactivo"}
                                    </p>
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5 sm:col-span-2">
                                    <p
                                        className={`text-sm font-semibold ${isEmpty(departamento.descripcion) ? "text-danger" : "text-text-soft"}`}
                                    >
                                        Descripcion
                                    </p>
                                    <p
                                        className={`mt-2 text-lg font-bold ${isEmpty(departamento.descripcion) ? "text-danger" : "text-text-main"}`}
                                    >
                                        {departamento.descripcion || "\u2014"}
                                    </p>
                                </div>
                                <div className="rounded-[8px] bg-neutral-bg p-5 sm:col-span-2">
                                    <p className="text-sm font-semibold text-text-soft">
                                        Fecha de creacion
                                    </p>
                                    <p className="mt-2 flex items-center gap-2 text-lg font-bold text-text-main">
                                        <CalendarDays className="h-4 w-4 text-action" />
                                        {formatDate(departamento.creado_en)}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </DashboardLayout>

            <Modal
                action={modalAction}
                loading={actionLoading}
                onClose={() => setModalAction(null)}
                onConfirm={handleToggleStatus}
            />
        </>
    );
}

export default DetalleDepartamento;
