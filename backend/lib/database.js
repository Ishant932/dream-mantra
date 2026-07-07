import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { defaultProfile, normalizeProfile } from './profile.js';
import { ensureAllUserUids, nextUserUid } from './userUid.js';
import { connectMongo, isMongoConfigured, getMongoStatus } from './mongo.js';
import AppState from '../models/AppState.js';
import { normalizePhone } from '../utils/passwordReset.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../data.json');

let mongoEnabled = false;
let dbMode = 'file';
let persistTimer = null;
let persistInFlight = null;

const defaultData = {
  users: [],
  consultations: [],
  assessments: [],
  payments: [],
  availability_slots: [],
  user_reports: [],
  site_settings: { community_links: { 'crp-test': '' } },
  contact_leads: [],
  blog_posts: [],
  user_notifications: [],
  message_threads: [],
  messages: [],
  otpStore: [],
  nextId: {
    users: 1,
    consultations: 1,
    assessments: 1,
    payments: 1,
    availability_slots: 1,
    user_reports: 1,
    contact_leads: 1,
    blog_posts: 1,
    user_notifications: 1,
    message_threads: 1,
    messages: 1,
  },
};

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

function normalizePayload(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    return structuredClone(defaultData);
  }

  parsed.users = asArray(parsed.users);
  parsed.consultations = asArray(parsed.consultations);
  parsed.assessments = asArray(parsed.assessments);
  parsed.otpStore = asArray(parsed.otpStore);
  parsed.contact_leads = asArray(parsed.contact_leads);
  parsed.blog_posts = asArray(parsed.blog_posts);
  parsed.user_notifications = asArray(parsed.user_notifications);
  parsed.message_threads = asArray(parsed.message_threads);
  parsed.messages = asArray(parsed.messages);
  parsed.payments = asArray(parsed.payments);
  parsed.availability_slots = asArray(parsed.availability_slots);
  parsed.user_reports = asArray(parsed.user_reports);
  parsed.site_settings = {
    ...defaultData.site_settings,
    ...(parsed.site_settings && typeof parsed.site_settings === 'object' ? parsed.site_settings : {}),
    community_links: {
      ...defaultData.site_settings.community_links,
      ...(parsed.site_settings?.community_links || {}),
    },
  };
  parsed.nextId = { ...defaultData.nextId, ...(parsed.nextId && typeof parsed.nextId === 'object' ? parsed.nextId : {}) };
  parsed.users = parsed.users
    .filter((u) => u && typeof u === 'object')
    .map((u) => {
      try {
        return { ...u, profile: normalizeProfile(u.profile) };
      } catch {
        return { ...u, profile: defaultProfile() };
      }
    });
  return parsed;
}

function loadFromFile() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const parsed = normalizePayload(JSON.parse(fs.readFileSync(DB_PATH, 'utf8')));
      const changed = ensureAllUserUids(parsed);
      if (changed && !mongoEnabled) persistToFile(parsed);
      return parsed;
    }
  } catch (e) {
    console.error('DB load error', e.message);
  }
  return structuredClone(defaultData);
}

function persistToFile(snapshot = data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(snapshot, null, 2));
}

async function persistToMongo(snapshot = data) {
  await AppState.findByIdAndUpdate(
    'main',
    { payload: snapshot, updatedAt: new Date() },
    { upsert: true, new: true }
  );
}

function schedulePersist() {
  if (!mongoEnabled) {
    persistToFile();
    return;
  }
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistInFlight = persistToMongo()
      .catch((err) => console.error('MongoDB save failed:', err.message))
      .finally(() => {
        persistInFlight = null;
      });
  }, 250);
}

function load() {
  return loadFromFile();
}

function persist() {
  schedulePersist();
}

let data = structuredClone(defaultData);

