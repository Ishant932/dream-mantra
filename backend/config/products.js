/** Assessment products — prices in INR */
export const COUNSELLING_ADDON_PRICE = 699;

export const PRODUCTS = {
  dmit: {
    slug: 'dmit',
    title: 'Brain Mapping',
    price: 1999,
    optionalCounselling: true,
    testPath: '/dashboard/test/dmit',
    description: 'Fingerprint-based inborn talent mapping — learning styles, memory patterns & natural aptitudes.',
  },
  psychometric: {
    slug: 'psychometric',
    title: 'Skill Mapping',
    price: 699,
    optionalCounselling: true,
    testPath: '/dashboard/test/psychometric',
    description: 'MBTI, DISC, RIASEC, Big 5, VAK & multiple frameworks for personality & career fit.',
  },
  'dmit-psychometric': {
    slug: 'dmit-psychometric',
    title: 'Brain + Skill Mapping',
    price: 2999,
    includesCounselling: true,
    testPath: '/dashboard/test/dmit-psychometric',
    description: 'Complete nature + nurture profile with expert counselling session included.',
  },
  'crp-test': {
    slug: 'crp-test',
    title: 'AI Career Launchpad',
    price: 1499,
    testPath: '/dashboard/test/crp-test',
    description: '5-session AI-powered career training for college students & freshers.',
  },
  'counselling-topup': {
    slug: 'counselling-topup',
    title: 'Additional Counselling Session',
    price: 999,
    includesCounselling: true,
    testPath: '/dashboard?tab=book',
    description: 'Extra 1-on-1 counselling session after your first booking.',
  },
};

export function getProduct(slugOrType) {
  const key = Object.keys(PRODUCTS).find(
    (k) => k === slugOrType || PRODUCTS[k].title === slugOrType || PRODUCTS[k].slug === slugOrType
  );
  return key ? PRODUCTS[key] : PRODUCTS.dmit;
}
