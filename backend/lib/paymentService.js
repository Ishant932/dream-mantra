import crypto from 'crypto';
import { getData, saveData, repo } from './database.js';
import { notifyUser, notifyAdmins } from './notifications.js';
import { onPaymentConfirmed } from './whatsapp/events.js';
import { getProduct } from '../config/products.js';
import { isGatewayEnabled } from './paymentGateway.js';
import { savePaymentProof } from './paymentProof.js';

export const PAYMENT_STATUSES = ['pending', 'confirmed', 'failed', 'refunded'];
export const CONFIRMATION_SOURCES = ['gateway', 'admin_manual'];

/** Migrate legacy payment rows on read */
export function normalizePaymentRow(pay) {
  if (!pay) return null;
  if (!pay.payment_status) {
    if (pay.status === 'paid') pay.payment_status = 'confirmed';
    else if (pay.status === 'failed') pay.payment_status = 'failed';
    else pay.payment_status = 'pending';
  }
  if (pay.payment_status === 'confirmed' && !pay.confirmation_source) {
    pay.confirmation_source =
      (pay.provider === 'phonepe' || pay.provider === 'razorpay') &&
      (pay.transaction_id || pay.razorpay_payment_id)
        ? 'gateway'
        : null;
  }
  if (!pay.transaction_id && pay.razorpay_payment_id) {
    pay.transaction_id = pay.razorpay_payment_id;
  }
  return pay;
}

const PAYMENT_STATUS_RANK = { confirmed: 4, pending: 3, failed: 2, refunded: 1 };

function rankPayment(pay) {
  if (!pay) return 0;
  normalizePaymentRow(pay);
  return PAYMENT_STATUS_RANK[pay.payment_status] || 0;
}

/** All payment rows for an assessment (newest first within same rank). */
export function getAllPaymentsForAssessment(assessmentId) {
  const data = getData();
  return (data.payments || [])
    .filter((p) => p.assessment_id === Number(assessmentId))
    .map(normalizePaymentRow)
    .sort((a, b) => {
      const dr = rankPayment(b) - rankPayment(a);
      if (dr !== 0) return dr;
      return new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0);
    });
}

export function getPaymentForAssessment(assessmentId) {
  return getAllPaymentsForAssessment(assessmentId)[0] || null;
}

export function isPaymentConfirmed(payment) {
  if (!payment) return false;
  normalizePaymentRow(payment);
  return payment.payment_status === 'confirmed';
}

export function isAssessmentFullyPaid(assessment) {
  if (!assessment) return false;
  const payments = getAllPaymentsForAssessment(assessment.id);
  if (payments.some(isPaymentConfirmed)) return true;
  // Repaired legacy rows: paid assessment with access link after admin confirm
  if (assessment.status === 'paid' && assessment.test_link && assessment.paid_at) {
    return true;
  }
  return false;
}

/** Keep assessment row in sync when payment is confirmed (repair + idempotent confirm). */
export function syncAssessmentFromConfirmedPayment(assessment, pay) {
  if (!assessment || !pay) return false;
  normalizePaymentRow(pay);
  if (pay.payment_status !== 'confirmed') return false;

  let changed = false;
  const now = pay.paid_at || pay.confirmed_at || new Date().toISOString();
  const product = getProduct(assessment.product_slug || assessment.type);
  const testPath = product?.testPath || assessment.test_link || null;

  if (assessment.status !== 'paid') {
    assessment.status = 'paid';
    changed = true;
  }
  if (testPath && assessment.test_link !== testPath) {
    assessment.test_link = testPath;
    changed = true;
  }
  if (!assessment.paid_at) {
    assessment.paid_at = now;
    changed = true;
  }
  const paymentRef = pay.transaction_id || pay.order_id;
  if (paymentRef && assessment.payment_id !== paymentRef) {
    assessment.payment_id = paymentRef;
    changed = true;
  }
  return changed;
}

/** Repair all assessments whose payment is confirmed but assessment was never updated. */
export function syncAllConfirmedPaymentAssessments() {
  const data = getData();
  let changed = false;
  for (const pay of data.payments || []) {
    normalizePaymentRow(pay);
    if (pay.payment_status !== 'confirmed') continue;
    const assessment = data.assessments.find((a) => Number(a.id) === Number(pay.assessment_id));
    if (syncAssessmentFromConfirmedPayment(assessment, pay)) changed = true;
  }
  if (changed) saveData();
  return changed;
}

