/** Canonical Skill Mapping instrument ids — keep in sync with client testPortalData */

export const SKILL_MAPPING_INSTRUMENT_IDS = [
  'RIASEC', 'MIT', 'MBTI', 'VAK', 'DISC', 'BIG5', 'CARL_JUNG',
];

export const SKILL_MAPPING_INSTRUMENT_META = {
  RIASEC: { testId: 'riasec', label: '🧠 Career Interest Assessment' },
  MIT: { testId: 'mit', label: '🌟 Multiple Talents Assessment' },
  MBTI: { testId: 'mbti', label: '👤 Personality Assessment' },
  VAK: { testId: 'vak', label: '📚 Learning Style Assessment' },
  DISC: { testId: 'disc', label: '🤝 Professional Behaviour & Work Style Analysis' },
  BIG5: { testId: 'big5', label: '💡 Workplace Personality & Success Factors Analysis' },
  CARL_JUNG: { testId: 'career-understanding', label: '🎯 Decision-Making & Thinking Style Assessment' },
};

export const SKILL_MAPPING_SUITE_LABEL =
  'Career Interest, Multiple Talents, Personality, Learning Style, Professional Behaviour, Workplace Personality & Decision-Making assessments';

export function normalizeInstrumentIds(ids = []) {
  const set = new Set();
  for (const raw of ids) {
    const id = String(raw || '').trim().toUpperCase().replace(/-/g, '_');
    if (SKILL_MAPPING_INSTRUMENT_IDS.includes(id)) set.add(id);
  }
  return [...set];
}

export function instrumentIdsToTestIds(instrumentIds) {
  return normalizeInstrumentIds(instrumentIds)
    .map((id) => SKILL_MAPPING_INSTRUMENT_META[id]?.testId)
    .filter(Boolean);
}

export function formatInstrumentList(ids = []) {
  return normalizeInstrumentIds(ids)
    .map((id) => SKILL_MAPPING_INSTRUMENT_META[id]?.label || id)
    .join(' · ');
}
