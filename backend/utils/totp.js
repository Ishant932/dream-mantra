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
  if (!secret || !token) return false;
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: String(token).replace(/\s/g, ''),
    window: 2,
  });
}
