import { getData, saveData } from './database.js';
import { normalizeProfile } from './profile.js';
import { isAssessmentFullyPaid } from './paymentService.js';
import {
  normalizeSkillMappingBand,
  requiresSkillMappingBand,
  resolveAssessmentSlug,
} from './moduleCatalog.js';
import {
  hasCompletedAllPaidModuleTests,
  isPaidModuleActionComplete,
} from './moduleAccess.js';
import {
  onAssessmentTestCompleted,
  onAllTestsCompleted,
  onJourneyStatusUpdate,
} from './whatsapp/events.js';

import { getCommunityLink } from './siteSettings.js';

export const FLOW_STEPS = {
  CLASS: 'class_select',
  PROCESS: 'process',
  QUESTIONNAIRE: 'questionnaire',
  FINGERPRINT: 'fingerprint',
  COMMUNITY: 'community',
  COMPLETE: 'complete',
};

export function getAssessmentFlow(assessmentId, userId) {
  const data = getData();
  const assessment = data.assessments.find((a) => a.id === Number(assessmentId));
  if (!assessment || assessment.user_id !== userId) return null;

  const user = data.users.find((u) => u.id === userId);
  const profile = normalizeProfile(user?.profile);

  const slug = assessment.product_slug || 'dmit';
  return {
    assessment: {
      id: assessment.id,
      product_slug: slug,
      type: assessment.type,
      status: assessment.status,
      progress: assessment.progress || null,
    },
    profileClassLevel: profile.classLevel || null,
    communityLink: slug === 'crp-test' ? getCommunityLink('crp-test', new Date(), user?.created_at) : null,
  };
}

export function updateAssessmentFlow(assessmentId, userId, patch) {
  const data = getData();
  const assessment = data.assessments.find((a) => a.id === Number(assessmentId));
  if (!assessment || assessment.user_id !== userId) {
    throw new Error('Assessment not found');
  }
  if (!isAssessmentFullyPaid(assessment)) {
    throw new Error('Payment required');
  }

  const progress = {
    ...(assessment.progress || {}),
    updated_at: new Date().toISOString(),
  };

  if (patch.classLevel) progress.classLevel = patch.classLevel;
  if (patch.step) progress.step = patch.step;
  if (patch.processComplete === true) progress.processComplete = true;
  if (patch.fingerprintDone === true) progress.fingerprintDone = true;
  if (patch.communityJoined === true) progress.communityJoined = true;
  if (patch.answers) {
    progress.answers = { ...(progress.answers || {}), ...patch.answers };
  }
  if (patch.skillTestProgress && typeof patch.skillTestProgress === 'object') {
    progress.skillTestProgress = patch.skillTestProgress;
  }
  if (patch.testsDone === true) progress.testsDone = true;
  if (patch.completedAt) progress.completedAt = patch.completedAt;

  if (patch.skillMappingBand !== undefined) {
    const band = normalizeSkillMappingBand(patch.skillMappingBand);
    if (!band) throw new Error('Invalid class band selected');
    if (!requiresSkillMappingBand(resolveAssessmentSlug(assessment))) {
      throw new Error('This module does not use class bands');
    }
    if (progress.skillMappingBand && progress.skillMappingBand !== band) {
      throw new Error('Class band is already set for this purchase');
    }
    if (!progress.skillMappingBand) progress.skillMappingBand = band;
  }

  assessment.progress = progress;

  if (patch.classLevel) {
    const user = data.users.find((u) => u.id === userId);
    if (user) {
      user.profile = normalizeProfile(user.profile);
      if (!user.profile.classLevel) {
        user.profile.classLevel = patch.classLevel;
      }
    }
  }

  if (patch.step === FLOW_STEPS.COMPLETE) {
    progress.completedAt = progress.completedAt || new Date().toISOString();
  }

  const userAssessments = data.assessments.filter((a) => Number(a.user_id) === Number(userId));
  const wasModuleComplete = isPaidModuleActionComplete(assessment);
  const wasAllComplete = hasCompletedAllPaidModuleTests(userAssessments);

  saveData();

  const freshAssessment = data.assessments.find((a) => a.id === Number(assessmentId));
  const freshUser = data.users.find((u) => u.id === userId);
  const freshAssessments = data.assessments.filter((a) => Number(a.user_id) === Number(userId));
  const isModuleComplete = isPaidModuleActionComplete(freshAssessment);
  const isAllComplete = hasCompletedAllPaidModuleTests(freshAssessments);

  if (freshUser && freshAssessment) {
    const progressChanged = patch.step || patch.fingerprintDone || patch.communityJoined
      || patch.processComplete || patch.completedAt;
    if (!wasModuleComplete && isModuleComplete && !isAllComplete) {
      onAssessmentTestCompleted(freshUser, freshAssessment, freshAssessments);
    } else if (progressChanged && !isAllComplete) {
      onJourneyStatusUpdate(freshUser, freshAssessments);
    }
    if (!wasAllComplete && isAllComplete) {
      onAllTestsCompleted(freshUser, freshAssessments);
    }
  }

  return getAssessmentFlow(assessmentId, userId);
}
