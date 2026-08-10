const COUNSELLING_ASSESSMENT_TABS = {
  dmit: 'dmit',
  psychometric: 'psychometric',
  'dmit-psychometric': 'combo',
  combo: 'combo',
  'why-dreams-mantra': 'why',
  why: 'why',
};

/** Maps assessment slugs to in-hub counselling tabs */
export function counsellingAssessmentPath(slug) {
  const tab = COUNSELLING_ASSESSMENT_TABS[slug];
  if (!tab) return null;
  return `/counselling?tab=${tab}`;
}

export function assessmentPath(slug) {
  if (!slug) return '/counselling';
  return counsellingAssessmentPath(slug) || `/assessments/${slug}`;
}

export function programPageForSlug(slug) {
  if (!slug) return '/marketplace';
  const counselling = counsellingAssessmentPath(slug);
  if (counselling) return counselling;
  if (slug === 'crp-test') return '/crp?tab=launchpad';
  if (slug === 'career-readiness') return '/crp?tab=readiness';
  return '/marketplace';
}

export function programPath(slug) {
  return slug ? `/programs/${slug}` : '/counselling?tab=programs';
}

export function partnerPath(slug) {
  return slug ? `/partner/${slug}` : '/contact';
}

export function careerPath(slug) {
  return slug ? `/careers/${slug}` : '/careers';
}
