import prisma from '../config/prisma.js' 
import { verifyPassword } from '../utils/password.utils.js'
import { generateToken } from '../utils/jwt.js'

class AuthService {
  // Login
  async login(correo, password) {
    // Busca al usuario por su correo e incluye su rol
    const user = await prisma.usuario.findUnique({
      where: { correo },
      include: { rol: true },
    })

    // Comprobar si el usuario existe y si la contraseña es correcta
    if (!user) {
      const err = new Error('Credenciales inválidas')
      err.status = 401
      throw err
    }

    // Comprobar si el usuario está activo
    if (!user.activo) {
      const err = new Error('Tu cuenta está desactivada')
      err.status = 401
      throw err
    }

    // Comprobar la contraseña usando argon2
    const isValidPassword = await verifyPassword(user.password, password)
    if (!isValidPassword) {
      const err = new Error('Credenciales inválidas')
      err.status = 401
      throw err
    }

    // Generar un token JWT para el usuario
    const token = generateToken(user)

    // Devolver el token y los datos del usuario
    return {
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol.nombre,
      },
    }
  }

  // Obtener los datos del usuario autenticado
  async getMe(userId) {
    // Buscamos al usuario por su id e incluimos su rol
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      include: { rol: true },
    })

    // Comprobamos si el usuario existe
    if (!user) {
      const err = new Error('Usuario no encontrado')
      err.status = 401
      throw err
    }

    // Devolvemos los datos del usuario
    return {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol.nombre,
    }
  }
}

// Singleton
export const authService = new AuthService()