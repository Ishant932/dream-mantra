/** Dashboard module catalog — prices, external test links, Jaipur centres */

export const COUNSELLING_ADDON_PRICE = 699;
export const COUNSELLING_TOPUP_PRICE = 999;

export const DEFAULT_COUNSELLING_ADDON = {
  title: 'Counselling session',
  price: COUNSELLING_ADDON_PRICE,
  description: 'Add a 1-on-1 session with our certified counsellor',
};

export function resolveCounsellingAddon(mod) {
  if (!mod) return { ...DEFAULT_COUNSELLING_ADDON };
  const raw = mod.counsellingAddon || {};
  return {
    title: String(raw.title || DEFAULT_COUNSELLING_ADDON.title).trim(),
    price: Math.max(0, Number(raw.price ?? DEFAULT_COUNSELLING_ADDON.price)),
    description: String(raw.description || DEFAULT_COUNSELLING_ADDON.description).trim(),
  };
}

export const MODULE_CATALOG = [
  {
    slug: 'dmit',
    title: 'Brain Mapping',
    price: 1999,
    optionalCounselling: true,
    description: 'Fingerprint-based inborn talent mapping — learning styles, memory patterns & natural aptitudes.',
    icon: '🧬',
  },
  {
    slug: 'psychometric',
    title: 'Skill Mapping',
    price: 699,
    optionalCounselling: true,
    description: 'MBTI, DISC, RIASEC, Big 5, VAK & multiple frameworks for personality & career fit.',
    icon: '🧠',
  },
  {
    slug: 'dmit-psychometric',
    title: 'Brain + Skill Mapping',
    price: 2999,
    optionalCounselling: false,
    includesCounselling: true,
    description: 'Complete nature + nurture profile with expert counselling session included.',
    icon: '✨',
  },
  {
    slug: 'crp-test',
    title: 'AI Career Launchpad',
    price: 1499,
    optionalCounselling: false,
    description: '5-session AI-powered career training for college students & freshers.',
    icon: '🚀',
  },
  {
    slug: 'career-readiness',
    title: 'Personalised Career Readiness Program',
    price: 2999,
    optionalCounselling: false,
    includesCounselling: true,
    description: 'Brain + Skill Mapping, five training sessions, counselling & placement support.',
    icon: '🎯',
  },
  {
    slug: 'counselling-topup',
    title: 'Additional Counselling Session',
    price: COUNSELLING_TOPUP_PRICE,
    optionalCounselling: false,
    includesCounselling: true,
    followUpOnly: true,
    description: 'Extra 1-on-1 session with our certified counsellor — for follow-up after your first booking.',
    icon: '💬',
  },
];

export const SKILL_MAPPING_BANDS = [
  { id: 'class-6-8', label: 'Class 6–8', subtitle: 'VAK & MIT · ~35 mins total' },
  { id: 'class-9-12', label: 'Class 9–12', subtitle: '5 tests · VAK, DISC, RIASEC, MIT, MBTI' },
  { id: 'professionals', label: 'Adults / Professionals', subtitle: '6 tests · incl. Career Understanding' },
];

