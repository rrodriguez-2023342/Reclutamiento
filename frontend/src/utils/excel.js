import * as XLSX from "xlsx";

// Fecha ISO -> dd/mm/aaaa (es-GT)
export function fechaExcel(valor) {
  if (!valor) return "";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "";
  return fecha.toLocaleDateString("es-GT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Fecha ISO -> dd/mm (para aniversarios sin año)
export function fechaCortaExcel(valor) {
  if (!valor) return "";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "";
  return fecha.toLocaleDateString("es-GT", { day: "2-digit", month: "2-digit" });
}

// Booleano -> "Sí" / "No" / ""
export function siNo(valor) {
  if (valor === null || valor === undefined) return "";
  return valor ? "Sí" : "No";
}

// Booleano de activo -> "Activo" / "Inactivo"
export function activoTexto(valor) {
  if (valor === null || valor === undefined) return "";
  return valor ? "Activo" : "Inactivo";
}

// Texto plano, vacío si no hay valor
export function texto(valor) {
  if (valor === null || valor === undefined) return "";
  return String(valor);
}

// Número de Excel (vacío si no es numérico) para poder sumar/filtrar
export function numero(valor) {
  if (valor === null || valor === undefined || valor === "") return "";
  const n = Number(valor);
  return Number.isNaN(n) ? "" : n;
}

// Edad en años a partir de una fecha
export function edadTexto(fecha) {
  if (!fecha) return "";
  const nacimiento = new Date(fecha);
  if (Number.isNaN(nacimiento.getTime())) return "";
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad -= 1;
  return edad >= 0 ? edad : "";
}

// Construye el libro con una hoja por entrada y lo descarga como .xlsx
export function exportarExcel({ filename, hojas }) {
  const libro = XLSX.utils.book_new();

  for (const hoja of hojas) {
    const encabezados = hoja.columnas.map((columna) => columna.encabezado);
    const filas = hoja.filas.map((fila) => {
      const salida = {};
      for (const columna of hoja.columnas) {
        const valor = columna.obtener(fila);
        salida[columna.encabezado] = valor === undefined ? "" : valor;
      }
      return salida;
    });

    const calculo = XLSX.utils.json_to_sheet(filas, { header: encabezados });

    calculo["!cols"] = hoja.columnas.map((columna) => {
      let ancho = columna.encabezado.length + 4;
      for (const fila of filas) {
        const largo = String(fila[columna.encabezado] ?? "").length + 2;
        if (largo > ancho) ancho = largo;
      }
      return { wch: Math.min(60, Math.max(ancho, 10)) };
    });

    XLSX.utils.book_append_sheet(libro, calculo, hoja.nombre);
  }

  const fecha = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(libro, `${filename}_${fecha}.xlsx`);
}
