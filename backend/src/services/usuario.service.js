import prisma from "../config/prisma.js";
import { hashPassword } from "../utils/password.utils.js";
import crypto from "crypto";
import { sendTemporalPasswordEmail } from "../config/email.js";
import { historialSueldoService } from "./historial-sueldo.service.js";
import { historialEmpresaService } from "./historial-empresa.service.js";
import { COLABORADOR_ROLE } from "../config/roles.constant.js";

// Funcion para crear un error con mensaje y status
function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

// Verifica que una empresa este dentro del alcance del solicitante (null = sin limite)
function dentroDeAlcance(empresaIds, empresaId) {
  if (!Array.isArray(empresaIds)) return true;
  return empresaId !== null && empresaId !== undefined && empresaIds.includes(empresaId);
}

// Servicio para manejar operaciones relacionadas con usuarios
class UsuarioService {
  // Construye el filtro where compartido entre listado y exportación
  construirWhere({ q, rol_id, activo, empresa_ids, empresa_id, patrono_id } = {}) {
    const where = {};

    if (activo !== undefined) {
      where.activo = activo;
    }

    // Filtrar por rol si se proporciona
    if (rol_id) {
      where.rol_id = rol_id;
    }

    // Alcance por empresa (Recursos Humanos): array = limitar, null = sin limite
    if (Array.isArray(empresa_ids)) {
      where.empresa_id = { in: empresa_ids };
    }

    // Filtrar por empresa puntual (interseccionado con el alcance)
    if (empresa_id) {
      if (Array.isArray(where.empresa_id?.in)) {
        where.empresa_id = where.empresa_id.in.includes(empresa_id)
          ? empresa_id
          : { in: [] };
      } else {
        where.empresa_id = empresa_id;
      }
    }

    // Filtrar por patrono si se proporciona
    if (patrono_id) {
      where.patrono_id = patrono_id;
    }

    // Filtrar por busqueda en nombre, correo o usuario si se proporciona
    if (q) {
      where.OR = [
        { nombre: { contains: q } },
        { correo: { contains: q } },
        { usuario: { contains: q } },
      ];
    }

    return where;
  }

  async listar({ page = 1, limit = 10, ...filtros }) {
    const where = this.construirWhere(filtros);

    // Realizar la transaccion para obtener los usuarios y el conteo total
    const [data, total] = await prisma.$transaction([
      prisma.usuario.findMany({
        where,
        include: {
          rol: { select: { id: true, nombre: true } },
          empresa: { select: { id: true, nombre_empresa: true } },
          patrono: { select: { id: true, razon_social: true } },
          puesto: { select: { id: true, nombre: true, descripcion: true } },
          empresas_asignadas: {
            include: { empresa: { select: { id: true, nombre_empresa: true, activo: true } } },
            orderBy: { empresa: { nombre_empresa: "asc" } },
          },
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

  // Exporta TODOS los usuarios filtrados con sus relaciones e historiales (sin paginar)
  async exportar(filtros) {
    const data = await prisma.usuario.findMany({
      where: this.construirWhere(filtros),
      include: {
        rol: { select: { id: true, nombre: true } },
        empresa: { select: { id: true, nombre_empresa: true } },
        patrono: { select: { id: true, razon_social: true } },
        puesto: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            departamento: { select: { nombre: true } },
          },
        },
        historial_sueldo: {
          include: { cambiado_por: { select: { id: true, nombre: true } } },
          orderBy: { fecha_cambio: "desc" },
        },
        historial_empresa: {
          include: {
            empresa_anterior: { select: { id: true, nombre_empresa: true } },
            empresa_nuevo: { select: { id: true, nombre_empresa: true } },
            cambiado_por: { select: { id: true, nombre: true } },
          },
          orderBy: { fecha_cambio: "desc" },
        },
      },
      orderBy: [{ creado_en: "desc" }, { id: "desc" }],
    });

    // Excluir campos sensibles antes de devolver los datos
    return data.map(
      ({ password, resetToken, resetTokenExpiry, ...resto }) => resto,
    );
  }

  // Obtener un usuario por su ID, excluyendo campos sensibles
  async obtenerPorId(id, ctx = {}) {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        rol: { select: { id: true, nombre: true } },
        empresa: { select: { id: true, nombre_empresa: true } },
        patrono: { select: { id: true, razon_social: true } },
        puesto: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            departamento: { select: { nombre: true } },
          },
        },
        empresas_asignadas: {
          include: { empresa: { select: { id: true, nombre_empresa: true, activo: true } } },
          orderBy: { empresa: { nombre_empresa: "asc" } },
        },
      },
    });

    if (!usuario) return null;

