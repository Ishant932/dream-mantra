import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { defaultProfile, normalizeProfile } from './profile.js';
import { nextUserUid } from './userUid.js';
import { getData, saveData } from './database.js';
import { normalizePhone } from '../utils/passwordReset.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_PATH = path.join(__dirname, '../data/counsellors.seed.json');

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function loadCounsellorSeedList() {
  const fromEnv = process.env.COUNSELLORS_JSON?.trim();
  if (fromEnv) {
    try {
      const parsed = JSON.parse(fromEnv);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      console.warn('COUNSELLORS_JSON is invalid JSON — using counsellors.seed.json');
    }
  }

  if (fs.existsSync(SEED_PATH)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
      if (Array.isArray(parsed)) return parsed;
    } catch (err) {
      console.warn('counsellors.seed.json read failed:', err.message);
    }
  }

  const legacyEmail = process.env.COUNSELLOR_EMAIL?.trim();
  if (legacyEmail) {
    return [{
      name: process.env.COUNSELLOR_NAME?.trim() || 'Dream Mantra Counsellor',
      email: legacyEmail,
      phone: process.env.COUNSELLOR_PHONE?.trim() || '8888888888',
      password: process.env.COUNSELLOR_PASSWORD || 'Counsellor@123',
    }];
  }

  return [];
}

function normalizeSeedEntry(entry) {
  const email = (entry.email || '').trim().toLowerCase();
  const phone = normalizePhone(entry.phone || '');
  const name = (entry.name || '').trim();
  const password = entry.password || '';
  if (!email || !name || !password || password.length < 6) return null;
  return { name, email, phone: phone || null, password, syncPassword: !!entry.syncPassword };
}

export function sanitizeCounsellor(user) {
  if (!user) return null;
  return {
    id: user.id,
    user_uid: user.user_uid,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    created_at: user.created_at,
  };
}

export function listCounsellorStaff() {
  return getData().users
    .filter((u) => u.role === 'counsellor')
    .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
    .map(sanitizeCounsellor);
}

function emailTaken(email, exceptId = null) {
  return getData().users.some(
    (u) => u.email?.toLowerCase() === email.toLowerCase() && u.id !== exceptId
  );
}

function phoneTaken(phone, exceptId = null) {
  if (!phone) return false;
  return getData().users.some((u) => u.phone === phone && u.id !== exceptId);
}

export function upsertCounsellorFromSeed({ name, email, phone, password, syncPassword = false }) {
  const data = getData();
  const normalizedEmail = email.toLowerCase();
  let user = data.users.find((u) => u.role === 'counsellor' && u.email?.toLowerCase() === normalizedEmail);

  if (user) {
    user.name = name;
    if (phone) user.phone = phone;
    if (syncPassword || !user.password) {
      user.password = hashPassword(password);
    }
    saveData();
    return { user: sanitizeCounsellor(user), created: false };
  }

  if (emailTaken(normalizedEmail)) {
    console.warn(`Counsellor seed skipped — email already used: ${normalizedEmail}`);
    return null;
  }
  if (phone && phoneTaken(phone)) {
    console.warn(`Counsellor seed skipped — phone already used: ${phone}`);
    return null;
  }

  const id = data.nextId.users++;
  const created_at = new Date().toISOString();
  user = {
    id,
    user_uid: nextUserUid(data, created_at),
    name,
    email: normalizedEmail,
    phone: phone || null,
    password: hashPassword(password),
    role: 'counsellor',
    twoFactorEnabled: false,
    twoFactorSecret: null,
    twoFactorPendingSecret: null,
    profile: defaultProfile(),
    created_at,
  };
  data.users.push(user);
  saveData();
  return { user: sanitizeCounsellor(user), created: true };
}

export function seedCounsellors() {
  const seeds = loadCounsellorSeedList();
  if (!seeds.length) {
    console.log('No counsellor seed accounts configured');
    return { created: 0, synced: 0 };
  }

  let created = 0;
  let synced = 0;
  for (const raw of seeds) {
    const entry = normalizeSeedEntry(raw);
    if (!entry) continue;
    const result = upsertCounsellorFromSeed({ ...entry, syncPassword: !!raw.syncPassword });
    if (!result) continue;
    if (result.created) {
      created += 1;
      console.log(`Counsellor seeded: ${entry.email}`);
    } else {
      synced += 1;
    }
  }

  if (created || synced) {
    console.log(`Counsellor accounts: ${created} created, ${synced} synced`);
  }
  return { created, synced };
}

export function createCounsellorStaff({ name, email, phone, password }) {
  const trimmedName = name?.trim();
  const normalizedEmail = (email || '').trim().toLowerCase();
  const normalizedPhone = phone ? normalizePhone(phone) : null;

  if (!trimmedName) throw new Error('Name is required');
  if (!normalizedEmail?.includes('@')) throw new Error('Valid email is required');
  if (!password || password.length < 6) throw new Error('Password must be at least 6 characters');
  if (emailTaken(normalizedEmail)) throw new Error('Email already in use');
  if (normalizedPhone && phoneTaken(normalizedPhone)) throw new Error('Phone already in use');

  const data = getData();
  const id = data.nextId.users++;
  const created_at = new Date().toISOString();
  const user = {
    id,
    user_uid: nextUserUid(data, created_at),
    name: trimmedName,
    email: normalizedEmail,
    phone: normalizedPhone,
    password: hashPassword(password),
    role: 'counsellor',
    twoFactorEnabled: false,
    twoFactorSecret: null,
    twoFactorPendingSecret: null,
    profile: defaultProfile(),
    created_at,
  };
  data.users.push(user);
  saveData();
  return sanitizeCounsellor(user);
}

export function updateCounsellorStaff(id, { name, email, phone, password }) {
  const data = getData();
  const user = data.users.find((u) => u.id === Number(id) && u.role === 'counsellor');
  if (!user) throw new Error('Counsellor not found');

  if (name?.trim()) user.name = name.trim();
  if (email !== undefined) {
    const normalizedEmail = email?.trim().toLowerCase() || null;
    if (!normalizedEmail?.includes('@')) throw new Error('Valid email is required');
    if (emailTaken(normalizedEmail, user.id)) throw new Error('Email already in use');
    user.email = normalizedEmail;
  }
  if (phone !== undefined) {
    const normalizedPhone = phone ? normalizePhone(phone) : null;
    if (normalizedPhone && phoneTaken(normalizedPhone, user.id)) throw new Error('Phone already in use');
    user.phone = normalizedPhone;
  }
  if (password) {
    if (password.length < 6) throw new Error('Password must be at least 6 characters');
    user.password = hashPassword(password);
  }

  saveData();
  return sanitizeCounsellor(user);
}

export function removeCounsellorStaff(id) {
  const data = getData();
  const idx = data.users.findIndex((u) => u.id === Number(id) && u.role === 'counsellor');
  if (idx === -1) throw new Error('Counsellor not found');
  data.users.splice(idx, 1);
  saveData();
  return { message: 'Counsellor account removed' };
}
