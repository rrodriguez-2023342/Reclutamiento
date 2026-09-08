import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
    Field,
    Input,
    Select,
} from "../../components/postulantes/formControls.jsx";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import {
    getPatronoById,
    updatePatrono,
} from "../../services/patronos.service.js";
import {
    defaultPatronoValues,
    patronoSchema,
} from "../../validators/patronos.validator.js";

function EditarPatrono() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState("");
    const [loadingPatrono, setLoadingPatrono] = useState(true);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(patronoSchema),
        defaultValues: defaultPatronoValues,
    });

    useEffect(() => {
        let active = true;
        setLoadingPatrono(true);
        getPatronoById(id)
            .then((data) => {
                if (active) {
                    reset({
                        ...defaultPatronoValues,
                        razon_social: data.razon_social || "",
                        numero_patronal: data.numero_patronal || "",
                        nit: data.nit || "",
                        representante_legal: data.representante_legal || "",
                        dpi_representante: data.dpi_representante || "",
                        fecha_vencimiento_dpi: data.fecha_vencimiento_dpi
                            ? data.fecha_vencimiento_dpi.split("T")[0]
                            : "",
                        fecha_nacimiento: data.fecha_nacimiento
                            ? data.fecha_nacimiento.split("T")[0]
                            : "",
                        sexo: data.sexo || undefined,
                        estado_civil: data.estado_civil || undefined,
                        profesion: data.profesion || "",
                        dpi_extendido_en: data.dpi_extendido_en || "",
                        activo: data.activo ?? true,
                    });
                }
            })
            .catch((requestError) => {
                if (active) {
                    setServerError(
                        requestError.response?.data?.message ||
                            "No fue posible cargar el patrono.",
                    );
                }
            })
            .finally(() => active && setLoadingPatrono(false));

        return () => {
            active = false;
        };
    }, [id, reset]);

    const onSubmit = async (values) => {
        try {
            setServerError("");
            const payload = {
                ...values,
                numero_patronal: values.numero_patronal || null,
                nit: values.nit || null,
                representante_legal: values.representante_legal || null,
                dpi_representante: values.dpi_representante || null,
                fecha_vencimiento_dpi: values.fecha_vencimiento_dpi || null,
                fecha_nacimiento: values.fecha_nacimiento || null,
                sexo: values.sexo || null,
                estado_civil: values.estado_civil || null,
                profesion: values.profesion || null,
                dpi_extendido_en: values.dpi_extendido_en || null,
            };
            await updatePatrono(id, payload);
            navigate("/patronos", {
                state: { mensaje: "Patrono actualizado correctamente" },
            });
        } catch (requestError) {
            setServerError(
                requestError.response?.data?.message ||
                    "No fue posible actualizar el patrono.",
            );
        }
    };

    return (
        <DashboardLayout title="Editar Patrono">
            <div className="mx-auto max-w-3xl">
                <div className="mb-6 flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/patronos")}
                        aria-label="Volver a patronos"
                        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[#dce3ee] bg-white text-[#071b3b] transition hover:bg-[#f0f4fa]"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-[-0.04em] text-[#071b3b] sm:text-3xl">
                            Editar Patrono
                        </h1>
                        <p className="mt-1 text-[#5b6e8b]">
                            Actualiza la información del patrono.
                        </p>
                    </div>
                </div>

                {loadingPatrono ? (
                    <div className="rounded-[26px] bg-white p-10 text-center text-[#5b6e8b] shadow-[0_10px_24px_rgba(20,43,89,0.06)]">
                        Cargando patrono...
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="rounded-[26px] bg-white p-6 shadow-[0_10px_24px_rgba(20,43,89,0.06)] sm:p-8"
                        noValidate
                    >
                        {serverError && (
                            <div
                                role="alert"
                                className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-600"
                            >
                                {serverError}
                            </div>
                        )}

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <Field
                                    label="Razón Social *"
                                    error={errors.razon_social?.message}
                                >
                                    <Input
                                        registration={register("razon_social")}
                                        placeholder="Ej. Viclasa S.A."
                                    />
                                </Field>
                            </div>

                            <Field
                                label="Número Patronal"
                                error={errors.numero_patronal?.message}
                            >
                                <Input
                                    registration={register("numero_patronal")}
                                    placeholder="Ej. 12345"
                                />
                            </Field>

                            <Field label="NIT" error={errors.nit?.message}>
                                <Input
                                    registration={register("nit")}
                                    placeholder="Ej. 1234567-8"
                                />
                            </Field>

                            <Field
                                label="Representante Legal"
                                error={errors.representante_legal?.message}
                            >
                                <Input
                                    registration={register("representante_legal")}
                                    placeholder="Nombre del representante"
                                />
                            </Field>

                            <Field
                                label="DPI del Representante"
                                error={errors.dpi_representante?.message}
                            >
                                <Input
                                    registration={register("dpi_representante")}
                                    placeholder="13 dígitos"
                                />
                            </Field>

                            <Field
                                label="Fecha Vencimiento DPI"
                                error={errors.fecha_vencimiento_dpi?.message}
                            >
                                <Input
                                    registration={register("fecha_vencimiento_dpi")}
                                    type="date"
                                />
                            </Field>

                            <Field
                                label="Fecha de Nacimiento"
                                error={errors.fecha_nacimiento?.message}
                            >
                                <Input
                                    registration={register("fecha_nacimiento")}
                                    type="date"
                                />
                            </Field>

                            <Field label="Sexo" error={errors.sexo?.message}>
                                <Select registration={register("sexo")}>
                                    <option value="">Seleccione...</option>
                                    <option value="MASCULINO">Masculino</option>
                                    <option value="FEMENINO">Femenino</option>
                                </Select>
                            </Field>

                            <Field label="Estado Civil" error={errors.estado_civil?.message}>
                                <Select registration={register("estado_civil")}>
                                    <option value="">Seleccione...</option>
                                    <option value="SOLTERO">Soltero (a)</option>
                                    <option value="CASADO">Casado (a)</option>
                                    <option value="UNIDO">Unido (a)</option>
                                    <option value="VIUDO">Viudo (a)</option>
                                    <option value="DIVORCIADO">Divorciado (a)</option>
                                </Select>
                            </Field>

                            <Field label="Profesión" error={errors.profesion?.message}>
                                <Input
                                    registration={register("profesion")}
                                    placeholder="Ej. Ingeniero"
                                />
                            </Field>

                            <Field
                                label="Dónde se extendió DPI"
                                error={errors.dpi_extendido_en?.message}
                            >
                                <Input
                                    registration={register("dpi_extendido_en")}
                                    placeholder="Ej. Guatemala"
                                />
                            </Field>
                        </div>

                        <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-[#dce3ee] px-4 py-4 text-[#071b3b]">
                            <input
                                type="checkbox"
                                {...register("activo")}
                                className="h-5 w-5 cursor-pointer accent-[#3162e9]"
                            />
                            <span className="font-semibold">Patrono activo</span>
                        </label>
                        
                        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => navigate("/patronos")}
                                className="h-14 cursor-pointer rounded-2xl border border-[#dce3ee] px-6 font-bold text-[#5b6e8b] transition hover:bg-[#f0f4fa]"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#3162e9] px-7 font-bold text-white transition hover:bg-[#183fca] disabled:cursor-not-allowed disabled:opacity-60"
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

export default EditarPatrono;
