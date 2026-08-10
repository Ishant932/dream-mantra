export const STUDIO_LANDINGS = [
  { slug: 'counselling', label: 'Counselling', productSlug: 'dmit-psychometric' },
  { slug: 'brain-mapping', label: 'Brain Mapping', productSlug: 'dmit' },
  { slug: 'skill-mapping', label: 'Skill Mapping', productSlug: 'psychometric' },
  { slug: 'training-and-placement', label: 'Training & Placement', productSlug: 'career-readiness' },
];

export function studioLandingPath(slug) {
  return `/studio/${slug}/`;
}

export function studioLandingOrigin() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return window.location.origin;
    }
  }
  return 'https://dreammantra.in';
}

export function studioLandingUrl(slug) {
  return `${studioLandingOrigin()}/studio/${slug}/`;
}

export function studioLandingLocalUrl(slug) {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/studio/${slug}/`;
  }
  return `http://localhost:5174/studio/${slug}/`;
}

export function studioLandingProductionUrl(slug) {
  return `https://dreammantra.in/studio/${slug}/`;
}