/** In-app skill mapping tests — embedded Google Forms, grouped by class band */
export const SKILL_MAPPING_TESTS = [
  {
    id: 'vak',
    title: '📚 Learning Style Assessment (VAK)',
    shortTitle: '📚 VAK',
    desc: 'Discovers how you learn and retain information most effectively.',
    duration: '5 mins',
    bands: ['class-6-8', 'class-9-12'],
    icon: '👁️',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSd7p0jHNECuSjQpeFq_qwXDrk6nkDWvy1QywlRhO9AbxdYQxg/viewform',
    prefill: { userUid: 'entry.2103035402', userName: 'entry.1712228602', phone: 'entry.2118228663' },
  },
  {
    id: 'mit',
    title: '🌟 Multiple Talents Assessment (Multiple Intelligences Theory - MIT)',
    shortTitle: 'MIT',
    desc: 'Identifies your strongest multiple abilities and areas of intelligence.',
    duration: '30 mins',
    bands: ['class-6-8', 'class-9-12', 'professionals'],
    icon: '🎯',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLScFPTNZEGEzQfOqZVo3p8JrkPY04ACH7EkjohPAX__oIYU5Qg/viewform',
    prefill: { userUid: 'entry.1712759419', userName: 'entry.1810131233', phone: 'entry.946141524' },
  },
  {
    id: 'disc',
    title: '🤝 Professional Behaviour & Work Style Analysis (DISC)',
    shortTitle: 'DISC',
    desc: 'Understands how you communicate, collaborate, and respond in different situations.',
    duration: '10 mins',
    bands: ['class-9-12', 'professionals'],
    icon: '⚡',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSfei4_2YtzW-4QpZY7Zn0NSQsuNPl-tDw1NSCBilOa0BpUr_A/viewform',
    prefill: { userUid: 'entry.238042039', userName: 'entry.156451596', phone: 'entry.18322214' },
  },
  {
    id: 'riasec',
    title: '🧠 Career Interest Assessment (RIASEC)',
    shortTitle: 'RIASEC',
    desc: 'Finds the careers and work environments that match your interests.',
    duration: '10 mins',
    bands: ['class-9-12', 'professionals'],
    icon: '🗺️',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLScT1dyE6IHa_JwO2VYT7_cxpmhBSv9XyQZ3J-64AKxH-sq1Ig/viewform',
    prefill: { userUid: 'entry.687340479', userName: 'entry.816363426', phone: 'entry.1647270277' },
  },
  {
    id: 'mbti',
    title: '👤 Personality Assessment (MBTI – Myers-Briggs Type Indicator)',
    shortTitle: 'MBTI',
    desc: 'Helps you understand your personality type, work style, and preferences.',
    duration: '15 mins',
    bands: ['class-9-12', 'professionals'],
    icon: '🧠',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSfVU5p89sERCKfcCpQHul1auD48btzT1IZwDt2a-APb750u-g/viewform',
    prefill: { userUid: 'entry.1025910415', userName: 'entry.1235236889', phone: 'entry.689804706' },
  },
  {
    id: 'big5',
    title: '💡 Workplace Personality & Success Factors Analysis (Big Five Personality Traits)',
    shortTitle: 'Big Five',
    desc: 'Identifies your core personality traits, behavioural patterns, and strengths.',
    duration: '15 mins',
    bands: ['professionals'],
    icon: '🌟',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSel5kdNq5lxLyHK9ImFKOK0Gb_HuUGdzAdS_p9zme5XlmTngg/viewform',
    prefill: { userUid: 'entry.1345936881', userName: 'entry.1092911347', phone: 'entry.728143181' },
  },
  {
    id: 'career-understanding',
    title: 'Career Understanding',
    shortTitle: 'Career',
    desc: 'Reflect on your career goals, priorities, and direction — helps our counsellor tailor your personalised roadmap.',
    duration: '10 mins',
    bands: ['professionals'],
    icon: '🧭',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSe7Cg6TSzmVHoVglQpBcSuCMcT1RNAJ_chiD8EiWCPXdi3oYQ/viewform',
    prefill: { userUid: 'entry.2103035402', userName: 'entry.1712228602', phone: 'entry.2118228663' },
  },
];

/** Tests available for a class band */
export function getSkillMappingTestsForBand(bandId) {
  if (!bandId) return [];
  return SKILL_MAPPING_TESTS.filter((t) => t.bands.includes(bandId));
}

/** Whether a class band is unlocked (from payment selection) */
export function isSkillMappingBandAllowed(bandId, unlockedBand) {
  if (!unlockedBand) return false;
  return bandId === unlockedBand;
}

/** Band stored on assessment at payment — null until selected & paid */
export function resolveSkillMappingBand(assessment) {
  const band = assessment?.progress?.skillMappingBand;
  if (band && SKILL_MAPPING_BANDS.some((b) => b.id === band)) return band;
  return null;
}

