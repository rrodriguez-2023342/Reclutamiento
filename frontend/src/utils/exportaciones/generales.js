import {
  etiquetasEstadoCivil,
  etiquetasSexo,
} from "../../components/postulantes/etiquetas.js";
import {
  fechaExcel,
  fechaCortaExcel,
  activoTexto,
  texto,
  numero,
  edadTexto,
} from "../excel.js";

const etiquetasMoneda = { QUETZAL: "Quetzal", DOLAR: "Dólar" };

function etiqueta(mapa) {
  return (valor) => (valor && mapa[valor]) || "";
}

function col(encabezado, obtener) {
  return { encabezado, obtener };
}

export function hojasPlaza(plazas) {
  return [
    {
      nombre: "Plazas",
      columnas: [
        col("ID", (p) => numero(p.id)),
        col("Nombre", (p) => texto(p.nombre)),
        col("Descripción", (p) => texto(p.descripcion)),
        col("Estado", (p) => activoTexto(p.activo)),
        col("Moneda", etiqueta(etiquetasMoneda)),
        col("Salario mínimo", (p) => numero(p.salario_min)),
        col("Salario máximo", (p) => numero(p.salario_max)),
        col("Postulantes", (p) => numero(p._count?.postulantes)),
        col("Creado", (p) => fechaExcel(p.creado_en)),
      ],
      filas: plazas,
    },
  ];
}

export function hojasEmpresa(empresas) {
  return [
    {
      nombre: "Empresas",
      columnas: [
        col("ID", (e) => numero(e.id)),
        col("Nombre", (e) => texto(e.nombre_empresa)),
        col("Detalle", (e) => texto(e.detalle_empresa)),
        col("Dirección", (e) => texto(e.direccion)),
        col("Teléfono", (e) => texto(e.telefono)),
        col("Correo", (e) => texto(e.correo)),
        col("Fecha de aniversario", (e) => fechaCortaExcel(e.fecha_aniversario)),
        col("Estado", (e) => activoTexto(e.activo)),
        col("Creado", (e) => fechaExcel(e.creado_en)),
      ],
      filas: empresas,
    },
  ];
}

export function hojasPatrono(patronos) {
  return [
    {
      nombre: "Patronos",
      columnas: [
        col("ID", (p) => numero(p.id)),
        col("Razón social", (p) => texto(p.razon_social)),
        col("Número patronal", (p) => texto(p.numero_patronal)),
        col("NIT", (p) => texto(p.nit)),
        col("Representante legal", (p) => texto(p.representante_legal)),
        col("DPI del representante", (p) => texto(p.dpi_representante)),
        col("Vencimiento del DPI", (p) => fechaExcel(p.fecha_vencimiento_dpi)),
        col("Fecha de nacimiento", (p) => fechaExcel(p.fecha_nacimiento)),
        col("Edad", (p) => edadTexto(p.fecha_nacimiento)),
        col("Sexo", etiqueta(etiquetasSexo)),
        col("Estado civil", etiqueta(etiquetasEstadoCivil)),
        col("Profesión", (p) => texto(p.profesion)),
        col("DPI extendido en", (p) => texto(p.dpi_extendido_en)),
        col("Dirección", (p) => texto(p.direccion)),
        col("Teléfono", (p) => texto(p.telefono)),
        col("Correo", (p) => texto(p.correo)),
        col("Estado", (p) => activoTexto(p.activo)),
        col("Creado", (p) => fechaExcel(p.creado_en)),
      ],
      filas: patronos,
    },
  ];
}

export function hojasDivision(divisiones) {
  return [
    {
      nombre: "Divisiones",
      columnas: [
        col("ID", (d) => numero(d.id)),
        col("Nombre", (d) => texto(d.nombre)),
        col("Descripción", (d) => texto(d.descripcion)),
        col("Estado", (d) => activoTexto(d.activo)),
        col("Creado", (d) => fechaExcel(d.creado_en)),
      ],
      filas: divisiones,
    },
  ];
}

export function hojasDepartamento(departamentos) {
  return [
    {
      nombre: "Departamentos",
      columnas: [
        col("ID", (d) => numero(d.id)),
        col("Nombre", (d) => texto(d.nombre)),
        col("Descripción", (d) => texto(d.descripcion)),
        col("Estado", (d) => activoTexto(d.activo)),
        col("Creado", (d) => fechaExcel(d.creado_en)),
      ],
      filas: departamentos,
    },
  ];
}

export function hojasPuesto(puestos) {
  return [
    {
      nombre: "Puestos",
      columnas: [
        col("ID", (p) => numero(p.id)),
        col("Nombre", (p) => texto(p.nombre)),
        col("Descripción", (p) => texto(p.descripcion)),
        col("División", (p) => texto(p.division?.nombre)),
        col("Departamento", (p) => texto(p.departamento?.nombre)),
        col("Estado", (p) => activoTexto(p.activo)),
        col("Creado", (p) => fechaExcel(p.creado_en)),
      ],
      filas: puestos,
    },
  ];
}
