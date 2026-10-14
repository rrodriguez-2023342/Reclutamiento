import { Router } from 'express';
import prisma from '../config/prisma.js';
import { rateLimitPublic } from '../middlewares/rate-limit-public.js';

const router = Router();

// Lista pública de plazas activas (para el formulario de postulación sin sesión)
router.get('/', rateLimitPublic, async (req, res) => {
  try {
    const plazas = await prisma.plaza.findMany({
      where: { activo: true },
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    });
    res.json({ status: 'ok', data: plazas });
  } catch (error) {
    console.error('Error listando plazas públicas:', error);
    res.status(500).json({ status: 'error', message: 'No se pudieron cargar las plazas' });
  }
});

export default router;
