import { getData, repo } from '../../db.js';
import { normalizeProfile } from '../profile.js';
import { isWhatsAppEnabled } from './config.js';
import { resolveUserPhone, toWhatsAppId, userMayReceiveWhatsApp, resolveAdminPhones, fromWhatsAppId } from './phone.js';
import { scheduleWhatsAppMessage, queueWhatsAppMessage, processOutbox } from './outbox.js';
import { markOptIn } from './conversations.js';
import { messageCatalog } from './catalog.js';
import { siteUrl } from './config.js';
import { sendNotificationEmail, whatsappBodyToEmailHtml } from '../../utils/mail.js';
import { notifyAdmins } from '../notifications.js';
import {
  getUserJourneyStatus,
  hasCompletedAllPaidModuleTests,
  isPaidModuleActionComplete,
  journeyProgressPercent,
} from '../moduleAccess.js';
import { resolveAssessmentSlug } from '../moduleCatalog.js';

import { getWhatsAppTimingMs } from './adminConfig.js';

async function mirrorToEmail(trigger, user, body) {
  if (!user?.email || !body) return;
  try {
    await sendNotificationEmail({
      to: user.email,
      subject: `Dream Mantra — ${String(trigger).replace(/_/g, ' ')}`,
      html: whatsappBodyToEmailHtml(body),
      text: body,
    });
  } catch (err) {
    console.error('[whatsapp] email mirror failed:', err.message);
  }
}

/** Queue a message, flush outbox immediately, and mirror to email for reliability. */
async function sendNow(trigger, user, extra = {}) {
  const body = messageCatalog(trigger, user, extra);
  if (!body) return;
  queueWhatsAppMessage({
    userId: user.id,
    user,
    trigger,
    body,
    meta: extra,
  });
  const result = await processOutbox({ limit: 20, userId: user.id });
  // Mirror to email so users always get the message (WhatsApp may be blocked until production sender)
  await mirrorToEmail(trigger, user, body);
  return result;
}

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

async function sendAdminWhatsApp(trigger, user, extra = {}) {
  const phones = resolveAdminPhones();
  if (!phones.length) return;
  const body = messageCatalog(trigger, user, extra);
  if (!body) return;

  for (const phone of phones) {
    queueWhatsAppMessage({
      phone,
      trigger,
      body,
      meta: { ...extra, userId: user.id },
      kind: 'admin',
    });
  }
  await processOutbox({ limit: 20 });
}

function moduleSummary(assessments = []) {
  return assessments
    .map((a) => {
      const title = a.type || resolveAssessmentSlug(a) || 'Module';
      const done = isPaidModuleActionComplete(a) ? 'Done' : 'Pending';
      return `• ${title}: ${done}`;
    })
    .join('\n');
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

    await sendNow('registration_success', fresh);
    scheduleText('welcome_step2', fresh, getWhatsAppTimingMs('welcome_step2_hours', 2));
    scheduleText('welcome_step3', fresh, getWhatsAppTimingMs('welcome_step3_hours', 24));
    scheduleText('welcome_step4', fresh, getWhatsAppTimingMs('welcome_step4_hours', 48));
  });
}

export function onProfileUpdated(user) {
  fire(async () => {
    if (!canSend(user)) return;
    const profile = normalizeProfile(user.profile);
    if (!profile.setupComplete) return;
    await sendNow('profile_complete', user);
  });
}

export function onPaymentPending(user, assessment) {
  fire(() => {
    if (!canSend(user) || !assessment) return;
    scheduleText('payment_reminder', user, getWhatsAppTimingMs('payment_schedule_delay_hours', 6), {
      moduleTitle: assessment.type || assessment.product_slug,
      paymentUrl: `${siteUrl()}/payment/${assessment.id}`,
    });
  });
}

export function onPaymentConfirmed(user, assessment) {
  fire(async () => {
    if (!canSend(user)) return;
    const slug = String(assessment?.product_slug || '').toLowerCase();
    const moduleTitle = assessment?.type || assessment?.product_slug;
    if (slug === 'career-readiness') {
      await sendNow('career_readiness_intro', user, { moduleTitle });
      return;
    }
    await sendNow('payment_confirmed', user, { moduleTitle });
  });
}

export function onReportReady(user, report) {
  fire(async () => {
    if (!canSend(user)) return;
    await sendNow('report_ready', user, {
      reportTitle: report?.report_title || report?.title || 'Assessment report',
    });
  });
}

export function onConsultationBooked(user, consultation) {
  fire(async () => {
    if (!canSend(user) || !consultation?.scheduled_at) return;
    const d = new Date(consultation.scheduled_at);
    const sessionDate = d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
    const sessionTime = d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
    queueText('booking_confirmed', user, { sessionDate, sessionTime });
    queueText('session_reminder', user, { sessionDate, sessionTime });
    await processOutbox({ limit: 20 });
  });
}

export function onAssessmentTestCompleted(user, assessment, allAssessments = []) {
  fire(async () => {
    if (!user || !assessment) return;
    const statusSummary = getUserJourneyStatus(user, allAssessments);
    const extra = {
      moduleTitle: assessment.type || resolveAssessmentSlug(assessment),
      statusSummary,
      progressPercent: journeyProgressPercent(user, allAssessments),
    };

    if (canSend(user)) {
      await sendNow('test_complete', user, extra);
      await sendNow('journey_status', user, extra);
    }
  });
}

export function onAllTestsCompleted(user, allAssessments = []) {
  fire(async () => {
    if (!user) return;
    const statusSummary = getUserJourneyStatus(user, allAssessments);
    const modulesSummary = moduleSummary(
      allAssessments.filter((a) => resolveAssessmentSlug(a) !== 'counselling-topup')
    );
    const phoneDisplay = fromWhatsAppId(resolveUserPhone(user)) || user.phone || '—';
    const extra = {
      statusSummary,
      modulesSummary,
      progressPercent: journeyProgressPercent(user, allAssessments),
      phoneDisplay,
    };

    if (canSend(user)) {
      await sendNow('all_tests_complete', user, extra);
    }

    notifyAdmins({
      type: 'all_tests_complete',
      title: `${user.name || 'Student'} completed all tests`,
      body: statusSummary,
      link: '/admin',
      meta: { userId: user.id, dreamsId: user.user_uid },
    });

    await sendAdminWhatsApp('admin_all_tests_complete', user, extra);
  });
}

export function onJourneyStatusUpdate(user, allAssessments = []) {
  fire(async () => {
    if (!canSend(user)) return;
    const statusSummary = getUserJourneyStatus(user, allAssessments);
    await sendNow('journey_status', user, {
      statusSummary,
      progressPercent: journeyProgressPercent(user, allAssessments),
    });
  });
}

export { processOutbox } from './outbox.js';
export { runReminderScan } from './reminders.js';
export { handleInboundMessage } from './conversations.js';
export { isWhatsAppEnabled, isWhatsAppConfigured, getWhatsAppPublicConfig } from './config.js';
