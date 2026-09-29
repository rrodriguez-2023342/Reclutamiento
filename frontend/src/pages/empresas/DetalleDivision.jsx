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
import {
    activarDivision,
    desactivarDivision,
    getDivisionById,
} from "../../services/divisiones.service.js";

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

function DetalleDivision() {
    const { id } = useParams();
    console.log("DEBUG DetalleDivision - useParams id:", id, typeof id);
    const navigate = useNavigate();
    const [division, setDivision] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modalAction, setModalAction] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [success, setSuccess] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getDivisionById(id);
            setDivision(data);
        } catch (e) {
            setError("No fue posible recargar la division.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        let active = true;
        getDivisionById(id)
            .then((data) => active && setDivision(data))
            .catch((requestError) => {
                if (active) {
                    setError(
                        requestError.response?.data?.message ||
                            "No fue posible cargar la division.",
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
        if (!division) return;
        try {
            setActionLoading(true);
            const msg = division.activo
                ? "Division desactivada correctamente"
                : "Division activada correctamente";
            if (division.activo) {
                await desactivarDivision(division.id);
            } else {
                await activarDivision(division.id);
            }
            setModalAction(null);
            setSuccess(msg);
            await load();
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "No fue posible cambiar el estado de la division.",
            );
            setModalAction(null);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout title="Detalle de Division">
                <section className="rounded-[26px] bg-white p-10 text-center shadow-[0_10px_24px_rgba(20,43,89,0.06)]">
                    <h2 className="text-xl font-bold text-red-600">Error</h2>
                    <p className="mt-2 text-[#5b6e8b]">
                        {error || "Division no encontrada"}
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/empresas/divisiones")}
                        className="mt-4 cursor-pointer rounded-2xl border border-[#dce3ee] px-4 py-4 font-semibold text-[#071b3b] transition hover:bg-[#f0f4fa]"
                    >
                        Volver a divisiones
                    </button>
                </section>
            </DashboardLayout>
        );
    }

    if (error || !division) {
        return (
            <DashboardLayout title="Detalle de Division">
                <section className="rounded-[26px] bg-white p-10 text-center shadow-[0_10px_24px_rgba(20,43,89,0.06)]">
                    <h2 className="text-xl font-bold text-red-600">Error</h2>
                    <p className="mt-2 text-[#5b6e8b]">
                        {error || "Division no encontrada"}
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/empresas/divisiones")}
                        className="mt-4 cursor-pointer rounded-2xl border border-[#dce3ee] px-4 py-4 font-semibold text-[#071b3b] transition hover:bg-[#f0f4fa]"
                    >
                        Volver a divisiones
                    </button>
                </section>
            </DashboardLayout>
        );
    }

    return (
        <>
            <DashboardLayout title="Detalle de Division">
                {loading && (
                    <div className="rounded-[26px] bg-white p-12 text-center text-[#5b6e8b] shadow-[0_10px_24px_rgba(20,43,89,0.06)]">
                        Cargando division...
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
                            onClick={() => navigate("/empresas/divisiones")}
                            className="ml-3 cursor-pointer underline"
                        >
                            Volver a divisiones
                        </button>
                    </div>
                )}

                {!loading && division && (
                    <div className="mx-auto max-w-4xl">
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                            <button
                                type="button"
                                onClick={() => navigate("/empresas/divisiones")}
                                className="flex h-11 cursor-pointer items-center gap-2 rounded-2xl border border-[#dce3ee] bg-white px-4 font-semibold text-[#071b3b] transition hover:bg-[#f0f4fa]"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                Volver a divisiones
                            </button>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(`/empresas/divisiones/${division.id}/editar`)
                                    }
                                    className="flex h-12 cursor-pointer items-center gap-2 rounded-2xl bg-[#3162e9] px-5 font-bold text-white transition hover:bg-[#183fca]"
                                >
                                    <Pencil className="h-5 w-5" />
                                    Editar
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setModalAction({
                                            type: division.activo ? "desactivar" : "activar",
                                            title: division.activo
                                                ? "Desactivar division"
                                                : "Activar division",
                                            description: division.activo
                                                ? `Deseas desactivar a ${division.nombre}?`
                                                : `Deseas activar a ${division.nombre}?`,
                                        })
                                    }
                                    className="flex h-12 cursor-pointer items-center gap-2 rounded-2xl border border-[#dce3ee] bg-white px-4 font-bold text-[#071b3b] transition hover:bg-[#f0f4fa]"
                                >
                                    <Power className="h-5 w-5" />
                                    {division.activo ? "Desactivar" : "Activar"}
                                </button>
                            </div>
                        </div>

                        <section className="rounded-[26px] bg-white p-6 shadow-[0_10px_24px_rgba(20,43,89,0.06)] sm:p-8">
                            <div className="flex flex-col gap-5 border-b border-[#dce3ee] pb-7 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#f0f4fa] text-xl font-bold text-[#3162e9]">
                                        <Building2 className="h-7 w-7" />
                                    </span>
                                    <div>
                                        <h1 className="text-2xl font-bold tracking-[-0.04em] text-[#071b3b] sm:text-3xl">
                                            {division.nombre}
                                        </h1>
                                        <p className="mt-2 text-[#5b6e8b]">
                                            Informacion de la division
                                        </p>
                                    </div>
                                </div>

                                <span
                                    className={`self-start rounded-full px-3 py-1 text-sm font-semibold ${division.activo ? "bg-[#c9f3dd] text-[#087947]" : "bg-[#f1f4f9] text-[#5b6e8b]"}`}
                                >
                                    {division.activo ? "Activa" : "Inactiva"}
                                </span>
                            </div>

                            <div className="mt-7 grid gap-5 sm:grid-cols-2">
                                <div className="rounded-xl bg-[#f0f4fa] p-5">
                                    <p className="text-sm font-semibold text-[#5b6e8b]">Nombre</p>
                                    <p className="mt-2 text-lg font-bold text-[#071b3b]">
                                        {division.nombre}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-[#f0f4fa] p-5">
                                    <p className="text-sm font-semibold text-[#5b6e8b]">Estado</p>
                                    <p className="mt-2 text-lg font-bold text-[#071b3b]">
                                        {division.activo ? "Activa" : "Inactiva"}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-[#f0f4fa] p-5 sm:col-span-2">
                                    <p
                                        className={`text-sm font-semibold ${isEmpty(division.descripcion) ? "text-[#df353c]" : "text-[#5b6e8b]"}`}
                                    >
                                        Descripcion
                                    </p>
                                    <p
                                        className={`mt-2 text-lg font-bold ${isEmpty(division.descripcion) ? "text-[#df353c]" : "text-[#071b3b]"}`}
                                    >
                                        {division.descripcion || "\u2014"}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-[#f0f4fa] p-5">
                                    <p className="text-sm font-semibold text-[#5b6e8b]">
                                        Empresa
                                    </p>
                                    <p className="mt-2 text-lg font-bold text-[#071b3b]">
                                        {division.empresa?.nombre_empresa || "Sin empresa"}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-[#f0f4fa] p-5 sm:col-span-2">
                                    <p className="text-sm font-semibold text-[#5b6e8b]">
                                        Fecha de creacion
                                    </p>
                                    <p className="mt-2 flex items-center gap-2 text-lg font-bold text-[#071b3b]">
                                        <CalendarDays className="h-4 w-4 text-[#3162e9]" />
                                        {formatDate(division.creado_en)}
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

export default DetalleDivision;