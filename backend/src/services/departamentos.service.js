import prisma from "../config/prisma.js";

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

class DepartamentosService {
  async listar({ page = 1, limit = 10, q, division_id, activo }) {
    const where = {};

    if (activo !== undefined) {
      where.activo = activo;
    }

    if (division_id) {
      where.division_id = division_id;
    }

    if (q) {
      where.nombre = { contains: q };
    }

    const [data, total] = await prisma.$transaction([
      prisma.departamento.findMany({
        where,
        include: {
          division: { select: { id: true, nombre: true, empresa: { select: { id: true, nombre_empresa: true } } } },
          _count: { select: { puestos: true } },
        },
        orderBy: { creado_en: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.departamento.count({ where }),
    ]);

    return { data, total, page, totalPages: Math.ceil(total / limit) || 1 };
  }

  async obtenerPorId(id) {
    const departamento = await prisma.departamento.findUnique({
      where: { id },
      include: {
        division: { select: { id: true, nombre: true, empresa: { select: { id: true, nombre_empresa: true } } } },
        puestos: { where: { activo: true }, select: { id: true, nombre: true } },
      },
    });
    if (!departamento) return null;
    return departamento;
  }

  async crear(data) {
    const division = await prisma.division.findUnique({ where: { id: data.division_id } });
    if (!division) {
      throw crearError("La división seleccionada no existe", 400);
    }

    const existe = await prisma.departamento.findFirst({
      where: { nombre: data.nombre, division_id: data.division_id },
    });
    if (existe) {
      throw crearError("Ya existe un departamento con ese nombre en esta división", 409);
    }

    const departamento = await prisma.departamento.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        division_id: data.division_id,
        activo: data.activo ?? true,
      },
      include: {
        division: { select: { id: true, nombre: true, empresa: { select: { id: true, nombre_empresa: true } } } },
      },
    });

    return departamento;
  }

  async actualizar(id, data) {
    const departamento = await prisma.departamento.findUnique({ where: { id } });
    if (!departamento) {
      throw crearError("Departamento no encontrado", 404);
    }

    if (data.nombre && data.nombre !== departamento.nombre) {
      const existe = await prisma.departamento.findFirst({
        where: { nombre: data.nombre, division_id: departamento.division_id, id: { not: id } },
      });
      if (existe) {
        throw crearError("Ya existe un departamento con ese nombre en esta división", 409);
      }
    }

    const actualizado = await prisma.departamento.update({
      where: { id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        division_id: data.division_id,
        activo: data.activo,
      },
      include: {
        division: { select: { id: true, nombre: true, empresa: { select: { id: true, nombre_empresa: true } } } },
      },
    });

    return actualizado;
  }

  async desactivar(id) {
    const departamento = await prisma.departamento.findUnique({ where: { id } });
    if (!departamento) throw crearError("Departamento no encontrado", 404);
    if (!departamento.activo) throw crearError("El departamento ya está inactivo", 400);

    const tienePuestos = await prisma.puesto.count({
      where: { departamento_id: id, activo: true },
    });
    if (tienePuestos > 0) {
      throw crearError("No se puede desactivar: tiene puestos activos", 400);
    }

    const actualizado = await prisma.departamento.update({
      where: { id },
      data: { activo: false },
      select: { id: true, nombre: true, activo: true },
    });
    return actualizado;
  }

  async activar(id) {
    const departamento = await prisma.departamento.findUnique({ where: { id } });
    if (!departamento) throw crearError("Departamento no encontrado", 404);
    if (departamento.activo) throw crearError("El departamento ya está activo", 400);

    const actualizado = await prisma.departamento.update({
      where: { id },
      data: { activo: true },
      select: { id: true, nombre: true, activo: true },
    });
    return actualizado;
  }
}

export const departamentosService = new DepartamentosService();