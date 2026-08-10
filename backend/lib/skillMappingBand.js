import { getData, saveData } from './database.js';
import { isAssessmentFullyPaid } from './paymentService.js';
import {
  normalizeSkillMappingBand,
  requiresSkillMappingBand,
  resolveAssessmentSlug,
} from './moduleCatalog.js';
import { getSkillMappingCombo } from './skillMappingCombos.js';
import { normalizeInstrumentIds } from './skillMappingInstruments.js';

/** Set agewise combo on assessment (payment / checkout). */
export function setAssessmentSkillMappingCombo(assessmentId, userId, comboId) {
  const data = getData();
  const assessment = data.assessments.find(
    (a) => a.id === Number(assessmentId) && a.user_id === Number(userId),
  );
  if (!assessment) throw new Error('Assessment not found');

  const slug = resolveAssessmentSlug(assessment);
  if (!requiresSkillMappingBand(slug)) {
    throw new Error('This module does not require a test combo');
  }

  const combo = getSkillMappingCombo(comboId);
  if (!combo || combo.active === false) {
    throw new Error('Select a valid agewise bifurcation combo');
  }

  const progress = { ...(assessment.progress || {}) };
  const isPaid = isAssessmentFullyPaid(assessment);

  if (progress.skillMappingComboId && progress.skillMappingComboId !== combo.id) {
    if (isPaid) throw new Error('Test combo is already set for this purchase');
  }

  progress.skillMappingComboId = combo.id;
  progress.skillMappingComboName = combo.name;
  progress.skillMappingInstruments = normalizeInstrumentIds(combo.instruments);
  progress.skillMappingBand = combo.id;
  progress.updated_at = new Date().toISOString();
  assessment.progress = progress;
  saveData();
  return assessment;
}

/** @deprecated use setAssessmentSkillMappingCombo — accepts legacy band id or combo id */
export function setAssessmentSkillMappingBand(assessmentId, userId, bandInput) {
  const combo = getSkillMappingCombo(bandInput);
  if (combo) return setAssessmentSkillMappingCombo(assessmentId, userId, combo.id);
  return setAssessmentSkillMappingCombo(assessmentId, userId, bandInput);
}
