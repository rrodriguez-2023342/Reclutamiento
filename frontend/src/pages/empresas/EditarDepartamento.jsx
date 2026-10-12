import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
    Field,
    Input,
    Textarea,
} from "../../components/postulantes/formControls.jsx";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import {
    getDepartamentoById,
    updateDepartamento,
} from "../../services/departamentos.service.js";
import {
    defaultDepartamentoValues,
    departamentoSchema,
} from "../../validators/departamentos.validator.js";

function EditarDepartamento() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState("");
    const [loadingDepartamento, setLoadingDepartamento] = useState(true);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(departamentoSchema),
        defaultValues: defaultDepartamentoValues,
    });

    useEffect(() => {
        let active = true;
        getDepartamentoById(id)
            .then((data) => {
                if (active) {
                    reset({
                        ...defaultDepartamentoValues,
                        nombre: data.nombre || "",
                        descripcion: data.descripcion || "",
                        activo: data.activo ?? true,
                    });
                }
            })
            .catch((requestError) => {
                if (active) {
                    setServerError(
                        requestError.response?.data?.message ||
                            "No fue posible cargar el departamento.",
                    );
                }
            })
            .finally(() => active && setLoadingDepartamento(false));

        return () => {
            active = false;
        };
    }, [id, reset]);

    const onSubmit = async (values) => {
        try {
            setServerError("");
            const payload = {
                ...values,
                descripcion: values.descripcion || null,
            };
            await updateDepartamento(id, payload);
            navigate("/empresas/departamentos", {
                state: { mensaje: "Departamento actualizado correctamente" },
            });
        } catch (requestError) {
            setServerError(
                requestError.response?.data?.message ||
                    "No fue posible actualizar el departamento.",
            );
        }
    };

    return (
        <DashboardLayout title="Editar Departamento">
            <div className="mx-auto max-w-3xl">
                <div className="mb-6 flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/empresas/departamentos")}
                        aria-label="Volver a departamentos"
                        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-[8px] border border-border bg-surface text-text-main transition hover:bg-neutral-bg"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-[-0.04em] text-text-main sm:text-3xl">
                            Editar Departamento
                        </h1>
                        <p className="mt-1 text-text-soft">
                            Actualiza la información del departamento.
                        </p>
                    </div>
                </div>

                {loadingDepartamento ? (
                    <div className="rounded-[10px] border border-border bg-surface p-10 text-center text-text-soft shadow-none">
                        Cargando departamento...
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="rounded-[10px] border border-border bg-surface p-6 shadow-none sm:p-8"
                        noValidate
                    >
                        {serverError && (
                            <div
                                role="alert"
                                className="mb-6 rounded-[10px] border border-danger bg-danger-bg px-5 py-4 font-semibold text-danger"
                            >
                                {serverError}
                            </div>
                        )}

                        <div className="grid gap-5">
                            <Field label="Nombre *" error={errors.nombre?.message}>
                                <Input
                                    registration={register("nombre")}
                                    placeholder="Ej. Departamento de Desarrollo"
                                />
                            </Field>

                            <Field label="Descripción" error={errors.descripcion?.message}>
                                <Textarea
                                    registration={register("descripcion")}
                                    placeholder="Descripción del departamento..."
                                />
                            </Field>

                            <label className="flex cursor-pointer items-center gap-3 rounded-[8px] border border-border px-4 py-4 text-text-main">
                                <input
                                    type="checkbox"
                                    {...register("activo")}
                                    className="h-5 w-5 cursor-pointer accent-action"
                                />
                                <span className="font-semibold">Departamento activo</span>
                            </label>
                        </div>

                        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => navigate("/empresas/departamentos")}
                                className="h-14 cursor-pointer rounded-[10px] border border-border px-6 font-bold text-text-soft transition hover:bg-neutral-bg"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-action px-7 font-bold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Save className="h-5 w-5" />
                                {isSubmitting ? "Guardando..." : "Guardar"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </DashboardLayout>
    );
}

export default EditarDepartamento;