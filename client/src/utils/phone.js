/** Normalize Indian mobile to 10 digits. */
export function normalizeMobile(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

export function isValidMobile(raw) {
  return /^[6-9]\d{9}$/.test(normalizeMobile(raw));
}
