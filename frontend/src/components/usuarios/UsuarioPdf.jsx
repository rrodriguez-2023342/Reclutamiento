import { useState } from "react";
import { Download, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { registrarBajaUsuario } from "../../services/usuarios.service.js";

const escapeHtml = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (character) => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        };
        return entities[character];
    });

function buildPdfHtml({
    usuario,
    puesto,
    empresa,
    patrono,
    generatedBy,
    notes,
    tipoDocumento,
    fechaBaja,
    motivoBaja,
    reingresoBaja,
}) {
    const nombre = usuario.nombre || "Sin nombre";
    const nombrePuesto = puesto?.nombre || "Sin puesto";
    const departamento = puesto?.departamento?.nombre || "Sin departamento";
    const formatDate = (value) => {
        if (!value) return "Sin fecha";
        const date = String(value).split("T")[0];
        return new Date(`${date}T00:00:00`).toLocaleDateString("es-GT", {
            dateStyle: "long",
        });
    };
    const estadoCivilLabels = {
        SOLTERO: "Soltero(a)",
        CASADO: "Casado(a)",
        UNIDO: "Unido(a)",
        VIUDO: "Viudo(a)",
        DIVORCIADO: "Divorciado(a)",
    };
    const nivelEducativoLabels = {
        PRIMARIA: "Primaria",
        BASICOS: "Básicos",
        DIVERSIFICADO: "Diversificado",
        TECNICO: "Técnico",
        LICENCIATURA: "Licenciatura",
        MAESTRIA: "Maestría",
        OTRO: "Otro",
    };
    const modalidadSeguroLabels = {
        INDIVIDUAL: "Individual",
        FAMILIAR: "Familiar",
    };
    const sueldo = Number(usuario.sueldo || 0);
    const bonos = Number(usuario.bonos || 0);
    const moneda = usuario.moneda_sueldo === "DOLAR"
        ? { simbolo: "$", codigo: "USD" }
        : { simbolo: "Q", codigo: "GTQ" };
    const documentTitle =
        [empresa, patrono].filter(Boolean).join(" / ") ||
        "Documento del colaborador";
    const createdAt = new Date().toLocaleString("es-GT", {
        dateStyle: "medium",
        timeStyle: "short",
    });
    const esBaja = tipoDocumento === "BAJA";
    const fechaBajaFormateada = fechaBaja ? formatDate(fechaBaja) : "";
    const values = {
        title: documentTitle,
        company: empresa || "Sin especificar",
        patron: patrono || "Sin especificar",
        documentType: esBaja ? "Baja del colaborador" : "Alta del colaborador",
        name: nombre,
        position: nombrePuesto,
        department: departamento,
        contractType:
            usuario.tipo_contrato === "DEFINIDO" ? "Definido" : "Indefinido",
        hireDate: formatDate(usuario.fecha_contratacion),
        contractEnd:
            usuario.tipo_contrato === "DEFINIDO"
                ? formatDate(usuario.fecha_fin_contrato)
                : "No aplica",
        dpi: usuario.dpi || "Sin DPI",
        maritalStatus: estadoCivilLabels[usuario.estado_civil] || "Sin especificar",
        birthDate: formatDate(usuario.fecha_nacimiento),
        nationality: usuario.nacionalidad || "Sin especificar",
        address: usuario.direccion || "Sin especificar",
        education: nivelEducativoLabels[usuario.ultimo_grado_cursado] || "Sin especificar",
        nit: usuario.nit || "Sin NIT",
        phone: usuario.telefono || "Sin especificar",
        igss: usuario.numero_afiliacion_igss || "Sin número",
        salary: `${moneda.simbolo} ${sueldo.toFixed(2)} (${moneda.codigo})`,
        bonus: `${moneda.simbolo} ${bonos.toFixed(2)} (${moneda.codigo})`,
        total: `${moneda.simbolo} ${(sueldo + bonos).toFixed(2)} (${moneda.codigo})`,
        bank: usuario.banco || "Sin especificar",
        accountType: usuario.tipo_cuenta_bancaria || "Sin especificar",
        accountNumber: usuario.numero_cuenta_bancaria || "Sin especificar",
        emergencyName: usuario.contacto_emergencia_nombre || "Sin especificar",
        emergencyPhone: usuario.contacto_emergencia_telefono || "Sin especificar",
        medicalInsurance: usuario.tiene_seguro_gastos_medicos ? "Sí" : "No",
        medicalCompany: usuario.empresa_seguro_gastos_medicos || "Sin especificar",
        medicalModality:
            modalidadSeguroLabels[usuario.tipo_seguro_gastos_medicos] ||
            "Sin especificar",
        medicalCategory:
            usuario.categoria_seguro_gastos_medicos || "Sin especificar",
        lifeInsurance: usuario.tiene_seguro_vida ? "Sí" : "No",
        lifeCompany: usuario.empresa_seguro_vida || "Sin especificar",
        lifeCategory: usuario.categoria_seguro_vida || "Sin especificar",
        notes: notes || "Sin notas adicionales",
        bajaDate: fechaBajaFormateada,
        bajaReason: motivoBaja || "",
        reentry: reingresoBaja ? "Sí" : "No",
        createdAt,
        generatedBy,
    };
    const safe = Object.fromEntries(
        Object.entries(values).map(([key, value]) => [key, escapeHtml(value)]),
    );

    return `<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <title>${safe.title}</title>
    <style>
        :root { --navy:#0a1f44; --navy-light:#14315e; --accent:#2e5eea; --ink:#101828; --muted:#667085; --line:#e4e8f0; --paper:#fff; }
        * { box-sizing:border-box; }
        body { margin:0; padding:40px 24px; background:#eef1f6; font-family:'Helvetica Neue',Arial,sans-serif; color:var(--ink); -webkit-font-smoothing:antialiased; }
        .page { max-width:880px; margin:0 auto; background:var(--paper); border-radius:18px; overflow:hidden; box-shadow:0 20px 45px rgba(10,31,68,.12); }
        .header { position:relative; background:linear-gradient(120deg,var(--navy) 0%,var(--navy-light) 55%,var(--accent) 130%); color:#fff; padding:36px 40px 30px; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        .header::after { content:""; position:absolute; inset:0; background:radial-gradient(circle at 88% 20%,rgba(255,255,255,.12),transparent 55%); pointer-events:none; }
        .eyebrow { margin:0 0 6px; color:rgba(255,255,255,.65); font-size:11px; font-weight:700; letter-spacing:.16em; text-transform:uppercase; }
        .header h1 { max-width:640px; margin:0; font-size:26px; font-weight:700; letter-spacing:-.02em; line-height:1.25; }
        .doc-id { position:absolute; top:36px; right:40px; color:rgba(255,255,255,.7); text-align:right; font-size:11px; letter-spacing:.04em; }
        .content { padding:34px 40px 40px; }
        .section-title { margin:0 0 14px; color:var(--accent); font-size:12px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; }
        .meta { display:grid; grid-template-columns:1fr 1fr; gap:14px 16px; }
        .meta-three { grid-template-columns:repeat(3,minmax(0,1fr)); }
        .item,.cell { padding:14px 16px; background:#fbfcfe; border:1px solid var(--line); border-left:3px solid var(--accent); border-radius:10px; }
        .span-2 { grid-column:1 / -1; }
        .span-3 { grid-column:1 / -1; }
        .label { display:block; margin-bottom:5px; color:var(--muted); font-size:11px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; }
        .value { color:var(--ink); font-size:16px; font-weight:700; }
        .termination { margin-top:26px; }
        .insurance-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px 12px; }
        .insurance-details { margin-top:4px; color:var(--muted); font-size:11px; line-height:1.4; }
        .insurance-details p { margin:2px 0 0; }
        .insurance-details strong { color:var(--ink); }
        .emergency-title { margin-top:22px; }
        .comp { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px 16px; margin-top:22px; }
        .notes-block { margin-top:22px; }
        .notes { min-height:130px; padding:18px 20px; background:#fbfcfe; border:1px solid var(--line); border-radius:12px; white-space:pre-wrap; line-height:1.65; font-size:13.5px; }
        .signatures { display:grid; grid-template-columns:1fr; gap:28px; margin-top:110px; }
        .signature-box { min-height:70px; padding-top:12px; border-top:1.5px solid var(--navy); }
        .signature-box span { display:inline-block; color:var(--muted); font-size:11px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; }
        .is-baja .signatures { margin-top:130px; }
        .is-baja .signature-box { min-height:110px; }
        .footer { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-top:36px; padding-top:16px; border-top:1px solid var(--line); color:var(--muted); font-size:11px; }
        .footer strong { color:var(--ink); }
        @page { size:letter; margin:8mm; }
        @media print {
            body { padding:0; background:#fff; -webkit-print-color-adjust:exact; print-color-adjust:exact; color-adjust:exact; }
            .page { display:flex; width:100%; height:261mm; max-width:none; flex-direction:column; border-radius:0; box-shadow:none; overflow:hidden; -webkit-print-color-adjust:exact; print-color-adjust:exact; color-adjust:exact; }
            .header { padding:16px 28px 12px; } .header h1 { font-size:20px; }
            .eyebrow { margin-bottom:4px; }
            .content { display:flex; flex:1; flex-direction:column; padding:12px 26px 14px; }
            .section-title { margin-bottom:5px; font-size:10px; }
            .meta,.comp { gap:5px 8px; } .item,.cell { padding:5px 8px; break-inside:avoid; }
            .label { margin-bottom:2px; font-size:8px; } .value { font-size:10.5px; line-height:1.2; overflow-wrap:anywhere; }
            .meta-three { grid-template-columns:repeat(3,minmax(0,1fr)); }
            .termination { margin-top:8px; }
            .insurance-grid { gap:5px 8px; }
            .insurance-details { margin-top:2px; font-size:8px; line-height:1.2; }
            .insurance-details p { margin-top:1px; }
            .emergency-title { margin-top:10px; }
            .comp { margin-top:8px; } .notes-block { margin-top:8px; break-inside:avoid; }
            .notes { min-height:16mm; max-height:none; overflow:visible; padding:7px 9px; font-size:10px; line-height:1.25; overflow-wrap:anywhere; }
            .signatures { gap:12px; margin-top:auto; padding-top:7mm; break-inside:avoid; }
            .signature-box { min-height:34px; padding-top:5px; }
            .is-baja .notes { min-height:24mm; }
            .is-baja .signatures { margin-top:auto; padding-top:18mm; }
            .is-baja .signature-box { min-height:70px; }
            .footer { margin-top:8px; padding-top:5px; break-inside:avoid; font-size:9px; }
        }
    </style>
</head>
<body>
    <div class="page${esBaja ? " is-baja" : ""}">
        <header class="header">
            <p class="eyebrow">${safe.documentType}</p>
            <h1>${safe.title}</h1>
        </header>
        <main class="content">
            <p class="section-title">Datos generales</p>
            <div class="meta meta-three">
                <div class="item span-3"><span class="label">Nombre del colaborador</span><div class="value">${safe.name}</div></div>
                <div class="item"><span class="label">Empresa</span><div class="value">${safe.company}</div></div>
                <div class="item"><span class="label">Patrono</span><div class="value">${safe.patron}</div></div>
                <div class="item"><span class="label">Puesto</span><div class="value">${safe.position}</div></div>
                <div class="item"><span class="label">Departamento</span><div class="value">${safe.department}</div></div>
                <div class="item"><span class="label">Tipo de contrato</span><div class="value">${safe.contractType}</div></div>
                <div class="item"><span class="label">Fecha de ingreso</span><div class="value">${safe.hireDate}</div></div>
                <div class="item"><span class="label">Fecha de finalización</span><div class="value">${safe.contractEnd}</div></div>
                <div class="item"><span class="label">DPI</span><div class="value">${safe.dpi}</div></div>
                <div class="item"><span class="label">Estado civil</span><div class="value">${safe.maritalStatus}</div></div>
                <div class="item"><span class="label">Fecha de nacimiento</span><div class="value">${safe.birthDate}</div></div>
                <div class="item"><span class="label">Nacionalidad</span><div class="value">${safe.nationality}</div></div>
                <div class="item"><span class="label">NIT</span><div class="value">${safe.nit}</div></div>
                <div class="item"><span class="label">Teléfono</span><div class="value">${safe.phone}</div></div>
                <div class="item"><span class="label">No. afiliación IGSS</span><div class="value">${safe.igss}</div></div>
                <div class="item span-3"><span class="label">Dirección completa</span><div class="value">${safe.address}</div></div>
                <div class="item span-3"><span class="label">Último grado cursado</span><div class="value">${safe.education}</div></div>
            </div>
            ${
                esBaja
                    ? `<section class="termination">
                <p class="section-title">Datos de baja</p>
                <div class="meta">
                    <div class="item"><span class="label">Fecha de baja</span><div class="value">${safe.bajaDate}</div></div>
                    <div class="item"><span class="label">Motivo de baja</span><div class="value">${safe.bajaReason}</div></div>
                    <div class="item"><span class="label">¿Reingreso?</span><div class="value">${safe.reentry}</div></div>
                </div>
            </section>`
                    : ""
            }
            ${
                !esBaja
                    ? `<section class="termination">
                <p class="section-title">Seguros</p>
                <div class="insurance-grid">
                    <div class="item">
                        <span class="label">Seguro de gastos médicos</span>
                        <div class="value">${safe.medicalInsurance}</div>
                        ${
                            usuario.tiene_seguro_gastos_medicos
                                ? `<div class="insurance-details">
                            <p>Empresa: <strong>${safe.medicalCompany}</strong></p>
                            <p>Modalidad: <strong>${safe.medicalModality}</strong></p>
                            <p>Categoría: <strong>${safe.medicalCategory}</strong></p>
                        </div>`
                                : ""
                        }
                    </div>
                    <div class="item">
                        <span class="label">Seguro de vida</span>
                        <div class="value">${safe.lifeInsurance}</div>
                        ${
                            usuario.tiene_seguro_vida
                                ? `<div class="insurance-details">
                            <p>Empresa: <strong>${safe.lifeCompany}</strong></p>
                            <p>Categoría: <strong>${safe.lifeCategory}</strong></p>
                        </div>`
                                : ""
                        }
                    </div>
                </div>
            </section>`
                    : ""
            }
            ${
                !esBaja
                    ? `<section class="termination">
                <p class="section-title">Datos bancarios</p>
                <div class="meta meta-three">
                    <div class="item"><span class="label">Banco</span><div class="value">${safe.bank}</div></div>
                    <div class="item"><span class="label">Tipo de cuenta</span><div class="value">${safe.accountType}</div></div>
                    <div class="item"><span class="label">No. de cuenta bancaria</span><div class="value">${safe.accountNumber}</div></div>
                </div>
                <p class="section-title emergency-title">Contacto de emergencia</p>
                <div class="meta meta-three">
                    <div class="item"><span class="label">Nombre</span><div class="value">${safe.emergencyName}</div></div>
                    <div class="item"><span class="label">Teléfono</span><div class="value">${safe.emergencyPhone}</div></div>
                </div>
            </section>`
                    : ""
            }
            <div class="comp">
                <div class="cell"><span class="label">Sueldo base</span><div class="value">${safe.salary}</div></div>
                <div class="cell"><span class="label">Bonificación</span><div class="value">${safe.bonus}</div></div>
                <div class="cell"><span class="label">Total</span><div class="value">${safe.total}</div></div>
            </div>
            <div class="notes-block"><p class="section-title">Notas</p><div class="notes">${safe.notes}</div></div>
            <div class="signatures">
                <div class="signature-box"><span>Autorización</span></div>
            </div>
            <footer class="footer">
                <span>Fecha de creación: <strong>${safe.createdAt}</strong></span>
                <span>Generado por: <strong>${safe.generatedBy}</strong></span>
            </footer>
        </main>
    </div>
</body>
</html>`;
}

