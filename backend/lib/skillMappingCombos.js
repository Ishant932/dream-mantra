import { getData, saveData } from './database.js';
import { ensureSiteSettings } from './siteSettings.js';
import { formatInstrumentList, normalizeInstrumentIds } from './skillMappingInstruments.js';

const DEFAULT_COMBOS = [
  { name: 'Class 6–8', instruments: ['VAK', 'MIT'] },
  { name: 'Class 9–12', instruments: ['RIASEC', 'MBTI', 'VAK'] },
  { name: 'Adults', instruments: ['RIASEC', 'MIT', 'MBTI', 'DISC', 'BIG5'] },
  { name: 'Partner', instruments: ['RIASEC', 'MIT', 'MBTI', 'VAK', 'DISC', 'BIG5', 'CARL_JUNG'] },
];

function nextComboId(data) {
  if (!data.nextId.skill_mapping_combos) data.nextId.skill_mapping_combos = 1;
  return data.nextId.skill_mapping_combos++;
}

export function ensureSkillMappingCombos() {
  const data = getData();
  ensureSiteSettings();
  if (!Array.isArray(data.site_settings.skill_mapping_combos)) {
    data.site_settings.skill_mapping_combos = DEFAULT_COMBOS.map((c, i) => ({
      id: `combo-${i + 1}`,
      name: c.name,
      instruments: normalizeInstrumentIds(c.instruments),
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    saveData();
  }
  const seen = new Set();
  const deduped = [];
  for (const c of data.site_settings.skill_mapping_combos) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    deduped.push(c);
  }
  if (deduped.length !== data.site_settings.skill_mapping_combos.length) {
    data.site_settings.skill_mapping_combos = deduped;
    saveData();
  }
  return data.site_settings.skill_mapping_combos;
}

export function listSkillMappingCombos({ activeOnly = false } = {}) {
  const combos = ensureSkillMappingCombos();
  const list = [...combos].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  return activeOnly ? list.filter((c) => c.active !== false) : list;
}

export function getSkillMappingCombo(id) {
  if (!id) return null;
  return listSkillMappingCombos().find((c) => c.id === id) || null;
}

export function createSkillMappingCombo({ name, instruments = [] }) {
  const data = getData();
  ensureSkillMappingCombos();
  const inst = normalizeInstrumentIds(instruments);
  if (!String(name || '').trim()) throw new Error('Combo name is required');
  if (!inst.length) throw new Error('Select at least one instrument');

  const row = {
    id: `combo-${nextComboId(data)}`,
    name: String(name).trim(),
    instruments: inst,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  data.site_settings.skill_mapping_combos.push(row);
  saveData();
  return row;
}

export function updateSkillMappingCombo(id, patch = {}) {
  const data = getData();
  const combos = ensureSkillMappingCombos();
  const idx = combos.findIndex((c) => c.id === id);
  if (idx < 0) return null;

  const row = combos[idx];
  if (patch.name !== undefined) row.name = String(patch.name).trim();
  if (patch.instruments !== undefined) {
    const inst = normalizeInstrumentIds(patch.instruments);
    if (!inst.length) throw new Error('Select at least one instrument');
    row.instruments = inst;
  }
  if (patch.active !== undefined) row.active = !!patch.active;
  row.updated_at = new Date().toISOString();
  combos[idx] = row;
  saveData();
  return row;
}

export function comboSummary(combo) {
  if (!combo) return '';
  return formatInstrumentList(combo.instruments);
}
