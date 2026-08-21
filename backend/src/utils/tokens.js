import crypto from 'crypto'

// Genera un token aleatorio seguro para reset de contraseña
export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex')
}

// Hashea el token antes de guardarlo en BD (no guardamos el token en claro)
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// Verifica si un token coincide con su hash
export const verifyTokenHash = (token, hash) => {
  return hashToken(token) === hash
}