import { getData, saveData } from './database.js';
import { isAssessmentFullyPaid } from './paymentService.js';
import {
  normalizeSkillMappingBand,
  requiresSkillMappingBand,
  resolveAssessmentSlug,
} from './moduleCatalog.js';

/** Set skill mapping class band on an assessment (payment page or one-time legacy fix). */
export function setAssessmentSkillMappingBand(assessmentId, userId, bandInput) {
  const data = getData();
  const assessment = data.assessments.find(
    (a) => a.id === Number(assessmentId) && a.user_id === Number(userId)
  );
  if (!assessment) throw new Error('Assessment not found');

  const slug = resolveAssessmentSlug(assessment);
  if (!requiresSkillMappingBand(slug)) {
    throw new Error('This module does not require a class band');
  }

  const band = normalizeSkillMappingBand(bandInput);
  if (!band) {
    throw new Error('Select Class 6–8, Class 9–12, or Adults / Professionals');
  }

  const progress = { ...(assessment.progress || {}) };
  const isPaid = isAssessmentFullyPaid(assessment);

  if (progress.skillMappingBand && progress.skillMappingBand !== band) {
    if (isPaid) {
      throw new Error('Class band is already set for this purchase');
    }
  }

  progress.skillMappingBand = band;
  progress.updated_at = new Date().toISOString();
  assessment.progress = progress;
  saveData();
  return assessment;
}
