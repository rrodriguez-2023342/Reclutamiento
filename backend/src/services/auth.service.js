import prisma from '../config/prisma.js'
import { verifyPassword, hashPassword } from '../utils/password.utils.js'
import { generateToken } from '../utils/jwt.js'
import { generateResetToken, hashToken, verifyTokenHash } from '../utils/tokens.js'
import { sendPasswordResetEmail, sendTemporalPasswordEmail } from '../config/email.js'
import crypto from 'crypto'

class AuthService {
  // Login
  async login(correo, password) {
    const user = await prisma.usuario.findUnique({
      where: { correo },
      include: { rol: true },
    })

    if (!user) {
      const err = new Error('Credenciales inválidas')
      err.status = 401
      throw err
    }

    if (!user.activo) {
      const err = new Error('Tu cuenta está desactivada')
      err.status = 401
      throw err
    }

    const isValidPassword = await verifyPassword(user.password, password)
    if (!isValidPassword) {
      const err = new Error('Credenciales inválidas')
      err.status = 401
      throw err
    }

    const token = generateToken(user)

    const response = {
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol.nombre,
        mustChangePassword: user.mustChangePassword,
      },
    }

    return response
  }

  // Obtener datos del usuario autenticado
  async getMe(userId) {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      include: { rol: true },
    })

    if (!user) {
      const err = new Error('Usuario no encontrado')
      err.status = 401
      throw err
    }

    return {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol.nombre,
      mustChangePassword: user.mustChangePassword,
    }
  }

  // Cambiar contraseña (usuario autenticado)
  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.usuario.findUnique({ where: { id: userId } })
    if (!user) {
      const err = new Error('Usuario no encontrado')
      err.status = 404
      throw err
    }

    const isValid = await verifyPassword(user.password, currentPassword)
    if (!isValid) {
      const err = new Error('Contraseña actual incorrecta')
      err.status = 401
      throw err
    }

    // Verificar que la nueva sea diferente a la actual
    const isSame = await verifyPassword(user.password, newPassword)
    if (isSame) {
      const err = new Error('La nueva contraseña debe ser diferente a la actual')
      err.status = 400
      throw err
    }

    const hashed = await hashPassword(newPassword)
    await prisma.usuario.update({
      where: { id: userId },
      data: {
        password: hashed,
        mustChangePassword: false,
      },
    })

    return { success: true, message: 'Contraseña actualizada correctamente' }
  }

  // Solicitar reset de contraseña (forgot password)
  async requestPasswordReset(correo) {
    const user = await prisma.usuario.findUnique({ where: { correo } })

    // Por seguridad, siempre respondemos éxito aunque el usuario no exista
    if (!user) {
      return { success: true, message: 'Si el correo existe, recibirás un enlace' }
    }

    const resetToken = generateResetToken()
    const hashedToken = hashToken(resetToken)
    const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: expiry,
      },
    })

    // Enviar email (si falla, logueamos pero no rompemos el flujo)
    try {
      await sendPasswordResetEmail(user.correo, user.nombre, resetToken)
    } catch (emailErr) {
      console.error('Error enviando email de reset:', emailErr)
    }

    return { success: true, message: 'Si el correo existe, recibirás un enlace' }
  }

  // Resetear contraseña con token
  async resetPassword(token, newPassword) {
    const hashedToken = hashToken(token)

    const user = await prisma.usuario.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: { gt: new Date() },
      },
    })

    if (!user) {
      const err = new Error('Token inválido o expirado')
      err.status = 401
      throw err
    }

    const hashed = await hashPassword(newPassword)
    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        password: hashed,
        mustChangePassword: false,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return { success: true, message: 'Contraseña restablecida correctamente' }
  }

  // Generar contraseña temporal y enviar por email (para admin creando usuario)
  async generateTemporalPassword(correo) {
    const user = await prisma.usuario.findUnique({ where: { correo } })
    if (!user) {
      const err = new Error('Usuario no encontrado')
      err.status = 404
      throw err
    }

    // Generar contraseña temporal aleatoria
    const temporalPassword = crypto.randomBytes(8).toString('hex')
    const hashed = await hashPassword(temporalPassword)

    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        password: hashed,
        mustChangePassword: true,
      },
    })

    // Enviar email con la contraseña temporal
    try {
      await sendTemporalPasswordEmail(user.correo, user.nombre, temporalPassword)
    } catch (emailErr) {
      console.error('Error enviando email de contraseña temporal:', emailErr)
    }

    return { success: true, temporalPassword }
  }

  // Logout (stateless JWT, solo client-side limpia; endpoint existe por consistencia)
  async logout() {
    return { success: true, message: 'Sesión cerrada' }
  }
}

// Singleton
export const authService = new AuthService()