/** Whether user may remove an unpaid / unconfirmed module booking */
export function canCancelAssessment(assessment) {
  if (!assessment) return false;
  if (isAssessmentFullyPaid(assessment)) return false;

  const pay = getPaymentForAssessment(assessment.id);
  if (!pay) return assessment.status === 'pending_payment';
  if (isPaymentConfirmed(pay)) return false;
  if (assessment.status === 'pending_payment') return true;
  if (['pending', 'failed'].includes(pay.payment_status)) return true;
  if (['requested', 'created'].includes(assessment.status)) return true;
  return false;
}

function enrichPaymentRow(pay) {
  normalizePaymentRow(pay);
  const data = getData();
  const user = data.users.find((u) => u.id === pay.user_id);
  const assessment = data.assessments.find((a) => a.id === pay.assessment_id);
  const admin = pay.confirmed_by_admin_id
    ? data.users.find((u) => u.id === pay.confirmed_by_admin_id)
    : null;
  return {
    ...pay,
    transaction_id: pay.transaction_id || pay.razorpay_payment_id || null,
    user_name: user?.name,
    user_uid: user?.user_uid,
    email: user?.email,
    phone: user?.phone,
    product_title: assessment?.progress?.selection?.displayTitle || assessment?.type,
    product_slug: assessment?.product_slug,
    assessment_status: assessment?.status,
    test_link: assessment?.test_link,
    confirmed_by_admin_name: admin?.name || null,
    confirmation_status: getConfirmationStatusLabel(pay),
    selection: assessment?.progress?.selection || null,
  };
}

export function getConfirmationStatusLabel(pay) {
  normalizePaymentRow(pay);
  if (pay.payment_status === 'confirmed') {
    return pay.confirmation_source === 'gateway' ? 'Gateway confirmed' : 'Admin confirmed';
  }
  if (pay.payment_status === 'failed') return 'Failed';
  if (pay.payment_status === 'refunded') return 'Refunded';
  if (pay.submitted_at) return 'Awaiting admin verification';
  if (pay.provider === 'manual' || pay.payment_method === 'manual') return 'Awaiting admin review';
  return 'Pending';
}

/** Create or return existing pending payment for an assessment order */
export function createPendingPaymentForAssessment({ userId, assessmentId, amount }) {
  const all = getAllPaymentsForAssessment(assessmentId);
  const confirmed = all.find(isPaymentConfirmed);
  if (confirmed) return enrichPaymentRow(confirmed);

  const pending = all.find((p) => p.payment_status === 'pending');
  if (pending) {
    if (pending.amount !== amount) {
      pending.amount = amount;
      saveData();
    }
    return enrichPaymentRow(pending);
  }

  const orderId = `DM-${assessmentId}-${Date.now()}`;
  const row = repo.createPayment({
    userId,
    assessmentId,
    amount,
    orderId,
    provider: 'manual',
    paymentMethod: 'manual',
  });
  return enrichPaymentRow(row);
}

/** User requests admin verification — order stays pending until admin confirms */
export function submitManualPayment({
  assessmentId,
  userId,
  proofDataUrl,
  proofFileName,
  userNote,
  paymentReferenceId,
}) {
  const data = getData();
  const assessment = data.assessments.find((a) => a.id === Number(assessmentId));
  if (!assessment || assessment.user_id !== Number(userId)) {
    throw new Error('Order not found');
  }

  if (!proofDataUrl?.trim()) {
    throw new Error('Payment screenshot is required');
  }
  if (!paymentReferenceId?.trim()) {
    throw new Error('Payment reference / transaction ID is required');
  }

  let pay = getPaymentForAssessment(assessmentId);
  if (pay?.payment_status === 'confirmed') {
    return { alreadyConfirmed: true, payment: enrichPaymentRow(pay), assessment };
  }
  if (!pay || pay.payment_status === 'failed' || pay.payment_status === 'refunded') {
    pay = createPendingPaymentForAssessment({
      userId,
      assessmentId: assessment.id,
      amount: assessment.amount,
    });
  }

  normalizePaymentRow(pay);
  if (pay.payment_status === 'confirmed') {
    return { alreadyConfirmed: true, payment: enrichPaymentRow(pay), assessment };
  }

  const now = new Date().toISOString();
  try {
    const saved = savePaymentProof(pay.id, proofDataUrl, proofFileName);
    pay.payment_proof_url = saved.url;
    pay.payment_proof_name = saved.originalName;
    pay.payment_proof_mime = saved.mime;
  } catch (proofErr) {
    throw new Error(proofErr.message || 'Could not save payment proof');
  }

  pay.payment_reference_id = String(paymentReferenceId).trim().slice(0, 120);
  pay.payment_status = 'pending';
  pay.status = 'pending_review';
  pay.provider = 'manual';
  pay.payment_method = 'manual';
  pay.submitted_at = now;
  pay.updated_at = now;
  if (userNote) pay.user_note = String(userNote).slice(0, 500);

  saveData();

  const user = data.users.find((u) => Number(u.id) === Number(userId));
  notifyAdmins({
    type: 'payment_review',
    title: 'Payment needs review',
    body: `${user?.name || 'A student'} submitted manual payment proof for ${assessment.type || 'a module'}.`,
    link: '/admin?tab=payments',
    meta: { paymentId: pay.id, assessmentId: assessment.id, userId },
  });

  return { alreadyConfirmed: false, payment: enrichPaymentRow(pay), assessment };
}