export async function initDatabase() {
  if (!isMongoConfigured()) {
    data = loadFromFile();
    dbMode = 'file';
    console.log('Database: local data.json (set MONGODB_URI for MongoDB Atlas)');
    return { mode: dbMode };
  }

  try {
    await connectMongo();
  } catch (err) {
    const isProd = process.env.NODE_ENV === 'production';
    if (isProd) {
      throw err;
    }
    console.warn(`MongoDB unavailable (${err.message}) — falling back to local data.json`);
    data = loadFromFile();
    mongoEnabled = false;
    dbMode = 'file';
    return { mode: dbMode, mongoFallback: true };
  }

  mongoEnabled = true;
  dbMode = 'mongodb';

  const doc = await AppState.findById('main').lean();
  if (doc?.payload) {
    data = normalizePayload(structuredClone(doc.payload));
    const changed = ensureAllUserUids(data);
    if (changed || !Array.isArray(doc.payload.consultations) || !Array.isArray(doc.payload.assessments)) {
      await persistToMongo(data);
    }
    console.log('Database: MongoDB Atlas (loaded existing data)');
    return { mode: dbMode };
  }

  if (fs.existsSync(DB_PATH)) {
    data = loadFromFile();
    await persistToMongo(data);
    console.log('Database: MongoDB Atlas (migrated from data.json)');
    return { mode: dbMode, migrated: true };
  }

  data = structuredClone(defaultData);
  await persistToMongo(data);
  console.log('Database: MongoDB Atlas (initialized empty store)');
  return { mode: dbMode, initialized: true };
}

export async function flushDatabase() {
  clearTimeout(persistTimer);
  if (mongoEnabled) {
    if (persistInFlight) await persistInFlight;
    await persistToMongo();
    return;
  }
  persistToFile();
}

export function getDbMode() {
  return dbMode;
}

export function getDbStatus() {
  return {
    mode: dbMode,
    mongo: getMongoStatus(),
  };
}

export function getData() {
  if (
    !data
    || !Array.isArray(data.users)
    || !Array.isArray(data.consultations)
    || !Array.isArray(data.assessments)
    || !Array.isArray(data.payments)
  ) {
    data = normalizePayload(data || {});
  }
  return data;
}

export function saveData() {
  persist(data);
}

// Legacy SQL-like adapter for existing routes
const db = {
  prepare(sql) {
    return {
      get: (...p) => runQuery(sql, p, 'get'),
      all: (...p) => runQuery(sql, p, 'all'),
      run: (...p) => runQuery(sql, p, 'run'),
    };
  },
};

