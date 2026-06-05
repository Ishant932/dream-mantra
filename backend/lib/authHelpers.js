import bcrypt from 'bcryptjs';
import db, { getData } from './database.js';
import { findUserByUid } from './userUid.js';
import { normalizeIdentifier, normalizePhone } from '../utils/passwordReset.js';

export function safeComparePassword(plainPassword, storedHash) {
  if (!plainPassword || !storedHash || typeof storedHash !== 'string') return false;
  if (!/^\$2[aby]\$/.test(storedHash)) return false;
  try {
    return bcrypt.compareSync(plainPassword, storedHash);
  } catch {
    return false;
  }
}

export function findUserByEmail(email) {
  const normalized = normalizeIdentifier(email);
  if (!normalized || !normalized.includes('@')) return null;
  return db.prepare('SELECT * FROM users WHERE email = ?').get(normalized) || null;
}

/** Login lookup: registered email, mobile, or Dreams ID (e.g. 605210001 or DM-605210001). */
export function findUserByLoginIdentifier(identifier) {
  const raw = String(identifier || '').trim();
  if (!raw) return null;

  const id = normalizeIdentifier(raw);
  if (!id) return null;

  if (id.includes('@')) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(id) || null;
  }

  const uidCandidate = raw.replace(/^DM-/i, '').replace(/\s+/g, '');
  if (/^\d{8,10}$/.test(uidCandidate)) {
    const byUid = findUserByUid(uidCandidate, getData());
    if (byUid) return byUid;
  }

  const phoneNorm = normalizePhone(id);
  if (phoneNorm.length >= 10) {
    return db.prepare('SELECT * FROM users WHERE phone = ?').get(phoneNorm) || null;
  }

  return db.prepare('SELECT * FROM users WHERE phone = ?').get(id) || null;
}