/**
 * Idempotent payment confirmation — gateway or admin manual.
 */
export function confirmPayment({
  orderId,
  paymentId,
  source = 'gateway',
  adminId = null,
  adminNote = null,
  paymentMethod = null,
  gatewayResponse = null,
}) {
  const data = getData();
  const pay = data.payments.find((p) => p.order_id === orderId);
  if (!pay) throw new Error('Payment record not found');

  normalizePaymentRow(pay);

  if (pay.payment_status === 'confirmed') {
    const assessment = data.assessments.find((a) => a.id === pay.assessment_id);
    if (syncAssessmentFromConfirmedPayment(assessment, pay)) saveData();
    return { alreadyConfirmed: true, payment: enrichPaymentRow(pay), assessment };
  }

  const now = new Date().toISOString();
  pay.payment_status = 'confirmed';
  pay.status = 'paid';
  pay.confirmation_source = source;
  pay.transaction_id = paymentId || pay.transaction_id || pay.razorpay_payment_id;
  if (paymentId) pay.razorpay_payment_id = paymentId; // legacy field — stores gateway txn id
  const gatewayMethod =
    pay.provider === 'phonepe' ? 'phonepe' : pay.provider === 'razorpay' ? 'razorpay' : 'manual';
  pay.payment_method =
    paymentMethod ||
    pay.payment_method ||
    (source === 'admin_manual' ? 'manual' : gatewayMethod);
  pay.paid_at = now;
  pay.confirmed_at = now;
  if (adminId) {
    pay.confirmed_by_admin_id = adminId;
    pay.admin_note = adminNote || pay.admin_note || null;
  }
  if (gatewayResponse) pay.gateway_response = gatewayResponse;
  if (adminNote && source === 'admin_manual') pay.admin_note = adminNote;

  const assessment = data.assessments.find((a) => a.id === pay.assessment_id);
  if (assessment) {
    const product = getProduct(assessment.product_slug || assessment.type);
    assessment.status = 'paid';
    assessment.test_link = product.testPath;
    assessment.paid_at = now;
    assessment.payment_id = pay.transaction_id || pay.order_id;
  }

  saveData();

  if (assessment?.user_id) {
    notifyUser(assessment.user_id, {
      type: 'payment',
      title: 'Payment confirmed',
      body: `Your payment for ${assessment.type || 'your module'} is confirmed. Access is now unlocked.`,
      link: '/dashboard?tab=assess',
      meta: { assessmentId: assessment.id, paymentId: pay.id },
    });
    const user = data.users.find((u) => Number(u.id) === Number(assessment.user_id));
    if (user) onPaymentConfirmed(user, assessment);
  }

  return { alreadyConfirmed: false, payment: enrichPaymentRow(pay), assessment };
}

