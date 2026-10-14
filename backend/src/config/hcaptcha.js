const HCAPTCHA_SECRET_KEY = process.env.HCAPTCHA_SECRET_KEY;
const HCAPTCHA_VERIFY_URL = 'https://hcaptcha.com/siteverify';

export async function verifyHcaptcha(token) {
  if (!HCAPTCHA_SECRET_KEY || HCAPTCHA_SECRET_KEY === 'your_hcaptcha_secret_key_here') {
    console.warn('hCaptcha secret key no configurada - saltando verificación (solo desarrollo)');
    return { success: true };
  }

  if (!token) {
    return { success: false, error: 'Token hCaptcha requerido' };
  }

  try {
    const response = await fetch(HCAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: HCAPTCHA_SECRET_KEY,
        response: token,
      }),
    });

    const data = await response.json();
    return { success: data.success, 'error-codes': data['error-codes'] };
  } catch (error) {
    console.error('Error verificando hCaptcha:', error);
    return { success: false, error: 'Error al verificar hCaptcha' };
  }
}

export function getHcaptchaSiteKey() {
  return process.env.HCAPTCHA_SITE_KEY || 'your_hcaptcha_site_key_here';
}