import { getData } from './database.js';
import { getConfirmedPaidAssessments } from './moduleAccess.js';
import { resolveAssessmentSlug } from './moduleCatalog.js';
import { MODULE_CATALOG } from './moduleCatalog.js';

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

export function countCounsellingSessionCreditsForUser(userId) {
  const data = getData();
  const assessments = (data.assessments || []).filter((a) => a.user_id === Number(userId));
  let credits = 0;
  for (const a of getConfirmedPaidAssessments(assessments)) {
    const slug = resolveAssessmentSlug(a);
    if (slug === 'counselling-topup') credits += 1;
    else if (assessmentHasCounselling(a)) credits += 1;
  }
  return credits;
}

export function countUsedCounsellingBookingsForUser(userId) {
  const data = getData();
  return (data.consultations || []).filter(
    (c) => c.user_id === Number(userId)
      && c.status !== 'cancelled'
      && (!c.booking_type || c.booking_type === 'counselling'),
  ).length;
}

export function getRemainingCounsellingCredits(userId) {
  return Math.max(
    0,
    countCounsellingSessionCreditsForUser(userId) - countUsedCounsellingBookingsForUser(userId),
  );
}

export function assertCanBookCounsellingSession(userId) {
  const remaining = getRemainingCounsellingCredits(userId);
  if (remaining <= 0) {
    throw new Error(
      'You have used your counselling session credit. Purchase an Additional Counselling Session from Modules, then book your slot.',
    );
  }
}
