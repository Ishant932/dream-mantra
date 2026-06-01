import { getModuleBySlug, hasSkillMappingTests } from '../data/moduleCatalog';
import { PROCESS_TAB_ORDER } from '../data/processGuides';
import { FLOW_STEPS } from '../data/assessmentFlows';

/** Paid and admin- or gateway-confirmed */
export function isAssessmentUnlocked(assessment) {
  if (!assessment) return false;
  if (assessment.payment_confirmed === true) return true;
  if (assessment.payment_status === 'confirmed') return true;
  // Legacy rows: paid status + test link (payment row may be missing in old data)
  if (assessment.status === 'paid' && assessment.test_link) return true;
  return false;
}

export function resolveAssessmentSlug(assessment) {
  if (!assessment) return null;
  if (assessment.product_slug) return assessment.product_slug;
  const t = (assessment.type || '').toLowerCase();
  if (t.includes('mind') && t.includes('skill')) return 'dmit-psychometric';
  if (t.includes('mind mapping') || t.includes('dmit')) return 'dmit';
  if (t.includes('skill mapping') || t.includes('psychometric')) return 'psychometric';
  if (t.includes('launchpad') || t.includes('crp') || t.includes('ai career')) return 'crp-test';
  if (t.includes('counselling') && t.includes('additional')) return 'counselling-topup';
  if (assessment.product_slug === 'counselling-topup') return 'counselling-topup';
  return null;
}

export function getConfirmedPaidAssessments(assessments = []) {
  return assessments.filter(isAssessmentUnlocked);
}

export function getOwnedModuleSlugs(assessments = []) {
  const slugs = new Set();
  for (const a of assessments) {
    const slug = resolveAssessmentSlug(a);
    if (!slug) continue;
    if (isAssessmentUnlocked(a)) slugs.add(slug);
  }
  return slugs;
}

/** Slugs hidden from the shop catalog — purchased or already in checkout */
export function getBlockedCatalogSlugs(assessments = []) {
  const slugs = getOwnedModuleSlugs(assessments);
  for (const a of assessments) {
    const slug = resolveAssessmentSlug(a);
    if (!slug) continue;
    // Top-up can be purchased again after a session is used
    if (slug === 'counselling-topup') {
      if (a.status === 'pending_payment') slugs.add(slug);
      continue;
    }
    if (a.status === 'pending_payment') slugs.add(slug);
  }
  // Combo not offered if user already has Mind Mapping or Skill Mapping
  const hasSingleModule = ['dmit', 'psychometric'].some((s) => slugs.has(s));
  if (hasSingleModule) slugs.add('dmit-psychometric');
  const hasPendingTopup = assessments.some(
    (a) => resolveAssessmentSlug(a) === 'counselling-topup' && a.status === 'pending_payment'
  );
  if (!hasPendingTopup) slugs.delete('counselling-topup');
  return slugs;
}

/** User booked at least one counselling slot (non-cancelled) */
export function hasPriorCounsellingBooking(consultations = []) {
  return consultations.some((c) => c.status !== 'cancelled');
}

function isPaidModuleActionComplete(assessment) {
  if (!isAssessmentUnlocked(assessment)) return false;
  const slug = resolveAssessmentSlug(assessment);
  const p = assessment.progress || {};
  if (!slug || slug === 'counselling-topup') return false;
  if (slug === 'dmit') return !!p.fingerprintDone;
  if (slug === 'dmit-psychometric') {
    return !!p.fingerprintDone && (p.step === FLOW_STEPS.COMPLETE || !!p.completedAt);
  }
  if (slug === 'psychometric') return p.step === FLOW_STEPS.COMPLETE || !!p.completedAt;
  if (slug === 'crp-test') return !!p.communityJoined;
  return p.step === FLOW_STEPS.COMPLETE || !!p.completedAt;
}

