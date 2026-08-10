/** Canonical Skill Mapping instrument ids — keep in sync with client testPortalData */

export const SKILL_MAPPING_INSTRUMENT_IDS = [
  'RIASEC', 'MIT', 'MBTI', 'VAK', 'DISC', 'BIG5', 'CARL_JUNG',
];

export const SKILL_MAPPING_INSTRUMENT_META = {
  RIASEC: { testId: 'riasec', label: '🧠 Career Interest Assessment (RIASEC)' },
  MIT: { testId: 'mit', label: '🌟 Multiple Talents Assessment (Multiple Intelligences Theory - MIT)' },
  MBTI: { testId: 'mbti', label: '👤 Personality Assessment (MBTI – Myers-Briggs Type Indicator)' },
  VAK: { testId: 'vak', label: '📚 Learning Style Assessment (VAK)' },
  DISC: { testId: 'disc', label: '🤝 Professional Behaviour & Work Style Analysis (DISC)' },
  BIG5: { testId: 'big5', label: '💡 Workplace Personality & Success Factors Analysis (Big Five Personality Traits)' },
  CARL_JUNG: { testId: 'carl_jung', label: '🎯 Decision-Making & Thinking Style Assessment (Carl Jung Personality Test)' },
};

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
