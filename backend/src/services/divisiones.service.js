import prisma from "../config/prisma.js";

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

class DivisionesService {
  async listar({ page = 1, limit = 10, q, activo }) {
    const where = {};

    if (activo !== undefined) {
      where.activo = activo;
    }

    if (q) {
      where.nombre = { contains: q };
    }

    const [data, total] = await prisma.$transaction([
      prisma.division.findMany({
        where,
        orderBy: { creado_en: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.division.count({ where }),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) || 1 };
  }

  async obtenerPorId(id) {
    const division = await prisma.division.findUnique({
      where: { id },
    });
    if (!division) return null;
    return division;
  }

  async crear(data) {
    const existe = await prisma.division.findFirst({
      where: { nombre: data.nombre },
    });
    if (existe) {
      throw crearError("Ya existe una división con ese nombre", 409);
    }

    const division = await prisma.division.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        activo: data.activo ?? true,
      },
    });

    return division;
  }

  async actualizar(id, data) {
    const division = await prisma.division.findUnique({ where: { id } });
    if (!division) {
      throw crearError("División no encontrada", 404);
    }

    if (data.nombre && data.nombre !== division.nombre) {
      const existe = await prisma.division.findFirst({
        where: { nombre: data.nombre, id: { not: id } },
      });
      if (existe) {
        throw crearError("Ya existe una división con ese nombre", 409);
      }
    }

    const actualizada = await prisma.division.update({
      where: { id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        activo: data.activo,
      },
    });

    return actualizada;
  }

  async desactivar(id) {
    const division = await prisma.division.findUnique({ where: { id } });
    if (!division) throw crearError("División no encontrada", 404);
    if (!division.activo) throw crearError("La división ya está inactiva", 400);

    const tienePuestos = await prisma.puesto.count({
      where: { division_id: id, activo: true },
    });
    if (tienePuestos > 0) {
      throw crearError("No se puede desactivar: tiene puestos activos", 400);
    }

    const actualizada = await prisma.division.update({
      where: { id },
      data: { activo: false },
      select: { id: true, nombre: true, activo: true },
    });
    return actualizada;
  }

  async activar(id) {
    const division = await prisma.division.findUnique({ where: { id } });
    if (!division) throw crearError("División no encontrada", 404);
    if (division.activo) throw crearError("La división ya está activa", 400);

    const actualizada = await prisma.division.update({
      where: { id },
      data: { activo: true },
      select: { id: true, nombre: true, activo: true },
    });
    return actualizada;
  }
}

export const divisionesService = new DivisionesService();
