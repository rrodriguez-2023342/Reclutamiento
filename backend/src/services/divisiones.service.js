import prisma from "../config/prisma.js";

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

class DivisionesService {
  async listar({ page = 1, limit = 10, q, empresa_id, activo }) {
    const where = {};

    if (activo !== undefined) {
      where.activo = activo;
    }

    if (empresa_id) {
      where.empresa_id = empresa_id;
    }

    if (q) {
      where.nombre = { contains: q };
    }

    const [data, total] = await prisma.$transaction([
      prisma.division.findMany({
        where,
        include: {
          empresa: { select: { id: true, nombre_empresa: true } },
          _count: { select: { departamentos: true } },
        },
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
      include: {
        empresa: { select: { id: true, nombre_empresa: true } },
        departamentos: { where: { activo: true }, select: { id: true, nombre: true } },
      },
    });
    if (!division) return null;
    return division;
  }

  async crear(data) {
    const empresa = await prisma.empresa.findUnique({ where: { id: data.empresa_id } });
    if (!empresa) {
      throw crearError("La empresa seleccionada no existe", 400);
    }

    const existe = await prisma.division.findFirst({
      where: { nombre: data.nombre, empresa_id: data.empresa_id },
    });
    if (existe) {
      throw crearError("Ya existe una división con ese nombre en esta empresa", 409);
    }

    const division = await prisma.division.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        empresa_id: data.empresa_id,
        activo: data.activo ?? true,
      },
      include: {
        empresa: { select: { id: true, nombre_empresa: true } },
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
        where: { nombre: data.nombre, empresa_id: division.empresa_id, id: { not: id } },
      });
      if (existe) {
        throw crearError("Ya existe una división con ese nombre en esta empresa", 409);
      }
    }

    const actualizada = await prisma.division.update({
      where: { id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        empresa_id: data.empresa_id,
        activo: data.activo,
      },
      include: {
        empresa: { select: { id: true, nombre_empresa: true } },
      },
    });

    return actualizada;
  }

  async desactivar(id) {
    const division = await prisma.division.findUnique({ where: { id } });
    if (!division) throw crearError("División no encontrada", 404);
    if (!division.activo) throw crearError("La división ya está inactiva", 400);

    const tieneDepartamentos = await prisma.departamento.count({
      where: { division_id: id, activo: true },
    });
    if (tieneDepartamentos > 0) {
      throw crearError("No se puede desactivar: tiene departamentos activos", 400);
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