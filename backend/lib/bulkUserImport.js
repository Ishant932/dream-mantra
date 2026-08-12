import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import db, { repo } from '../db.js';
import { buildModuleSelection } from './moduleCatalog.js';
import { createPendingPaymentForAssessment, confirmPayment, isAssessmentFullyPaid } from './paymentService.js';
import { onUserRegistered } from './whatsapp/events.js';
import { normalizeProfile } from './profile.js';

function normalizePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

function generatePassword() {
  return crypto.randomBytes(4).toString('hex');
}

export function parseBulkUserCsv(text) {
  const lines = String(text || '').trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ''));
  const hasHeader = header.some((h) => ['name', 'email', 'phone', 'mobile'].includes(h));
  const start = hasHeader ? 1 : 0;

  const idx = {
    name: header.indexOf('name'),
    email: header.indexOf('email'),
    phone: Math.max(header.indexOf('phone'), header.indexOf('mobile')),
    password: header.indexOf('password'),
  };

  const rows = [];
  for (let i = start; i < lines.length; i += 1) {
    const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
    const name = idx.name >= 0 ? cols[idx.name] : cols[0];
    const email = idx.email >= 0 ? cols[idx.email] : cols[1];
    const phone = idx.phone >= 0 ? cols[idx.phone] : cols[2];
    const password = idx.password >= 0 ? cols[idx.password] : cols[3];
    if (!name && !email && !phone) continue;
    rows.push({
      name: String(name || '').trim(),
      email: String(email || '').trim().toLowerCase() || null,
      phone: normalizePhone(phone),
      password: String(password || '').trim() || null,
    });
  }
  return rows;
}

function assignModuleToUser(userId, productSlug, { paymentMode = 'none', adminId = null } = {}) {
  const catalog = buildModuleSelection(productSlug, false);
  if (!catalog) throw new Error(`Invalid module: ${productSlug}`);

  const existing = db.prepare('SELECT * FROM assessments WHERE user_id = ? AND product_slug = ?').all(userId, catalog.moduleSlug);
  let assessment = existing.find((a) => isAssessmentFullyPaid(a));
  if (assessment) {
    return { assessmentId: assessment.id, paymentApproved: true, skipped: true };
  }

  let row = existing.find((a) => a.status === 'pending_payment');
  if (!row) {
    const result = db
      .prepare('INSERT INTO assessments (user_id, type, status, amount, product_slug) VALUES (?, ?, ?, ?, ?)')
      .run(userId, catalog.moduleTitle, 'pending_payment', catalog.total, catalog.moduleSlug);
    row = db.prepare('SELECT * FROM assessments WHERE id = ?').get(result.lastInsertRowid);
    repo.updateAssessment(row.id, {
      progress: {
        addCounselling: catalog.addCounselling,
        selection: {
          displayTitle: catalog.displayTitle,
          lineItems: catalog.lineItems,
          total: catalog.total,
          moduleSlug: catalog.moduleSlug,
          moduleTitle: catalog.moduleTitle,
          addCounselling: catalog.addCounselling,
        },
      },
    });
  }

  const pay = createPendingPaymentForAssessment({
    userId,
    assessmentId: row.id,
    amount: catalog.total,
  });

  let paymentApproved = false;
  if (paymentMode === 'admin' && pay?.order_id) {
    confirmPayment({
      orderId: pay.order_id,
      paymentId: `ADMIN-BULK-${Date.now()}`,
      source: 'admin_manual',
      adminId,
      adminNote: 'Bulk assign — admin approved payment',
      paymentMethod: 'manual',
    });
    paymentApproved = true;
  } else if (paymentMode === 'razorpay' && pay?.order_id) {
    confirmPayment({
      orderId: pay.order_id,
      paymentId: `RZP-BULK-${Date.now()}`,
      source: 'gateway',
      adminId,
      adminNote: 'Bulk assign — marked paid via Razorpay',
      paymentMethod: 'razorpay',
    });
    paymentApproved = true;
  }

  return { assessmentId: row.id, paymentApproved, skipped: false };
}

function upsertUserRow({ name, email, phone, password }) {
  const mobile = normalizePhone(phone);
  if (!name || name.length < 2) throw new Error('Name is required');
  if (!/^[6-9]\d{9}$/.test(mobile) && !email) {
    throw new Error('Valid 10-digit mobile or email required');
  }

  let user = email ? db.prepare('SELECT * FROM users WHERE email = ?').get(email) : null;
  if (!user && mobile) user = db.prepare('SELECT * FROM users WHERE phone = ?').get(mobile);
  if (user) {
    return { user, created: false, password: null };
  }

  const pwd = password && password.length >= 6 ? password : generatePassword();
  const hash = bcrypt.hashSync(pwd, 10);
  const result = db
    .prepare('INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)')
    .run(name, email, mobile || null, hash, 'user');
  user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  onUserRegistered(user, { whatsappOptIn: true });
  return { user, created: true, password: pwd };
}

export function importBulkUsers({
  rows = [],
  moduleSlugs = [],
  approvePayments = false,
  paymentMethod = 'none',
  adminId = null,
  userIds = null,
  applyToAll = false,
} = {}) {
  const results = [];
  const slugs = [...new Set((moduleSlugs || []).filter(Boolean))];
  const payMode = paymentMethod !== 'none'
    ? paymentMethod
    : (approvePayments ? 'admin' : 'none');

  let targets = [];
  if (applyToAll) {
    targets = db.prepare('SELECT id FROM users WHERE role = ?').all('user').map((u) => ({ userId: u.id }));
  } else if (userIds?.length) {
    targets = userIds.map((id) => ({ userId: Number(id) }));
  } else {
    targets = rows.map((row) => ({ row }));
  }

  if (!targets.length) {
    return { total: 0, success: 0, failed: 0, results: [] };
  }

  for (const target of targets) {
    try {
      let user;
      let plainPassword = null;
      let created = false;

      if (target.userId) {
        user = db.prepare('SELECT * FROM users WHERE id = ? AND role = ?').get(target.userId, 'user');
        if (!user) throw new Error('User not found');
      } else {
        const upserted = upsertUserRow(target.row);
        user = upserted.user;
        created = upserted.created;
        plainPassword = upserted.password;
      }

      const modules = [];
      for (const slug of slugs) {
        modules.push({
          slug,
          ...assignModuleToUser(user.id, slug, { paymentMode: payMode, adminId }),
        });
      }

      results.push({
        ok: true,
        userId: user.id,
        dreamsId: user.user_uid,
        name: user.name,
        email: user.email,
        phone: user.phone,
        created,
        password: plainPassword,
        modules,
      });
    } catch (err) {
      results.push({
        ok: false,
        name: target.row?.name || `User #${target.userId}`,
        error: err.message,
      });
    }
  }

  return {
    total: results.length,
    success: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  };
}

export function bulkUserCsvTemplate() {
  return 'name,email,phone,password\nStudent Name,student@example.com,9876543210,Welcome123\n';
}
