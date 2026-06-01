import { getModuleBySlug } from '../data/moduleCatalog';
import { resolveAssessmentSlug } from './moduleAccess';

export function getAssessmentDisplayTitle(assessment) {
  if (!assessment) return 'Module';
  const stored = assessment.progress?.selection?.displayTitle;
  if (stored) return stored;
  const slug = resolveAssessmentSlug(assessment);
  return getModuleBySlug(slug)?.title || assessment.type || 'Module';
}

export function getPaymentDisplayTitle(payment, linkedAssessment) {
  if (linkedAssessment) return getAssessmentDisplayTitle(linkedAssessment);
  return payment?.product_title || 'Module';
}

export function getPaymentLineItemsSummary(assessment) {
  const items = assessment?.progress?.selection?.lineItems;
  if (!items?.length) return null;
  return items.map((li) => li.label).join(' · ');
}

function assessmentPriority(assessment) {
  if (assessment.payment_confirmed === true) return 3;
  if (assessment.status === 'paid') return 2;
  if (assessment.status === 'pending_payment') return 1;
  return 0;
}

/** Keep one assessment per product slug — prefer confirmed, then newest */
export function dedupeAssessmentsBySlug(assessments = []) {
  const map = new Map();
  for (const a of assessments) {
    const slug = resolveAssessmentSlug(a) || String(a.id);
    const prev = map.get(slug);
    if (!prev) {
      map.set(slug, a);
      continue;
    }
    const pa = assessmentPriority(a);
    const pp = assessmentPriority(prev);
    if (pa > pp || (pa === pp && new Date(a.created_at) > new Date(prev.created_at))) {
      map.set(slug, a);
    }
  }
  return [...map.values()].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

import { isAssessmentUnlocked } from './moduleAccess';

export function canCancelAssessment(assessment) {
  if (!assessment) return false;
  if (isAssessmentUnlocked(assessment)) return false;
  if (assessment.status === 'pending_payment') return true;
  if (assessment.payment_status === 'pending' || assessment.payment_status === 'failed') return true;
  if (['requested', 'created'].includes(assessment.status)) return true;
  return false;
}
