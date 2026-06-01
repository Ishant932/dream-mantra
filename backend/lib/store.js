import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../data.json');

const defaultData = {
  users: [],
  consultations: [],
  assessments: [],
  orders: [],
  otpStore: [],
  nextId: { users: 1, consultations: 1, assessments: 1, orders: 1 },
};

function load() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      parsed.otpStore = parsed.otpStore || [];
      parsed.orders = parsed.orders || [];
      parsed.nextId = { ...defaultData.nextId, ...parsed.nextId };
      if (!parsed.nextId.orders) parsed.nextId.orders = 1;
      return parsed;
    }
  } catch (e) {
    console.error('DB load error', e.message);
  }
  return structuredClone(defaultData);
}

function save(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

let data = load();

export function getData() {
  return data;
}

export function persist() {
  save(data);
}

// ——— Users ———
export function findUserByEmail(email) {
  return data.users.find((u) => u.email === email);
}
export function findUserByPhone(phone) {
  return data.users.find((u) => u.phone === phone);
}
export function findUserById(id) {
  return data.users.find((u) => u.id === Number(id));
}
export function createUser({ name, email, phone, password, role = 'user' }) {
  if (data.users.some((u) => (email && u.email === email) || (phone && u.phone === phone))) {
    throw new Error('UNIQUE constraint failed');
  }
  const id = data.nextId.users++;
  const row = {
    id,
    name,
    email: email || null,
    phone: phone || null,
    password,
    role,
    created_at: new Date().toISOString(),
  };
  data.users.push(row);
  persist();
  return row;
}
export function listUsersByRole(role) {
  return data.users.filter((u) => u.role === role).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}
export function countUsersByRole(role) {
  return data.users.filter((u) => u.role === role).length;
}

// ——— OTP ———
export function saveOtp(identifier, otp, type) {
  data.otpStore = data.otpStore.filter((o) => o.identifier !== identifier);
  data.otpStore.push({
    identifier,
    otp,
    type,
    created_at: new Date().toISOString(),
    verified: false,
  });
  persist();
}
export function getOtp(identifier) {
  return data.otpStore.find((o) => o.identifier === identifier);
}
export function verifyOtpEntry(identifier) {
  const e = data.otpStore.find((o) => o.identifier === identifier);
  if (e) {
    e.verified = true;
    persist();
  }
}
export function deleteOtp(identifier) {
  data.otpStore = data.otpStore.filter((o) => o.identifier !== identifier);
  persist();
}

// ——— Consultations ———
export function createConsultation(userId, program, notes) {
  const id = data.nextId.consultations++;
  const row = { id, user_id: userId, program, notes, status: 'pending', created_at: new Date().toISOString() };
  data.consultations.push(row);
  persist();
  return row;
}
export function listConsultationsByUser(userId) {
  return data.consultations.filter((c) => c.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}
export function listAllConsultations() {
  return data.consultations
    .map((c) => {
      const u = findUserById(c.user_id);
      return { ...c, user_name: u?.name, email: u?.email, phone: u?.phone };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}
export function updateConsultation(id, status, notes) {
  const c = data.consultations.find((x) => x.id === Number(id));
  if (c) {
    c.status = status;
    if (notes !== undefined) c.notes = notes;
    persist();
  }
  return c;
}
export function countConsultations(status) {
  if (status) return data.consultations.filter((c) => c.status === status).length;
  return data.consultations.length;
}

// ——— Assessments & Orders ———
export function createAssessmentBooking(userId, product) {
  const id = data.nextId.assessments++;
  const orderId = data.nextId.orders++;
  const assessment = {
    id,
    user_id: userId,
    type: product.title,
    product_slug: product.slug,
    amount: product.price,
    status: 'pending_payment',
    order_id: orderId,
    test_url: product.testPath,
    payment_id: null,
    created_at: new Date().toISOString(),
    paid_at: null,
  };
  const order = {
    id: orderId,
    user_id: userId,
    assessment_id: id,
    product_slug: product.slug,
    amount: product.price,
    currency: 'INR',
    status: 'created',
    razorpay_order_id: null,
    razorpay_payment_id: null,
    created_at: new Date().toISOString(),
    paid_at: null,
  };
  data.assessments.push(assessment);
  data.orders.push(order);
  persist();
  return { assessment, order };
}

export function findOrder(id, userId) {
  const o = data.orders.find((x) => x.id === Number(id));
  if (!o || (userId && o.user_id !== userId)) return null;
  return o;
}

export function markOrderPaid(orderId, paymentId, razorpayPaymentId = null) {
  const order = data.orders.find((o) => o.id === Number(orderId));
  if (!order) return null;
  order.status = 'paid';
  order.payment_id = paymentId;
  order.razorpay_payment_id = razorpayPaymentId;
  order.paid_at = new Date().toISOString();
  const assessment = data.assessments.find((a) => a.id === order.assessment_id);
  if (assessment) {
    assessment.status = 'paid';
    assessment.payment_id = paymentId;
    assessment.paid_at = order.paid_at;
  }
  persist();
  return { order, assessment };
}

export function listAssessmentsByUser(userId) {
  return data.assessments.filter((a) => a.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function findAssessment(id, userId) {
  const a = data.assessments.find((x) => x.id === Number(id));
  if (!a || a.user_id !== userId) return null;
  return a;
}

export function findPaidAssessmentBySlug(userId, slug) {
  return data.assessments.find(
    (a) => a.user_id === userId && a.product_slug === slug && (a.status === 'paid' || a.status === 'completed')
  );
}

export function countAssessments() {
  return data.assessments.length;
}

export function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@dreamsmantra.com';
  const phone = process.env.ADMIN_PHONE || '9999999999';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  if (!data.users.find((u) => u.role === 'admin')) {
    createUser({
      name: 'Dream Mantra Admin',
      email,
      phone,
      password: bcrypt.hashSync(password, 10),
      role: 'admin',
    });
    console.log(`Admin seeded: ${email}`);
  }
}

// Legacy db.prepare compatibility shim
const db = {
  prepare(sql) {
    return {
      get: (...p) => legacyGet(sql, p),
      all: (...p) => legacyAll(sql, p),
      run: (...p) => legacyRun(sql, p),
    };
  },
};

function legacyGet(sql, p) {
  if (sql.includes('users WHERE email')) return findUserByEmail(p[0]);
  if (sql.includes('users WHERE phone')) return findUserByPhone(p[0]);
  if (sql.includes('users WHERE id')) return findUserById(p[0]);
  if (sql.includes('otpStore WHERE identifier')) return getOtp(p[0]);
  if (sql.includes('consultations WHERE id')) return data.consultations.find((c) => c.id === Number(p[0]));
  if (sql.includes('COUNT(*)') && sql.includes('users') && sql.includes('role')) return { c: countUsersByRole(p[0]) };
  if (sql.includes('COUNT(*)') && sql.includes("status = 'pending'")) return { c: countConsultations('pending') };
  if (sql.includes('COUNT(*)') && sql.includes('consultations')) return { c: countConsultations() };
  if (sql.includes('COUNT(*)') && sql.includes('assessments')) return { c: countAssessments() };
  return undefined;
}

function legacyAll(sql, p) {
  if (sql.includes('consultations WHERE user_id')) return listConsultationsByUser(p[0]);
  if (sql.includes('assessments WHERE user_id')) return listAssessmentsByUser(p[0]);
  if (sql.includes('FROM users WHERE role')) return listUsersByRole(p[0]);
  if (sql.includes('JOIN users')) return listAllConsultations();
  return [];
}

function legacyRun(sql, p) {
  if (sql.includes('INSERT INTO users')) {
    const row = createUser({ name: p[0], email: p[1], phone: p[2], password: p[3], role: p[4] || 'user' });
    return { lastInsertRowid: row.id };
  }
  if (sql.includes('INSERT INTO consultations')) {
    const row = createConsultation(p[0], p[1], p[2]);
    return { lastInsertRowid: row.id };
  }
  if (sql.includes('INSERT INTO assessments')) {
    const id = data.nextId.assessments++;
    const row = {
      id,
      user_id: p[0],
      type: p[1],
      status: p[2] || 'requested',
      created_at: new Date().toISOString(),
    };
    data.assessments.push(row);
    persist();
    return { lastInsertRowid: id };
  }
  if (sql.includes('INSERT INTO otpStore')) {
    saveOtp(p[0], p[1], p[2]);
    return {};
  }
  if (sql.includes('UPDATE otpStore SET verified')) {
    verifyOtpEntry(p[1]);
    return {};
  }
  if (sql.includes('DELETE FROM otpStore')) {
    deleteOtp(p[0]);
    return {};
  }
  if (sql.includes('UPDATE consultations SET')) {
    updateConsultation(p[2], p[0], p[1]);
    return {};
  }
  return {};
}

export default db;
