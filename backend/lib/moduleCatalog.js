/** Dashboard module catalog — must stay in sync with client/src/data/moduleCatalog.js */

export const COUNSELLING_ADDON_PRICE = 699;
export const COUNSELLING_TOPUP_PRICE = 999;

export const MODULE_CATALOG = [
  {
    slug: 'dmit',
    title: 'Mind Mapping',
    price: 1999,
    optionalCounselling: true,
  },
  {
    slug: 'psychometric',
    title: 'Skill Mapping',
    price: 699,
    optionalCounselling: true,
  },
  {
    slug: 'dmit-psychometric',
    title: 'Mind + Skill + Counselling',
    price: 2999,
    optionalCounselling: false,
    includesCounselling: true,
  },
  {
    slug: 'crp-test',
    title: 'AI Career Launchpad',
    price: 1499,
    optionalCounselling: false,
  },
  {
    slug: 'counselling-topup',
    title: 'Additional Counselling Session',
    price: COUNSELLING_TOPUP_PRICE,
    optionalCounselling: false,
    includesCounselling: true,
  },
];

export function getModuleBySlug(slug) {
  return MODULE_CATALOG.find((m) => m.slug === slug);
}

export function buildModuleSelection(slug, addCounselling = false) {
  const mod = getModuleBySlug(slug);
  if (!mod) return null;

  const withCounselling = !!(addCounselling && mod.optionalCounselling);
  const lineItems = [{ label: mod.title, amount: mod.price, slug: mod.slug, type: 'module' }];

  if (withCounselling) {
    lineItems.push({
      label: 'Counselling session',
      amount: COUNSELLING_ADDON_PRICE,
      type: 'counselling',
    });
  }

  const total = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const displayTitle = withCounselling ? `${mod.title} + Counselling` : mod.title;

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
  if (t.includes('mind mapping') || t.includes('dmit')) return 'dmit';
  if (t.includes('skill mapping') || t.includes('psychometric')) return 'psychometric';
  if (t.includes('launchpad') || t.includes('crp') || t.includes('ai career')) return 'crp-test';
  if (t.includes('counselling') && t.includes('additional')) return 'counselling-topup';
  return null;
}

export function requiresSkillMappingBand(slugOrAssessment) {
  const slug = typeof slugOrAssessment === 'string'
    ? slugOrAssessment
    : resolveAssessmentSlug(slugOrAssessment);
  return slug === 'psychometric' || slug === 'dmit-psychometric';
}

export function normalizeSkillMappingBand(band) {
  if (!band || typeof band !== 'string') return null;
  const id = band.trim();
  return SKILL_MAPPING_BAND_IDS.includes(id) ? id : null;
}

export function assertSkillMappingBandSelected(assessment) {
  const slug = resolveAssessmentSlug(assessment);
  if (!requiresSkillMappingBand(slug)) return null;
  const band = normalizeSkillMappingBand(assessment.progress?.skillMappingBand);
  if (!band) {
    throw new Error('Select which class band applies (Class 6–8, Class 9–12, or Adults / Professionals) before paying.');
  }
  return band;
}
