import { FLOW_STEPS } from './assessmentProgress.js';
import { calcProfileCompletion, normalizeProfile } from './profile.js';

export function isAssessmentComplete(assessment) {
  if (!assessment || assessment.status !== 'paid') return false;
  const p = assessment.progress || {};
  if (p.step === FLOW_STEPS.COMPLETE || p.completedAt) return true;
  const slug = assessment.product_slug || 'dmit';
  if (slug === 'dmit' && p.fingerprintDone) return true;
  if (slug === 'crp-test' && p.communityJoined) return true;
  return false;
}

export function summarizeUserAssessments(assessments = []) {
  const paid = assessments.filter((a) => a.status === 'paid');
  const completed = paid.filter(isAssessmentComplete);
  const pendingPayment = assessments.some((a) => a.status === 'pending_payment');
  return {
    assessmentsBooked: assessments.length,
    paidTests: paid.length,
    completedTests: completed.length,
    pendingPayment,
    hasCompletedTest: completed.length > 0,
    hasPaidTest: paid.length > 0,
  };
}

export function isPendingUser(user, activitySummary, consultations = 0) {
  const profile = normalizeProfile(user.profile);
  const completion = calcProfileCompletion(user, {
    paidTests: activitySummary.paidTests,
    consultations,
  });
  if (profile.setupComplete || completion >= 80) {
    return activitySummary.pendingPayment;
  }
  return true;
}

export const CLASS_FILTER_OPTIONS = [
  'Class 1-5',
  'Class 6-8',
  'Class 9-10',
  'Class 11-12',
  'College Students',
  'Working Professionals',
];
