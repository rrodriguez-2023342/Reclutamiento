import prisma from "../config/prisma.js";

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

class PuestosService {
  async listar({ page = 1, limit = 10, q, division_id, departamento_id, activo }) {
    const where = {};

    if (division_id) {
      where.division_id = division_id;
    }

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
          division: { select: { id: true, nombre: true } },
          departamento: { select: { id: true, nombre: true } },
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
        division: { select: { id: true, nombre: true } },
        departamento: { select: { id: true, nombre: true } },
      },
    });
    if (!puesto) return null;
    return puesto;
  }

  async crear(data) {
    const division = await prisma.division.findUnique({ where: { id: data.division_id } });
    if (!division) {
      throw crearError("La división seleccionada no existe", 400);
    }

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
        division_id: data.division_id,
        departamento_id: data.departamento_id,
        activo: data.activo ?? true,
      },
      include: {
        division: { select: { id: true, nombre: true } },
        departamento: { select: { id: true, nombre: true } },
      },
    });

    return puesto;
  }

  async actualizar(id, data) {
    const puesto = await prisma.puesto.findUnique({ where: { id } });
    if (!puesto) {
      throw crearError("Puesto no encontrado", 404);
    }

    if (data.division_id !== undefined) {
      const division = await prisma.division.findUnique({ where: { id: data.division_id } });
      if (!division) {
        throw crearError("La división seleccionada no existe", 400);
      }
    }

    if (data.departamento_id !== undefined) {
      const departamento = await prisma.departamento.findUnique({ where: { id: data.departamento_id } });
      if (!departamento) {
        throw crearError("El departamento seleccionado no existe", 400);
      }
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
        division_id: data.division_id,
        departamento_id: data.departamento_id,
        activo: data.activo,
      },
      include: {
        division: { select: { id: true, nombre: true } },
        departamento: { select: { id: true, nombre: true } },
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