function runQuery(sql, params, mode) {
  const p = params;

  if (sql.includes('INSERT INTO users')) {
    const id = data.nextId.users++;
    const created_at = new Date().toISOString();
    const row = {
      id,
      user_uid: nextUserUid(data, created_at),
      name: p[0],
      email: p[1],
      phone: p[2],
      password: p[3],
      role: p[4] || 'user',
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorPendingSecret: null,
      profile: defaultProfile(),
      created_at,
    };
    if (data.users.some((u) => (row.email && u.email === row.email) || (row.phone && u.phone === row.phone))) {
      throw new Error('UNIQUE constraint failed');
    }
    data.users.push(row);
    saveData();
    return mode === 'run' ? { lastInsertRowid: id } : row;
  }

  if (sql.includes('SELECT * FROM users WHERE id')) {
    const row = usersOf(data).find((u) => u.id === Number(p[0]));
    return mode === 'all' ? (row ? [row] : []) : row;
  }
  if (sql.includes('SELECT * FROM users WHERE email')) {
    const q = String(p[0] || '').trim().toLowerCase();
    return usersOf(data).find((u) => u.email?.toLowerCase() === q);
  }
  if (sql.includes('SELECT * FROM users WHERE phone')) {
    const q = String(p[0] || '').trim();
    const qNorm = normalizePhone(q);
    return usersOf(data).find((u) => {
      if (!u.phone) return false;
      if (u.phone === q) return true;
      return qNorm.length >= 10 && normalizePhone(u.phone) === qNorm;
    });
  }
  if (sql.includes('SELECT id FROM users WHERE role')) return usersOf(data).find((u) => u.role === p[0]);
  if (sql.includes('COUNT(*)') && sql.includes('users') && sql.includes('role')) {
    return { c: usersOf(data).filter((u) => u.role === p[0]).length };
  }
  if (sql.includes('FROM users WHERE role') && sql.includes('ORDER BY')) {
    return usersOf(data).filter((u) => u.role === p[0]).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  if (sql.includes('INSERT INTO consultations')) {
    const id = data.nextId.consultations++;
    const row = {
      id,
      user_id: p[0],
      program: p[1],
      notes: p[2],
      slot_id: null,
      scheduled_at: null,
      mode: null,
      location: null,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    data.consultations.push(row);
    saveData();
    return mode === 'run' ? { lastInsertRowid: id } : row;
  }

  if (sql.includes('INSERT INTO assessments')) {
    const id = data.nextId.assessments++;
    const row = {
      id,
      user_id: p[0],
      type: p[1],
      status: p[2] || 'pending_payment',
      amount: p[3] ?? null,
      product_slug: p[4] ?? null,
      payment_id: null,
      test_link: null,
      result_summary: null,
      created_at: new Date().toISOString(),
      paid_at: null,
    };
    data.assessments.push(row);
    saveData();
    return mode === 'run' ? { lastInsertRowid: id } : row;
  }

  if (sql.includes('consultations WHERE user_id')) {
    const userId = num(p[0]);
    return consultationsOf(data)
      .filter((c) => num(c.user_id) === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  if (sql.includes('assessments WHERE user_id')) {
    const userId = num(p[0]);
    return assessmentsOf(data)
      .filter((a) => num(a.user_id) === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  if (sql.includes('SELECT * FROM assessments WHERE id')) {
    return assessmentsOf(data).find((a) => Number(a.id) === Number(p[0]));
  }

  if (sql.includes('SELECT COUNT(*) as c FROM consultations')) {
    if (sql.includes("status = 'pending'")) {
      return { c: consultationsOf(data).filter((c) => c.status === 'pending').length };
    }
    return { c: consultationsOf(data).length };
  }
  if (sql.includes('SELECT COUNT(*) as c FROM assessments')) {
    if (sql.includes("status = 'paid'") && sql.includes('user_id')) {
      const userId = num(p[0]);
      return {
        c: assessmentsOf(data).filter((a) => num(a.user_id) === userId && a.status === 'paid').length,
      };
    }
    return { c: assessmentsOf(data).length };
  }

  if (sql.includes('JOIN users u ON')) {
    return consultationsOf(data)
      .map((c) => {
        const u = usersOf(data).find((x) => num(x.id) === num(c.user_id));
        return {
          ...c,
          user_name: c.user_snapshot?.name || u?.name,
          email: c.user_snapshot?.email || u?.email,
          phone: c.user_snapshot?.phone || u?.phone,
          user_profile: c.user_snapshot?.profile || u?.profile,
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  if (sql.includes('UPDATE consultations SET')) {
    const c = consultationsOf(data).find((x) => x.id === Number(p[2]));
    if (c) {
      c.status = p[0];
      c.notes = p[1];
      saveData();
    }
    return {};
  }
  if (sql.includes('SELECT * FROM consultations WHERE id')) {
    return consultationsOf(data).find((c) => c.id === Number(p[0]));
  }

  if (sql.includes('INSERT INTO otpStore')) {
    const entry = {
      id: Math.random().toString(36).slice(2, 11),
      identifier: p[0],
      otp: p[1],
      type: p[2] || 'registration',
      created_at: new Date().toISOString(),
      verified: false,
    };
    data.otpStore = data.otpStore.filter((o) => o.identifier !== p[0]);
    data.otpStore.push(entry);
    saveData();
    return { id: entry.id };
  }
  if (sql.includes('SELECT * FROM otpStore WHERE identifier')) return data.otpStore.find((o) => o.identifier === p[0]);
  if (sql.includes('UPDATE otpStore SET verified')) {
    const entry = data.otpStore.find((o) => o.identifier === p[0]);
    if (entry) {
      entry.verified = true;
      saveData();
    }
    return {};
  }
  if (sql.includes('DELETE FROM otpStore WHERE identifier')) {
    data.otpStore = data.otpStore.filter((o) => o.identifier !== p[0]);
    saveData();
    return {};
  }

  return mode === 'all' ? [] : undefined;
}

function num(v) {
  return typeof v === 'number' ? v : Number(v);
}

function usersOf(data) {
  return data.users || [];
}

function consultationsOf(data) {
  return data.consultations || [];
}

function assessmentsOf(data) {
  return data.assessments || [];
}

// Modern API helpers
export const repo = {
  createPayment({ userId, assessmentId, amount, orderId, provider, paymentMethod }) {
    const id = data.nextId.payments++;
    const now = new Date().toISOString();
    const prov = provider || 'manual';
    const row = {
      id,
      user_id: userId,
      assessment_id: assessmentId,
      amount,
      currency: 'INR',
      order_id: orderId,
      provider: prov,
      status: 'pending',
      payment_status: 'pending',
      confirmation_source: null,
      payment_method: paymentMethod || (prov === 'razorpay' ? 'razorpay' : 'manual'),
      transaction_id: null,
      gateway_response: null,
      admin_note: null,
      user_note: null,
      payment_proof_url: null,
      payment_proof_name: null,
      payment_proof_mime: null,
      submitted_at: null,
      confirmed_by_admin_id: null,
      confirmed_at: null,
      created_at: now,
      updated_at: now,
    };
    data.payments.push(row);
    saveData();
    return row;
  },
  getPaymentById(id) {
    return data.payments.find((p) => p.id === Number(id));
  },
  getPaymentByOrderId(orderId) {
    return data.payments.find((p) => p.order_id === orderId);
  },
  markPaymentPaid(orderId, paymentId, extra = {}) {
    const pay = data.payments.find((p) => p.order_id === orderId);
    if (pay) {
      pay.status = 'paid';
      pay.payment_status = 'confirmed';
      pay.confirmation_source = extra.source || 'gateway';
      pay.razorpay_payment_id = paymentId;
      pay.transaction_id = paymentId;
      pay.payment_method = extra.paymentMethod || pay.provider;
      pay.paid_at = new Date().toISOString();
      pay.confirmed_at = pay.paid_at;
      if (extra.gatewayResponse) pay.gateway_response = extra.gatewayResponse;
      saveData();
    }
    return pay;
  },
  updateAssessment(id, patch) {
    const a = data.assessments.find((x) => Number(x.id) === Number(id));
    if (a) Object.assign(a, patch);
    saveData();
    return a;
  },
  getAssessment(id) {
    return data.assessments.find((a) => Number(a.id) === Number(id));
  },
  deleteAssessment(id) {
    const numId = Number(id);
    const idx = data.assessments.findIndex((a) => Number(a.id) === numId);
    if (idx === -1) return false;
    data.assessments.splice(idx, 1);
    data.payments = (data.payments || []).filter((p) => Number(p.assessment_id) !== numId);
    saveData();
    return true;
  },
  updateUser(id, patch) {
    const u = data.users.find((x) => x.id === Number(id));
    if (!u) return null;
    Object.assign(u, patch);
    saveData();
    return u;
  },
  deleteUser(id) {
    const numId = Number(id);
    const idx = data.users.findIndex((u) => Number(u.id) === numId);
    if (idx === -1) return false;
    data.users.splice(idx, 1);
    data.assessments = (data.assessments || []).filter((a) => Number(a.user_id) !== numId);
    data.payments = (data.payments || []).filter((p) => Number(p.user_id) !== numId);
    data.consultations = (data.consultations || []).filter((c) => Number(c.user_id) !== numId);
    if (Array.isArray(data.notifications)) {
      data.notifications = data.notifications.filter((n) => Number(n.user_id) !== numId);
    }
    saveData();
    return true;
  },
};

export function seedAdmin() {
  const admins = [
    {
      email: (process.env.ADMIN_EMAIL || 'admin@dreamsmantra.com').trim().toLowerCase(),
      phone: (process.env.ADMIN_PHONE || '9999999999').trim(),
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      name: process.env.ADMIN_NAME || 'Dream Mantra Admin',
    },
    {
      email: (process.env.ADMIN2_EMAIL || 'admin2@dreamsmantra.com').trim().toLowerCase(),
      phone: (process.env.ADMIN2_PHONE || '9999999998').trim(),
      password: process.env.ADMIN2_PASSWORD || process.env.ADMIN_PASSWORD || 'Admin@123',
      name: process.env.ADMIN2_NAME || 'Dream Mantra Admin 2',
    },
  ];

  const reset2fa = process.env.ADMIN_RESET_2FA === 'true' || process.env.ADMIN_REQUIRE_2FA !== 'true';

  for (const cfg of admins) {
    const hashed = bcrypt.hashSync(cfg.password, 10);
    let user = data.users.find((u) => u.email?.toLowerCase() === cfg.email);

    if (user) {
      user.name = cfg.name;
      user.email = cfg.email;
      user.phone = cfg.phone;
      user.password = hashed;
      user.role = 'admin';
    } else {
      const id = data.nextId.users++;
      const created_at = new Date().toISOString();
      user = {
        id,
        user_uid: nextUserUid(data, created_at),
        name: cfg.name,
        email: cfg.email,
        phone: cfg.phone,
        password: hashed,
        role: 'admin',
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorPendingSecret: null,
        profile: defaultProfile(),
        created_at,
      };
      data.users.push(user);
    }

    if (reset2fa) {
      user.twoFactorEnabled = false;
      user.twoFactorSecret = null;
      user.twoFactorPendingSecret = null;
    }
  }

  saveData();
  console.log(`Admin accounts synced: ${admins.map((a) => a.email).join(', ')}`);
  if (reset2fa) {
    console.log('Admin 2FA reset (ADMIN_RESET_2FA=true) — scan QR on next login');
  }
}

export default db;
