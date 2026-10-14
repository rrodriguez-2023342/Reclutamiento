import prisma from '../config/prisma.js';
import { sendPostulanteConfirmacionEmail } from '../config/email.js';

function crearError(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

const INCLUDE_COMPLETO = {
  usuario: {
    select: {
      id: true,
      nombre: true,
      correo: true,
      empresa: { select: { id: true, nombre_empresa: true } },
      patrono: { select: { id: true, razon_social: true } },
    },
  },
  plaza: {
    select: {
      id: true,
      nombre: true,
      tipo_moneda: true,
      salario_min: true,
      salario_max: true,
    },
  },
  datosFamiliares: true,
  educacionHistorial: true,
  idiomas: true,
  capacitaciones: true,
  experienciaLaboral: true,
  referenciasPersonales: true,
  rechazado_por_usuario: { select: { id: true, nombre: true, correo: true } },
  contratado_por_usuario: { select: { id: true, nombre: true } },
  devuelto_por_usuario: { select: { id: true, nombre: true } },
  documentos: {
    select: {
      id: true,
      tipo: true,
      nombre_archivo: true,
      mime_type: true,
      tamano_bytes: true,
      fecha_subida: true,
    },
  },
};

const SECCIONES_HIJAS = [
  ['datosFamiliares', 'datosFamiliares'],
  ['educacionHistorial', 'educacionHistorial'],
  ['idiomas', 'idioma'],
  ['capacitaciones', 'capacitacion'],
  ['experienciaLaboral', 'experienciaLaboral'],
  ['referenciasPersonales', 'referenciaPersonal'],
];

async function getDefaultUsuarioId() {
  const admin = await prisma.usuario.findFirst({
    where: { correo: process.env.ADMIN_EMAIL },
    select: { id: true },
  });
  if (!admin) {
    throw crearError('Usuario administrador por defecto no encontrado', 500);
  }
  return admin.id;
}

export class PublicPostulanteService {
  async crear(data, hcaptchaToken) {
    const { verifyHcaptcha } = await import('../config/hcaptcha.js');
    
    const hcaptchaResult = await verifyHcaptcha(hcaptchaToken);
    if (!hcaptchaResult.success) {
      const err = crearError('Verificación hCaptcha fallida', 400);
      err.errors = hcaptchaResult['error-codes'];
      throw err;
    }

    const defaultUsuarioId = await getDefaultUsuarioId();

    const existente = await prisma.postulante.findUnique({
      where: { dpi: data.dpi },
    });
    if (existente) {
      throw crearError('Ya existe un postulante registrado con ese DPI', 409);
    }

    const {
      datosFamiliares = [],
      educacionHistorial = [],
      idiomas = [],
      capacitaciones = [],
      experienciaLaboral = [],
      referenciasPersonales = [],
      plaza_id,
      ...generales
    } = data;

    const creado = await prisma.postulante.create({
      data: {
        ...generales,
        ...(plaza_id && { plaza_id: Number(plaza_id) }),
        usuario_id: defaultUsuarioId,
        estado: 'POSTULANTE',
        fecha_registro: new Date(),
        datosFamiliares: { create: datosFamiliares },
        educacionHistorial: { create: educacionHistorial },
        idiomas: { create: idiomas },
        capacitaciones: { create: capacitaciones },
        experienciaLaboral: { create: experienciaLaboral },
        referenciasPersonales: { create: referenciasPersonales },
      },
      include: INCLUDE_COMPLETO,
    });

    if (creado.correo) {
      try {
        await sendPostulanteConfirmacionEmail(creado.correo, creado.nombre_completo);
      } catch (emailErr) {
        console.error('Error enviando email de confirmación:', emailErr);
      }
    }

    return creado;
  }
}

export const publicPostulanteService = new PublicPostulanteService();