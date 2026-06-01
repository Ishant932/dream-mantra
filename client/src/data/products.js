export const PRODUCTS = {
  dmit: {
    slug: 'dmit',
    title: 'Mind Mapping',
    price: 1999,
    optionalCounselling: true,
    testPath: '/dashboard/test/dmit',
    description: 'Fingerprint-based inborn talent mapping',
  },
  psychometric: {
    slug: 'psychometric',
    title: 'Skill Mapping',
    price: 699,
    optionalCounselling: true,
    testPath: '/dashboard/test/psychometric',
    description: 'MBTI, DISC, RIASEC & 7 frameworks',
  },
  'dmit-psychometric': {
    slug: 'dmit-psychometric',
    title: 'Mind + Skill + Counselling',
    price: 2999,
    includesCounselling: true,
    testPath: '/dashboard/test/dmit-psychometric',
    description: 'Complete Mind Mapping + Skill Mapping with expert counselling',
  },
  'crp-test': {
    slug: 'crp-test',
    title: 'AI Career Launchpad Training',
    price: 1499,
    testPath: '/dashboard/test/crp-test',
    description: 'Career readiness for college & freshers',
  },
};

export const COUNSELLING_ADDON_PRICE = 699;