/** All confirmed paid modules (except top-up) have finished their assessment steps */
export function hasCompletedAllPaidModuleTests(assessments = []) {
  const paid = getConfirmedPaidAssessments(assessments).filter(
    (a) => resolveAssessmentSlug(a) !== 'counselling-topup'
  );
  if (!paid.length) return false;
  return paid.every(isPaidModuleActionComplete);
}

/** Show ₹999 counselling top-up in shop / booking banner */
export function canShowCounsellingTopUp(assessments = [], consultations = []) {
  return hasPriorCounsellingBooking(consultations) || hasCompletedAllPaidModuleTests(assessments);
}

export function userOwnsModule(assessments, slug) {
  return getOwnedModuleSlugs(assessments).has(slug);
}

function assessmentHasCounselling(assessment) {
  const slug = resolveAssessmentSlug(assessment);
  if (slug === 'counselling-topup') return true;
  const mod = slug ? getModuleBySlug(slug) : null;
  if (mod?.includesCounselling) return true;
  if (assessment.progress?.addCounselling) return true;
  if (assessment.progress?.selection?.addCounselling) return true;
  if (assessment.progress?.selection?.lineItems?.some((li) => li.type === 'counselling')) return true;
  return false;
}

/** Paid modules that unlock slot booking (CRP sessions, counselling top-up, or counselling add-on/combo). */
export function assessmentGrantsSlotBooking(assessment) {
  if (!isAssessmentUnlocked(assessment)) return false;
  const slug = resolveAssessmentSlug(assessment);
  if (slug === 'counselling-topup' || slug === 'crp-test') return true;
  return assessmentHasCounselling(assessment);
}

export function hasCounsellingAccess(assessments = []) {
  return getConfirmedPaidAssessments(assessments).some(assessmentGrantsSlotBooking);
}
export function getProcessGuideIdsForAssessment(assessment) {
  if (!isAssessmentUnlocked(assessment)) return [];
  const slug = resolveAssessmentSlug(assessment);
  if (!slug) return [];
  const ids = [];
  if (['dmit', 'dmit-psychometric'].includes(slug)) ids.push('dmit');
  if (['psychometric', 'dmit-psychometric'].includes(slug)) ids.push('psychometric');
  if (slug === 'crp-test') ids.push('crp-test');
  if (assessmentHasCounselling(assessment)) ids.push('counselling');
  return ids;
}

/** Union of process tabs across all confirmed purchases */
export function getAvailableProcessGuideTabs(assessments = []) {
  const ids = new Set();
  for (const a of getConfirmedPaidAssessments(assessments)) {
    getProcessGuideIdsForAssessment(a).forEach((id) => ids.add(id));
  }
  return PROCESS_TAB_ORDER.filter((id) => ids.has(id));
}

export function hasMindMappingAccess(assessments = []) {
  return getConfirmedPaidAssessments(assessments).some((a) =>
    ['dmit', 'dmit-psychometric'].includes(resolveAssessmentSlug(a))
  );
}

export function hasSkillMappingAccess(assessments = []) {
  return getConfirmedPaidAssessments(assessments).some((a) =>
    hasSkillMappingTests(resolveAssessmentSlug(a))
  );
}

export function hasQuestionnaireAccess(assessments = []) {
  return hasSkillMappingAccess(assessments);
}

/** Whether checkout / purchase includes a counselling session */
export function purchaseIncludesCounselling({ slug, lineItems, addCounselling } = {}) {
  if (slug === 'counselling-topup') return true;
  const mod = slug ? getModuleBySlug(slug) : null;
  if (mod?.includesCounselling) return true;
  if (addCounselling) return true;
  if (lineItems?.some((li) => li.type === 'counselling')) return true;
  return false;
}

export { assessmentHasCounselling };

export function hasCrpAccess(assessments = []) {
  return getConfirmedPaidAssessments(assessments).some((a) => resolveAssessmentSlug(a) === 'crp-test');
}

export function canShowProcessTab(assessments = []) {
  if (getAvailableProcessGuideTabs(assessments).length > 0) return true;
  return getConfirmedPaidAssessments(assessments).some((a) => resolveAssessmentSlug(a));
}
