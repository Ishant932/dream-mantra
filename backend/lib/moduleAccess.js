/**
 * Module / test completion — mirrors client/src/utils/moduleAccess.js
 */
import { FLOW_STEPS } from './assessmentProgress.js';
import { isAssessmentFullyPaid } from './paymentService.js';
import { resolveAssessmentSlug } from './moduleCatalog.js';
import { normalizeProfile } from './profile.js';

export function isAssessmentUnlocked(assessment) {
  return isAssessmentFullyPaid(assessment);
}

export function getConfirmedPaidAssessments(assessments = []) {
  return assessments.filter(isAssessmentUnlocked);
}

export function isPaidModuleActionComplete(assessment) {
  if (!isAssessmentUnlocked(assessment)) return false;
  const slug = resolveAssessmentSlug(assessment);
  const p = assessment.progress || {};
  if (!slug || slug === 'counselling-topup') return false;
  if (slug === 'dmit') return !!p.fingerprintDone;
  if (slug === 'dmit-psychometric') {
    return !!p.fingerprintDone && (p.step === FLOW_STEPS.COMPLETE || !!p.completedAt);
  }
  if (slug === 'psychometric') {
    const tests = p.skillTestProgress;
    if (tests && typeof tests === 'object') {
      const vals = Object.values(tests);
      if (vals.length && vals.every((t) => t?.status === 'completed')) return true;
    }
    return p.step === FLOW_STEPS.COMPLETE || !!p.completedAt || !!p.testsDone;
  }
  if (slug === 'crp-test') return !!p.communityJoined;
  return p.step === FLOW_STEPS.COMPLETE || !!p.completedAt;
}

/** All confirmed paid modules (except top-up) finished their assessment steps */
export function hasCompletedAllPaidModuleTests(assessments = []) {
  const paid = getConfirmedPaidAssessments(assessments).filter(
    (a) => resolveAssessmentSlug(a) !== 'counselling-topup'
  );
  if (!paid.length) return false;
  return paid.every(isPaidModuleActionComplete);
}

export function getUserJourneyStatus(user, assessments = []) {
  const profile = normalizeProfile(user?.profile);
  const paid = getConfirmedPaidAssessments(assessments).filter(
    (a) => resolveAssessmentSlug(a) !== 'counselling-topup'
  );
  const completed = paid.filter(isPaidModuleActionComplete);
  const lines = [];

  lines.push(profile.setupComplete ? 'Profile: complete' : 'Profile: incomplete');

  if (!paid.length) {
    lines.push('Modules: none paid yet');
    return lines.join(' | ');
  }

  lines.push(`Tests: ${completed.length}/${paid.length} modules done`);

  for (const a of paid) {
    const title = a.type || resolveAssessmentSlug(a) || 'Module';
    lines.push(`${title}: ${isPaidModuleActionComplete(a) ? 'Complete' : 'In progress'}`);
  }

  return lines.join(' | ');
}

export function journeyProgressPercent(user, assessments = []) {
  const profile = normalizeProfile(user?.profile);
  const paid = getConfirmedPaidAssessments(assessments).filter(
    (a) => resolveAssessmentSlug(a) !== 'counselling-topup'
  );
  if (!paid.length) return profile.setupComplete ? 35 : 15;
  const completed = paid.filter(isPaidModuleActionComplete).length;
  const base = profile.setupComplete ? 25 : 10;
  const testShare = Math.round((completed / paid.length) * 65);
  return Math.min(100, base + testShare);
}
