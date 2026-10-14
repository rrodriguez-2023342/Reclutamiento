import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { rateLimitPublicPost } from '../middlewares/rate-limit-public.js';
import { createPublicPostulante } from '../controllers/public.postulantes.controller.js';
import { subirDocumento } from '../controllers/documento.controller.js';
import { uploadDocumento } from '../config/multer.js';
import prisma from '../config/prisma.js';

const router = Router();

const rateLimitUpload = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    status: 'error',
    message: 'Demasiadas subidas de archivos. Intente de nuevo en un minuto.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

function asegurarDirectorioPostulante(req, _res, next) {
  const dir = path.resolve('uploads', 'postulantes', String(req.params.id));
  fs.mkdirSync(dir, { recursive: true });
  next();
}

// Solo permite subir documentos a postulantes creados en las últimas 24 horas
async function verificarPostulanteReciente(req, res, next) {
  try {
    const postulante = await prisma.postulante.findUnique({
      where: { id: Number(req.params.id) },
      select: { fecha_registro: true },
    });
    if (!postulante) {
      return res.status(404).json({ status: 'error', message: 'Postulante no encontrado' });
    }
    const hace24h = Date.now() - 24 * 60 * 60 * 1000;
    if (postulante.fecha_registro.getTime() < hace24h) {
      return res.status(403).json({
        status: 'error',
        message: 'No se pueden subir documentos a este postulante',
      });
    }
    next();
  } catch (error) {
    console.error('Error verificando postulante:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
}

router.post('/', rateLimitPublicPost, createPublicPostulante);

router.post(
  '/:id/documentos',
  rateLimitUpload,
  verificarPostulanteReciente,
  asegurarDirectorioPostulante,
  uploadDocumento.single('archivo'),
  subirDocumento,
);

export default router;
