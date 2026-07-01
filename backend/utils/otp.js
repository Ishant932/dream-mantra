import db from '../db.js';
import { normalizeIdentifier } from './passwordReset.js';

const OTP_TTL_MS = 10 * 60 * 1000;

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function otpKey(type, identifier) {
  return `${type}:${normalizeIdentifier(identifier)}`;
}

export function saveOtp(type, identifier, otp) {
  const key = otpKey(type, identifier);
  db.prepare('DELETE FROM otpStore WHERE identifier = ?').run(key);
  db.prepare('INSERT INTO otpStore (identifier, otp, type) VALUES (?, ?, ?)').run(key, otp, type);
}

export function verifyOtp(type, identifier, code) {
  const key = otpKey(type, identifier);
  const entry = db.prepare('SELECT * FROM otpStore WHERE identifier = ?').get(key);
  if (!entry) {
    return { ok: false, message: 'No OTP found. Please request a new code.' };
  }

  const age = Date.now() - new Date(entry.created_at).getTime();
  if (age > OTP_TTL_MS) {
    db.prepare('DELETE FROM otpStore WHERE identifier = ?').run(key);
    return { ok: false, message: 'OTP expired. Please request a new code.' };
  }

  if (String(entry.otp) !== String(code || '').trim()) {
    return { ok: false, message: 'Invalid OTP. Check the 6-digit code and try again.' };
  }

  db.prepare('DELETE FROM otpStore WHERE identifier = ?').run(key);
  return { ok: true };
}

export function clearOtp(type, identifier) {
  const key = otpKey(type, identifier);
  db.prepare('DELETE FROM otpStore WHERE identifier = ?').run(key);
}
