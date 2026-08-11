import { getData, saveData } from '../database.js';
import { isProfileIncomplete } from '../profile.js';
import { siteUrl } from './config.js';
import { userMayReceiveWhatsApp } from './phone.js';
import { queueFromTemplate, hasRecentOutbox } from './outbox.js';
import { isAssessmentFullyPaid } from '../paymentService.js';
import {
  getConfirmedPaidAssessments,
  getUserJourneyStatus,
  hasCompletedAllPaidModuleTests,
  isPaidModuleActionComplete,
  journeyProgressPercent,
} from '../moduleAccess.js';

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

    const age = hoursSince(assessment.created_at || assessment.updated_at);
    if (age < 6) continue;
    const trigger = age >= 24 ? 'payment_reminder_24h' : 'payment_reminder_6h';
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
    if (!isAssessmentFullyPaid(assessment)) continue;
    if (isPaidModuleActionComplete(assessment)) continue;
    if (hoursSince(assessment.paid_at || assessment.updated_at) < 48) continue;

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

/** Periodic journey status for users with paid modules still in progress */
export function scanJourneyStatusReminders() {
  const data = getData();
  const users = data.users || [];
  let queued = 0;

  for (const user of users) {
    if (user.role !== 'user') continue;
    if (!userMayReceiveWhatsApp(user)) continue;

    const assessments = (data.assessments || []).filter((a) => Number(a.user_id) === Number(user.id));
    const paid = getConfirmedPaidAssessments(assessments).filter(
      (a) => String(a.product_slug || '').toLowerCase() !== 'counselling-topup'
    );
    if (!paid.length) continue;
    if (hasCompletedAllPaidModuleTests(assessments)) continue;
    if (hoursSince(user.created_at) < 24) continue;
    if (hasRecentOutbox(user.id, 'journey_status', 72)) continue;

    const row = queueFromTemplate('journey_status', user, {
      statusSummary: getUserJourneyStatus(user, assessments),
      progressPercent: journeyProgressPercent(user, assessments),
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

export function scanReadinessScheduleReminders() {
  const data = getData();
  const users = data.users || [];
  let queued = 0;

  for (const assessment of data.assessments || []) {
    if (assessment.status !== 'paid' && assessment.payment_status !== 'confirmed' && assessment.payment_confirmed !== true) continue;
    const slug = String(assessment.product_slug || '').toLowerCase();
    if (slug !== 'career-readiness') continue;
    if (hoursSince(assessment.paid_at || assessment.updated_at) < 48) continue;

    const progress = assessment.progress || {};
    const sessionsBooked = Number(progress.sessionsBooked || progress.programSessionsBooked || 0);
    if (sessionsBooked >= 8) continue;

    const user = users.find((u) => Number(u.id) === Number(assessment.user_id));
    if (!userMayReceiveWhatsApp(user)) continue;
    if (hasRecentOutbox(user.id, 'career_readiness_schedule_reminder', 72)) continue;

    const row = queueFromTemplate('career_readiness_schedule_reminder', user);
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
    journey: scanJourneyStatusReminders(),
    readiness: scanReadinessScheduleReminders(),
  };
}
