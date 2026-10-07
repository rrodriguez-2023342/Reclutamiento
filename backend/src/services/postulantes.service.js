import prisma from "../config/prisma.js";
import { historialRechazoService } from "./historial-rechazo.service.js";
import { ADMIN_ROLE, RRHH_ROLE } from "../config/roles.constant.js";

// Constantes de estado y transiciones válidas para el flujo de postulantes
const ETIQUETAS_ESTADO = {
  POSTULANTE: "Postulante",
  CONTRATADO: "Contratado",
  RECHAZADO: "Rechazado",
};

// Transiciones válidas: desde un estado, a qué estados puede pasar
const TRANSICIONES_PERMITIDAS = {
  POSTULANTE: ["CONTRATADO", "RECHAZADO"],
  CONTRATADO: ["POSTULANTE"],
  RECHAZADO: ["POSTULANTE"],
};

// Relaciones que se devuelven siempre al consultar un postulante
const INCLUDE_COMPLETO = {
  usuario: {
    select: {
      id: true,
      nombre: true,
      correo: true,
      empresa: { select: { id: true, nombre_empresa: true } },
      patrono: { select: { id: true, razon_social: true } },
    },
  },
  plaza: {
    select: {
      id: true,
      nombre: true,
      tipo_moneda: true,
      salario_min: true,
      salario_max: true,
    },
  },
  datosFamiliares: true,
  educacionHistorial: true,
  idiomas: true,
  capacitaciones: true,
  experienciaLaboral: true,
  referenciasPersonales: true,
  rechazado_por_usuario: { select: { id: true, nombre: true, correo: true } },
  contratado_por_usuario: { select: { id: true, nombre: true } },
  devuelto_por_usuario: { select: { id: true, nombre: true } },
  documentos: {
    select: {
      id: true,
      tipo: true,
      nombre_archivo: true,
      mime_type: true,
      tamano_bytes: true,
      fecha_subida: true,
    },
  },
};

// Secciones hijas que se pueden actualizar en bloque
const SECCIONES_HIJAS = [
  ["datosFamiliares", "datosFamiliares"],
  ["educacionHistorial", "educacionHistorial"],
  ["idiomas", "idioma"],
  ["capacitaciones", "capacitacion"],
  ["experienciaLaboral", "experienciaLaboral"],
  ["referenciasPersonales", "referenciaPersonal"],
];

// Crea un Error con un código HTTP asociado
function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

// Construye el filtro where compartido entre listado y exportación
function construirWhere({ q, estado, plaza_id } = {}) {
  const where = {};

  if (estado) {
    where.estado = estado;
  }

  if (q) {
    where.OR = [
      { nombre_completo: { contains: q } },
      { dpi: { contains: q } },
      { correo: { contains: q } },
      { plaza: { nombre: { contains: q } } },
    ];
  }

  if (plaza_id) {
    where.plaza_id = plaza_id;
  }

  return where;
}

