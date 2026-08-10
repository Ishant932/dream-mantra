/** Skill Mapping instruments — sync with backend/lib/skillMappingInstruments.js */

export const SKILL_MAPPING_INSTRUMENT_IDS = [
  'RIASEC', 'MIT', 'MBTI', 'VAK', 'DISC', 'BIG5', 'CARL_JUNG',
];

export const SKILL_MAPPING_INSTRUMENT_META = {
  RIASEC: { testId: 'riasec', short: 'RIASEC', emoji: '🧠', label: '🧠 Career Interest Assessment (RIASEC)' },
  MIT: { testId: 'mit', short: 'MIT', emoji: '🌟', label: '🌟 Multiple Talents Assessment (Multiple Intelligences Theory - MIT)' },
  MBTI: { testId: 'mbti', short: 'MBTI', emoji: '👤', label: '👤 Personality Assessment (MBTI – Myers-Briggs Type Indicator)' },
  VAK: { testId: 'vak', short: 'VAK', emoji: '📚', label: '📚 Learning Style Assessment (VAK)' },
  DISC: { testId: 'disc', short: 'DISC', emoji: '🤝', label: '🤝 Professional Behaviour & Work Style Analysis (DISC)' },
  BIG5: { testId: 'big5', short: 'Big Five', emoji: '💡', label: '💡 Workplace Personality & Success Factors Analysis (Big Five Personality Traits)' },
  CARL_JUNG: { testId: 'carl_jung', short: 'Carl Jung', emoji: '🎯', label: '🎯 Decision-Making & Thinking Style Assessment (Carl Jung Personality Test)' },
};

export function formatInstrumentList(ids = []) {
  return (ids || [])
    .map((id) => SKILL_MAPPING_INSTRUMENT_META[id]?.label || id)
    .join(' · ');
}
