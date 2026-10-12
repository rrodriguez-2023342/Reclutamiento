import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
    Field,
    Input,
    Textarea,
    SearchableSelect,
} from "../../components/postulantes/formControls.jsx";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import {
    getPuestoById,
    updatePuesto,
    getDepartamentosForSelect,
    getDivisionesForSelect,
} from "../../services/puestos.service.js";
import {
    defaultPuestoValues,
    puestoSchema,
} from "../../validators/puestos.validator.js";

function EditarPuesto() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState("");
    const [loadingPuesto, setLoadingPuesto] = useState(true);
    const [departamentos, setDepartamentos] = useState([]);
    const [divisiones, setDivisiones] = useState([]);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(puestoSchema),
        defaultValues: defaultPuestoValues,
    });

    useEffect(() => {
        Promise.all([getDivisionesForSelect(), getDepartamentosForSelect()])
            .then(([divisionOptions, departmentOptions]) => {
                setDivisiones(divisionOptions);
                setDepartamentos(departmentOptions);
            })
            .catch(() => {
                setDivisiones([]);
                setDepartamentos([]);
            });
    }, []);

    useEffect(() => {
        let active = true;
        getPuestoById(id)
            .then((data) => {
                if (active) {
                    reset({
                        ...defaultPuestoValues,
                        nombre: data.nombre || "",
                        descripcion: data.descripcion || "",
                        division_id: data.division?.id ?? null,
                        departamento_id: data.departamento?.id ?? null,
                        activo: data.activo ?? true,
                    });
                }
            })
            .catch((requestError) => {
                if (active) {
                    setServerError(
                        requestError.response?.data?.message ||
                            "No fue posible cargar el puesto.",
                    );
                }
            })
            .finally(() => active && setLoadingPuesto(false));

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
                division_id: values.division_id,
                departamento_id: values.departamento_id,
            };
            await updatePuesto(id, payload);
            navigate("/empresas/puestos", {
                state: { mensaje: "Puesto actualizado correctamente" },
            });
        } catch (requestError) {
            setServerError(
                requestError.response?.data?.message ||
                    "No fue posible actualizar el puesto.",
            );
        }
    };

    return (
        <DashboardLayout title="Editar Puesto">
            <div className="mx-auto max-w-3xl">
                <div className="mb-6 flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/empresas/puestos")}
                        aria-label="Volver a puestos"
                        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-[8px] border border-border bg-surface text-text-main transition hover:bg-neutral-bg"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-[-0.04em] text-text-main sm:text-3xl">
                            Editar Puesto
                        </h1>
                        <p className="mt-1 text-text-soft">
                            Actualiza la información del puesto.
                        </p>
                    </div>
                </div>

                {loadingPuesto ? (
                    <div className="rounded-[10px] border border-border bg-surface p-10 text-center text-text-soft shadow-none">
                        Cargando puesto...
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
                                    placeholder="Ej. Desarrollador Senior"
                                />
                            </Field>

                            <Field label="Descripción" error={errors.descripcion?.message}>
                                <Textarea
                                    registration={register("descripcion")}
                                    placeholder="Descripción del puesto..."
                                />
                            </Field>

                            <Field
                                label="División *"
                                error={errors.division_id?.message}
                            >
                                <SearchableSelect
                                    control={control}
                                    name="division_id"
                                    options={[
                                        { value: "", label: "Seleccionar división" },
                                        ...divisiones.map((division) => ({
                                            value: division.id,
                                            label: division.nombre,
                                        })),
                                    ]}
                                    placeholder="Seleccionar división"
                                    valueAsNumber
                                    error={errors.division_id?.message}
                                />
                            </Field>

                            <Field
                                label="Departamento *"
                                error={errors.departamento_id?.message}
                            >
                                <SearchableSelect
                                    control={control}
                                    name="departamento_id"
                                    options={[
                                        { value: "", label: "Seleccionar departamento" },
                                        ...departamentos.map((departamento) => ({
                                            value: departamento.id,
                                            label: departamento.nombre,
                                        })),
                                    ]}
                                    placeholder="Seleccionar departamento"
                                    valueAsNumber
                                    error={errors.departamento_id?.message}
                                />
                            </Field>

                            <label className="flex cursor-pointer items-center gap-3 rounded-[8px] border border-border px-4 py-4 text-text-main">
                                <input
                                    type="checkbox"
                                    {...register("activo")}
                                    className="h-5 w-5 cursor-pointer accent-action"
                                />
                                <span className="font-semibold">Puesto activo</span>
                            </label>
                        </div>

                        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => navigate("/empresas/puestos")}
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

export default EditarPuesto;