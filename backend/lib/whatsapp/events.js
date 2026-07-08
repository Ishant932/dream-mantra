import { getData, repo } from '../../db.js';
import { normalizeProfile } from '../profile.js';
import { isWhatsAppEnabled } from './config.js';
import { resolveUserPhone, toWhatsAppId, userMayReceiveWhatsApp } from './phone.js';
import { queueFromTemplate, scheduleWhatsAppMessage, queueWhatsAppMessage } from './outbox.js';
import { markOptIn } from './conversations.js';
import { messageCatalog } from './catalog.js';
import { siteUrl } from './config.js';

const HOUR = 60 * 60 * 1000;

function canSend(user) {
  if (!isWhatsAppEnabled()) return false;
  return userMayReceiveWhatsApp(user);
}

function fire(fn) {
  setImmediate(() => {
    Promise.resolve(fn()).catch((err) => {
      console.error('[whatsapp] event error:', err.message);
    });
  });
}

function queueText(trigger, user, extra = {}) {
  const body = messageCatalog(trigger, user, extra);
  if (!body) return null;
  return queueWhatsAppMessage({
    userId: user.id,
    user,
    trigger,
    body,
    meta: extra,
  });
}

function scheduleText(trigger, user, delayMs, extra = {}) {
  const body = messageCatalog(trigger, user, extra);
  if (!body) return null;
  return scheduleWhatsAppMessage({
    userId: user.id,
    user,
    trigger,
    body,
    meta: extra,
  }, delayMs);
}

export function onUserRegistered(user, { whatsappOptIn = true } = {}) {
  fire(async () => {
    if (!user) return;

    if (user.phone) {
      const waId = toWhatsAppId(user.phone);
      repo.updateUser(user.id, {
        profile: {
          ...normalizeProfile(user.profile),
          whatsappOptIn: whatsappOptIn !== false,
          whatsappNumber: normalizeProfile(user.profile).whatsappNumber || user.phone,
        },
      });
      if (waId) markOptIn(user.id, waId);
    }

    const fresh = getData().users.find((u) => Number(u.id) === Number(user.id)) || user;
    if (!canSend(fresh)) return;

    queueText('registration_success', fresh);
    scheduleText('welcome_step2', fresh, 2 * HOUR);
    scheduleText('welcome_step3', fresh, 24 * HOUR);
    scheduleText('welcome_step4', fresh, 48 * HOUR);
  });
}

export function onProfileUpdated(user) {
  fire(() => {
    if (!canSend(user)) return;
    const profile = normalizeProfile(user.profile);
    if (!profile.setupComplete) return;
    queueText('profile_complete', user);
  });
}

export function onPaymentPending(user, assessment) {
  fire(() => {
    if (!canSend(user) || !assessment) return;
    scheduleText('payment_reminder', user, 6 * HOUR, {
      moduleTitle: assessment.type || assessment.product_slug,
      paymentUrl: `${siteUrl()}/payment/${assessment.id}`,
    });
  });
}

export function onPaymentConfirmed(user, assessment) {
  fire(() => {
    if (!canSend(user)) return;
    queueText('payment_confirmed', user, {
      moduleTitle: assessment?.type || assessment?.product_slug,
    });
  });
}

export function onReportReady(user, report) {
  fire(() => {
    if (!canSend(user)) return;
    queueText('report_ready', user, {
      reportTitle: report?.report_title || report?.title || 'Assessment report',
    });
  });
}

export function onConsultationBooked(user, consultation) {
  fire(() => {
    if (!canSend(user) || !consultation?.scheduled_at) return;
    const d = new Date(consultation.scheduled_at);
    const sessionDate = d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
    const sessionTime = d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
    queueText('booking_confirmed', user, { sessionDate, sessionTime });
    queueText('session_reminder', user, { sessionDate, sessionTime });
  });
}

export { processOutbox } from './outbox.js';
export { runReminderScan } from './reminders.js';
export { handleInboundMessage } from './conversations.js';
export { isWhatsAppEnabled, isWhatsAppConfigured, getWhatsAppPublicConfig } from './config.js';
