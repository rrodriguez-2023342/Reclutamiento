import { useState } from "react";
import { Download, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";

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
}) {
    const nombre = usuario.nombre || "Sin nombre";
    const nombrePuesto = puesto?.nombre || "Sin puesto";
    const departamento = puesto?.departamento?.nombre || "Sin departamento";
    const fechaContratacion = usuario.fecha_contratacion || "Sin fecha";
    const fechaFinContrato = usuario.fecha_fin_contrato || "";
    const contrato =
        usuario.tipo_contrato === "DEFINIDO"
            ? `Tipo: Definido | Fecha de contratación: ${fechaContratacion} | Fecha de finalización: ${fechaFinContrato}`
            : `Tipo: Indefinido | Fecha de contratación: ${fechaContratacion}`;
    const sueldo = Number(usuario.sueldo || 0);
    const bonos = Number(usuario.bonos || 0);
    const documentTitle =
        [empresa, patrono].filter(Boolean).join(" / ") ||
        "Documento del colaborador";
    const createdAt = new Date().toLocaleString("es-GT", {
        dateStyle: "medium",
        timeStyle: "short",
    });
    const values = {
        title: documentTitle,
        name: nombre,
        position: nombrePuesto,
        department: departamento,
        contract: contrato,
        dpi: usuario.dpi || "Sin DPI",
        nit: usuario.nit || "Sin NIT",
        igss: usuario.numero_afiliacion_igss || "Sin número",
        salary: `Q ${sueldo.toFixed(2)}`,
        bonus: `Q ${bonos.toFixed(2)}`,
        total: `Q ${(sueldo + bonos).toFixed(2)}`,
        notes: notes || "Sin notas adicionales",
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
        .item,.cell { padding:14px 16px; background:#fbfcfe; border:1px solid var(--line); border-left:3px solid var(--accent); border-radius:10px; }
        .span-2 { grid-column:1 / -1; }
        .label { display:block; margin-bottom:5px; color:var(--muted); font-size:11px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; }
        .value { color:var(--ink); font-size:16px; font-weight:700; }
        .comp { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px 16px; margin-top:22px; }
        .notes-block { margin-top:22px; }
        .notes { min-height:130px; padding:18px 20px; background:#fbfcfe; border:1px solid var(--line); border-radius:12px; white-space:pre-wrap; line-height:1.65; font-size:13.5px; }
        .signatures { display:grid; grid-template-columns:1fr 1fr; gap:28px; margin-top:110px; }
        .signature-box { min-height:70px; padding-top:12px; border-top:1.5px solid var(--navy); }
        .signature-box span { display:inline-block; color:var(--muted); font-size:11px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; }
        .footer { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-top:36px; padding-top:16px; border-top:1px solid var(--line); color:var(--muted); font-size:11px; }
        .footer strong { color:var(--ink); }
        @page { size:A4; margin:8mm; }
        @media print {
            body { padding:0; background:#fff; -webkit-print-color-adjust:exact; print-color-adjust:exact; color-adjust:exact; }
            .page { display:flex; width:100%; height:281mm; max-width:none; flex-direction:column; border-radius:0; box-shadow:none; -webkit-print-color-adjust:exact; print-color-adjust:exact; color-adjust:exact; }
            .header { padding:28px 36px 24px; } .header h1 { font-size:24px; }
            .content { display:flex; flex:1; flex-direction:column; padding:26px 36px 28px; }
            .section-title { margin-bottom:12px; }
            .meta,.comp { gap:12px; } .item,.cell { padding:12px 14px; break-inside:avoid; }
            .label { margin-bottom:4px; font-size:10px; } .value { font-size:14px; overflow-wrap:anywhere; }
            .comp { margin-top:16px; } .notes-block { margin-top:16px; break-inside:avoid; }
            .notes { min-height:46mm; max-height:none; overflow:visible; padding:12px 14px; font-size:12px; line-height:1.45; overflow-wrap:anywhere; }
            .signatures { gap:20px; margin-top:auto; padding-top:16mm; break-inside:avoid; }
            .signature-box { min-height:52px; padding-top:10px; }
            .footer { margin-top:24px; padding-top:12px; break-inside:avoid; }
        }
    </style>
</head>
<body>
    <div class="page">
        <header class="header">
            <p class="eyebrow">Ficha del colaborador</p>
            <h1>${safe.title}</h1>
            <div class="doc-id">Generado: ${safe.createdAt}</div>
        </header>
        <main class="content">
            <p class="section-title">Datos generales</p>
            <div class="meta">
                <div class="item span-2"><span class="label">Nombre</span><div class="value">${safe.name}</div></div>
                <div class="item"><span class="label">Puesto</span><div class="value">${safe.position}</div></div>
                <div class="item"><span class="label">Departamento</span><div class="value">${safe.department}</div></div>
                <div class="item span-2"><span class="label">Contrato</span><div class="value">${safe.contract}</div></div>
                <div class="item span-2"><span class="label">DPI</span><div class="value">${safe.dpi}</div></div>
                <div class="item"><span class="label">NIT</span><div class="value">${safe.nit}</div></div>
                <div class="item"><span class="label">No. afiliación IGSS</span><div class="value">${safe.igss}</div></div>
            </div>
            <div class="comp">
                <div class="cell"><span class="label">Sueldo base</span><div class="value">${safe.salary}</div></div>
                <div class="cell"><span class="label">Bonificación</span><div class="value">${safe.bonus}</div></div>
                <div class="cell"><span class="label">Total</span><div class="value">${safe.total}</div></div>
            </div>
            <div class="notes-block"><p class="section-title">Notas</p><div class="notes">${safe.notes}</div></div>
            <div class="signatures">
                <div class="signature-box"><span>Firma del colaborador</span></div>
                <div class="signature-box"><span>Firma del responsable</span></div>
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

function UsuarioPdf({ getUsuario, puesto, empresa, patrono, onError }) {
    const { user: authUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [notes, setNotes] = useState("");

    const handleDownload = () => {
        const printWindow = window.open("", "_blank", "width=1200,height=1000");
        if (!printWindow) {
            onError("El navegador bloqueó la ventana de impresión.");
            return;
        }

    printWindow.document.write(
        buildPdfHtml({
            usuario: getUsuario(),
            puesto,
            empresa,
            patrono,
            generatedBy:
                authUser?.nombre || authUser?.correo || "Usuario del sistema",
            notes: notes.trim() || "Sin notas adicionales",
        }),
    );
    printWindow.document.close();
    setTimeout(() => {
        printWindow.focus();
        printWindow.print();
    }, 250);
    setNotes("");
    setIsOpen(false);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#3162e9] bg-white px-6 font-bold text-[#3162e9] transition hover:bg-[#edf3ff]"
            >
                <Download className="h-5 w-5" />
                Descargar PDF
            </button>
            {isOpen && (
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
                                onClick={() => setIsOpen(false)}
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
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                maxLength={160}
                                rows={7}
                                className="w-full rounded-2xl border border-[#dce3ee] bg-[#f8faff] px-4 py-3 text-[#071b3b] outline-none transition focus:border-[#3162e9]"
                                placeholder="Escribe aquí las observaciones, comentarios o información adicional que quieres incluir en el PDF..."
                            />
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="h-12 cursor-pointer rounded-2xl border border-[#dce3ee] px-5 font-bold text-[#5b6e8b] transition hover:bg-[#f0f4fa]"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleDownload}
                                className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#3162e9] px-6 font-bold text-white transition hover:bg-[#183fca]"
                            >
                                <Download className="h-5 w-5" />
                                Descargar PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default UsuarioPdf;
