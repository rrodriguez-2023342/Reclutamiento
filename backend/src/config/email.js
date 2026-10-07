import nodemailer from 'nodemailer'

const createTransporter = () => {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || process.env.BREVO_SENDER_EMAIL || 'no-reply@localhost'

  if (!host || !user || !pass) {
    throw new Error('Faltan variables SMTP_HOST, SMTP_USER o SMTP_PASS en el .env')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  })
}

const getFrom = () => ({
  name: process.env.SMTP_FROM_NAME || 'Sistema GHCorp',
  address: process.env.SMTP_FROM || process.env.BREVO_SENDER_EMAIL || 'no-reply@localhost',
})

const getMailErrorMessage = (error) => {
  if (error?.response?.data) return JSON.stringify(error.response.data)
  if (error?.message) return error.message
  return 'Error desconocido al enviar el correo'
}

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter()

  try {
    await transporter.sendMail({
      from: getFrom(),
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('SMTP error:', getMailErrorMessage(error))
    throw error
  }
}

// Envía email de reset de contraseña
export const sendPasswordResetEmail = async (to, nombre, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

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
      <p style="color: #6b6375; font-size: 12px;">Sistema GHCorp</p>
    </div>
  `;

  await sendEmail({ to, subject: "Restablece tu contraseña", html });
};

// Envía email con contraseña temporal (cuando admin crea usuario)
export const sendTemporalPasswordEmail = async (
  to,
  nombre,
  temporalPassword,
) => {
  const loginUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #1e3a8a;">Bienvenido al Sistema GHCorp</h2>
      <p>Hola <strong>${nombre}</strong>,</p>
      <p>Se ha creado tu cuenta. Tu contraseña temporal es:</p>
      <div style="background: #f0fdf4; border: 1px solid #1e3a8a; padding: 16px; border-radius: 6px; text-align: center; margin: 20px 0;">
        <code style="font-size: 18px; font-weight: bold; color: #1e3a8a;">${temporalPassword}</code>
      </div>
      <p>Inicia sesión en <a href="${loginUrl}">${loginUrl}</a> y se te pedirá que cambies tu contraseña.</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e4e7;">
      <p style="color: #6b6375; font-size: 12px;">Sistema GHCorp</p>
    </div>
  `;

  await sendEmail({
    to,
    subject: "Tu cuenta en Sistema GHCorp - Contraseña temporal",
    html,
  });
};

