import prisma from "../config/prisma.js";
import { hashPassword } from "../utils/password.utils.js";
import crypto from "crypto";
import { sendTemporalPasswordEmail } from "../config/email.js";
import { historialSueldoService } from "./historial-sueldo.service.js";
import { historialEmpresaService } from "./historial-empresa.service.js";

// Funcion para crear un error con mensaje y status
function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

// Servicio para manejar operaciones relacionadas con usuarios
class UsuarioService {
  async listar({ page = 1, limit = 10, q, rol_id, activo }) {
    const where = {};

    if (activo !== undefined) {
      where.activo = activo;
    }

    // Filtrar por rol si se proporciona
    if (rol_id) {
      where.rol_id = rol_id;
    }

    // Filtrar por busqueda en nombre o correo si se proporciona
    if (q) {
      where.OR = [{ nombre: { contains: q } }, { correo: { contains: q } }];
    }

    // Realizar la transaccion para obtener los usuarios y el conteo total
    const [data, total] = await prisma.$transaction([
      prisma.usuario.findMany({
        where,
        include: {
          rol: { select: { id: true, nombre: true } },
          empresa: { select: { id: true, nombre_empresa: true } },
          patrono: { select: { id: true, razon_social: true } },
        },
        orderBy: [{ creado_en: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.usuario.count({ where }),
    ]);

    // Excluir campos sensibles antes de devolver los datos
    const sinPassword = data.map(
      ({ password, resetToken, resetTokenExpiry, ...resto }) => resto,
    );

    // Devolver los datos junto con la informacion de paginacion
    return {
      data: sinPassword,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // Obtener un usuario por su ID, excluyendo campos sensibles
  async obtenerPorId(id) {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        rol: { select: { id: true, nombre: true } },
        empresa: { select: { id: true, nombre_empresa: true } },
        patrono: { select: { id: true, razon_social: true } },
      },
    });

    if (!usuario) return null;

    const { password, resetToken, resetTokenExpiry, ...resto } = usuario;
    return resto;
  }

  // Crear un nuevo usuario, verificando duplicados y enviando correo si es necesario
  async crear(data, adminId) {
    // Verificar si ya existe un usuario con el mismo correo
    const existente = await prisma.usuario.findUnique({
      where: { correo: data.correo },
    });
    if (existente) {
      throw crearError("Ya existe un usuario con ese correo", 409);
    }

    // Verificar si el rol proporcionado existe
    const rol = await prisma.role.findUnique({ where: { id: data.rol_id } });
    if (!rol) {
      throw crearError("El rol seleccionado no existe", 400);
    }

    let hashedPassword; // Variable para almacenar la contraseña hasheada
    let mustChangePassword = false; // Variable para indicar si el usuario debe cambiar la contraseña al iniciar sesion
    let temporalPassword = null; // Variable para almacenar la contraseña temporal generada

    // Si se proporciona una contraseña, se hashea; de lo contrario, se genera temporalmente
    if (data.password) {
      hashedPassword = await hashPassword(data.password);
    } else {
      temporalPassword = crypto.randomBytes(8).toString("hex");
      hashedPassword = await hashPassword(temporalPassword);
      mustChangePassword = true;
    }

    // Si no se especifica el estado activo, se asume que el usuario esta activo por defecto
    const activo = data.activo !== undefined ? data.activo : true;

    // Crear el usuario en la base de datos, incluyendo el rol asociado
    const creado = await prisma.usuario.create({
      data: {
        nombre: data.nombre,
        correo: data.correo,
        password: hashedPassword,
        rol_id: data.rol_id,
        activo,
        mustChangePassword,
        empresa_id: data.empresa_id || null,
        patrono_id: data.patrono_id || null,
        fecha_nacimiento: data.fecha_nacimiento ? new Date(data.fecha_nacimiento) : null,
        sexo: data.sexo || null,
        dpi: data.dpi || null,
        dpi_extendido_en: data.dpi_extendido_en || null,
        direccion: data.direccion || null,
        sueldo: data.sueldo || null,
        bonos: data.bonos || null,
      },
      include: {
        rol: { select: { id: true, nombre: true } },
        empresa: { select: { id: true, nombre_empresa: true } },
        patrono: { select: { id: true, razon_social: true } },
      },
    });

    // Enviar correo con contraseña temporal si se genero una
    if (temporalPassword) {
      try {
        await sendTemporalPasswordEmail(
          creado.correo,
          creado.nombre,
          temporalPassword,
        );
      } catch (errorEmail) {
        console.error(
          "No fue posible enviar el correo de contraseña temporal:",
          errorEmail.message,
        );
      }
    }

    // Excluir campos sensibles antes de devolver los datos
    const { password, resetToken, resetTokenExpiry, ...resto } = creado;
    // Devolver el usuario creado junto con la informacion de si se envio el correo
    const resultado = { ...resto, correoEnviado: temporalPassword !== null };

    // Registrar historial de sueldo si se asigno uno
    if (data.sueldo || data.bonos) {
      try {
        await historialSueldoService.registrar({
          usuario_id: creado.id,
          sueldo_anterior: null,
          sueldo_nuevo: data.sueldo || null,
          bonos_anterior: null,
          bonos_nuevo: data.bonos || null,
          motivo: "Asignación inicial de sueldo",
          cambiado_por_id: adminId,
        });
      } catch (errorHistorial) {
        console.error(
          "No fue posible registrar historial de sueldo:",
          errorHistorial.message,
        );
      }
    }

    return resultado;
  }

  // Actualizar un usuario existente, verificando duplicados y existencia de rol
  async actualizar(id, data, adminId) {
    // Verificar si el usuario existe
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      throw crearError("Usuario no encontrado", 404);
    }

    // Verificar si el correo proporcionado ya existe en otro usuario
    if (data.correo && data.correo !== usuario.correo) {
      const duplicado = await prisma.usuario.findFirst({
        where: { correo: data.correo, id: { not: id } },
      });
      if (duplicado) {
        throw crearError("Ya existe otro usuario con ese correo", 409);
      }
    }

    // Verificar si el rol proporcionado existe
    if (data.rol_id) {
      const rol = await prisma.role.findUnique({ where: { id: data.rol_id } });
      if (!rol) {
        throw crearError("El rol seleccionado no existe", 400);
      }
    }

    // Extraer campos que no van directos a Prisma update
    const {
      rol_id,
      motivo_cambio_sueldo,
      motivo_cambio_empresa,
      empresa_id,
      patrono_id,
      fecha_nacimiento,
      ...restFields
    } = data;

    const updateData = {
      ...restFields,
      rol: { connect: { id: rol_id } },
      empresa: empresa_id ? { connect: { id: empresa_id } } : { disconnect: true },
      patrono: patrono_id ? { connect: { id: patrono_id } } : { disconnect: true },
    };
    if (fecha_nacimiento) {
      updateData.fecha_nacimiento = new Date(fecha_nacimiento);
    }

    // Detectar cambios en sueldo o bonos para registrar historial
    const sueldoCambio =
      data.sueldo !== undefined &&
      Number(data.sueldo) !== Number(usuario.sueldo || 0);
    const bonosCambio =
      data.bonos !== undefined &&
      Number(data.bonos) !== Number(usuario.bonos || 0);

    // Detectar cambio de empresa
    const empresaAnteriorId = usuario.empresa_id;
    const empresaNuevoId = empresa_id ?? null;
    const empresaCambio = empresaAnteriorId !== empresaNuevoId;

    const actualizado = await prisma.usuario.update({
      where: { id },
      data: updateData,
      include: {
        rol: { select: { id: true, nombre: true } },
        empresa: { select: { id: true, nombre_empresa: true } },
        patrono: { select: { id: true, razon_social: true } },
      },
    });

    // Excluir campos sensibles antes de devolver los datos
    const { password, resetToken, resetTokenExpiry, ...resto } = actualizado;

    // Registrar historial si cambiaron sueldo o bonos
    if (sueldoCambio || bonosCambio) {
      try {
        await historialSueldoService.registrar({
          usuario_id: id,
          sueldo_anterior: sueldoCambio ? usuario.sueldo : null,
          sueldo_nuevo: sueldoCambio ? actualizado.sueldo : null,
          bonos_anterior: bonosCambio ? usuario.bonos : null,
          bonos_nuevo: bonosCambio ? actualizado.bonos : null,
          motivo: motivo_cambio_sueldo || "Actualización de sueldo",
          cambiado_por_id: adminId,
        });
      } catch (errorHistorial) {
        console.error(
          "No fue posible registrar historial de sueldo:",
          errorHistorial.message,
        );
      }
    }

    // Registrar historial si cambió empresa
    if (empresaCambio) {
      try {
        await historialEmpresaService.registrar({
          usuario_id: id,
          empresa_anterior_id: empresaAnteriorId,
          empresa_nuevo_id: empresaNuevoId,
          motivo: motivo_cambio_empresa || "Cambio de empresa",
          cambiado_por_id: adminId,
        });
      } catch (errorHistorial) {
        console.error(
          "No fue posible registrar historial de empresa:",
          errorHistorial.message,
        );
      }
    }

    // Devolver el usuario actualizado
    return resto;
  }

  // Desactivar un usuario, asegurando que no se pueda desactivar a si mismo y que exista y este activo
  async desactivar(id, adminId) {
    // Verificar que el administrador no intente descactivar su propia cuenta
    if (Number(id) === Number(adminId)) {
      throw crearError("No puede desactivar su propia cuenta", 400);
    }

    // Verificar si el usuario existe y si esta activo
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: { id: true, nombre: true, correo: true, activo: true },
    });
    // Si el usuario no existe, lanzar un error 404
    if (!usuario) {
      throw crearError("Usuario no encontrado", 404);
    }
    // Si el usuario ya esta desactivado, lanzar un error 400
    if (!usuario.activo) {
      throw crearError("El usuario ya está desactivado", 400);
    }

    // Actualizar el usuario para marcarlo como inactivo
    const actualizado = await prisma.usuario.update({
      where: { id },
      data: { activo: false },
      select: {
        id: true,
        nombre: true,
        correo: true,
        activo: true,
        rol: { select: { id: true, nombre: true } },
      },
    });

    // Devolver el usuario actualizado
    return actualizado;
  }

