import { getData, saveData } from '../database.js';
import { isProfileIncomplete } from '../profile.js';
import { siteUrl } from './config.js';
import { userMayReceiveWhatsApp, resolveUserPhone } from './phone.js';
import { queueFromTemplate, hasRecentOutbox, scheduleWhatsAppMessage } from './outbox.js';

const HOUR = 60 * 60 * 1000;

function hoursSince(iso) {
  if (!iso) return Infinity;
  return (Date.now() - new Date(iso).getTime()) / HOUR;
}

function formatSessionDateTime(iso) {
  try {
    const d = new Date(iso);
    return {
      sessionDate: d.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' }),
      sessionTime: d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
    };
  } catch {
    return { sessionDate: 'soon', sessionTime: 'TBD' };
  }
}

export function scanProfileReminders() {
  const users = (getData().users || []).filter((u) => u.role === 'user');
  let queued = 0;

  for (const user of users) {
    if (!userMayReceiveWhatsApp(user)) continue;
    if (!isProfileIncomplete(user)) continue;
    if (hoursSince(user.created_at) < 24) continue;
    if (hasRecentOutbox(user.id, 'profile_reminder')) continue;

    const row = queueFromTemplate('profile_reminder', user);
    if (row) queued += 1;
  }
  return queued;
}

export function scanPaymentReminders() {
  const data = getData();
  const users = data.users || [];
  const assessments = data.assessments || [];
  const payments = data.payments || [];
  let queued = 0;

  for (const assessment of assessments) {
    if (assessment.status !== 'pending_payment') continue;
    const user = users.find((u) => Number(u.id) === Number(assessment.user_id));
    if (!userMayReceiveWhatsApp(user)) continue;

    const trigger = age >= 24 ? 'payment_reminder_24h' : 'payment_reminder_6h';
    if (age < 6) continue;
    if (hasRecentOutbox(user.id, trigger)) continue;

    const payload = {
      moduleTitle: assessment.type || assessment.product_slug,
      paymentUrl: `${siteUrl()}/payment/${assessment.id}`,
    };
    const row = queueFromTemplate('payment_reminder', user, payload);
    if (row) {
      row.trigger = trigger;
      saveData();
      queued += 1;
    }

    const pay = payments.find((p) => Number(p.assessment_id) === Number(assessment.id));
    if (pay?.submitted_at && pay.payment_status !== 'confirmed' && hoursSince(pay.submitted_at) >= 12) {
      if (!hasRecentOutbox(user.id, 'payment_proof_pending')) {
        const proofRow = queueFromTemplate('payment_proof_pending', user, {
          moduleTitle: assessment.type,
        });
        if (proofRow) queued += 1;
      }
    }
  }
  return queued;
}

export function scanSessionReminders() {
  const data = getData();
  const users = data.users || [];
  const consultations = (data.consultations || []).filter((c) => c.status !== 'cancelled');
  let queued = 0;
  const now = Date.now();

  for (const c of consultations) {
    if (!c.scheduled_at) continue;
    const scheduled = new Date(c.scheduled_at).getTime();
    const hoursUntil = (scheduled - now) / HOUR;
    if (hoursUntil < 0 || hoursUntil > 25) continue;

    const user = users.find((u) => Number(u.id) === Number(c.user_id));
    if (!userMayReceiveWhatsApp(user)) continue;

    const trigger = hoursUntil <= 1.5 ? 'session_reminder_1h' : 'session_reminder_24h';
    if (hasRecentOutbox(user.id, trigger)) continue;

    const { sessionDate, sessionTime } = formatSessionDateTime(c.scheduled_at);
    const row = queueFromTemplate('session_reminder', user, { sessionDate, sessionTime });
    if (row) {
      row.trigger = trigger;
      saveData();
      queued += 1;
    }
  }
  return queued;
}

export function scanTestReminders() {
  const data = getData();
  const users = data.users || [];
  let queued = 0;

  for (const assessment of data.assessments || []) {
    if (assessment.status !== 'paid') continue;
    const progress = assessment.progress || {};
    const flow = progress.flow || {};
    if (flow.testStarted || flow.testCompleted) continue;
    if (hoursSince(assessment.paid_at) < 48) continue;

    const user = users.find((u) => Number(u.id) === Number(assessment.user_id));
    if (!userMayReceiveWhatsApp(user)) continue;
    if (hasRecentOutbox(user.id, 'test_reminder')) continue;

    const row = queueFromTemplate('test_reminder', user, {
      moduleTitle: assessment.type || assessment.product_slug,
    });
    if (row) queued += 1;
  }
  return queued;
}

export function scanCommunityReminders() {
  const data = getData();
  const users = data.users || [];
  let queued = 0;

  for (const assessment of data.assessments || []) {
    if (assessment.status !== 'paid') continue;
    const slug = String(assessment.product_slug || '').toLowerCase();
    if (!slug.includes('crp') && !slug.includes('launchpad')) continue;

    const progress = assessment.progress || {};
    if (progress.communityJoined || progress.flow?.communityDone) continue;
    if (hoursSince(assessment.paid_at) < 24) continue;

    const user = users.find((u) => Number(u.id) === Number(assessment.user_id));
    if (!userMayReceiveWhatsApp(user)) continue;
    if (hasRecentOutbox(user.id, 'community_invite')) continue;

    const row = queueFromTemplate('community_invite', user);
    if (row) queued += 1;
  }
  return queued;
}

export function runReminderScan() {
  return {
    profile: scanProfileReminders(),
    payment: scanPaymentReminders(),
    session: scanSessionReminders(),
    test: scanTestReminders(),
    community: scanCommunityReminders(),
  };
}
