import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { defaultProfile, normalizeProfile } from './profile.js';
import { ensureAllUserUids, nextUserUid } from './userUid.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../data.json');

const defaultData = {
  users: [],
  consultations: [],
  assessments: [],
  payments: [],
  availability_slots: [],
  user_reports: [],
  site_settings: { community_links: { 'crp-test': '' } },
  contact_leads: [],
  user_notifications: [],
  otpStore: [],
  nextId: {
    users: 1,
    consultations: 1,
    assessments: 1,
    payments: 1,
    availability_slots: 1,
    user_reports: 1,
    contact_leads: 1,
    user_notifications: 1,
  },
};

function load() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      parsed.otpStore = parsed.otpStore || [];
      parsed.contact_leads = parsed.contact_leads || [];
      parsed.user_notifications = parsed.user_notifications || [];
      parsed.payments = parsed.payments || [];
      parsed.availability_slots = parsed.availability_slots || [];
      parsed.user_reports = parsed.user_reports || [];
      parsed.site_settings = {
        ...defaultData.site_settings,
        ...parsed.site_settings,
        community_links: {
          ...defaultData.site_settings.community_links,
          ...(parsed.site_settings?.community_links || {}),
        },
      };
      parsed.nextId = { ...defaultData.nextId, ...parsed.nextId };
      parsed.users = (parsed.users || []).map((u) => ({
        ...u,
        profile: normalizeProfile(u.profile),
      }));
      const changed = ensureAllUserUids(parsed);
      if (changed) persist(parsed);
      return parsed;
    }
  } catch (e) {
    console.error('DB load error', e.message);
  }
  return structuredClone(defaultData);
}

function persist(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

let data = load();

export function getData() {
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
    const row = data.users.find((u) => u.id === Number(p[0]));
    return mode === 'all' ? (row ? [row] : []) : row;
  }
  if (sql.includes('SELECT * FROM users WHERE email')) {
    const q = String(p[0] || '').trim().toLowerCase();
    return data.users.find((u) => u.email?.toLowerCase() === q);
  }
  if (sql.includes('SELECT * FROM users WHERE phone')) return data.users.find((u) => u.phone === p[0]);
  if (sql.includes('SELECT id FROM users WHERE role')) return data.users.find((u) => u.role === p[0]);
  if (sql.includes('COUNT(*)') && sql.includes('users') && sql.includes('role')) {
    return { c: data.users.filter((u) => u.role === p[0]).length };
  }
  if (sql.includes('FROM users WHERE role') && sql.includes('ORDER BY')) {
    return data.users.filter((u) => u.role === p[0]).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
    return data.consultations
      .filter((c) => c.user_id === num(p[0]))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  if (sql.includes('assessments WHERE user_id')) {
    return data.assessments
      .filter((a) => a.user_id === num(p[0]))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  if (sql.includes('SELECT * FROM assessments WHERE id')) {
    return data.assessments.find((a) => Number(a.id) === Number(p[0]));
  }

  if (sql.includes('SELECT COUNT(*) as c FROM consultations')) {
    if (sql.includes("status = 'pending'")) {
      return { c: data.consultations.filter((c) => c.status === 'pending').length };
    }
    return { c: data.consultations.length };
  }
  if (sql.includes('SELECT COUNT(*) as c FROM assessments')) {
    if (sql.includes("status = 'paid'") && sql.includes('user_id')) {
      const userId = num(p[0]);
      return {
        c: data.assessments.filter((a) => a.user_id === userId && a.status === 'paid').length,
      };
    }
    return { c: data.assessments.length };
  }

  if (sql.includes('JOIN users u ON')) {
    return data.consultations
      .map((c) => {
        const u = data.users.find((x) => x.id === c.user_id);
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
    const c = data.consultations.find((x) => x.id === Number(p[2]));
    if (c) {
      c.status = p[0];
      c.notes = p[1];
      saveData();
    }
    return {};
  }
  if (sql.includes('SELECT * FROM consultations WHERE id')) {
    return data.consultations.find((c) => c.id === Number(p[0]));
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
};

export function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'admin@dreamsmantra.com').trim().toLowerCase();
  const phone = (process.env.ADMIN_PHONE || '9999999999').trim();
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  const hashed = bcrypt.hashSync(password, 10);

  const existing = data.users.find((u) => u.role === 'admin');
  if (existing) {
    existing.name = existing.name || 'Dream Mantra Admin';
    existing.email = email;
    existing.phone = phone;
    existing.password = hashed;
    saveData();
    console.log(`Admin credentials synced: ${email}`);
    return;
  }

  const id = data.nextId.users++;
  const created_at = new Date().toISOString();
  data.users.push({
    id,
    user_uid: nextUserUid(data, created_at),
    name: 'Dream Mantra Admin',
    email,
    phone,
    password: hashed,
    role: 'admin',
    twoFactorEnabled: false,
    twoFactorSecret: null,
    twoFactorPendingSecret: null,
    profile: defaultProfile(),
    created_at,
  });
  saveData();
  console.log(`Admin seeded: ${email}`);
}

export default db;
