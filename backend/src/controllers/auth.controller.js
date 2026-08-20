import { z } from 'zod' 
import { authService } from '../services/auth.service.js'

// Esquema de validación para el login
const loginSchema = z.object({
  usuario: z.string().min(1, 'El usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

// Inicia sesión y devuelve un token JWT si las credenciales son correctas
export const login = async (req, res) => {
  const parsed = loginSchema.safeParse(req.body) // Validamos los datos de entrada usando Zod

  // Comprobamos si la validación falló
  if (!parsed.success) {
    return res.status(400).json({
      status: 'error',
      message: parsed.error.issues[0].message,
    })
  }

  // Desestructuramos los datos validados
  const { usuario, password } = parsed.data
  const result = await authService.login(usuario.trim(), password)

  res.json(result) // Devolvemos el resultado del login
}

// Devuelve los datos del usuario autenticado
export const me = async (req, res) => {
  const user = await authService.getMe(req.userId)
  res.json({ status: 'ok', user })
}