    // Si el solicitante tiene alcance limitado (RRHH) y el usuario queda fuera, se oculta
    if (!dentroDeAlcance(ctx.empresaIds, usuario.empresa_id)) return null;

    const { password, resetToken, resetTokenExpiry, ...resto } = usuario;
    return resto;
  }

  // Crear un nuevo usuario, verificando duplicados y enviando correo si es necesario
  async crear(data, adminId, ctx = {}) {
    // Recursos Humanos solo puede crear colaboradores dentro de sus empresas asignadas
    if (ctx.esRH) {
      const rolColaborador = await prisma.role.findUnique({
        where: { nombre: COLABORADOR_ROLE },
      });
      if (!rolColaborador || data.rol_id !== rolColaborador.id) {
        throw crearError(
          "Solo el administrador puede asignar roles distintos a Colaborador",
          403,
        );
      }
      if (!data.empresa_id) {
        throw crearError("Debe asignar una empresa al colaborador", 400);
      }
      if (!dentroDeAlcance(ctx.empresaIds, data.empresa_id)) {
        throw crearError("No tiene permiso sobre esa empresa", 403);
      }
    }

    // Verificar si ya existe un usuario con el mismo correo o nombre de usuario
    if (data.correo) {
      const existenteCorreo = await prisma.usuario.findUnique({
        where: { correo: data.correo },
      });
      if (existenteCorreo) {
        throw crearError("Ya existe un usuario con ese correo", 409);
      }
    }
    if (data.usuario) {
      const existenteUsuario = await prisma.usuario.findUnique({
        where: { usuario: data.usuario },
      });
      if (existenteUsuario) {
        throw crearError("Ya existe un usuario con ese nombre de usuario", 409);
      }
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
        usuario: data.usuario || null,
        correo: data.correo || null,
        password: hashedPassword,
        rol_id: data.rol_id,
        activo,
        mustChangePassword,
        empresa_id: data.empresa_id || null,
        patrono_id: data.patrono_id || null,
        puesto_id: data.puesto_id || null,
        fecha_nacimiento: data.fecha_nacimiento ? new Date(data.fecha_nacimiento) : null,
        estado_civil: data.estado_civil || null,
        nacionalidad: data.nacionalidad || null,
        telefono: data.telefono || null,
        ultimo_grado_cursado: data.ultimo_grado_cursado || null,
        fecha_contratacion: data.fecha_contratacion ? new Date(data.fecha_contratacion) : null,
        tipo_contrato: data.tipo_contrato || "INDEFINIDO",
        fecha_fin_contrato:
          data.tipo_contrato === "DEFINIDO" && data.fecha_fin_contrato
            ? new Date(data.fecha_fin_contrato)
            : null,
        nit: data.nit || null,
        numero_afiliacion_igss: data.numero_afiliacion_igss || null,
        sexo: data.sexo || null,
        dpi: data.dpi || null,
        dpi_extendido_en: data.dpi_extendido_en || null,
        direccion: data.direccion || null,
        sueldo: data.sueldo || null,
        bonos: data.bonos || null,
        moneda_sueldo: data.moneda_sueldo || "QUETZAL",
        banco: data.banco || null,
        tipo_cuenta_bancaria: data.tipo_cuenta_bancaria || null,
        numero_cuenta_bancaria: data.numero_cuenta_bancaria || null,
        contacto_emergencia_nombre: data.contacto_emergencia_nombre || null,
        contacto_emergencia_telefono: data.contacto_emergencia_telefono || null,
        tiene_seguro_gastos_medicos: data.tiene_seguro_gastos_medicos ?? false,
        empresa_seguro_gastos_medicos: data.tiene_seguro_gastos_medicos
          ? data.empresa_seguro_gastos_medicos ?? null
          : null,
        tipo_seguro_gastos_medicos: data.tiene_seguro_gastos_medicos
          ? data.tipo_seguro_gastos_medicos ?? null
          : null,
        categoria_seguro_gastos_medicos: data.tiene_seguro_gastos_medicos
          ? data.categoria_seguro_gastos_medicos ?? null
          : null,
        tiene_seguro_vida: data.tiene_seguro_vida ?? false,
        empresa_seguro_vida: data.tiene_seguro_vida
          ? data.empresa_seguro_vida ?? null
          : null,
        categoria_seguro_vida: data.tiene_seguro_vida
          ? data.categoria_seguro_vida ?? null
          : null,
      },
      include: {
        rol: { select: { id: true, nombre: true } },
        empresa: { select: { id: true, nombre_empresa: true } },
        patrono: { select: { id: true, razon_social: true } },
        puesto: { select: { id: true, nombre: true } },
      },
    });

    // Enviar correo con contraseña temporal solo si se genero una y hay correo
    let correoEnviado = false;
    let passwordTemporal = null;
    if (temporalPassword) {
      if (creado.correo) {
        try {
          await sendTemporalPasswordEmail(
            creado.correo,
            creado.nombre,
            temporalPassword,
          );
          correoEnviado = true;
        } catch (errorEmail) {
          console.error(
            "No fue posible enviar el correo de contraseña temporal:",
            errorEmail.message,
          );
        }
      } else {
        // Sin correo no se puede enviar: se devuelve para mostrarla en pantalla
        passwordTemporal = temporalPassword;
      }
    }

    // Excluir campos sensibles antes de devolver los datos
    const { password, resetToken, resetTokenExpiry, ...resto } = creado;
    // Devolver el usuario creado junto con el estado del correo y la contraseña si aplica
    const resultado = { ...resto, correoEnviado };
    if (passwordTemporal) {
      resultado.passwordTemporal = passwordTemporal;
    }

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
  async actualizar(id, data, adminId, ctx = {}) {
    // Verificar si el usuario existe
    const usuario = await prisma.usuario.findUnique({ where: { id } });
    if (!usuario) {
      throw crearError("Usuario no encontrado", 404);
    }

    // Alcance limitado (RRHH): no puede tocar usuarios fuera de sus empresas
    if (!dentroDeAlcance(ctx.empresaIds, usuario.empresa_id)) {
      throw crearError("Usuario no encontrado", 404);
    }

    if (ctx.esRH) {
      // Recursos Humanos no puede cambiar roles
      if (data.rol_id) {
        const rolColaborador = await prisma.role.findUnique({
          where: { nombre: COLABORADOR_ROLE },
        });
        if (!rolColaborador || data.rol_id !== rolColaborador.id) {
          throw crearError(
            "Solo el administrador puede asignar roles distintos a Colaborador",
            403,
          );
        }
      }
      // Recursos Humanos no puede quitarle la empresa ni moverlo fuera de su alcance
      if (data.empresa_id === null) {
        throw crearError("Debe mantenerse la empresa asignada al colaborador", 403);
      }
      if (
        data.empresa_id !== undefined &&
        data.empresa_id !== null &&
        !dentroDeAlcance(ctx.empresaIds, data.empresa_id)
      ) {
        throw crearError("No tiene permiso sobre esa empresa", 403);
      }
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

    // Verificar si el nombre de usuario proporcionado ya existe en otro usuario
    if (data.usuario && data.usuario !== usuario.usuario) {
      const duplicadoUsuario = await prisma.usuario.findFirst({
        where: { usuario: data.usuario, id: { not: id } },
      });
      if (duplicadoUsuario) {
        throw crearError("Ya existe otro usuario con ese nombre de usuario", 409);
      }
    }

    // Verificar si el rol proporcionado existe
    if (data.rol_id) {
      const rol = await prisma.role.findUnique({ where: { id: data.rol_id } });
      if (!rol) {
        throw crearError("El rol seleccionado no existe", 400);
      }
    }

    const {
      rol_id,
      motivo_cambio_sueldo,
      motivo_cambio_empresa,
      empresa_id,
      patrono_id,
      puesto_id,
      fecha_nacimiento,
      ...restFields
    } = data;

    const updateData = {
      ...restFields,
      rol: { connect: { id: rol_id } },
      empresa: empresa_id ? { connect: { id: empresa_id } } : { disconnect: true },
      patrono: patrono_id ? { connect: { id: patrono_id } } : { disconnect: true },
      puesto: puesto_id ? { connect: { id: puesto_id } } : { disconnect: true },
    };
    if (data.tiene_seguro_gastos_medicos === false) {
      updateData.empresa_seguro_gastos_medicos = null;
      updateData.tipo_seguro_gastos_medicos = null;
      updateData.categoria_seguro_gastos_medicos = null;
    }
    if (data.tiene_seguro_vida === false) {
      updateData.empresa_seguro_vida = null;
      updateData.categoria_seguro_vida = null;
    }
    if (fecha_nacimiento) {
      updateData.fecha_nacimiento = new Date(fecha_nacimiento);
    }
    if (data.fecha_contratacion) {
      updateData.fecha_contratacion = new Date(data.fecha_contratacion);
    }
    if (data.fecha_fin_contrato !== undefined) {
      updateData.fecha_fin_contrato = data.fecha_fin_contrato
        ? new Date(data.fecha_fin_contrato)
        : null;
    }
    if (data.tipo_contrato === "INDEFINIDO") {
      updateData.fecha_fin_contrato = null;
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
        puesto: { select: { id: true, nombre: true } },
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

  async registrarBaja(id, data, ctx = {}) {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: { id: true, empresa_id: true },
    });
    if (!usuario) {
      throw crearError("Usuario no encontrado", 404);
    }
    if (!dentroDeAlcance(ctx.empresaIds, usuario.empresa_id)) {
      throw crearError("Usuario no encontrado", 404);
    }

    return prisma.usuario.update({
      where: { id },
      data: {
        fecha_baja: new Date(`${data.fecha_baja}T00:00:00.000Z`),
        motivo_baja: data.motivo_baja,
        notas_baja: data.notas_baja || null,
        reingreso_baja: data.reingreso_baja,
        // Registrar la baja desactiva al colaborador en el mismo update
        activo: false,
      },
      select: {
        id: true,
        fecha_baja: true,
        motivo_baja: true,
        notas_baja: true,
        reingreso_baja: true,
        activo: true,
      },
    });
  }

  // Desactivar un usuario, asegurando que no se pueda desactivar a si mismo y que exista y este activo
  async desactivar(id, adminId, ctx = {}) {
    // Verificar si el usuario existe y si esta activo
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: { id: true, nombre: true, correo: true, activo: true, empresa_id: true },
    });
    // Si el usuario no existe, lanzar un error 404
    if (!usuario) {
      throw crearError("Usuario no encontrado", 404);
    }
    // Alcance limitado (RRHH): no visible fuera de sus empresas
    if (!dentroDeAlcance(ctx.empresaIds, usuario.empresa_id)) {
      throw crearError("Usuario no encontrado", 404);
    }
    // Verificar que el administrador no intente descactivar su propia cuenta
    if (Number(id) === Number(adminId)) {
      throw crearError("No puede desactivar su propia cuenta", 400);
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
  async activar(id, ctx = {}) {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: { id: true, nombre: true, correo: true, activo: true, empresa_id: true },
    });
    if (!usuario) {
      throw crearError("Usuario no encontrado", 404);
    }
    if (!dentroDeAlcance(ctx.empresaIds, usuario.empresa_id)) {
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

  async resetPassword(id, ctx = {}) {
    // Buscar al usuario por el ID proporcionado
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: { id: true, nombre: true, correo: true, empresa_id: true },
    });
    // Si el usuario no existe se genera un error 404
    if (!usuario) {
      throw crearError("Usuario no encontrado", 404);
    }
    // Alcance limitado (RRHH): no visible fuera de sus empresas
    if (!dentroDeAlcance(ctx.empresaIds, usuario.empresa_id)) {
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

    // Sin correo no se puede enviar: se devuelve la contraseña para mostrarla en pantalla
    if (!usuario.correo) {
      return { success: true, correoEnviado: false, passwordTemporal };
    }

    let correoEnviado = true;
    try {
      // Envia la contraseña temporal al correo
      await sendTemporalPasswordEmail(
        usuario.correo,
        usuario.nombre,
        temporalPassword,
      );
    } catch (errorEmail) {
      correoEnviado = false;
      console.error(
        "No fue posible enviar el correo de contraseña temporal:",
        errorEmail.message,
      );
    }

    // Devuelve el resultado de la operacion
    return { success: true, correoEnviado };
  }

  // Obtiene las empresas asignadas a un usuario (rol Recursos Humanos)
  async obtenerEmpresasAsignadas(id) {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!usuario) {
      throw crearError("Usuario no encontrado", 404);
    }

    const filas = await prisma.usuarioEmpresa.findMany({
      where: { usuario_id: id },
      include: {
        empresa: { select: { id: true, nombre_empresa: true, activo: true } },
      },
      orderBy: { empresa: { nombre_empresa: "asc" } },
    });

    return filas.map((f) => f.empresa);
  }

  // Reemplaza las empresas asignadas a un usuario (solo administrador)
  async asignarEmpresas(id, empresaIds) {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!usuario) {
      throw crearError("Usuario no encontrado", 404);
    }

    const unicos = [...new Set(empresaIds)];

    // Verificar que todas las empresas indicadas existan
    const existentes = await prisma.empresa.findMany({
      where: { id: { in: unicos } },
      select: { id: true },
    });
    if (existentes.length !== unicos.length) {
      throw crearError("Una o más empresas no existen", 400);
    }

    // Reemplazar el conjunto de asignaciones en una transaccion
    await prisma.$transaction([
      prisma.usuarioEmpresa.deleteMany({ where: { usuario_id: id } }),
      ...(unicos.length > 0
        ? [
            prisma.usuarioEmpresa.createMany({
              data: unicos.map((empresa_id) => ({
                usuario_id: id,
                empresa_id,
              })),
              skipDuplicates: true,
            }),
          ]
        : []),
    ]);

    return this.obtenerEmpresasAsignadas(id);
  }
}

export const usuarioService = new UsuarioService();