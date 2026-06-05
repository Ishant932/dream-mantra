import crypto from 'crypto';
import { getData, saveData } from '../lib/database.js';

const OTP_TTL_MS = 15 * 60 * 1000;

export function normalizeIdentifier(identifier) {
  const id = String(identifier || '').trim();
  if (!id) return '';
  if (id.includes('@')) return id.toLowerCase();
  return id.replace(/\s+/g, '');
}

export function generateOtp() {
  return String(crypto.randomInt(100000, 999999));
}

export function savePasswordResetOtp(normalizedId, otp) {
  const data = getData();
  data.otpStore = (data.otpStore || []).filter(
    (o) => !(o.identifier === normalizedId && o.type === 'password_reset')
  );
  data.otpStore.push({
    id: crypto.randomBytes(8).toString('hex'),
    identifier: normalizedId,
    otp,
    type: 'password_reset',
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
    verified: false,
  });
  saveData();
}

export function getPasswordResetOtp(normalizedId) {
  const entry = getData().otpStore?.find(
    (o) => o.identifier === normalizedId && o.type === 'password_reset'
  );
  if (!entry) return null;
  if (entry.expires_at && new Date(entry.expires_at) < new Date()) return null;
  return entry;
}

export function clearPasswordResetOtp(normalizedId) {
  const data = getData();
  data.otpStore = (data.otpStore || []).filter(
    (o) => !(o.identifier === normalizedId && o.type === 'password_reset')
  );
  saveData();
}
