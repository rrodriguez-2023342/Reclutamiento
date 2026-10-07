import {
  etiquetasEstadoCivil,
  etiquetasSexo,
  etiquetasNivelEducativo,
} from "../../components/postulantes/etiquetas.js";
import { fechaExcel, siNo, activoTexto, texto, numero, edadTexto } from "../excel.js";

const etiquetasMoneda = { QUETZAL: "Quetzal", DOLAR: "Dólar" };
const etiquetasModalidadSeguro = { INDIVIDUAL: "Individual", FAMILIAR: "Familiar" };

function etiqueta(mapa) {
  return (valor) => (valor && mapa[valor]) || "";
}

function col(encabezado, obtener) {
  return { encabezado, obtener };
}

function tipoContrato(valor) {
  if (!valor) return "";
  return valor === "DEFINIDO" ? "Definido" : "Indefinido";
}

function aplanar(usuarios, clave) {
  return usuarios.flatMap((usuario) =>
    (usuario[clave] || []).map((item) => ({
      ...item,
      colaborador: usuario.nombre,
    })),
  );
}

export function hojasColaborador(usuarios) {
  return [
    {
      nombre: "Colaboradores",
      columnas: [
        col("ID", (u) => numero(u.id)),
        col("Nombre", (u) => texto(u.nombre)),
        col("Correo", (u) => texto(u.correo)),
        col("Usuario", (u) => texto(u.usuario)),
        col("Rol", (u) => texto(u.rol?.nombre)),
        col("Estado", (u) => activoTexto(u.activo)),
        col("Creado", (u) => fechaExcel(u.creado_en)),

        col("Fecha de nacimiento", (u) => fechaExcel(u.fecha_nacimiento)),
        col("Edad", (u) => edadTexto(u.fecha_nacimiento)),
        col("Sexo", etiqueta(etiquetasSexo)),
        col("Estado civil", etiqueta(etiquetasEstadoCivil)),
        col("Nacionalidad", (u) => texto(u.nacionalidad)),
        col("Teléfono", (u) => texto(u.telefono)),
        col("Último grado cursado", etiqueta(etiquetasNivelEducativo)),
        col("DPI", (u) => texto(u.dpi)),
        col("DPI extendido en", (u) => texto(u.dpi_extendido_en)),
        col("NIT", (u) => texto(u.nit)),
        col("No. de afiliación IGSS", (u) => texto(u.numero_afiliacion_igss)),
        col("Dirección", (u) => texto(u.direccion)),

        col("Fecha de contratación", (u) => fechaExcel(u.fecha_contratacion)),
        col("Tipo de contrato", (u) => tipoContrato(u.tipo_contrato)),
        col("Fecha de fin de contrato", (u) => fechaExcel(u.fecha_fin_contrato)),

        col("Sueldo base", (u) => numero(u.sueldo)),
        col("Bonos", (u) => numero(u.bonos)),
        col("Moneda del sueldo", etiqueta(etiquetasMoneda)),

        col("Banco", (u) => texto(u.banco)),
        col("Tipo de cuenta", (u) => texto(u.tipo_cuenta_bancaria)),
        col("Número de cuenta", (u) => texto(u.numero_cuenta_bancaria)),

        col("Contacto de emergencia", (u) => texto(u.contacto_emergencia_nombre)),
        col("Teléfono de contacto de emergencia", (u) =>
          texto(u.contacto_emergencia_telefono),
        ),

        col("¿Seguro de gastos médicos?", (u) => siNo(u.tiene_seguro_gastos_medicos)),
        col("Empresa del seguro médico", (u) => texto(u.empresa_seguro_gastos_medicos)),
        col("Modalidad del seguro médico", etiqueta(etiquetasModalidadSeguro)),
        col("Categoría del seguro médico", (u) => texto(u.categoria_seguro_gastos_medicos)),
        col("¿Seguro de vida?", (u) => siNo(u.tiene_seguro_vida)),
        col("Empresa del seguro de vida", (u) => texto(u.empresa_seguro_vida)),
        col("Categoría del seguro de vida", (u) => texto(u.categoria_seguro_vida)),

        col("Puesto", (u) => texto(u.puesto?.nombre)),
        col("Departamento", (u) => texto(u.puesto?.departamento?.nombre)),
        col("Descripción del puesto", (u) => texto(u.puesto?.descripcion)),

        col("Empresa", (u) => texto(u.empresa?.nombre_empresa)),
        col("Patrono", (u) => texto(u.patrono?.razon_social)),

        col("Fecha de baja", (u) => fechaExcel(u.fecha_baja)),
        col("Motivo de baja", (u) => texto(u.motivo_baja)),
        col("¿Puede reingresar?", (u) => siNo(u.reingreso_baja)),
        col("Notas de baja", (u) => texto(u.notas_baja)),
      ],
      filas: usuarios,
    },
    {
      nombre: "Historial Sueldo",
      columnas: [
        col("Colaborador", (i) => texto(i.colaborador)),
        col("Fecha", (i) => fechaExcel(i.fecha_cambio)),
        col("Sueldo anterior", (i) => numero(i.sueldo_anterior)),
        col("Sueldo nuevo", (i) => numero(i.sueldo_nuevo)),
        col("Bonos anterior", (i) => numero(i.bonos_anterior)),
        col("Bonos nuevo", (i) => numero(i.bonos_nuevo)),
        col("Motivo", (i) => texto(i.motivo)),
        col("Cambiado por", (i) => texto(i.cambiado_por?.nombre)),
      ],
      filas: aplanar(usuarios, "historial_sueldo"),
    },
    {
      nombre: "Historial Empresa",
      columnas: [
        col("Colaborador", (i) => texto(i.colaborador)),
        col("Fecha", (i) => fechaExcel(i.fecha_cambio)),
        col("Empresa anterior", (i) => texto(i.empresa_anterior?.nombre_empresa)),
        col("Empresa nueva", (i) => texto(i.empresa_nuevo?.nombre_empresa)),
        col("Motivo", (i) => texto(i.motivo)),
        col("Cambiado por", (i) => texto(i.cambiado_por?.nombre)),
      ],
      filas: aplanar(usuarios, "historial_empresa"),
    },
  ];
}
