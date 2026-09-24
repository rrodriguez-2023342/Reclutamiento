import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
    Field,
    Input,
    Select,
    RadioGroup,
} from "../../components/postulantes/formControls.jsx";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import {
    getRoles,
    getUsuarioById,
    updateUsuario,
    getEmpresas,
    getPatronos,
} from "../../services/usuarios.service.js";
import {
    defaultUsuarioValues,
    usuarioSchema,
} from "../../validators/usuarios.validator.js";

function EditarUsuario() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [patronos, setPatronos] = useState([]);
    const [serverError, setServerError] = useState("");
    const [loadingUser, setLoadingUser] = useState(true);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        control,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(usuarioSchema),
        defaultValues: defaultUsuarioValues,
    });

    const selectedRole = watch("rol_id") ?? 2;
    const selectedEmpresa = watch("empresa_id") ?? "";
    const selectedPatrono = watch("patrono_id") ?? "";
    const currentSueldo = watch("sueldo");
    const currentBonos = watch("bonos");
    const currentEmpresa = watch("empresa_id");
    const tieneSeguroGastos = watch("tiene_seguro_gastos_medicos");
    const tieneSeguroVida = watch("tiene_seguro_vida");
    const [originalSueldo, setOriginalSueldo] = useState(null);
    const [originalBonos, setOriginalBonos] = useState(null);
    const [originalEmpresa, setOriginalEmpresa] = useState(null);
    const hasSalaryChange =
        (originalSueldo !== null || originalBonos !== null) &&
        (Number(currentSueldo || 0) !== Number(originalSueldo || 0) ||
            Number(currentBonos || 0) !== Number(originalBonos || 0));
    const hasEmpresaChange =
        originalEmpresa !== null &&
        Number(currentEmpresa || 0) !== Number(originalEmpresa || 0);

    useEffect(() => {
        let active = true;
        Promise.all([getRoles(), getEmpresas(), getPatronos()])
            .then(([r, e, p]) => {
                if (active) {
                    setRoles(r || []);
                    setEmpresas(e || []);
                    setPatronos(p || []);
                }
            })
            .catch(() => {
                if (active) {
                    setRoles([]);
                    setEmpresas([]);
                    setPatronos([]);
                }
            });

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;
        setLoadingUser(true);
        getUsuarioById(id)
            .then((data) => {
                if (active) {
                    reset({
                        ...defaultUsuarioValues,
                        nombre: data.nombre || "",
                        correo: data.correo || "",
                        rol_id: data.rol?.id ?? 2,
                        activo: data.activo ?? true,
                        empresa_id: data.empresa?.id ?? null,
                        patrono_id: data.patrono?.id ?? null,
                        fecha_nacimiento: data.fecha_nacimiento
                            ? data.fecha_nacimiento.split("T")[0]
                            : "",
                        sexo: data.sexo || "",
                        dpi: data.dpi || "",
                        dpi_extendido_en: data.dpi_extendido_en || "",
                        direccion: data.direccion || "",
                        sueldo: data.sueldo ?? "",
                        bonos: data.bonos ?? "",
                        tiene_seguro_gastos_medicos:
                            data.tiene_seguro_gastos_medicos ?? false,
                        empresa_seguro_gastos_medicos:
                            data.empresa_seguro_gastos_medicos || "",
                        tiene_seguro_vida: data.tiene_seguro_vida ?? false,
                        empresa_seguro_vida: data.empresa_seguro_vida || "",
                    });
                    setOriginalSueldo(data.sueldo ?? null);
                    setOriginalBonos(data.bonos ?? null);
                    setOriginalEmpresa(data.empresa?.id ?? null);
                }
            })
            .catch((requestError) => {
                if (active) {
                    setServerError(
                        requestError.response?.data?.message ||
                            "No fue posible cargar el colaborador.",
                    );
                }
            })
            .finally(() => active && setLoadingUser(false));

        return () => {
            active = false;
        };
    }, [id, reset]);

    const onSubmit = async (values) => {
        try {
            setServerError("");
            const payload = {
                ...values,
                rol_id: Number(values.rol_id),
                empresa_id: values.empresa_id || null,
                patrono_id: values.patrono_id || null,
                fecha_nacimiento: values.fecha_nacimiento || null,
                sexo: values.sexo || null,
                dpi: values.dpi || null,
                dpi_extendido_en: values.dpi_extendido_en || null,
                direccion: values.direccion || null,
                sueldo: values.sueldo || null,
                bonos: values.bonos || null,
                motivo_cambio_sueldo: hasSalaryChange
                    ? values.motivo_cambio_sueldo || null
                    : null,
                motivo_cambio_empresa: hasEmpresaChange
                    ? values.motivo_cambio_empresa || null
                    : null,
                tiene_seguro_gastos_medicos:
                    values.tiene_seguro_gastos_medicos || false,
                empresa_seguro_gastos_medicos: values.tiene_seguro_gastos_medicos
                    ? values.empresa_seguro_gastos_medicos || null
                    : null,
                tiene_seguro_vida: values.tiene_seguro_vida || false,
                empresa_seguro_vida: values.tiene_seguro_vida
                    ? values.empresa_seguro_vida || null
                    : null,
            };
            await updateUsuario(id, payload);
            navigate("/colaboradores", {
                state: { mensaje: "Colaborador actualizado correctamente" },
            });
        } catch (requestError) {
            setServerError(
                requestError.response?.data?.message ||
                    "No fue posible actualizar el colaborador.",
            );
        }
    };

    return (
        <DashboardLayout title="Editar Colaborador">
            <div className="mx-auto max-w-3xl">
                <div className="mb-6 flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => navigate("/colaboradores")}
                        aria-label="Volver a colaboradores"
                        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[#dce3ee] bg-white text-[#071b3b] transition hover:bg-[#f0f4fa]"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-[-0.04em] text-[#071b3b] sm:text-3xl">
                            Editar Colaborador
                        </h1>
                        <p className="mt-1 text-[#5b6e8b]">
                            Actualiza la información del colaborador.
                        </p>
                    </div>
                </div>

                {loadingUser ? (
                    <div className="rounded-[26px] bg-white p-10 text-center text-[#5b6e8b] shadow-[0_10px_24px_rgba(20,43,89,0.06)]">
                        Cargando colaborador...
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

                        <div className="grid gap-5">
                            <Field label="Nombre *" error={errors.nombre?.message}>
                                <Input
                                    registration={register("nombre")}
                                    placeholder="Ej. Carlos Méndez"
                                />
                            </Field>

                            <Field label="Correo *" error={errors.correo?.message}>
                                <Input
                                    type="email"
                                    registration={register("correo")}
                                    placeholder="nombre@empresa.com"
                                />
                            </Field>

                            <Field label="Rol *" error={errors.rol_id?.message}>
                                <Select
                                    registration={{
                                        ...register("rol_id", { valueAsNumber: true }),
                                        value: selectedRole,
                                        onChange: (event) =>
                                            setValue("rol_id", Number(event.target.value), {
                                                shouldValidate: true,
                                            }),
                                    }}
                                >
                                    {roles.length === 0 ? (
                                        <option value={2}>Usuario</option>
                                    ) : (
                                        roles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.nombre}
                                            </option>
                                        ))
                                    )}
                                </Select>
                            </Field>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field label="Empresa" error={errors.empresa_id?.message}>
                                    <Select
                                        registration={{
                                            ...register("empresa_id", { valueAsNumber: true }),
                                            value: selectedEmpresa,
                                            onChange: (event) =>
                                                setValue(
                                                    "empresa_id",
                                                    event.target.value
                                                        ? Number(event.target.value)
                                                        : null,
                                                    {
                                                        shouldValidate: true,
                                                    },
                                                ),
                                        }}
                                    >
                                        <option value="">Sin empresa</option>
                                        {empresas.map((empresa) => (
                                            <option key={empresa.id} value={empresa.id}>
                                                {empresa.nombre_empresa}
                                            </option>
                                        ))}
                                    </Select>
                                </Field>

                                <Field label="Patrono" error={errors.patrono_id?.message}>
                                    <Select
                                        registration={{
                                            ...register("patrono_id", { valueAsNumber: true }),
                                            value: selectedPatrono,
                                            onChange: (event) =>
                                                setValue(
                                                    "patrono_id",
                                                    event.target.value
                                                        ? Number(event.target.value)
                                                        : null,
                                                    {
                                                        shouldValidate: true,
                                                    },
                                                ),
                                        }}
                                    >
                                        <option value="">Sin patrono</option>
                                        {patronos.map((patrono) => (
                                            <option key={patrono.id} value={patrono.id}>
                                                {patrono.razon_social}
                                            </option>
                                        ))}
                                    </Select>
                                </Field>
                            </div>

                            {hasEmpresaChange && (
                                <Field
                                    label="Motivo del cambio de empresa *"
                                    error={errors.motivo_cambio_empresa?.message}
                                >
                                    <textarea
                                        {...register("motivo_cambio_empresa", {
                                            required:
                                                "El motivo es requerido cuando cambia la empresa",
                                        })}
                                        rows={3}
                                        className="w-full rounded-xl border border-[#dce3ee] bg-white px-4 py-3 text-[#071b3b] transition placeholder:text-[#9ba8c2] focus:border-[#3162e9] focus:outline-none"
                                        placeholder="Explique el motivo del cambio de empresa..."
                                    />
                                </Field>
                            )}

                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field
                                    label="Fecha de nacimiento"
                                    error={errors.fecha_nacimiento?.message}
                                >
                                    <Input
                                        registration={register("fecha_nacimiento")}
                                        type="date"
                                    />
                                </Field>

                                <Field label="Sexo" error={errors.sexo?.message}>
                                    <Select registration={register("sexo")}>
                                        <option value="">Seleccionar...</option>
                                        <option value="MASCULINO">Masculino</option>
                                        <option value="FEMENINO">Femenino</option>
                                    </Select>
                                </Field>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field label="DPI" error={errors.dpi?.message}>
                                    <Input
                                        registration={register("dpi")}
                                        placeholder="Número de DPI"
                                    />
                                </Field>

                                <Field
                                    label="Extendido en"
                                    error={errors.dpi_extendido_en?.message}
                                >
                                    <Input
                                        registration={register("dpi_extendido_en")}
                                        placeholder="Ej. Guatemala"
                                    />
                                </Field>
                            </div>

                            <Field label="Dirección" error={errors.direccion?.message}>
                                <Input
                                    registration={register("direccion")}
                                    placeholder="Dirección completa"
                                />
                            </Field>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <Field label="Sueldo Base" error={errors.sueldo?.message}>
                                    <Input
                                        registration={register("sueldo")}
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </Field>

                                <Field
                                    label="Bonificación decreto ley"
                                    error={errors.bonos?.message}
                                >
                                    <Input
                                        registration={register("bonos")}
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </Field>
                            </div>

                            <section className="mt-6 rounded-[26px] bg-white p-6 shadow-[0_10px_24px_rgba(20,43,89,0.06)] sm:p-8">
                                <div className="flex items-center gap-3">
                                    <Shield className="h-6 w-6 text-[#3162e9]" />
                                    <h2 className="text-lg font-bold text-[#071b3b]">Seguros</h2>
                                </div>

                                <div className="mt-6 space-y-6">
                                    <div className="rounded-xl bg-[#f0f4fa] p-5">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-base font-semibold text-[#071b3b]">
                                                Seguro de Gastos Médicos
                                            </h3>
                                            <RadioGroup
                                                control={control}
                                                name="tiene_seguro_gastos_medicos"
                                                options={[
                                                    { value: true, label: "Sí" },
                                                    { value: false, label: "No" },
                                                ]}
                                                className="flex items-center gap-4"
                                            />
                                        </div>
                                        {tieneSeguroGastos && (
                                            <Field
                                                label="Empresa aseguradora *"
                                                error={errors.empresa_seguro_gastos_medicos?.message}
                                            >
                                                <Input
                                                    registration={register(
                                                        "empresa_seguro_gastos_medicos",
                                                        {
                                                            required: tieneSeguroGastos
                                                                ? "La empresa aseguradora es requerida"
                                                                : false,
                                                        },
                                                    )}
                                                    placeholder="Nombre de la empresa aseguradora"
                                                />
                                            </Field>
                                        )}
                                    </div>

                                    <div className="rounded-xl bg-[#f0f4fa] p-5">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-base font-semibold text-[#071b3b]">
                                                Seguro de Vida
                                            </h3>
                                            <RadioGroup
                                                control={control}
                                                name="tiene_seguro_vida"
                                                options={[
                                                    { value: true, label: "Sí" },
                                                    { value: false, label: "No" },
                                                ]}
                                                className="flex items-center gap-4"
                                            />
                                        </div>
                                        {tieneSeguroVida && (
                                            <Field
                                                label="Empresa aseguradora *"
                                                error={errors.empresa_seguro_vida?.message}
                                            >
                                                <Input
                                                    registration={register("empresa_seguro_vida", {
                                                        required: tieneSeguroVida
                                                            ? "La empresa aseguradora es requerida"
                                                            : false,
                                                    })}
                                                    placeholder="Nombre de la empresa aseguradora"
                                                />
                                            </Field>
                                        )}
                                    </div>
                                </div>
                            </section>

                            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#dce3ee] px-4 py-4 text-[#071b3b]">
                                <input
                                    type="checkbox"
                                    {...register("activo")}
                                    className="h-5 w-5 cursor-pointer accent-[#3162e9]"
                                />
                                <span className="font-semibold">Colaborador activo</span>
                            </label>
                        </div>

                        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => navigate("/colaboradores")}
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

export default EditarUsuario;