  // Activar un usuario, asegurando que exista y que no este ya activo
  async activar(id) {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: { id: true, nombre: true, correo: true, activo: true },
    });
    if (!usuario) {
      throw crearError("Usuario no encontrado", 404);
    }

    if (usuario.activo) {
      throw crearError("El usuario ya está activo", 400);
    }

    const actualizado = await prisma.usuario.update({
      where: { id },
      data: { activo: true },
      select: {
        id: true,
        nombre: true,
        correo: true,
        activo: true,
        rol: { select: { id: true, nombre: true } },
      },
    });

    return actualizado;
  }

  async resetPassword(id) {
    // Buscar al usuario por el ID proporcionado
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    // Si el usuario no existe se genera un error 404
    if (!usuario) {
      throw crearError("Usuario no encontrado", 404);
    }

    const temporalPassword = crypto.randomBytes(8).toString("hex"); // Genera una contrasela provisional
    const hashed = await hashPassword(temporalPassword); // Encripta la contrasela temporal

    // Actualiza la contrasela del usuario y establece que debe cambiarla
    await prisma.usuario.update({
      where: { id },
      data: {
        password: hashed,
        mustChangePassword: true,
      },
    });

    try {
      // Envia la contraseña temporal al correo
      await sendTemporalPasswordEmail(
        usuario.correo,
        usuario.nombre,
        temporalPassword,
      );
    } catch (errorEmail) {
      console.error(
        "No fue posible enviar el correo de contraseña temporal:",
        errorEmail.message,
      );
    }

    // Devuelve el resultado de la operacion
    return { success: true, correoEnviado: true };
  }
}

export const usuarioService = new UsuarioService();