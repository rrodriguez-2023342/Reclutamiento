import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Field,
    Input,
    SearchableSelect,
    RadioGroup,
    Select,
} from "../../components/postulantes/formControls.jsx";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import UsuarioPdf from "../../components/usuarios/UsuarioPdf.jsx";
import CamposAltaUsuario from "../../components/usuarios/CamposAltaUsuario.jsx";
import {
    createUsuario,
    getRoles,
    getEmpresas,
    getPatronos,
    getPuestos,
} from "../../services/usuarios.service.js";
import {
    defaultUsuarioValues,
    usuarioSchema,
} from "../../validators/usuarios.validator.js";

function NuevoUsuario() {
    const navigate = useNavigate();
    const location = useLocation();
    const [roles, setRoles] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [patronos, setPatronos] = useState([]);
    const [puestos, setPuestos] = useState([]);
    const [serverError, setServerError] = useState("");
    const {
        register,
        handleSubmit,
        getValues,
        watch,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(usuarioSchema),
        defaultValues: defaultUsuarioValues,
    });

    const tieneSeguroGastos = watch("tiene_seguro_gastos_medicos");
    const tieneSeguroVida = watch("tiene_seguro_vida");
    const tipoContrato = watch("tipo_contrato");
    const selectedEmpresa = watch("empresa_id") ?? "";
    const selectedPatrono = watch("patrono_id") ?? "";
    const selectedPuesto = watch("puesto_id") ?? "";
    const puestoSeleccionado =
        puestos.find((puesto) => puesto.id === Number(selectedPuesto)) || null;
    const empresaSeleccionada =
        empresas.find((empresa) => empresa.id === Number(selectedEmpresa))
            ?.nombre_empresa || "";
    const patronoSeleccionado =
        patronos.find((patrono) => patrono.id === Number(selectedPatrono))
            ?.razon_social || "";

    const getHighestEducation = (historial = []) => {
        const priority = {
            PRIMARIA: 1,
            BASICOS: 2,
            DIVERSIFICADO: 3,
            TECNICO: 4,
            LICENCIATURA: 5,
            MAESTRIA: 6,
            OTRO: 0,
        };
        return [...historial].sort(
            (a, b) => (priority[b.nivel] || 0) - (priority[a.nivel] || 0),
        )[0]?.nivel || "";
    };

    useEffect(() => {
        let active = true;
        Promise.all([getRoles(), getEmpresas(), getPatronos(), getPuestos()])
            .then(([r, e, p, pst]) => {
                if (active) {
                    setRoles(r || []);
                    setEmpresas(e || []);
                    setPatronos(p || []);
                    setPuestos(pst || []);
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
        const postulante = location.state?.postulante;
        if (postulante) {
            reset({
                ...defaultUsuarioValues,
                nombre: postulante.nombre || "",
                correo: postulante.correo || "",
                empresa_id: postulante.empresa_id || null,
                patrono_id: postulante.patrono_id || null,
                dpi: postulante.dpi || "",
                dpi_extendido_en: postulante.dpi_extendido_en || "",
                nit: postulante.nit || "",
                direccion: postulante.direccion || "",
                estado_civil: postulante.estado_civil || "",
                sexo: postulante.sexo || "",
                telefono: postulante.telefono || "",
                ultimo_grado_cursado: getHighestEducation(
                    postulante.educacionHistorial,
                ),
                contacto_emergencia_nombre:
                    postulante.datosFamiliares?.find(
                        (familiar) => familiar.parentesco === "EMERGENCIA",
                    )?.nombres_apellidos || "",
                contacto_emergencia_telefono:
                    postulante.datosFamiliares?.find(
                        (familiar) => familiar.parentesco === "EMERGENCIA",
                    )?.telefono || "",
                fecha_nacimiento: postulante.fecha_nacimiento
                    ? postulante.fecha_nacimiento.split("T")[0]
                    : "",
                fecha_contratacion: postulante.fecha_contratacion
                    ? postulante.fecha_contratacion.split("T")[0]
                    : "",
                sueldo: postulante.sueldo ?? "",
                moneda_sueldo: postulante.moneda_sueldo || "QUETZAL",
                banco: postulante.banco || "",
                tipo_cuenta_bancaria: postulante.tipo_cuenta_bancaria || "",
                numero_cuenta_bancaria:
                    postulante.numero_cuenta_bancaria || "",
            });
        }
    }, [location.state, reset]);

    const onSubmit = async (values) => {
        try {
            setServerError("");
            const payload = {
                ...values,
                empresa_id: values.empresa_id || null,
                patrono_id: values.patrono_id || null,
                puesto_id: values.puesto_id || null,
                fecha_nacimiento: values.fecha_nacimiento || null,
                estado_civil: values.estado_civil || null,
                nacionalidad: values.nacionalidad || null,
                telefono: values.telefono || null,
                ultimo_grado_cursado: values.ultimo_grado_cursado || null,
                tipo_contrato: values.tipo_contrato || "INDEFINIDO",
                fecha_fin_contrato:
                    values.tipo_contrato === "DEFINIDO"
                        ? values.fecha_fin_contrato || null
                        : null,
                nit: values.nit || null,
                numero_afiliacion_igss: values.numero_afiliacion_igss || null,
                sexo: values.sexo || null,
                dpi: values.dpi || null,
                dpi_extendido_en: values.dpi_extendido_en || null,
                direccion: values.direccion || null,
                sueldo: values.sueldo || null,
                bonos: values.bonos || null,
                moneda_sueldo: values.moneda_sueldo || "QUETZAL",
                banco: values.banco || null,
                tipo_cuenta_bancaria: values.tipo_cuenta_bancaria || null,
                numero_cuenta_bancaria: values.numero_cuenta_bancaria || null,
                contacto_emergencia_nombre:
                    values.contacto_emergencia_nombre || null,
                contacto_emergencia_telefono:
                    values.contacto_emergencia_telefono || null,
                tiene_seguro_gastos_medicos:
                    values.tiene_seguro_gastos_medicos || false,
                empresa_seguro_gastos_medicos: values.tiene_seguro_gastos_medicos
                    ? values.empresa_seguro_gastos_medicos || null
                    : null,
                tipo_seguro_gastos_medicos: values.tiene_seguro_gastos_medicos
                    ? values.tipo_seguro_gastos_medicos || null
                    : null,
                categoria_seguro_gastos_medicos: values.tiene_seguro_gastos_medicos
                    ? values.categoria_seguro_gastos_medicos || null
                    : null,
                tiene_seguro_vida: values.tiene_seguro_vida || false,
                empresa_seguro_vida: values.tiene_seguro_vida
                    ? values.empresa_seguro_vida || null
                    : null,
                categoria_seguro_vida: values.tiene_seguro_vida
                    ? values.categoria_seguro_vida || null
                    : null,
            };
            await createUsuario(payload);
            navigate("/colaboradores", {
                state: { mensaje: "Colaborador creado correctamente" },
            });
        } catch (requestError) {
            setServerError(
                requestError.response?.data?.message ||
                    "No fue posible crear el colaborador.",
            );
        }
    };

    return (
        <DashboardLayout title="Nuevo Colaborador">
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
                            Nuevo Colaborador
                        </h1>
                        <p className="mt-1 text-[#5b6e8b]">
                            Registra a un nuevo miembro del equipo.
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
                                registration={register("rol_id")}
                                error={errors.rol_id?.message}
                            >
                                <option value="">Seleccionar rol</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.nombre}
                                    </option>
                                ))}
                            </Select>
                        </Field>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label="Empresa" error={errors.empresa_id?.message}>
                                <SearchableSelect
                                    control={control}
                                    name="empresa_id"
                                    options={[
                                        { value: "", label: "Sin empresa" },
                                        ...empresas.map((empresa) => ({
                                            value: empresa.id,
                                            label: empresa.nombre_empresa,
                                        })),
                                    ]}
                                    placeholder="Sin empresa"
                                    valueAsNumber
                                    error={errors.empresa_id?.message}
                                />
                            </Field>

                            <Field label="Patrono" error={errors.patrono_id?.message}>
                                <SearchableSelect
                                    control={control}
                                    name="patrono_id"
                                    options={[
                                        { value: "", label: "Sin patrono" },
                                        ...patronos.map((patrono) => ({
                                            value: patrono.id,
                                            label: patrono.razon_social,
                                        })),
                                    ]}
                                    placeholder="Sin patrono"
                                    valueAsNumber
                                    error={errors.patrono_id?.message}
                                />
                            </Field>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label="Puesto" error={errors.puesto_id?.message}>
                                <SearchableSelect
                                    control={control}
                                    name="puesto_id"
                                    options={[
                                        { value: "", label: "Sin puesto" },
                                        ...puestos.map((puesto) => ({
                                            value: puesto.id,
                                            label: puesto.nombre,
                                        })),
                                    ]}
                                    placeholder="Sin puesto"
                                    valueAsNumber
                                    error={errors.puesto_id?.message}
                                />
                            </Field>
                        </div>

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

                            <Field
                                label="Fecha de contratación *"
                                error={errors.fecha_contratacion?.message}
                            >
                                <Input
                                    registration={register("fecha_contratacion")}
                                    type="date"
                                />
                            </Field>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field
                                label="Tipo de contrato *"
                                error={errors.tipo_contrato?.message}
                            >
                                <Select registration={register("tipo_contrato")}>
                                    <option value="INDEFINIDO">Indefinido</option>
                                    <option value="DEFINIDO">Definido</option>
                                </Select>
                            </Field>
                            {tipoContrato === "DEFINIDO" && (
                                <Field
                                    label="Fecha de finalización *"
                                    error={errors.fecha_fin_contrato?.message}
                                >
                                    <Input
                                        registration={register("fecha_fin_contrato")}
                                        type="date"
                                    />
                                </Field>
                            )}
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
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

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label="NIT" error={errors.nit?.message}>
                                <Input
                                    registration={register("nit")}
                                    placeholder="Número de NIT"
                                />
                            </Field>
                            <Field
                                label="No. de afiliación IGSS"
                                error={errors.numero_afiliacion_igss?.message}
                            >
                                <Input
                                    registration={register("numero_afiliacion_igss")}
                                    placeholder="Número de afiliación IGSS"
                                />
                            </Field>
                        </div>

                        <Field label="Dirección" error={errors.direccion?.message}>
                            <Input
                                registration={register("direccion")}
                                placeholder="Dirección completa"
                            />
                        </Field>

                        <CamposAltaUsuario
                            register={register}
                            errors={errors}
                            valorTipoCuenta={watch("tipo_cuenta_bancaria") || ""}
                        />

                        <div className="grid gap-5 sm:grid-cols-3">
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
                            <Field
                                label="Moneda del sueldo"
                                error={errors.moneda_sueldo?.message}
                            >
                                <Select registration={register("moneda_sueldo")}>
                                    <option value="QUETZAL">Quetzales (GTQ)</option>
                                    <option value="DOLAR">Dólares (USD)</option>
                                </Select>
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
                                                { value: true, label: "Si" },
                                                { value: false, label: "No" },
                                            ]}
                                            className="flex items-center gap-4"
                                        />
                                    </div>
                                    {tieneSeguroGastos && (
                                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                            <Field
                                                label="Modalidad *"
                                                error={errors.tipo_seguro_gastos_medicos?.message}
                                            >
                                                <Select
                                                    registration={register("tipo_seguro_gastos_medicos")}
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    <option value="INDIVIDUAL">Individual</option>
                                                    <option value="FAMILIAR">Familiar</option>
                                                </Select>
                                            </Field>
                                            {watch("tipo_seguro_gastos_medicos") && (
                                                <>
                                                    <Field
                                                        label="Empresa aseguradora *"
                                                        error={
                                                            errors.empresa_seguro_gastos_medicos?.message
                                                        }
                                                    >
                                                        <Input
                                                            registration={register(
                                                                "empresa_seguro_gastos_medicos",
                                                            )}
                                                            placeholder="Nombre de la empresa aseguradora"
                                                        />
                                                    </Field>
                                                    <Field
                                                        label="Categoría *"
                                                        error={
                                                            errors.categoria_seguro_gastos_medicos?.message
                                                        }
                                                    >
                                                        <Input
                                                            registration={register(
                                                                "categoria_seguro_gastos_medicos",
                                                            )}
                                                            placeholder="Categoría del seguro médico"
                                                        />
                                                    </Field>
                                                </>
                                            )}
                                        </div>
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
                                                { value: true, label: "Si" },
                                                { value: false, label: "No" },
                                            ]}
                                            className="flex items-center gap-4"
                                        />
                                    </div>
                                    {tieneSeguroVida && (
                                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                            <Field
                                                label="Empresa aseguradora *"
                                                error={errors.empresa_seguro_vida?.message}
                                            >
                                                <Input
                                                    registration={register("empresa_seguro_vida")}
                                                    placeholder="Nombre de la empresa aseguradora"
                                                />
                                            </Field>
                                            <Field
                                                label="Categoría *"
                                                error={errors.categoria_seguro_vida?.message}
                                            >
                                                <Input
                                                    registration={register("categoria_seguro_vida")}
                                                    placeholder="Categoría del seguro de vida"
                                                />
                                            </Field>
                                        </div>
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

                        <UsuarioPdf
                            getUsuario={getValues}
                            puesto={puestoSeleccionado}
                            empresa={empresaSeleccionada}
                            patrono={patronoSeleccionado}
                            onError={setServerError}
                        />

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

export default NuevoUsuario;