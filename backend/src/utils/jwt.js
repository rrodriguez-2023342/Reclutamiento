import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h'

if (!SECRET) {
  throw new Error('Falta JWT_SECRET en el .env')
}

// Genera un token JWT para un usuario dado
export const generateToken = (user) => {
  // Payload del token:
  return jwt.sign(
    {
      sub: String(user.id), // ID del usuario
      rol: user.rol?.nombre, // Nombre del rol
      correo: user.correo,
      nombre: user.nombre,
    },
    SECRET, // Clave con la que se firma
    { expiresIn: EXPIRES_IN } // Duración del token
  )
}

// Comprueba si un token JWT es válido y devuelve el payload decodificado. Lanza un error si el token no es válido o ha expirado
export const verifyToken = (token) => {
  return jwt.verify(token, SECRET)
}