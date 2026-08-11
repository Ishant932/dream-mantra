import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db, { repo } from '../db.js';
import { findUserByLoginIdentifier } from './authHelpers.js';
import { buildModuleSelection } from './moduleCatalog.js';
import { createPendingPaymentForAssessment } from './paymentService.js';
import { isAssessmentFullyPaid } from './paymentService.js';
import { onPaymentPending } from './whatsapp/events.js';
import { onUserRegistered } from './whatsapp/events.js';
import { normalizeProfile } from './profile.js';
import { getAllStudioLandings } from './studioLandings.js';

const JWT_SECRET = () => process.env.JWT_SECRET || 'dreams-mantra-secret-key';
const JWT_EXPIRES = () => process.env.JWT_EXPIRES_IN || '7d';

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, phone: user.phone, role: user.role, name: user.name },
    JWT_SECRET(),
    { expiresIn: JWT_EXPIRES() }
  );
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password, twoFactorSecret, twoFactorPendingSecret, ...rest } = user;
  return { ...rest, profile: normalizeProfile(user.profile) };
}

function bookModuleForUser(userId, productSlug) {
  const catalog = buildModuleSelection(productSlug, false);
  if (!catalog) throw new Error('Invalid program for this landing page');

  const userAssessments = db.prepare('SELECT * FROM assessments WHERE user_id = ?').all(userId);
  const owned = userAssessments.find((a) => a.product_slug === catalog.moduleSlug && isAssessmentFullyPaid(a));
  if (owned) {
    return { paymentUrl: `/payment/${owned.id}`, assessmentId: owned.id, reused: true };
  }

  const progress = {
    addCounselling: catalog.addCounselling,
    selection: {
      displayTitle: catalog.displayTitle,
      lineItems: catalog.lineItems,
      total: catalog.total,
      moduleSlug: catalog.moduleSlug,
      moduleTitle: catalog.moduleTitle,
      addCounselling: catalog.addCounselling,
    },
  };

  const pending = userAssessments.find(
    (a) => a.product_slug === catalog.moduleSlug && a.status === 'pending_payment'
  );

  if (pending) {
    repo.updateAssessment(pending.id, {
      amount: catalog.total,
      type: catalog.moduleTitle,
      product_slug: catalog.moduleSlug,
      progress: { ...(pending.progress || {}), ...progress },
    });
    createPendingPaymentForAssessment({
      userId,
      assessmentId: pending.id,
      amount: catalog.total,
    });
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    onPaymentPending(user, repo.getAssessment(pending.id));
    return { paymentUrl: `/payment/${pending.id}`, assessmentId: pending.id, reused: true };
  }

  const result = db
    .prepare('INSERT INTO assessments (user_id, type, status, amount, product_slug) VALUES (?, ?, ?, ?, ?)')
    .run(userId, catalog.moduleTitle, 'pending_payment', catalog.total, catalog.moduleSlug);
  const assessment = db.prepare('SELECT * FROM assessments WHERE id = ?').get(result.lastInsertRowid);
  repo.updateAssessment(assessment.id, { progress });
  createPendingPaymentForAssessment({
    userId,
    assessmentId: assessment.id,
    amount: catalog.total,
  });
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  onPaymentPending(user, repo.getAssessment(assessment.id));
  return { paymentUrl: `/payment/${assessment.id}`, assessmentId: assessment.id, reused: false };
}

export function landingSignupCheckout({ name, email, phone, password, productSlug, studioSlug, source }) {
  const trimmedName = String(name || '').trim();
  const userEmail = String(email || '').trim().toLowerCase() || null;
  const userPhone = String(phone || '').trim() || null;
  const pwd = String(password || '');

  if (!trimmedName || trimmedName.length < 2) throw new Error('Please enter your name');
  const phoneDigits = String(userPhone || '').replace(/\D/g, '');
  const mobile = phoneDigits.length === 12 && phoneDigits.startsWith('91')
    ? phoneDigits.slice(2)
    : phoneDigits.length === 11 && phoneDigits.startsWith('0')
      ? phoneDigits.slice(1)
      : phoneDigits;
  if (!/^[6-9]\d{9}$/.test(mobile)) throw new Error('Enter a valid 10-digit mobile number');
  const normalizedPhone = mobile;
  if (pwd.length < 6) throw new Error('Password must be at least 6 characters');

  const landings = getAllStudioLandings();
  const landing = landings.find((l) => l.slug === studioSlug);
  const slug = productSlug || landing?.productSlug;
  if (!slug || !buildModuleSelection(slug, false)) {
    throw new Error('Invalid landing program');
  }

  let user = userEmail
    ? db.prepare('SELECT * FROM users WHERE email = ?').get(userEmail)
  : null;
  if (!user && normalizedPhone) {
    user = db.prepare('SELECT * FROM users WHERE phone = ?').get(normalizedPhone);
  }
  if (!user && userEmail) {
    user = findUserByLoginIdentifier(userEmail);
  }

  if (user) {
    if (!bcrypt.compareSync(pwd, user.password)) {
      throw new Error('Account already exists. Use the correct password or sign in on the website.');
    }
  } else {
    const hash = bcrypt.hashSync(pwd, 10);
    const result = db
      .prepare('INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)')
      .run(trimmedName, userEmail, normalizedPhone, hash, 'user');
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    onUserRegistered(user, { whatsappOptIn: true });
  }

  const { paymentUrl, assessmentId, reused } = bookModuleForUser(user.id, slug);
  const token = signToken(user);

  return {
    token,
    user: sanitizeUser(user),
    paymentUrl,
    assessmentId,
    reused,
    productSlug: slug,
  };
}
