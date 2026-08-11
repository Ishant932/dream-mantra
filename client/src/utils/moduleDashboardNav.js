import { assessmentGrantsSlotBooking, moduleHasTakeTest, resolveAssessmentSlug } from './moduleAccess';

/** Where to send the user from Book Now → Active modules */
export function getModuleDashboardRoute(assessment, action = 'default') {
  const slug = resolveAssessmentSlug(assessment);
  if (!slug) return { tab: 'assess', hubView: 'active' };

  if (slug === 'counselling-topup') return { tab: 'book' };

  if (slug === 'crp-test') {
    return { tab: 'training', focus: 'launchpad', subtab: action === 'test' ? 'community' : 'journey' };
  }
  if (slug === 'career-readiness') {
    return {
      tab: 'training',
      focus: 'readiness',
      subtab: action === 'book' || action === 'test' ? 'schedule' : 'journey',
    };
  }
  if (slug === 'dmit') {
    return {
      tab: 'counselling',
      focus: 'brain',
      subtab: action === 'test' || action === 'book' ? 'counselling' : 'journey',
    };
  }
  if (slug === 'psychometric') {
    return {
      tab: 'counselling',
      focus: 'skill',
      subtab: action === 'test' ? 'take-test' : 'journey',
    };
  }
  if (slug === 'dmit-psychometric') {
    if (action === 'book') return { tab: 'counselling', focus: 'combo', subtab: 'counselling' };
    if (action === 'test') return { tab: 'counselling', focus: 'combo', subtab: 'take-test' };
    return { tab: 'counselling', focus: 'combo', subtab: 'journey' };
  }
  return { tab: 'assess', hubView: 'active' };
}

export function moduleActionLabel(assessment, action) {
  const slug = resolveAssessmentSlug(assessment);
  if (action === 'test') {
    if (slug === 'crp-test') return 'Community';
    if (slug === 'career-readiness') return 'Schedule Session';
    return 'Take test';
  }
  if (action === 'book') {
    if (slug === 'career-readiness') return 'Schedule Session';
    return 'Book session';
  }
  return 'Open';
}

export function moduleActionFlags(assessment) {
  const slug = resolveAssessmentSlug(assessment);
  const isReadiness = slug === 'career-readiness';
  return {
    showTest: !!(slug && moduleHasTakeTest(slug) && !isReadiness),
    showProcess: slug !== 'counselling-topup',
    showBook: assessmentGrantsSlotBooking(assessment),
  };
}
