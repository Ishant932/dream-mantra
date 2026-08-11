/** Skill Mapping instruments — sync with backend/lib/skillMappingInstruments.js */

export const SKILL_MAPPING_INSTRUMENT_IDS = [
  'RIASEC', 'MIT', 'MBTI', 'VAK', 'DISC', 'BIG5', 'CARL_JUNG',
];

export const SKILL_MAPPING_INSTRUMENT_META = {
  RIASEC: { testId: 'riasec', short: 'Career Interest', emoji: '🧠', label: '🧠 Career Interest Assessment' },
  MIT: { testId: 'mit', short: 'Multiple Talents', emoji: '🌟', label: '🌟 Multiple Talents Assessment' },
  MBTI: { testId: 'mbti', short: 'Personality', emoji: '👤', label: '👤 Personality Assessment' },
  VAK: { testId: 'vak', short: 'Learning Style', emoji: '📚', label: '📚 Learning Style Assessment' },
  DISC: { testId: 'disc', short: 'Professional Behaviour', emoji: '🤝', label: '🤝 Professional Behaviour & Work Style Analysis' },
  BIG5: { testId: 'big5', short: 'Workplace Personality', emoji: '💡', label: '💡 Workplace Personality & Success Factors Analysis' },
  CARL_JUNG: { testId: 'carl_jung', short: 'Decision-Making', emoji: '🎯', label: '🎯 Decision-Making & Thinking Style Assessment' },
};

/** Short list for marketing copy */
export const SKILL_MAPPING_SUITE_LABEL =
  'Career Interest, Multiple Talents, Personality, Learning Style, Professional Behaviour, Workplace Personality & Decision-Making assessments';

export function formatInstrumentList(ids = []) {
  return (ids || [])
    .map((id) => SKILL_MAPPING_INSTRUMENT_META[id]?.label || id)
    .join(' · ');
}
