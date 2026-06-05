export function normalizeIdentifier(identifier) {
  const id = String(identifier || '').trim();
  if (!id) return '';
  if (id.includes('@')) return id.toLowerCase();
  return id.replace(/\s+/g, '');
}

export function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

export function normalizeUid(uid) {
  return String(uid || '').trim().toUpperCase();
}

/** Match registered mobile or Dreams ID */
export function verifyAccountSecret(user, secret) {
  const raw = String(secret || '').trim();
  if (!raw || !user) return false;

  if (user.phone && normalizePhone(user.phone) === normalizePhone(raw)) return true;
  if (user.user_uid && normalizeUid(user.user_uid) === normalizeUid(raw)) return true;
  return false;
}
