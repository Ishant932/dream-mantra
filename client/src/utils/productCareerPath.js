import { FLOW_STEPS } from '../data/assessmentFlows';
import { isAssessmentUnlocked, resolveAssessmentSlug } from './moduleAccess';

function step5Done(slug, progress = {}) {
  if (!slug) return false;
  if (slug === 'dmit') return !!progress.fingerprintDone;
  if (slug === 'career-readiness') return !!progress.fingerprintDone || !!progress.processComplete;
  if (slug === 'psychometric') return progress.step === FLOW_STEPS.COMPLETE || !!progress.completedAt;
  if (slug === 'crp-test') return !!progress.communityJoined;
  return progress.step === FLOW_STEPS.COMPLETE || !!progress.completedAt;
}

function step4Done(progress = {}) {
  const s = progress.step;
  return (
    !!progress.processComplete
    || s === FLOW_STEPS.QUESTIONNAIRE
    || s === FLOW_STEPS.FINGERPRINT
    || s === FLOW_STEPS.COMMUNITY
    || s === FLOW_STEPS.COMPLETE
  );
}

const FOCUS_SLUG_MAP = {
  brain: 'dmit',
  skill: 'psychometric',
  combo: 'dmit-psychometric',
  counselling: 'counselling-topup',
  launchpad: 'crp-test',
  readiness: 'career-readiness',
};

export function slugForCounsellingFocus(focus) {
  return FOCUS_SLUG_MAP[focus] || 'dmit';
}

export function slugForTrainingFocus(focus) {
  return focus === 'readiness' ? 'career-readiness' : 'crp-test';
}

export function findAssessmentForSlug(assessments = [], slug) {
  if (!slug) return null;
  if (slug === 'counselling-topup') {
    return (assessments || []).find((a) => {
      const s = resolveAssessmentSlug(a);
      return s === 'counselling-topup' || s === 'dmit-psychometric' || s === 'career-readiness' || s === 'dmit' || s === 'psychometric';
    });
  }
  return (assessments || []).find((a) => resolveAssessmentSlug(a) === slug);
}

/** Product-scoped journey steps — same shape as API careerPath for JourneyProgressBox */
export function buildProductCareerPath(data, productSlug, { profileCompletion = 0, profile = {} } = {}) {
  const assessments = data?.assessments || [];
  const consultations = data?.consultations || [];
  const reports = data?.reports || [];
  const assessment = findAssessmentForSlug(assessments, productSlug);
  const paid = assessment && isAssessmentUnlocked(assessment) ? assessment : null;
  const progress = paid?.progress || {};
  const slug = paid ? resolveAssessmentSlug(paid) : productSlug;

  const hasReport =
    reports.some((r) => r.report_link && (r.product_slug === slug || !r.product_slug))
    || assessments.some((a) => resolveAssessmentSlug(a) === slug && a.report_link);

  const hasBooking = consultations.some((c) => c.status !== 'cancelled');

  const steps = [
    { id: 'profile', done: profileCompletion >= 80 || profile.setupComplete },
    { id: 'book', done: assessments.some((a) => resolveAssessmentSlug(a) === productSlug) },
    { id: 'payment', done: paid != null },
    { id: 'process', done: paid ? step4Done(progress) : false },
    { id: 'product_action', done: paid ? step5Done(slug, progress) : false },
    { id: 'report', done: hasReport },
    { id: 'book_counselling', done: hasBooking },
  ];

  const pendingPayment = assessments.find(
    (a) => resolveAssessmentSlug(a) === productSlug && a.status === 'pending_payment' && !isAssessmentUnlocked(a),
  );

  return {
    steps,
    productSlug: slug,
    activeAssessment: paid,
    pendingPayment,
    progressPct: Math.round((steps.filter((s) => s.done).length / steps.length) * 100),
  };
}

export function hasPaidAccessForSlug(assessments = [], slug) {
  const a = findAssessmentForSlug(assessments, slug);
  return a && isAssessmentUnlocked(a);
}
