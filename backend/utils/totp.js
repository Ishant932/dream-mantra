import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export function generateTwoFactorSecret(email, name) {
  const label = email || name || 'user';
  const secret = speakeasy.generateSecret({
    name: `Dream Mantra (${label})`,
    issuer: 'Dream Mantra',
    length: 32,
  });
  return {
    base32: secret.base32,
    otpauthUrl: secret.otpauth_url,
  };
}

export async function qrCodeDataUrl(otpauthUrl) {
  return QRCode.toDataURL(otpauthUrl);
}

export function verifyTotp(secret, token) {
  if (!secret || token == null || token === '') return false;
  const normalized = String(token).replace(/\D/g, '').padStart(6, '0').slice(-6);
  if (normalized.length !== 6) return false;
  return speakeasy.totp.verify({
    secret: String(secret).replace(/\s/g, '').toUpperCase(),
    encoding: 'base32',
    token: normalized,
    window: 3,
  });
}
