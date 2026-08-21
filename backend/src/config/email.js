import nodemailer from 'nodemailer'

// Acepta los nombres SMTP_* actuales y los usados en instalaciones anteriores.
// Así la configuración no queda ligada a un proveedor concreto.
const getEmailConfig = () => ({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: (process.env.SMTP_SECURE ?? process.env.SMTP_ENABLE_SSL) === 'true',
  user: process.env.SMTP_USER ?? process.env.SMTP_USERNAME,
  pass: process.env.SMTP_PASS ?? process.env.SMTP_PASSWORD,
  from: process.env.SMTP_FROM ?? (
    process.env.EMAIL_FROM
      ? `${process.env.EMAIL_FROM_NAME || 'Sistema Reclutamiento'} <${process.env.EMAIL_FROM}>`
      : 'Sistema Reclutamiento <no-reply@reclutamiento.com>'
  ),
})

const validateEmailConfig = (config) => {
  const missing = ['host', 'user', 'pass'].filter((key) => !config[key])
  if (missing.length) {
    throw new Error(`Configuración SMTP incompleta: falta ${missing.join(', ')}`)
  }
}

// Configuración de Nodemailer con variables de entorno
const createTransporter = () => {
  const config = getEmailConfig()
  validateEmailConfig(config)

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure, // true para 465, false para 587
    auth: {
      user: config.user,
      pass: config.pass,
    },
  })
}

// Envía email de reset de contraseña
export const sendPasswordResetEmail = async (to, nombre, resetToken) => {
  const transporter = createTransporter()
  
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1e3a8a;">Restablecer contraseña</h2>
      <p>Hola <strong>${nombre}</strong>,</p>
      <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Restablecer contraseña</a>
      </p>
      <p>Este enlace expira en <strong>1 hora</strong>. Si no solicitaste esto, ignora este correo.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e4e7;">
      <p style="color: #6b6375; font-size: 12px;">Sistema de Reclutamiento</p>
    </div>
  `
  
  await transporter.sendMail({
    from: getEmailConfig().from,
    to,
    subject: 'Restablece tu contraseña',
    html,
  })
}

// Envía email con contraseña temporal (cuando admin crea usuario)
export const sendTemporalPasswordEmail = async (to, nombre, temporalPassword) => {
  const transporter = createTransporter()
  
  const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1e3a8a;">Bienvenido al Sistema de Reclutamiento</h2>
      <p>Hola <strong>${nombre}</strong>,</p>
      <p>Se ha creado tu cuenta. Tu contraseña temporal es:</p>
      <div style="background: #f0fdf4; border: 1px solid #1e3a8a; padding: 16px; border-radius: 6px; text-align: center; margin: 20px 0;">
        <code style="font-size: 18px; font-weight: bold; color: #1e3a8a;">${temporalPassword}</code>
      </div>
      <p>Inicia sesión en <a href="${loginUrl}">${loginUrl}</a> y se te pedirá que cambies tu contraseña.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e4e7;">
      <p style="color: #6b6375; font-size: 12px;">Sistema de Reclutamiento</p>
    </div>
  `
  
  await transporter.sendMail({
    from: getEmailConfig().from,
    to,
    subject: 'Tu cuenta en Sistema de Reclutamiento - Contraseña temporal',
    html,
  })
}