export function getSkillMappingBandLabel(bandId) {
  return SKILL_MAPPING_BANDS.find((b) => b.id === bandId)?.label || bandId;
}

/** Label for agewise combo — falls back to band label for legacy ids */
export function getSkillMappingComboLabel(comboId, combos = []) {
  const match = combos.find((c) => c.id === comboId);
  if (match) return match.name;
  return getSkillMappingBandLabel(comboId);
}

/** @deprecated use SKILL_MAPPING_TESTS */
export const ASSESSMENT_FORMS = SKILL_MAPPING_TESTS.map((t) => ({
  title: t.title,
  desc: t.desc,
  url: t.url,
}));

export function getSkillMappingTestEmbedUrl(formUrl, prefillData, prefillFields) {
  return buildSkillMappingTestUrl(formUrl, prefillData, prefillFields, { embedded: true });
}

/** Build a Google Form URL with Dreams ID, name & phone prefilled */
export function buildSkillMappingTestUrl(
  formUrl,
  { userUid, userName, phone } = {},
  prefill = {},
  { embedded = false } = {}
) {
  if (!formUrl) return null;
  const base = formUrl.split('?')[0];
  const params = new URLSearchParams();
  if (userUid && prefill.userUid) params.set(prefill.userUid, String(userUid).trim());
  if (userName && prefill.userName) params.set(prefill.userName, String(userName).trim());
  if (phone && prefill.phone) params.set(prefill.phone, String(phone).trim());
  if (embedded) params.set('embedded', 'true');
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export const JAIPUR_LOCATIONS = [
  { name: 'Raja Park', mapUrl: 'https://maps.app.goo.gl/7DjoroaKSUi2srsE9' },
  { name: 'Shastri Nagar', mapUrl: 'https://maps.app.goo.gl/yNpFN3hdMyvLnUrk9' },
  { name: 'Nirman Nagar', mapUrl: 'https://maps.app.goo.gl/Xns95EsMy79wUAEDA' },
  { name: 'Pan-India Online', online: true },
];

/** Map profile class level → skill mapping test band */
export function getSkillMappingBand(classLevel) {
  if (!classLevel) return null;
  if (classLevel === 'Class 1-5' || classLevel === 'Class 6-8') return 'class-6-8';
  if (classLevel === 'Class 9-10' || classLevel === 'Class 11-12') return 'class-9-12';
  if (classLevel === 'College' || classLevel === 'Working Professional') return 'professionals';
  return 'class-9-12';
}

export function getSkillMappingUrl(classLevel) {
  const band = getSkillMappingBand(classLevel);
  return band ? `/dashboard?tab=assess&tests=${band}` : null;
}

export function hasSkillMappingTests(productSlug) {
  return productSlug === 'psychometric' || productSlug === 'dmit-psychometric' || productSlug === 'career-readiness';
}

export function getModuleBySlug(slug, catalog = MODULE_CATALOG) {
  return catalog.find((m) => m.slug === slug);
}

/** Build checkout selection from dashboard module catalog — single source of truth for prices */
export function buildModuleSelection(slug, addCounselling = false, catalog = MODULE_CATALOG) {
  const mod = getModuleBySlug(slug, catalog);
  if (!mod) return null;

  const withCounselling = !!(addCounselling && mod.optionalCounselling);
  const lineItems = [{ label: mod.title, amount: mod.price, slug: mod.slug, type: 'module' }];

  if (withCounselling) {
    const addon = resolveCounsellingAddon(mod);
    lineItems.push({
      label: addon.title,
      amount: addon.price,
      type: 'counselling',
      description: addon.description,
    });
  }

  const total = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const addon = resolveCounsellingAddon(mod);
  const displayTitle = withCounselling ? `${mod.title} + ${addon.title}` : mod.title;

  return {
    slug: mod.slug,
    module: mod,
    lineItems,
    addCounselling: withCounselling,
    total,
    displayTitle,
  };
}
