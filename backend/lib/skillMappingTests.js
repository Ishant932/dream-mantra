/**
 * Skill Mapping test forms — keep prefill in sync with client/src/data/moduleCatalog.js
 * Prefill entry IDs from each Google Form (Dreamz ID, Name, Phone fields).
 */
export const SKILL_MAPPING_TESTS = [
  {
    id: 'vak',
    title: 'VAK Test',
    shortTitle: 'VAK',
    desc: 'Learning style assessment — Visual, Auditory, or Kinesthetic preferences.',
    duration: '5 mins',
    bands: ['class-6-8', 'class-9-12'],
    icon: '👁️',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSd7p0jHNECuSjQpeFq_qwXDrk6nkDWvy1QywlRhO9AbxdYQxg/viewform',
    prefill: { userUid: 'entry.2103035402', userName: 'entry.1712228602', phone: 'entry.2118228663' },
  },
  {
    id: 'mit',
    title: 'MIT Test',
    shortTitle: 'MIT',
    desc: 'Multiple Intelligence Assessment — logical, linguistic, creative, social & practical strengths.',
    duration: '30 mins',
    bands: ['class-6-8', 'class-9-12', 'professionals'],
    icon: '🎯',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLScFPTNZEGEzQfOqZVo3p8JrkPY04ACH7EkjohPAX__oIYU5Qg/viewform',
    prefill: { userUid: 'entry.1712759419', userName: 'entry.1810131233', phone: 'entry.946141524' },
  },
  {
    id: 'disc',
    title: 'DISC Test',
    shortTitle: 'DISC',
    desc: 'Behavioural style assessment — Dominance, Influence, Steadiness & Conscientiousness.',
    duration: '10 mins',
    bands: ['class-9-12', 'professionals'],
    icon: '⚡',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSfei4_2YtzW-4QpZY7Zn0NSQsuNPl-tDw1NSCBilOa0BpUr_A/viewform',
    prefill: { userUid: 'entry.238042039', userName: 'entry.156451596', phone: 'entry.18322214' },
  },
  {
    id: 'riasec',
    title: 'RIASEC Test',
    shortTitle: 'RIASEC',
    desc: 'Career interest mapping — Realistic, Investigative, Artistic, Social, Enterprising & Conventional.',
    duration: '10 mins',
    bands: ['class-9-12', 'professionals'],
    icon: '🗺️',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLScT1dyE6IHa_JwO2VYT7_cxpmhBSv9XyQZ3J-64AKxH-sq1Ig/viewform',
    prefill: { userUid: 'entry.687340479', userName: 'entry.816363426', phone: 'entry.1647270277' },
  },
  {
    id: 'mbti',
    title: 'MBTI Test',
    shortTitle: 'MBTI',
    desc: 'Personality type indicator — how you learn, decide, and work best across 16 types.',
    duration: '15 mins',
    bands: ['class-9-12', 'professionals'],
    icon: '🧠',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSfVU5p89sERCKfcCpQHul1auD48btzT1IZwDt2a-APb750u-g/viewform',
    prefill: { userUid: 'entry.1025910415', userName: 'entry.1235236889', phone: 'entry.689804706' },
  },
  {
    id: 'big5',
    title: 'Big 5 Test',
    shortTitle: 'Big 5',
    desc: 'Five-factor personality profile — openness, conscientiousness, extraversion, agreeableness & neuroticism.',
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

export function getSkillMappingTestsForBand(bandId) {
  if (!bandId) return [];
  return SKILL_MAPPING_TESTS.filter((t) => t.bands.includes(bandId));
}

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

export function getSkillTestsForUser(assessment, user) {
  const band = assessment?.progress?.skillMappingBand;
  if (!band) {
    throw new Error('Select your class band before taking tests.');
  }

  const userUid = String(user?.user_uid || '').trim();
  if (!userUid) {
    throw new Error('Your Dream Mantra ID is missing. Please log out and log in again, or contact support.');
  }

  const userName = String(user?.name || '').trim();
  const phone = String(user?.phone || user?.profile?.whatsappNumber || '').trim();

  const tests = getSkillMappingTestsForBand(band).map((t) => {
    const url = buildSkillMappingTestUrl(
      t.url,
      { userUid, userName, phone },
      t.prefill || {},
      { embedded: false }
    );
    const embedUrl = buildSkillMappingTestUrl(
      t.url,
      { userUid, userName, phone },
      t.prefill || {},
      { embedded: true }
    );
    return {
      id: t.id,
      title: t.title,
      shortTitle: t.shortTitle,
      desc: t.desc,
      duration: t.duration,
      icon: t.icon,
      url,
      embedUrl,
    };
  });

  return {
    registeredUserUid: userUid,
    registeredEmail: user?.email || null,
    userName,
    phone,
    band,
    tests,
  };
}
