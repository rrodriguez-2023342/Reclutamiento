import prisma from "../config/prisma.js";

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

class PuestosService {
  async listar({ page = 1, limit = 10, q, departamento_id, activo }) {
    const where = {};

    if (activo !== undefined) {
      where.activo = activo;
    }

    if (departamento_id) {
      where.departamento_id = departamento_id;
    }

    if (q) {
      where.nombre = { contains: q };
    }

    const [data, total] = await prisma.$transaction([
      prisma.puesto.findMany({
        where,
        include: {
          departamento: {
            select: {
              id: true,
              nombre: true,
              division: { select: { id: true, nombre: true, empresa: { select: { id: true, nombre_empresa: true } } } },
            },
          },
        },
        orderBy: { creado_en: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.puesto.count({ where }),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) || 1 };
  }

  async obtenerPorId(id) {
    const puesto = await prisma.puesto.findUnique({
      where: { id },
      include: {
        departamento: {
          select: {
            id: true,
            nombre: true,
            division: { select: { id: true, nombre: true, empresa: { select: { id: true, nombre_empresa: true } } } },
          },
        },
      },
    });
    if (!puesto) return null;
    return puesto;
  }

  async crear(data) {
    const departamento = await prisma.departamento.findUnique({ where: { id: data.departamento_id } });
    if (!departamento) {
      throw crearError("El departamento seleccionado no existe", 400);
    }

    const existe = await prisma.puesto.findFirst({
      where: { nombre: data.nombre, departamento_id: data.departamento_id },
    });
    if (existe) {
      throw crearError("Ya existe un puesto con ese nombre en este departamento", 409);
    }

    const puesto = await prisma.puesto.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        departamento_id: data.departamento_id,
        activo: data.activo ?? true,
      },
      include: {
        departamento: {
          select: {
            id: true,
            nombre: true,
            division: { select: { id: true, nombre: true, empresa: { select: { id: true, nombre_empresa: true } } } },
          },
        },
      },
    });

    return puesto;
  }

  async actualizar(id, data) {
    const puesto = await prisma.puesto.findUnique({ where: { id } });
    if (!puesto) {
      throw crearError("Puesto no encontrado", 404);
    }

    if (data.nombre && data.nombre !== puesto.nombre) {
      const existe = await prisma.puesto.findFirst({
        where: { nombre: data.nombre, departamento_id: puesto.departamento_id, id: { not: id } },
      });
      if (existe) {
        throw crearError("Ya existe un puesto con ese nombre en este departamento", 409);
      }
    }

    const actualizado = await prisma.puesto.update({
      where: { id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        departamento_id: data.departamento_id,
        activo: data.activo,
      },
      include: {
        departamento: {
          select: {
            id: true,
            nombre: true,
            division: { select: { id: true, nombre: true, empresa: { select: { id: true, nombre_empresa: true } } } },
          },
        },
      },
    });

    return actualizado;
  }

  async desactivar(id) {
    const puesto = await prisma.puesto.findUnique({ where: { id } });
    if (!puesto) throw crearError("Puesto no encontrado", 404);
    if (!puesto.activo) throw crearError("El puesto ya está inactivo", 400);

    const actualizado = await prisma.puesto.update({
      where: { id },
      data: { activo: false },
      select: { id: true, nombre: true, activo: true },
    });
    return actualizado;
  }

  async activar(id) {
    const puesto = await prisma.puesto.findUnique({ where: { id } });
    if (!puesto) throw crearError("Puesto no encontrado", 404);
    if (puesto.activo) throw crearError("El puesto ya está activo", 400);

    const actualizado = await prisma.puesto.update({
      where: { id },
      data: { activo: true },
      select: { id: true, nombre: true, activo: true },
    });
    return actualizado;
  }
}

export const puestosService = new PuestosService();