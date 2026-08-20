import { verifyToken } from '../utils/jwt.js'

// Middleware para autenticar al usuario mediante JWT
export const authenticate = (req, res, next) => {
  // Obtenemos el header "Authorization"
  const header = req.headers.authorization

  // Comprobamos que el header exista y tenga el formato correcto: "Bearer <token>"
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'No autorizado: token requerido' })
  }

  const token = header.slice(7).trim() // Extraemos el token (quitamos "Bearer ")

  try {
    const decoded = verifyToken(token) // Verificamos el token y obtenemos los datos decodificados

    req.userId = Number(decoded.sub) // Guardamos el id del usuario en la request para usarlo en los controllers
    req.userRol = decoded.rol // Guardamos el rol del usuario en la request para usarlo en los controllers

    next()
} catch (err) {
    // El token no es válido o expiró → 401.
    const message = err.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido'
    return res.status(401).json({ status: 'error', message })
  }
}

// Middleware para autorizar al usuario según su rol
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Comprobamos que el usuario esté autenticado
    if (!req.userRol) {
      return res.status(401).json({ status: 'error', message: 'No autorizado: token requerido' })
    }

    // Comprobamos que el rol del usuario esté entre los roles permitidos
    if (!roles.includes(req.userRol)) {
      return res.status(403).json({ status: 'error', message: 'Acceso denegado: rol no autorizado' })
    }

    next()
  }
}