import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Download, Save, Shield, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Field,
    Input,
    Select,
    RadioGroup,
} from "../../components/postulantes/formControls.jsx";
import DashboardLayout from "../../layouts/DashboardLayout.jsx";
import { useAuth } from "../../hooks/useAuth.js";
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
    const { user: authUser } = useAuth();
    const [roles, setRoles] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [patronos, setPatronos] = useState([]);
    const [puestos, setPuestos] = useState([]);
    const [serverError, setServerError] = useState("");
    const [pdfModalOpen, setPdfModalOpen] = useState(false);
    const [pdfNotes, setPdfNotes] = useState("");
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(usuarioSchema),
        defaultValues: defaultUsuarioValues,
    });

    const selectedRole = watch("rol_id") ?? 2;
    const selectedEmpresa = watch("empresa_id") ?? "";
    const selectedPatrono = watch("patrono_id") ?? "";
    const selectedPuesto = watch("puesto_id") ?? "";
    const tieneSeguroGastos = watch("tiene_seguro_gastos_medicos");
    const tieneSeguroVida = watch("tiene_seguro_vida");
    const puestoSeleccionado =
        puestos.find((puesto) => puesto.id === Number(selectedPuesto)) || null;
    const empresaSeleccionada =
        empresas.find((empresa) => empresa.id === Number(selectedEmpresa))
        ?.nombre_empresa || "";
    const patronoSeleccionado =
        patronos.find((patrono) => patrono.id === Number(selectedPatrono))
            ?.razon_social || "";

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
                dpi: postulante.dpi || "",
                dpi_extendido_en: postulante.dpi_extendido_en || "",
                direccion: postulante.direccion || "",
                fecha_nacimiento: postulante.fecha_nacimiento
                    ? postulante.fecha_nacimiento.split("T")[0]
                    : "",
                sueldo: postulante.sueldo ?? "",
            });
        }
    }, [location.state, reset]);

    const buildPdfHtml = () => {
        const nombre = watch("nombre") || "Sin nombre";
        const puesto = puestoSeleccionado?.nombre || "Sin puesto";
        const departamento =
            puestoSeleccionado?.departamento?.nombre || "Sin departamento";
        const sueldo = watch("sueldo") || "0.00";
        const bonos = watch("bonos") || "0.00";
        const dpi = watch("dpi") || "Sin DPI";
        const total = Number(sueldo || 0) + Number(bonos || 0);
        const documentTitle =
            [empresaSeleccionada, patronoSeleccionado].filter(Boolean).join(" / ") ||
            "Documento del colaborador";
        const generatedBy =
            authUser?.nombre || authUser?.correo || "Usuario del sistema";
        const createdAt = new Date().toLocaleString("es-GT", {
            dateStyle: "medium",
            timeStyle: "short",
        });
        const notes = pdfNotes.trim() || "Sin notas adicionales";

        return `<!doctype html>
        <html lang="es">
            <head>
                <meta charset="UTF-8" />
                <title>${documentTitle}</title>
                <style>
                    :root {
                        --navy: #0a1f44;
                        --navy-light: #14315e;
                        --accent: #2e5eea;
                        --accent-soft: #eef2fd;
                        --ink: #101828;
                        --muted: #667085;
                        --line: #e4e8f0;
                        --bg: #eef1f6;
                        --paper: #ffffff;
                    }
                    * { box-sizing: border-box; }
                    body {
                        margin: 0;
                        padding: 40px 24px;
                        background: var(--bg);
                        font-family: 'Helvetica Neue', Arial, sans-serif;
                        color: var(--ink);
                        -webkit-font-smoothing: antialiased;
                    }
                    .page {
                        max-width: 880px;
                        margin: 0 auto;
                        background: var(--paper);
                        border-radius: 18px;
                        overflow: hidden;
                        box-shadow: 0 20px 45px rgba(10, 31, 68, 0.12);
                    }

                    /* Header */
                    .header {
                        position: relative;
                        background: linear-gradient(120deg, var(--navy) 0%, var(--navy-light) 55%, var(--accent) 130%);
                        color: #fff;
                        padding: 36px 40px 30px;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        color-adjust: exact;
                    }
                    .header::after {
                        content: "";
                        position: absolute;
                        inset: 0;
                        background: radial-gradient(circle at 88% 20%, rgba(255,255,255,0.12), transparent 55%);
                        pointer-events: none;
                    }
                    .eyebrow {
                        font-size: 11px;
                        font-weight: 700;
                        letter-spacing: 0.16em;
                        text-transform: uppercase;
                        color: rgba(255,255,255,0.65);
                        margin: 0 0 6px;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 26px;
                        font-weight: 700;
                        letter-spacing: -0.02em;
                        line-height: 1.25;
                        max-width: 640px;
                    }
                    .header .doc-id {
                        position: absolute;
                        top: 36px;
                        right: 40px;
                        text-align: right;
                        font-size: 11px;
                        color: rgba(255,255,255,0.7);
                        letter-spacing: 0.04em;
                    }

                    /* Content */
                    .content { padding: 34px 40px 40px; }

                    .section-title {
                        font-size: 12px;
                        font-weight: 700;
                        letter-spacing: 0.1em;
                        text-transform: uppercase;
                        color: var(--accent);
                        margin: 0 0 14px;
                    }

                    .meta {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 14px 16px;
                    }
                    .item {
                        background: #fbfcfe;
                        border: 1px solid var(--line);
                        border-left: 3px solid var(--accent);
                        border-radius: 10px;
                        padding: 14px 16px;
                    }
                    .span-2 { grid-column: 1 / -1; }
                    .label {
                        display: block;
                        font-size: 11px;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.06em;
                        color: var(--muted);
                        margin-bottom: 5px;
                    }
                    .value {
                        font-size: 16px;
                        font-weight: 700;
                        color: var(--ink);
                    }
                    .comp {
                        display: grid;
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                        gap: 14px 16px;
                        margin-top: 22px;
                    }
                    .cell {
                        background: #fbfcfe;
                        border: 1px solid var(--line);
                        border-left: 3px solid var(--accent);
                        border-radius: 10px;
                        padding: 14px 16px;
                    }

                    /* Notes */
                    .notes-block { margin-top: 22px; }
                    .notes {
                        border: 1px solid var(--line);
                        border-radius: 12px;
                        background: #fbfcfe;
                        padding: 18px 20px;
                        min-height: 130px;
                        white-space: pre-wrap;
                        line-height: 1.65;
                        font-size: 13.5px;
                        color: var(--ink);
                    }

                    /* Signatures */
                    .signatures {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 28px;
                        margin-top: 110px;
                    }
                    .signature-box {
                        border-top: 1.5px solid var(--navy);
                        padding-top: 12px;
                        min-height: 70px;
                    }
                    .signature-box span {
                        display: inline-block;
                        font-size: 11px;
                        letter-spacing: 0.06em;
                        text-transform: uppercase;
                        color: var(--muted);
                        font-weight: 600;
                    }

                    /* Footer */
                    .footer {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        gap: 12px;
                        margin-top: 36px;
                        padding-top: 16px;
                        border-top: 1px solid var(--line);
                        font-size: 11px;
                        color: var(--muted);
                    }
                    .footer strong { color: var(--ink); }

                    @media print {
                        body {
                            background: white;
                            padding: 0;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                            color-adjust: exact;
                        }
                        .page {
                            box-shadow: none;
                            border-radius: 0;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                            color-adjust: exact;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="page">
                    <div class="header">
                        <p class="eyebrow">Ficha del colaborador</p>
                        <h1>${documentTitle}</h1>
                        <div class="doc-id">
                            Generado: ${createdAt}
                        </div>
                    </div>

                    <div class="content">
                        <p class="section-title">Datos generales</p>
                        <div class="meta">
                            <div class="item span-2">
                                <span class="label">Nombre</span>
                                <div class="value">${nombre}</div>
                            </div>
                            <div class="item">
                                <span class="label">Puesto</span>
                                <div class="value">${puesto}</div>
                            </div>
                            <div class="item">
                                <span class="label">Departamento</span>
                                <div class="value">${departamento}</div>
                            </div>
                            <div class="item span-2">
                                <span class="label">DPI</span>
                                <div class="value">${dpi}</div>
                            </div>
                        </div>

                        <div class="comp">
                            <div class="cell">
                                <span class="label">Sueldo base</span>
                                <div class="value">Q ${Number(sueldo || 0).toFixed(2)}</div>
                            </div>
                            <div class="cell">
                                <span class="label">Bonificación</span>
                                <div class="value">Q ${Number(bonos || 0).toFixed(2)}</div>
                            </div>
                            <div class="cell">
                                <span class="label">Total</span>
                                <div class="value">Q ${total}</div>
                            </div>
                        </div>

                        <div class="notes-block">
                            <p class="section-title">Notas</p>
                            <div class="notes">${notes}</div>
                        </div>

                        <div class="signatures">
                            <div class="signature-box">
                                <span>Firma del colaborador</span>
                            </div>
                            <div class="signature-box">
                                <span>Firma del responsable</span>
                            </div>
                        </div>

                        <div class="footer">
                            <span>Fecha de creación: <strong>${createdAt}</strong></span>
                            <span>Generado por: <strong>${generatedBy}</strong></span>
                        </div>
                    </div>
                </div>
            </body>
        </html>`;
    };

    const handleOpenPdfModal = () => setPdfModalOpen(true);

    const handleDownloadPdf = () => {
        const printWindow = window.open("", "_blank", "width=1200,height=1000");

        if (!printWindow) {
            setServerError("El navegador bloqueó la ventana de impresión.");
            return;
        }

        printWindow.document.write(buildPdfHtml());
        printWindow.document.close();

        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
        }, 250);

        setPdfNotes("");
        setPdfModalOpen(false);
    };

    const onSubmit = async (values) => {
        try {
            setServerError("");
            const payload = {
                ...values,
                empresa_id: values.empresa_id || null,
                patrono_id: values.patrono_id || null,
                puesto_id: values.puesto_id || null,
                fecha_nacimiento: values.fecha_nacimiento || null,
                sexo: values.sexo || null,
                dpi: values.dpi || null,
                dpi_extendido_en: values.dpi_extendido_en || null,
                direccion: values.direccion || null,
                sueldo: values.sueldo || null,
                bonos: values.bonos || null,
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
                                                event.target.value ? Number(event.target.value) : null,
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
                                                event.target.value ? Number(event.target.value) : null,
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

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field label="Puesto" error={errors.puesto_id?.message}>
                                <Select
                                    registration={{
                                        ...register("puesto_id", { valueAsNumber: true }),
                                        value: selectedPuesto,
                                        onChange: (event) =>
                                            setValue(
                                                "puesto_id",
                                                event.target.value ? Number(event.target.value) : null,
                                                {
                                                    shouldValidate: true,
                                                },
                                            ),
                                    }}
                                >
                                    <option value="">Sin puesto</option>
                                    {puestos.map((puesto) => (
                                        <option key={puesto.id} value={puesto.id}>
                                            {puesto.nombre}
                                        </option>
                                    ))}
                                </Select>
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
                                                { value: true, label: "Si" },
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
                                                { value: true, label: "Si" },
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
                            type="button"
                            onClick={handleOpenPdfModal}
                            className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#3162e9] bg-white px-6 font-bold text-[#3162e9] transition hover:bg-[#edf3ff]"
                        >
                            <Download className="h-5 w-5" />
                            Descargar PDF
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

                {pdfModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071b3b]/45 p-4">
                        <div className="w-full max-w-lg rounded-[26px] bg-white p-6 shadow-2xl">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5b6e8b]">
                                        Documento
                                    </p>
                                    <h3 className="text-2xl font-bold text-[#071b3b]">
                                        Agregar notas
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setPdfModalOpen(false)}
                                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#dce3ee] bg-white text-[#071b3b] transition hover:bg-[#f0f4fa]"
                                    aria-label="Cerrar nota"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mt-6">
                                <label className="mb-2 block text-sm font-semibold text-[#071b3b]">
                                    Notas del documento
                                </label>
                                <textarea
                                    value={pdfNotes}
                                    onChange={(event) => setPdfNotes(event.target.value)}
                                    rows={7}
                                    className="w-full rounded-2xl border border-[#dce3ee] bg-[#f8faff] px-4 py-3 text-[#071b3b] outline-none transition focus:border-[#3162e9]"
                                    placeholder="Escribe aquí las observaciones, comentarios o información adicional que quieres incluir en el PDF..."
                                />
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setPdfModalOpen(false)}
                                    className="h-12 cursor-pointer rounded-2xl border border-[#dce3ee] px-5 font-bold text-[#5b6e8b] transition hover:bg-[#f0f4fa]"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDownloadPdf}
                                    className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#3162e9] px-6 font-bold text-white transition hover:bg-[#183fca]"
                                >
                                    <Download className="h-5 w-5" />
                                    Descargar PDF
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default NuevoUsuario;