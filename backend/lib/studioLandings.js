/** Public URL slugs → Landing Pages folder + checkout module */
export const STUDIO_LANDINGS = [
  { slug: 'counselling', label: 'Counselling', folder: 'Counselling', productSlug: 'dmit-psychometric' },
  { slug: 'brain-mapping', label: 'Brain Mapping', folder: 'Brain Mapping', productSlug: 'dmit' },
  { slug: 'skill-mapping', label: 'Skill Mapping', folder: 'Skill Mapping', productSlug: 'psychometric' },
  { slug: 'training-and-placement', label: 'Training & Placement', folder: 'Training And Placement', productSlug: 'career-readiness' },
];

export function studioSlugForProduct(productSlug) {
  return STUDIO_LANDINGS.find((l) => l.productSlug === productSlug)?.slug || null;
}
