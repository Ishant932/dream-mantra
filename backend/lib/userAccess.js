import { getData } from './database.js';
import { isAssessmentFullyPaid } from './paymentService.js';
import { MODULE_CATALOG } from './moduleCatalog.js';

function resolveAssessmentSlug(assessment) {
  if (!assessment) return null;
  if (assessment.product_slug) return assessment.product_slug;
  const t = (assessment.type || '').toLowerCase();
  if (t.includes('mind') && t.includes('skill')) return 'dmit-psychometric';
  if (t.includes('mind mapping') || t.includes('dmit')) return 'dmit';
  if (t.includes('skill mapping') || t.includes('psychometric')) return 'psychometric';
  if (t.includes('launchpad') || t.includes('crp') || t.includes('ai career')) return 'crp-test';
  if (t.includes('counselling') && t.includes('additional')) return 'counselling-topup';
  return null;
}

function assessmentHasCounselling(assessment) {
  const slug = resolveAssessmentSlug(assessment);
  if (slug === 'counselling-topup') return true;
  const mod = MODULE_CATALOG.find((m) => m.slug === slug);
  if (mod?.includesCounselling) return true;
  if (assessment.progress?.addCounselling) return true;
  if (assessment.progress?.selection?.addCounselling) return true;
  if (assessment.progress?.selection?.lineItems?.some((li) => li.type === 'counselling')) return true;
  return false;
}

/** Paid modules that unlock the Book tab / slot calendar (CRP, counselling top-up, or counselling add-on/combo). */
function assessmentGrantsSlotBooking(assessment) {
  const slug = resolveAssessmentSlug(assessment);
  if (slug === 'counselling-topup' || slug === 'crp-test') return true;
  return assessmentHasCounselling(assessment);
}

/** User may book counselling slots after purchasing a bookable module. */
export function userHasCounsellingAccess(userId) {
  const data = getData();
  const assessments = (data.assessments || []).filter(
    (a) => a.user_id === Number(userId) && isAssessmentFullyPaid(a)
  );
  return assessments.some(assessmentGrantsSlotBooking);
}
