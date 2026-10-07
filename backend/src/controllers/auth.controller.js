import { z } from 'zod'
import { authService } from '../services/auth.service.js'

// Esquemas de validación
const loginSchema = z.object({
  usuario: z.string().min(1, 'El usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
})

const verifyPasswordSchema = z.object({
  password: z.string().min(1, 'La contraseña es requerida'),
})

const forgotPasswordSchema = z.object({
  correo: z.string().email('Correo inválido'),
})

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
})

// Login
export const login = async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      status: 'error',
      message: parsed.error.issues[0].message,
    })
  }

  const { usuario, password } = parsed.data
  const result = await authService.login(usuario.trim(), password)

  res.json(result)
}

// Obtener usuario autenticado
export const me = async (req, res) => {
  const user = await authService.getMe(req.userId)
  res.json({ status: 'ok', user })
}

// Cambiar contraseña (usuario autenticado)
export const changePassword = async (req, res) => {
  const parsed = changePasswordSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      status: 'error',
      message: parsed.error.issues[0].message,
    })
  }

  const { currentPassword, newPassword } = parsed.data
  const result = await authService.changePassword(req.userId, currentPassword, newPassword)

  res.json(result)
}

export const verifyCurrentPassword = async (req, res) => {
  const parsed = verifyPasswordSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      status: 'error',
      message: parsed.error.issues[0].message,
    })
  }

  const result = await authService.verifyCurrentPassword(req.userId, parsed.data.password)
  res.json(result)
}

// Solicitar reset de contraseña (forgot password)
export const forgotPassword = async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      status: 'error',
      message: parsed.error.issues[0].message,
    })
  }

  const { correo } = parsed.data
  const result = await authService.requestPasswordReset(correo.trim())

  // Siempre 200 por seguridad (no revelar si el correo existe)
  res.json(result)
}

// Resetear contraseña con token
export const resetPassword = async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      status: 'error',
      message: parsed.error.issues[0].message,
    })
  }

  const { token, newPassword } = parsed.data
  const result = await authService.resetPassword(token, newPassword)

  res.json(result)
}

// Logout
export const logout = async (req, res) => {
  await authService.logout()
  res.json({ status: 'ok', message: 'Sesión cerrada correctamente' })
}
