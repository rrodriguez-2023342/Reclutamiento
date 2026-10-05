import prisma from "../config/prisma.js";

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

class DepartamentosService {
  async listar({ page = 1, limit = 10, q, activo }) {
    const where = {};

    if (activo !== undefined) {
      where.activo = activo;
    }

    if (q) {
      where.nombre = { contains: q };
    }

    const [data, total] = await prisma.$transaction([
      prisma.departamento.findMany({
        where,
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
    });
    if (!departamento) return null;
    return departamento;
  }

  async crear(data) {
    const existe = await prisma.departamento.findFirst({
      where: { nombre: data.nombre },
    });
    if (existe) {
      throw crearError("Ya existe un departamento con ese nombre", 409);
    }

    const departamento = await prisma.departamento.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        activo: data.activo ?? true,
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
        where: { nombre: data.nombre, id: { not: id } },
      });
      if (existe) {
        throw crearError("Ya existe un departamento con ese nombre", 409);
      }
    }

    const actualizado = await prisma.departamento.update({
      where: { id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        activo: data.activo,
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