class PostulanteService {
  // Lista paginada con búsqueda (nombre, DPI, correo, plaza) y filtro por estado y plaza
  async listar({ page = 1, limit = 10, ...filtros }) {
    const where = construirWhere(filtros);

    const [data, total] = await prisma.$transaction([
      prisma.postulante.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              empresa: { select: { id: true, nombre_empresa: true } },
              patrono: { select: { id: true, razon_social: true } },
            },
          },
          plaza: { select: { id: true, nombre: true } },
          contratado_por_usuario: { select: { id: true, nombre: true } },
        },
        orderBy: [{ fecha_registro: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.postulante.count({ where }),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) || 1 };
  }

  // Exporta TODOS los postulantes filtrados con sus secciones completas (sin paginar)
  async exportar(filtros) {
    return prisma.postulante.findMany({
      where: construirWhere(filtros),
      include: INCLUDE_COMPLETO,
      orderBy: [{ fecha_registro: "desc" }, { id: "desc" }],
    });
  }

  // Devuelve un postulante con todas sus secciones. null si no existe
  obtenerPorId(id) {
    return prisma.postulante.findUnique({
      where: { id },
      include: INCLUDE_COMPLETO,
    });
  }

  // Crea un postulante con todas sus secciones anidadas en una sola transacción
  async crear(data, usuarioId) {
    const existente = await prisma.postulante.findUnique({
      where: { dpi: data.dpi },
    });
    if (existente) {
      throw crearError("Ya existe un postulante registrado con ese DPI", 409);
    }

    const {
      datosFamiliares = [],
      educacionHistorial = [],
      idiomas = [],
      capacitaciones = [],
      experienciaLaboral = [],
      referenciasPersonales = [],
      plaza_id,
      ...generales
    } = data;

    const creado = await prisma.postulante.create({
      data: {
        ...generales,
        ...(plaza_id && { plaza_id: Number(plaza_id) }),
        usuario_id: usuarioId,
        estado: "POSTULANTE",
        fecha_registro: new Date(),
        datosFamiliares: { create: datosFamiliares },
        educacionHistorial: { create: educacionHistorial },
        idiomas: { create: idiomas },
        capacitaciones: { create: capacitaciones },
        experienciaLaboral: { create: experienciaLaboral },
        referenciasPersonales: { create: referenciasPersonales },
      },
      include: INCLUDE_COMPLETO,
    });

    return creado;
  }

  // Actualiza campos generales y/o reemplaza secciones completas dentro de una transacción
  async actualizar(id, data) {
    const postulante = await prisma.postulante.findUnique({
      where: { id },
      select: { id: true, dpi: true },
    });
    if (!postulante) {
      throw crearError("Postulante no encontrado", 404);
    }

    if (data.dpi && data.dpi !== postulante.dpi) {
      const duplicado = await prisma.postulante.findFirst({
        where: { dpi: data.dpi, id: { not: id } },
      });
      if (duplicado) {
        throw crearError(
          "Ya existe otro postulante registrado con ese DPI",
          409,
        );
      }
    }

    const {
      datosFamiliares,
      educacionHistorial,
      idiomas,
      capacitaciones,
      experienciaLaboral,
      referenciasPersonales,
      plaza_id,
      ...generales
    } = data;

    await prisma.$transaction(async (tx) => {
      // Campos generales del postulante
      if (Object.keys(generales).length > 0 || plaza_id !== undefined) {
        const dataUpdate = {
          ...generales,
          ...(plaza_id !== undefined && {
            plaza: plaza_id ? { connect: { id: plaza_id } } : { disconnect: true },
          }),
        };
        await tx.postulante.update({ where: { id }, data: dataUpdate });
      }

      // Cada sección enviada sustituye por completo la existente
      for (const [clavePayload, modelo] of SECCIONES_HIJAS) {
        const items = data[clavePayload];
        if (!Array.isArray(items)) continue;

        await tx[modelo].deleteMany({ where: { postulante_id: id } });
        if (items.length > 0) {
          await tx[modelo].createMany({
            data: items.map((item) => ({ ...item, postulante_id: id })),
          });
        }
      }
    });

    return this.obtenerPorId(id);
  }

  // Cambia el estado validando la transición y notifica por correo al postulante
  async cambiarEstado(id, nuevoEstado, extras = {}) {
    const postulante = await prisma.postulante.findUnique({
      where: { id },
      select: { id: true, estado: true, usuario_id: true, contratado_por: true },
    });
    if (!postulante) {
      throw crearError("Postulante no encontrado", 404);
    }

    const permitidos = TRANSICIONES_PERMITIDAS[postulante.estado] ?? [];

    if (!permitidos.includes(nuevoEstado)) {
      const actual = ETIQUETAS_ESTADO[postulante.estado];

      if (permitidos.length === 0) {
        throw crearError(
          `El postulante está en estado "${actual}" (estado final) y no admite más cambios`,
          400,
        );
      }

      const destinos = permitidos
        .map((estado) => `"${ETIQUETAS_ESTADO[estado]}"`)
        .join(" o ");
      throw crearError(
        `Transición inválida: desde "${actual}" solo puede pasar a ${destinos}`,
        400,
      );
    }

    // Devolución de una contratación: solo Administrador o quien lo contrató, y con motivo obligatorio
    const esDevolucion = postulante.estado === "CONTRATADO" && nuevoEstado === "POSTULANTE";
    if (esDevolucion) {
      const esAdmin = extras.rol_solicitante === ADMIN_ROLE;
      const esDueno =
        extras.quien_solicita != null &&
        postulante.contratado_por === extras.quien_solicita;
      const puedeDevolver =
        esAdmin || (extras.rol_solicitante === RRHH_ROLE && esDueno);
      if (!puedeDevolver) {
        throw crearError(
          "No tienes permiso para devolver este postulante: solo puede hacerlo un administrador o la persona que lo contrató",
          403,
        );
      }
      if (!(extras.motivo_devolucion || "").trim()) {
        throw crearError("El motivo de devolución es obligatorio", 400);
      }
    }

    // Guarda el nuevo estado
    const data = { estado: nuevoEstado };

    // La auditoría de devolución solo aplica mientras vuelve a estar como postulante por esa vía:
    // se limpia al salir de POSTULANTE (contratar/rechazar) y al reactivar desde rechazo
    const limpiarDevolucion = {
      motivo_devolucion: null,
      fecha_devolucion: null,
      devuelto_por: null,
    };

    // Si se rechaza, guardar motivo, fecha y quién rechazó
    if (nuevoEstado === "RECHAZADO") {
      data.motivo_rechazo = extras.motivo_rechazo || null;
      data.fecha_rechazo = new Date();
      data.rechazado_por = extras.quien_rechazo || null;
      Object.assign(data, limpiarDevolucion);
    }

    // Si se reactiva (RECHAZADO -> POSTULANTE), actualizar historial de rechazo
    // NO limpiar campos de rechazo en postulante (mantener último rechazo visible)
    // NO resetear fecha_registro
    const esReactivacion = postulante.estado === "RECHAZADO" && nuevoEstado === "POSTULANTE";
    if (esReactivacion) {
      data.fecha_registro = postulante.fecha_registro;
      Object.assign(data, limpiarDevolucion);
    }

    // Si se devuelve (CONTRATADO -> POSTULANTE), deshacer la contratación y guardar la auditoría
    if (esDevolucion) {
      data.fecha_contratacion = null;
      data.contratado_por = null;
      data.motivo_devolucion = extras.motivo_devolucion.trim();
      data.fecha_devolucion = new Date();
      data.devuelto_por = extras.quien_solicita ?? null;
    }

    // Si se contrata, guardar fecha y quién contrató, y asignar empresa y patrono al usuario
    if (nuevoEstado === "CONTRATADO") {
      data.fecha_contratacion = new Date();
      data.contratado_por = extras.quien_contrato || null;
      Object.assign(data, limpiarDevolucion);
      const usuarioData = {};
      if (extras.empresa_id) usuarioData.empresa_id = extras.empresa_id;
      if (extras.patrono_id) usuarioData.patrono_id = extras.patrono_id;
      if (Object.keys(usuarioData).length > 0) {
        await prisma.usuario.update({
          where: { id: postulante.usuario_id },
          data: usuarioData,
        });
      }
    }

    const actualizado = await prisma.postulante.update({
      where: { id },
      data,
      select: {
        id: true,
        estado: true,
        fecha_registro: true,
        fecha_contratacion: true,
        motivo_devolucion: true,
        fecha_devolucion: true,
        nombre_completo: true,
        correo: true,
      },
    });

    // Registrar en historial de rechazo (después de actualizar postulante para tener el ID)
    try {
      if (nuevoEstado === "RECHAZADO") {
        await historialRechazoService.registrarRechazo({
          postulante_id: id,
          motivo: extras.motivo_rechazo || "Sin motivo",
          rechazado_por: extras.quien_rechazo || null,
        });
      }
    } catch (errorHistorial) {
      console.error("No fue posible registrar historial de rechazo:", errorHistorial.message);
    }

    return actualizado;
  }
}

// Singleton
export const postulanteService = new PostulanteService();