export function updatePaymentStatus(paymentId, status, { adminId, adminNote, userNote } = {}) {
  if (!PAYMENT_STATUSES.includes(status)) throw new Error('Invalid payment status');

  const data = getData();
  const pay = data.payments.find((p) => p.id === Number(paymentId));
  if (!pay) throw new Error('Payment not found');

  normalizePaymentRow(pay);
  const now = new Date().toISOString();
  pay.payment_status = status;
  pay.updated_at = now;

  const assessment = data.assessments.find((a) => a.id === pay.assessment_id);

  if (status === 'confirmed') {
    return confirmPayment({
      orderId: pay.order_id,
      paymentId: pay.transaction_id || pay.razorpay_payment_id,
      source: 'admin_manual',
      adminId,
      adminNote,
      paymentMethod: pay.payment_method || 'manual',
    });
  }

  if (status === 'pending') {
    pay.status = 'created';
    pay.confirmation_source = null;
    if (assessment) {
      assessment.status = 'pending_payment';
      assessment.test_link = null;
      assessment.paid_at = null;
    }
  }

  if (status === 'failed') {
    pay.status = 'failed';
    if (adminNote) pay.admin_note = adminNote;
    if (userNote) pay.user_note = userNote;
    if (adminId) pay.confirmed_by_admin_id = adminId;

    saveData();

    if (assessment?.user_id) {
      const reason = userNote || adminNote || 'Please check your payment details and try again.';
      notifyUser(assessment.user_id, {
        type: 'payment',
        title: 'Payment verification failed',
        body: reason,
        link: `/payment/${assessment.id}`,
        meta: { assessmentId: assessment.id, paymentId: pay.id },
      });
    }

    return { payment: enrichPaymentRow(pay), assessment };
  }

  if (status === 'refunded') {
    pay.status = 'refunded';
    pay.refunded_at = now;
    if (adminNote) pay.admin_note = adminNote;
    if (adminId) pay.confirmed_by_admin_id = adminId;
    if (assessment) {
      assessment.status = 'pending_payment';
      assessment.test_link = null;
      assessment.paid_at = null;
    }
  }

  saveData();
  return { payment: enrichPaymentRow(pay), assessment };
}

export function patchPaymentDetails(paymentId, { amount, adminNote, userNote, userId } = {}) {
  const data = getData();
  const pay = data.payments.find((p) => p.id === Number(paymentId));
  if (!pay) throw new Error('Payment not found');

  normalizePaymentRow(pay);
  const now = new Date().toISOString();

  if (amount != null && pay.payment_status === 'confirmed') {
    throw new Error('Cannot change amount on a confirmed payment');
  }

  if (userId != null) {
    const newUser = data.users.find((u) => u.id === Number(userId));
    if (!newUser) throw new Error('User not found');
    pay.user_id = newUser.id;
    if (pay.assessment_id) {
      const assessment = data.assessments.find((a) => Number(a.id) === Number(pay.assessment_id));
      if (assessment) assessment.user_id = newUser.id;
    }
  }

  if (amount != null && !Number.isNaN(Number(amount))) {
    pay.amount = Number(amount);
    const assessment = data.assessments.find((a) => a.id === pay.assessment_id);
    if (assessment) assessment.amount = Number(amount);
  }

  if (adminNote !== undefined) pay.admin_note = adminNote;
  if (userNote !== undefined) pay.user_note = userNote;
  pay.updated_at = now;

  saveData();
  return { payment: enrichPaymentRow(pay) };
}

