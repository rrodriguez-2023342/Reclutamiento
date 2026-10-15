import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import {
    Field,
    Input,
    Select,
} from "../../components/postulantes/formControls.jsx";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { createPatrono } from "../../services/patronos.service.js";
import {
    defaultPatronoValues,
    patronoSchema,
} from "../../validators/patronos.validator.js";

function NuevoPatrono() {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState("");
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(patronoSchema),
        defaultValues: defaultPatronoValues,
    });

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
                direccion: values.direccion || null,
                direccion_patente_comercio: values.direccion_patente_comercio || null,
                fecha_autorizacion_acta: values.fecha_autorizacion_acta || null,
                autorizada_por_notario: values.autorizada_por_notario || null,
                numero_registro: values.numero_registro || null,
                numero_folio: values.numero_folio || null,
                numero_libro: values.numero_libro || null,
                telefono: values.telefono || null,
                correo: values.correo || null,
            };
            await createPatrono(payload);
            navigate("/patronos", {
                state: { mensaje: "Patrono creado correctamente" },
            });
        } catch (requestError) {
            setServerError(
                requestError.response?.data?.message ||
                    "No fue posible crear el patrono.",
            );
        }
    };

    return (
        <DashboardLayout title="Nuevo Patrono">
            <div className="mx-auto max-w-3xl">
                <div className="mb-6 flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/patronos")}
                        aria-label="Volver a patronos"
                        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-[8px] border border-border bg-surface text-text-main transition hover:bg-neutral-bg"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-[-0.04em] text-text-main sm:text-3xl">
                            Nuevo Patrono
                        </h1>
                        <p className="mt-1 text-text-soft">
                            Registra un nuevo patrono en el sistema.
                        </p>
                    </div>
                </div>

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
                            label="Dirección fiscal patronal"
                            error={errors.direccion?.message}
                            className="sm:col-span-2"
                        >
                            <Input
                                registration={register("direccion")}
                                placeholder="Ej. 4ta Avenida 12-34, Zona 1"
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
                            label="Dónde se extendió DPI"
                            error={errors.dpi_extendido_en?.message}
                        >
                            <Input
                                registration={register("dpi_extendido_en")}
                                placeholder="Ej. Guatemala"
                            />
                        </Field>

                        <Field
                            label="Fecha de Nacimiento"
                            error={errors.fecha_nacimiento?.message}
                        >
                            <Input registration={register("fecha_nacimiento")} type="date" />
                        </Field>

                        <Field label="Sexo" error={errors.sexo?.message}>
                            <Select registration={register("sexo")}>
                                <option value="">Seleccione...</option>
                                <option value="MASCULINO">Masculino</option>
                                <option value="FEMENINO">Femenino</option>
                                <option value="PREFIERO_NO_DECIRLO">Prefiero no decirlo</option>
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
                            label="Teléfono"
                            error={errors.telefono?.message}
                        >
                            <Input
                                registration={register("telefono")}
                                placeholder="Ej. 55551234"
                            />
                        </Field>

                        <Field
                            label="Correo electrónico"
                            error={errors.correo?.message}
                        >
                            <Input
                                type="email"
                                registration={register("correo")}
                                placeholder="Ej. correo@ejemplo.com"
                            />
                        </Field>

                        <Field
                            label="Dirección de la patente de comercio"
                            error={errors.direccion_patente_comercio?.message}
                        >
                            <Input
                                registration={register("direccion_patente_comercio")}
                                placeholder="Ej. 4ta Avenida 12-34, Zona 1"
                            />
                        </Field>

                        <Field
                            label="Fecha de autorización de acta"
                            error={errors.fecha_autorizacion_acta?.message}
                        >
                            <Input type="date" registration={register("fecha_autorizacion_acta")} />
                        </Field>

                        <Field
                            label="Autorizada por el notario"
                            error={errors.autorizada_por_notario?.message}
                        >
                            <Input
                                registration={register("autorizada_por_notario")}
                                placeholder="Nombre del notario"
                            />
                        </Field>

                        <Field
                            label="No. de registro"
                            error={errors.numero_registro?.message}
                        >
                            <Input
                                registration={register("numero_registro")}
                                placeholder="Ej. 12345"
                            />
                        </Field>

                        <Field
                            label="No. de folio"
                            error={errors.numero_folio?.message}
                        >
                            <Input
                                registration={register("numero_folio")}
                                placeholder="Ej. 45"
                            />
                        </Field>

                        <Field
                            label="No. de libro"
                            error={errors.numero_libro?.message}
                        >
                            <Input
                                registration={register("numero_libro")}
                                placeholder="Ej. 12"
                            />
                        </Field>
                    </div>

                    <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-[8px] border border-border px-4 py-4 text-text-main">
                        <input
                            type="checkbox"
                            {...register("activo")}
                            className="h-5 w-5 cursor-pointer accent-action"
                        />
                        <span className="font-semibold">Patrono activo</span>
                    </label>

                    <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={() => navigate("/patronos")}
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
            </div>
        </DashboardLayout>
    );
}

export default NuevoPatrono;