function UsuarioPdf({
    getUsuario,
    usuarioId,
    fechaBajaInicial,
    motivoBajaInicial,
    notasBajaInicial,
    reingresoBajaInicial,
    puesto,
    empresa,
    patrono,
    onError,
    onBajaSaved,
}) {
    const { user: authUser } = useAuth();
    const [modalType, setModalType] = useState(null);
    const [notes, setNotes] = useState("");
    const [notesBaja, setNotesBaja] = useState(notasBajaInicial || "");
    const [fechaBaja, setFechaBaja] = useState(
        fechaBajaInicial ? String(fechaBajaInicial).split("T")[0] : "",
    );
    const [motivoBaja, setMotivoBaja] = useState(motivoBajaInicial || "");
    const [reingresoBaja, setReingresoBaja] = useState(
        reingresoBajaInicial == null
            ? ""
            : reingresoBajaInicial
                ? "SI"
                : "NO",
    );
    const [modalError, setModalError] = useState("");
    const [isSavingBaja, setIsSavingBaja] = useState(false);

    const handleDownload = async (tipoDocumento) => {
        if (
            tipoDocumento === "BAJA" &&
            (!fechaBaja || !motivoBaja || !reingresoBaja)
        ) {
            setModalError("Completa la fecha, el motivo y el reingreso de la baja.");
            return;
        }
        if (tipoDocumento === "BAJA" && !usuarioId) {
            setModalError("Guarda primero el colaborador para registrar su baja.");
            return;
        }

        const printWindow = window.open("", "_blank", "width=1200,height=1000");
        if (!printWindow) {
            onError("El navegador bloqueó la ventana de impresión.");
            return;
        }

        try {
            if (tipoDocumento === "BAJA") {
                setIsSavingBaja(true);
                await registrarBajaUsuario(usuarioId, {
                    fecha_baja: fechaBaja,
                    motivo_baja: motivoBaja,
                    notas_baja: notesBaja.trim() || null,
                    reingreso_baja: reingresoBaja === "SI",
                });
                onBajaSaved?.();
            }

            printWindow.document.write(
                buildPdfHtml({
                    usuario: getUsuario(),
                    puesto,
                    empresa,
                    patrono,
                    generatedBy:
                        authUser?.nombre || authUser?.correo || "Usuario del sistema",
                    notes:
                        (tipoDocumento === "BAJA" ? notesBaja : notes).trim() ||
                        "Sin notas adicionales",
                    tipoDocumento,
                    fechaBaja,
                    motivoBaja,
                    reingresoBaja: reingresoBaja === "SI",
                }),
            );
            printWindow.document.close();
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
            }, 250);
            if (tipoDocumento === "ALTA") setNotes("");
            setModalType(null);
            setModalError("");
        } catch (error) {
            printWindow.close();
            setModalError(
                error.response?.data?.message ||
                    "No fue posible guardar los datos de la baja.",
            );
        } finally {
            setIsSavingBaja(false);
        }
    };

    const motivosBaja = [
        "Abandono",
        "Baja ocupación",
        "Falta a normas",
        "Estudios - Horarios",
        "Fallecimiento",
        "Familiar",
        "Enfermedad",
        "Jubilación",
        "Ambiente de compañeros",
        "Liderazgo",
        "Mejor ocupación",
        "Período de prueba",
        "Viaje",
        "Otros",
    ];

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    setModalError("");
                    setModalType("ALTA");
                }}
                className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#3162e9] bg-white px-6 font-bold text-[#3162e9] transition hover:bg-[#edf3ff]"
            >
                <Download className="h-5 w-5" />
                Descargar Alta
            </button>
            <button
                type="button"
                onClick={() => {
                    setModalError("");
                    setModalType("BAJA");
                }}
                className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-red-300 bg-white px-6 font-bold text-red-700 transition hover:bg-red-50"
            >
                <Download className="h-5 w-5" />
                Dar de baja
            </button>
            {modalType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071b3b]/45 p-4">
                    <div className="w-full max-w-lg rounded-[26px] bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5b6e8b]">
                                    Documento
                                </p>
                                <h3 className="text-2xl font-bold text-[#071b3b]">
                                    {modalType === "BAJA"
                                        ? "Datos de la baja"
                                        : "Agregar notas"}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => !isSavingBaja && setModalType(null)}
                                disabled={isSavingBaja}
                                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[#dce3ee] bg-white text-[#071b3b] transition hover:bg-[#f0f4fa]"
                                aria-label="Cerrar nota"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="mt-6">
                            {modalType === "BAJA" && (
                                <div className="mb-5 grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label
                                            className="mb-2 block text-sm font-semibold text-[#071b3b]"
                                            htmlFor="fecha-baja"
                                        >
                                            Fecha de baja *
                                        </label>
                                        <input
                                            id="fecha-baja"
                                            type="date"
                                            required
                                            value={fechaBaja}
                                            onChange={(event) => {
                                                setFechaBaja(event.target.value);
                                                setModalError("");
                                            }}
                                            className="w-full rounded-xl border border-[#dce3ee] bg-[#f8faff] px-4 py-3 text-[#071b3b] outline-none transition focus:border-[#3162e9]"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            className="mb-2 block text-sm font-semibold text-[#071b3b]"
                                            htmlFor="motivo-baja"
                                        >
                                            Motivo de baja *
                                        </label>
                                        <select
                                            id="motivo-baja"
                                            required
                                            value={motivoBaja}
                                            onChange={(event) => {
                                                setMotivoBaja(event.target.value);
                                                setModalError("");
                                            }}
                                            className="w-full rounded-xl border border-[#dce3ee] bg-[#f8faff] px-4 py-3 text-[#071b3b] outline-none transition focus:border-[#3162e9]"
                                        >
                                            <option value="" disabled>
                                                Selecciona un motivo
                                            </option>
                                            {motivosBaja.map((motivo) => (
                                                <option key={motivo} value={motivo}>
                                                    {motivo}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label
                                            className="mb-2 block text-sm font-semibold text-[#071b3b]"
                                            htmlFor="reingreso-baja"
                                        >
                                            ¿Puede reingresar? *
                                        </label>
                                        <select
                                            id="reingreso-baja"
                                            required
                                            value={reingresoBaja}
                                            onChange={(event) => {
                                                setReingresoBaja(event.target.value);
                                                setModalError("");
                                            }}
                                            className="w-full rounded-xl border border-[#dce3ee] bg-[#f8faff] px-4 py-3 text-[#071b3b] outline-none transition focus:border-[#3162e9]"
                                        >
                                            <option value="" disabled>
                                                Selecciona una opción
                                            </option>
                                            <option value="SI">Sí</option>
                                            <option value="NO">No</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                            <label className="mb-2 block text-sm font-semibold text-[#071b3b]">
                                Notas del documento
                            </label>
                            <textarea
                                value={modalType === "BAJA" ? notesBaja : notes}
                                onChange={(event) =>
                                    modalType === "BAJA"
                                        ? setNotesBaja(event.target.value)
                                        : setNotes(event.target.value)
                                }
                                maxLength={160}
                                rows={7}
                                className="w-full rounded-2xl border border-[#dce3ee] bg-[#f8faff] px-4 py-3 text-[#071b3b] outline-none transition focus:border-[#3162e9]"
                                placeholder="Escribe aquí las observaciones, comentarios o información adicional que quieres incluir en el PDF..."
                            />
                        </div>
                        {modalError && (
                            <p className="mt-3 text-sm font-semibold text-red-600" role="alert">
                                {modalError}
                            </p>
                        )}
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => !isSavingBaja && setModalType(null)}
                                disabled={isSavingBaja}
                                className="h-12 cursor-pointer rounded-2xl border border-[#dce3ee] px-5 font-bold text-[#5b6e8b] transition hover:bg-[#f0f4fa]"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDownload(modalType)}
                                disabled={isSavingBaja}
                                className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#3162e9] px-6 font-bold text-white transition hover:bg-[#183fca]"
                            >
                                <Download className="h-5 w-5" />
                                {isSavingBaja ? "Guardando baja..." : "Descargar PDF"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default UsuarioPdf;