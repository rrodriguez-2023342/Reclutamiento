import rateLimit from 'express-rate-limit'

// Rate limit general para auth (15 min, 100 req)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    status: 'error',
    message: 'Demasiadas peticiones, intenta más tarde',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Rate limit estricto para login / forgot / reset (15 min, 20 req)
export const strictAuthRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    status: 'error',
    message: 'Demasiados intentos, espera 15 minutos',
  },
  standardHeaders: true,
  legacyHeaders: false,
})