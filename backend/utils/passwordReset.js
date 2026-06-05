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

export function validateEmail(email) {
  const e = String(email || '').trim().toLowerCase();
  if (!e) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return 'Enter a valid email address';
  return null;
}

export function validatePhone(phone) {
  const digits = normalizePhone(phone);
  if (!digits) return 'Mobile number is required';
  if (digits.length !== 10) return 'Enter a valid 10-digit mobile number';
  if (!/^[6-9]/.test(digits)) return 'Enter a valid Indian mobile number';
  return null;
}

export function phonesMatch(stored, input) {
  return normalizePhone(stored) === normalizePhone(input);
}
