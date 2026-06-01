const DEDICATED_ASSESSMENT_ROUTES = {
  dmit: '/assessments/dmit',
  psychometric: '/assessments/psychometric',
  'dmit-psychometric': '/assessments/dmit-psychometric',
  'why-dreams-mantra': '/assessments/why-dreams-mantra',
};

export function assessmentPath(slug) {
  if (!slug) return '/assessments';
  return DEDICATED_ASSESSMENT_ROUTES[slug] || `/assessments/${slug}`;
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
