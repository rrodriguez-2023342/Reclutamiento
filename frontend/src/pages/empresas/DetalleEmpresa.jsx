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
import {
    activarEmpresa,
    desactivarEmpresa,
    getEmpresaById,
} from "../../services/empresas.service.js";

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : new Intl.DateTimeFormat("es-GT", { dateStyle: "long" }).format(date);
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

function DetalleEmpresa() {
    const { id } = useParams();
    const navigate = useNavigate();
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
                <div className="rounded-[26px] bg-white p-12 text-center text-[#5b6e8b] shadow-[0_10px_24px_rgba(20,43,89,0.06)]">
                    Cargando empresa...
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
                        onClick={() => navigate("/empresas")}
                        className="ml-3 cursor-pointer underline"
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
                            className="flex h-11 cursor-pointer items-center gap-2 rounded-2xl border border-[#dce3ee] bg-white px-4 font-semibold text-[#071b3b] transition hover:bg-[#f0f4fa]"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Volver a empresas
                        </button>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => navigate(`/empresas/${empresa.id}/editar`)}
                                className="flex h-12 cursor-pointer items-center gap-2 rounded-2xl bg-[#3162e9] px-5 font-bold text-white transition hover:bg-[#183fca]"
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
                                            ? `¿Deseas desactivar a ${empresa.nombre}?`
                                            : `¿Deseas activar a ${empresa.nombre}?`,
                                    })
                                }
                                className="flex h-12 cursor-pointer items-center gap-2 rounded-2xl border border-[#dce3ee] bg-white px-4 font-bold text-[#071b3b] transition hover:bg-[#f0f4fa]"
                            >
                                <Power className="h-5 w-5" />
                                {empresa.activo ? "Desactivar" : "Activar"}
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
                                        {empresa.nombre}
                                    </h1>
                                    <p className="mt-2 text-[#5b6e8b]">
                                        Información general de la empresa
                                    </p>
                                </div>
                            </div>

                            <span
                                className={`self-start rounded-full px-3 py-1 text-sm font-semibold ${empresa.activo ? "bg-[#c9f3dd] text-[#087947]" : "bg-[#f1f4f9] text-[#5b6e8b]"}`}
                            >
                                {empresa.activo ? "Activa" : "Inactiva"}
                            </span>
                        </div>

                        <div className="mt-7 grid gap-5 sm:grid-cols-2">
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">Nombre</p>
                                <p className="mt-2 text-lg font-bold text-[#071b3b]">
                                    {empresa.nombre}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">Estado</p>
                                <p className="mt-2 text-lg font-bold text-[#071b3b]">
                                    {empresa.activo ? "Activa" : "Inactiva"}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">
                                    Dirección
                                </p>
                                <p className="mt-2 text-lg font-bold text-[#071b3b]">
                                    {empresa.direccion || "—"}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5">
                                <p className="text-sm font-semibold text-[#5b6e8b]">Teléfono</p>
                                <p className="mt-2 text-lg font-bold text-[#071b3b]">
                                    {empresa.telefono || "—"}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#f0f4fa] p-5 sm:col-span-2">
                                <p className="text-sm font-semibold text-[#5b6e8b]">
                                    Fecha de creación
                                </p>
                                <p className="mt-2 flex items-center gap-2 text-lg font-bold text-[#071b3b]">
                                    <CalendarDays className="h-4 w-4 text-[#3162e9]" />
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
