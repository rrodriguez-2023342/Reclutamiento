import { z } from 'zod';
import { publicPostulanteService } from '../services/public.postulantes.service.js';
import { createPostulanteSchema } from '../validators/postulantes.validator.js';

function validar(schema, datos, res) {
  const parsed = schema.safeParse(datos);
  if (!parsed.success) {
    res.status(400).json({ status: 'error', message: parsed.error.issues[0].message });
    return null;
  }
  return parsed.data;
}

export const createPublicPostulante = async (req, res) => {
  const hcaptchaToken = req.body.hcaptchaToken;
  const data = validar(createPostulanteSchema, req.body, res);
  if (!data) return;

  try {
    const postulante = await publicPostulanteService.crear(data, hcaptchaToken);
    res.status(201).json({ 
      status: 'ok', 
      data: postulante,
      message: 'Postulación enviada correctamente. Revisa tu correo para la confirmación.'
    });
  } catch (error) {
    if (error.status === 400 && error.errors) {
      return res.status(400).json({ 
        status: 'error', 
        message: error.message, 
        errors: error.errors 
      });
    }
    res.status(error.status || 500).json({ 
      status: 'error', 
      message: error.message || 'Error interno del servidor' 
    });
  }
};