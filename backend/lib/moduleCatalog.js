/** Dashboard module catalog — sync client/src/data/moduleCatalog.js with BASE in catalogStore.js */
import {
  getActiveModuleCatalog,
  COUNSELLING_ADDON_PRICE,
  COUNSELLING_TOPUP_PRICE,
  BASE_MODULE_CATALOG,
  resolveCounsellingAddon,
} from './catalogStore.js';

export { COUNSELLING_ADDON_PRICE, COUNSELLING_TOPUP_PRICE, resolveCounsellingAddon };export const MODULE_CATALOG = BASE_MODULE_CATALOG;

export function getModuleBySlug(slug) {
  return getActiveModuleCatalog().find((m) => m.slug === slug);
}

export function buildModuleSelection(slug, addCounselling = false) {
  const mod = getModuleBySlug(slug);
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
    moduleTitle: mod.title,
    lineItems,
    addCounselling: withCounselling,
    total,
    displayTitle,
    moduleSlug: mod.slug,
  };
}

/** Resolve checkout selection — stored user choice or rebuild from module catalog only */
export function resolveAssessmentSelection(assessment) {
  const slug = assessment.product_slug || 'dmit';
  const addCounselling = !!assessment.progress?.addCounselling;
  const catalog = buildModuleSelection(slug, addCounselling);
  if (!catalog) return null;

  const stored = assessment.progress?.selection;
  if (stored?.lineItems?.length && stored.total === catalog.total) {
    return {
      displayTitle: stored.displayTitle || catalog.displayTitle,
      lineItems: stored.lineItems,
      total: stored.total,
      moduleSlug: stored.moduleSlug || catalog.moduleSlug,
      moduleTitle: stored.moduleTitle || catalog.moduleTitle,
      addCounselling: catalog.addCounselling,
    };
  }

  return {
    displayTitle: catalog.displayTitle,
    lineItems: catalog.lineItems,
    total: catalog.total,
    moduleSlug: catalog.moduleSlug,
    moduleTitle: catalog.moduleTitle,
    addCounselling: catalog.addCounselling,
  };
}

/** Sync assessment amount + progress.selection to module catalog prices */
export function syncAssessmentSelection(assessment, repo) {
  const selection = resolveAssessmentSelection(assessment);
  if (!selection) return { assessment, selection: null };

  const progress = {
    ...(assessment.progress || {}),
    addCounselling: selection.addCounselling,
    selection: {
      displayTitle: selection.displayTitle,
      lineItems: selection.lineItems,
      total: selection.total,
      moduleSlug: selection.moduleSlug,
      moduleTitle: selection.moduleTitle,
      addCounselling: selection.addCounselling,
    },
  };

  const needsSync =
    assessment.amount !== selection.total ||
    !assessment.progress?.selection?.lineItems?.length;

  if (needsSync && repo) {
    repo.updateAssessment(assessment.id, { amount: selection.total, progress });
    return { assessment: repo.getAssessment(assessment.id), selection: progress.selection };
  }

  return { assessment: { ...assessment, progress }, selection: progress.selection };
}

export const SKILL_MAPPING_BAND_IDS = ['class-6-8', 'class-9-12', 'professionals'];

/** Resolve module slug from assessment row (matches client moduleAccess.js) */
export function resolveAssessmentSlug(assessment) {
  if (!assessment) return null;
  if (assessment.product_slug) return assessment.product_slug;
  const fromSelection = assessment.progress?.selection?.moduleSlug;
  if (fromSelection) return fromSelection;
  const t = (assessment.type || '').toLowerCase();
  if (t.includes('mind') && t.includes('skill')) return 'dmit-psychometric';
  if (t.includes('brain mapping') || t.includes('dmit')) return 'dmit';
  if (t.includes('skill mapping') || t.includes('psychometric')) return 'psychometric';
  if (t.includes('launchpad') || t.includes('crp') || t.includes('ai career')) return 'crp-test';
  if (t.includes('counselling') && t.includes('additional')) return 'counselling-topup';
  return null;
}

export function requiresSkillMappingBand(slugOrAssessment) {
  const slug = typeof slugOrAssessment === 'string'
    ? slugOrAssessment
    : resolveAssessmentSlug(slugOrAssessment);
  return slug === 'psychometric' || slug === 'dmit-psychometric' || slug === 'career-readiness';
}

export function normalizeSkillMappingBand(band) {
  if (!band || typeof band !== 'string') return null;
  const id = band.trim();
  return SKILL_MAPPING_BAND_IDS.includes(id) ? id : null;
}

import { getSkillMappingCombo } from './skillMappingCombos.js';
import { instrumentIdsToTestIds } from './skillMappingInstruments.js';

export function assertSkillMappingBandSelected(assessment) {
  const slug = resolveAssessmentSlug(assessment);
  if (!requiresSkillMappingBand(slug)) return null;
  const comboId = assessment.progress?.skillMappingComboId || assessment.progress?.skillMappingBand;
  const combo = getSkillMappingCombo(comboId);
  if (!combo) {
    throw new Error('Select an agewise bifurcation combo before paying.');
  }
  return combo.id;
}

export function resolveAssessmentInstruments(assessment) {
  const fromProgress = assessment?.progress?.skillMappingInstruments;
  if (Array.isArray(fromProgress) && fromProgress.length) {
    return fromProgress;
  }
  const combo = getSkillMappingCombo(assessment?.progress?.skillMappingComboId || assessment?.progress?.skillMappingBand);
  return combo?.instruments || [];
}

export function resolveAssessmentTestIds(assessment) {
  return instrumentIdsToTestIds(resolveAssessmentInstruments(assessment));
}

export { getActiveModuleCatalog };
