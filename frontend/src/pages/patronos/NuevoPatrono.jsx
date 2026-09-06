import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Field, Input } from "../../components/postulantes/formControls.jsx";
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
                direccion: values.direccion || null,
                telefono: values.telefono || null,
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
                        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[#dce3ee] bg-white text-[#071b3b] transition hover:bg-[#f0f4fa]"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-[-0.04em] text-[#071b3b] sm:text-3xl">
                            Nuevo Patrono
                        </h1>
                        <p className="mt-1 text-[#5b6e8b]">
                            Registra un nuevo patrono en el sistema.
                        </p>
                    </div>
                </div>

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

                    <div className="grid gap-5">
                        <Field label="Nombre *" error={errors.nombre?.message}>
                            <Input
                                registration={register("nombre")}
                                placeholder="Ej. Viclasa"
                            />
                        </Field>
                    
                        <Field label="Dirección" error={errors.direccion?.message}>
                            <Input
                                registration={register("direccion")}
                                placeholder="Ej. Zona 7, Ciudad de Guatemala"
                            />
                        </Field>
                    
                        <Field label="Teléfono" error={errors.telefono?.message}>
                            <Input
                                registration={register("telefono")}
                                placeholder="Ej. 2334-5678"
                            />
                        </Field>
                    
                        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#dce3ee] px-4 py-4 text-[#071b3b]">
                            <input
                                type="checkbox"
                                {...register("activo")}
                                className="h-5 w-5 cursor-pointer accent-[#3162e9]"
                            />
                            <span className="font-semibold">Patrono activo</span>
                        </label>
                    </div>

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
            </div>
        </DashboardLayout>
    );
}

export default NuevoPatrono;