export function listPaymentsForAdmin({
  status,
  search = '',
  page = 1,
  limit = 20,
  sort = 'created_at',
  order = 'desc',
} = {}) {
  const data = getData();
  let rows = (data.payments || []).map((p) => enrichPaymentRow(normalizePaymentRow({ ...p })));

  if (status && status !== 'all') {
    rows = rows.filter((p) => p.payment_status === status);
  }

  const q = search.trim().toLowerCase();
  if (q) {
    rows = rows.filter(
      (p) =>
        p.user_name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.phone?.includes(q) ||
        p.order_id?.toLowerCase().includes(q) ||
        p.transaction_id?.toLowerCase().includes(q) ||
        p.user_uid?.toLowerCase().includes(q)
    );
  }

  const sortKey = sort === 'amount' ? 'amount' : sort === 'paid_at' ? 'paid_at' : 'created_at';
  rows.sort((a, b) => {
    const av = a[sortKey] ?? '';
    const bv = b[sortKey] ?? '';
    if (sortKey === 'amount') return order === 'asc' ? av - bv : bv - av;
    const cmp = new Date(av) - new Date(bv);
    return order === 'asc' ? cmp : -cmp;
  });

  const total = rows.length;
  const start = (Math.max(1, page) - 1) * limit;
  const payments = rows.slice(start, start + limit);

  return {
    payments,
    pagination: {
      page: Math.max(1, page),
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export function listPaymentsForUser(userId) {
  const data = getData();
  return (data.payments || [])
    .filter((p) => p.user_id === Number(userId))
    .map((p) => enrichPaymentRow(normalizePaymentRow({ ...p })))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/**
 * PhonePe S2S webhook — kept for any in-flight PhonePe orders during migration.
 */
export function handlePhonePeWebhook(callbackResponse) {
  if (!isGatewayEnabled()) {
    return { handled: false, reason: 'Gateway disabled — manual confirmation only' };
  }

  const payload = callbackResponse?.payload || callbackResponse || {};
  const state = String(payload.state || '').toUpperCase();
  const orderId =
    payload.merchantOrderId ||
    payload.originalMerchantOrderId ||
    payload.merchant_order_id ||
    payload.orderId;
  if (!orderId) {
    return { handled: false, reason: 'Missing merchant order id' };
  }

  if (state && state !== 'COMPLETED' && state !== 'SUCCESS') {
    if (state === 'FAILED' || state === 'ERROR') {
      const data = getData();
      const pay = data.payments.find((p) => p.order_id === orderId);
      if (pay && pay.payment_status !== 'confirmed') {
        pay.payment_status = 'failed';
        pay.status = 'failed';
        pay.updated_at = new Date().toISOString();
        pay.gateway_response = { state, type: callbackResponse?.type || null };
        saveData();
      }
    }
    return { handled: false, reason: `State ignored: ${state || 'unknown'}` };
  }

  const paymentId =
    payload.transactionId ||
    payload.paymentId ||
    payload.paymentDetails?.[0]?.transactionId ||
    orderId;

  const result = confirmPayment({
    orderId,
    paymentId,
    source: 'gateway',
    paymentMethod: 'phonepe',
    gatewayResponse: {
      type: callbackResponse?.type || null,
      state,
      payment_id: paymentId,
      raw: payload,
    },
  });

  return { handled: true, ...result };
}

/** Razorpay payment.captured webhook — backup confirm if client verify fails */
export function handleRazorpayWebhook(body, signature, secret, rawBody) {
  if (!isGatewayEnabled()) {
    return { handled: false, reason: 'Gateway disabled — manual confirmation only' };
  }
  if (secret && signature) {
    const payload = typeof rawBody === 'string' ? rawBody : JSON.stringify(body);
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    if (expected !== signature) throw new Error('Invalid webhook signature');
  }

  const event = body?.event;
  const paymentEntity = body?.payload?.payment?.entity;
  if (event !== 'payment.captured' || !paymentEntity) {
    return { handled: false, reason: 'Event ignored' };
  }

  const orderId = paymentEntity.order_id;
  const paymentId = paymentEntity.id;
  const method = paymentEntity.method || 'razorpay';

  const result = confirmPayment({
    orderId,
    paymentId,
    source: 'gateway',
    paymentMethod: method,
    gatewayResponse: {
      event,
      payment_id: paymentId,
      method,
      captured_at: paymentEntity.created_at,
    },
  });

  return { handled: true, ...result };
}

/** Run once on existing data */
export function migrateLegacyPayments() {
  const data = getData();
  let changed = false;
  for (const pay of data.payments || []) {
    const before = JSON.stringify(pay);
    normalizePaymentRow(pay);
    if (pay.payment_status === 'confirmed' && pay.status !== 'paid') pay.status = 'paid';
    if (JSON.stringify(pay) !== before) changed = true;
  }

  for (const a of data.assessments || []) {
    if (!['paid', 'completed'].includes(a.status)) continue;
    const hasPay = (data.payments || []).some((p) => Number(p.assessment_id) === Number(a.id));
    if (hasPay) continue;

    const id = data.nextId.payments++;
    data.payments.push({
      id,
      user_id: a.user_id,
      assessment_id: a.id,
      amount: a.amount || 0,
      payment_status: 'confirmed',
      status: 'paid',
      provider: 'legacy',
      payment_method: 'manual',
      order_id: a.payment_id || `LEGACY-${a.id}`,
      product_title: a.type || 'Module',
      created_at: a.created_at || new Date().toISOString(),
      paid_at: a.paid_at || a.created_at || new Date().toISOString(),
      confirmation_source: 'admin_manual',
    });
    changed = true;
  }

  if (syncAllConfirmedPaymentAssessments()) changed = true;

  if (changed) saveData();
}
