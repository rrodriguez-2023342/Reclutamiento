import { useState } from "react";
import { Download } from "lucide-react";

function ExportarExcelButton({
  onExport,
  etiqueta = "Exportar Excel",
  compacto = false,
}) {
  const [exportando, setExportando] = useState(false);

  const manejarExportar = async () => {
    if (exportando) return;
    setExportando(true);
    try {
      await onExport();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "No fue posible exportar la información.",
      );
    } finally {
      setExportando(false);
    }
  };

  return (
    <button
      type="button"
      onClick={manejarExportar}
      disabled={exportando}
      className={`flex shrink-0 whitespace-nowrap ${compacto ? "h-12 px-5" : "h-14 px-6"} cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#dce3ee] font-bold text-[#071b3b] transition hover:border-[#3162e9] hover:text-[#3162e9] disabled:cursor-wait disabled:opacity-60`}
    >
      <Download className="h-5 w-5" />
      {exportando ? "Exportando…" : etiqueta}
    </button>
  );
}

export default ExportarExcelButton;
