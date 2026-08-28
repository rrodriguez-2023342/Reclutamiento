import {
  createUsuarioSchema,
  updateUsuarioSchema,
  listarUsuariosQuerySchema,
} from "../validators/usuarios.validator.js";
import { usuarioService } from "../services/usuario.service.js";

// Valida los datos recibidos utilizando el esquema proporcionado
function validar(schema, datos, res) {
  const parsed = schema.safeParse(datos);

  /* Si los datos no cumplen con las reglas de validación, 
  se devuelve una respuesta con código HTTP 400 */
  if (!parsed.success) {
    res.status(400).json({
      status: "error",
      message: parsed.error.issues[0].message,
    });
    return null;
  }
  // Retorna los datos la validados
  return parsed.data;
}

// Obtiene y valida el ID del usuario recibido como parametro en la URL de la peticion
function parsearId(req, res) {
  const id = Number(req.params.id);

  // Verifica que el ID sea un numero entero positivo
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ status: "error", message: "Id inválido" });
    return null;
  }

  return id;
}

// Obtiene una lista de usuarios
export const listarUsuarios = async (req, res) => {
  const query = validar(listarUsuariosQuerySchema, req.query, res);
  // Detiene la ejecucion si los parametros no son validos
  if (!query) return;

  // Solicita al servicio la lista de los usuarios
  const resultado = await usuarioService.listar(query);
  res.json({ status: "ok", data: resultado });
};

// Obtiene la informacion de un usario mediante su ID
export const getUsuarioById = async (req, res) => {
  const id = parsearId(req, res);
  // Detiene la ejecucion si el ID no es valido
  if (!id) return;

  // Busca al usuario mediante el servicio
  const usuario = await usuarioService.obtenerPorId(id);

  // Si el usuario no existe, devuelve un error 404
  if (!usuario) {
    return res
      .status(404)
      .json({ status: "error", message: "Usuario no encontrado" });
  }

  res.json({ status: "ok", data: usuario });
};

// Crea un nuevo usuario
export const createUsuario = async (req, res) => {
  const data = validar(createUsuarioSchema, req.body, res);
  // Detiene la ejecucion si los datos no son validos
  if (!data) return;

  // Envia los datos validados al servicio para crear el usuario
  const usuario = await usuarioService.crear(data, req.userId);
  res.status(201).json({ status: "ok", data: usuario });
};

// Actualizar la informacion de un usuario existente
export const updateUsuario = async (req, res) => {
  const id = parsearId(req, res);
  // Detiene la ejecucion si el ID no es valido
  if (!id) return;

  // Valida los datos recibidos en el cuerpo de la peticion
  const data = validar(updateUsuarioSchema, req.body, res);
  // Detiene la ejecucion si los datos no son validos
  if (!data) return;

  /* Envia el ID y los datos validados al servicio 
  para realizar la actualizacion */
  const usuario = await usuarioService.actualizar(id, data, req.userId);
  res.json({ status: "ok", data: usuario });
};

// Desactica un usuario mediante su ID
export const desactivarUsuario = async (req, res) => {
  const id = parsearId(req, res);
  // Detiene la ejecucion si el ID no es valido
  if (!id) return;

  // Solicita al servicio la desactivacion del usuario
  const usuario = await usuarioService.desactivar(id, req.userId);
  res.json({ status: "ok", data: usuario });
};

// Activa nuevamente al usuario
export const activarUsuario = async (req, res) => {
  const id = parsearId(req, res);
  // Detiene la ejecucion si el ID no es valido
  if (!id) return;

  // Solicita al servicio la activacion del usuario
  const usuario = await usuarioService.activar(id);
  res.json({ status: "ok", data: usuario });
};

// Restablece la contraseña del usuario
export const resetPasswordUsuario = async (req, res) => {
  const id = parsearId(req, res);
  // Detiene la ejecucion si el ID no es valido
  if (!id) return;

  // Solicita al servicio el restablecimiento de la contraseña
  const resultado = await usuarioService.resetPassword(id);
  res.json({ status: "ok", data: resultado });
};