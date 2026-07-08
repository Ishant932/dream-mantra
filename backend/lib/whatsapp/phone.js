import { getData } from '../database.js';
import { normalizeProfile } from '../profile.js';
import { normalizePhone } from '../../utils/passwordReset.js';

/** E.164 digits without + for storage (e.g. 919876543210) */
export function toWhatsAppId(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length < 10) return null;
  const local = digits.slice(-10);
  if (local.length !== 10) return null;
  return `91${local}`;
}

export function fromWhatsAppId(waId) {
  const digits = String(waId || '').replace(/\D/g, '');
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

export function resolveUserPhone(user) {
  if (!user) return null;
  const profile = normalizeProfile(user.profile);
  const raw = profile.whatsappNumber || user.phone || profile.parentPhone || '';
  return toWhatsAppId(raw);
}

export function findUserByWhatsAppId(waId) {
  const local = fromWhatsAppId(waId);
  if (!local) return null;
  const users = getData().users || [];
  return users.find((u) => {
    if (u.role !== 'user') return false;
    const profile = normalizeProfile(u.profile);
    const candidates = [u.phone, profile.whatsappNumber, profile.parentPhone];
    return candidates.some((p) => normalizePhone(p) === local);
  }) || null;
}

export function userMayReceiveWhatsApp(user) {
  if (!user || user.role !== 'user') return false;
  const profile = normalizeProfile(user.profile);
  if (profile.whatsappOptIn === false) return false;
  const waId = resolveUserPhone(user);
  if (!waId) return false;
  if (profile.whatsappOptIn === true) return true;
  if (user.phone || profile.whatsappNumber) return true;
  const convo = (getData().whatsapp_conversations || []).find((c) => c.phone === waId);
  return convo?.opt_in === true;
}
