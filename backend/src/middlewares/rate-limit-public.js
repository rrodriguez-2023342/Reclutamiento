import rateLimit from 'express-rate-limit';

export const rateLimitPublic = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    status: 'error',
    message: 'Demasiadas solicitudes desde esta IP. Intente de nuevo en un minuto.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const rateLimitPublicPost = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    status: 'error',
    message: 'Demasiados envíos de formulario. Intente de nuevo en un minuto.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});