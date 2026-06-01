import { getData } from './database.js';
import { calcProfileCompletion, normalizeProfile } from './profile.js';
import { listReportsForUser } from './reports.js';
import { FLOW_STEPS } from './assessmentProgress.js';

import { isAssessmentFullyPaid } from './paymentService.js';

function primaryPaidAssessment(assessments) {
  return (assessments || [])
    .filter((a) => isAssessmentFullyPaid(a))
    .sort((a, b) => new Date(b.paid_at || b.created_at) - new Date(a.paid_at || a.created_at))[0] || null;
}

function step5Done(slug, progress = {}) {
  if (!slug) return false;
  if (slug === 'dmit') return !!progress.fingerprintDone;
  if (slug === 'dmit-psychometric') return !!progress.fingerprintDone;
  if (slug === 'psychometric') return progress.step === FLOW_STEPS.COMPLETE;
  if (slug === 'crp-test') return !!progress.communityJoined;
  return progress.step === FLOW_STEPS.COMPLETE;
}

function step4Done(progress = {}) {
  const s = progress.step;
  return (
    !!progress.processComplete ||
    s === FLOW_STEPS.QUESTIONNAIRE ||
    s === FLOW_STEPS.FINGERPRINT ||
    s === FLOW_STEPS.COMMUNITY ||
    s === FLOW_STEPS.COMPLETE
  );
}

export function getCareerPathForUser(userId) {
  const data = getData();
  const user = data.users.find((u) => u.id === Number(userId));
  if (!user) return null;

  const profile = normalizeProfile(user.profile);
  const assessments = (data.assessments || []).filter((a) => a.user_id === Number(userId));
  const consultations = (data.consultations || []).filter((c) => c.user_id === Number(userId));
  const paidTests = assessments.filter((a) => isAssessmentFullyPaid(a)).length;
  const profileCompletion = calcProfileCompletion(user, {
    paidTests,
    consultations: consultations.length,
  });

  const paid = primaryPaidAssessment(assessments);
  const progress = paid?.progress || {};
  const slug = paid?.product_slug || null;
  const reports = listReportsForUser(userId);
  const hasReport =
    reports.some((r) => r.report_link) ||
    assessments.some((a) => a.status === 'paid' && a.report_link);

  const hasBooking = consultations.length > 0;

  const steps = [
    { id: 'profile', done: profileCompletion >= 80 || profile.setupComplete },
    { id: 'book', done: assessments.length > 0 },
    { id: 'payment', done: paidTests > 0 },
    { id: 'process', done: paid ? step4Done(progress) : false },
    { id: 'product_action', done: paid ? step5Done(slug, progress) : false },
    { id: 'report', done: hasReport },
    { id: 'book_counselling', done: hasBooking },
  ];

  const currentStep = steps.find((s) => !s.done)?.id || 'book_counselling';
  const completedCount = steps.filter((s) => s.done).length;

  return {
    steps,
    currentStep,
    completedCount,
    totalSteps: steps.length,
    progressPct: Math.round((completedCount / steps.length) * 100),
    activeAssessment: paid
      ? {
          id: paid.id,
          product_slug: paid.product_slug,
          type: paid.type,
          test_link: paid.test_link,
          progress,
        }
      : null,
    pendingPayment: assessments.find(
      (a) => a.status === 'pending_payment' && !isAssessmentFullyPaid(a)
    ) || null,
    productSlug: slug,
  };
}
