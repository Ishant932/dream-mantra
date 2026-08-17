/** Clean path URLs — no query strings for tabs on public pages */

const COUNSELLING_TAB_SEGMENTS = {
  overview: '',
  dmit: 'brain-mapping',
  psychometric: 'skill-mapping',
  combo: 'combo',
  why: 'why',
  institutions: 'institutions',
  programs: 'programs',
};

const COUNSELLING_SEGMENT_TABS = Object.fromEntries(
  Object.entries(COUNSELLING_TAB_SEGMENTS)
    .filter(([, seg]) => seg)
    .map(([tab, seg]) => [seg, tab]),
);

const DASHBOARD_TAB_SEGMENTS = {
  assess: 'book-now',
  book: 'book-session',
  counselling: 'counselling',
  training: 'training',
  support: 'support',
  careers: 'careers',
  reports: 'reports',
  overview: 'overview',
};

const DASHBOARD_SEGMENT_TABS = Object.fromEntries(
  Object.entries(DASHBOARD_TAB_SEGMENTS).map(([tab, seg]) => [seg, tab]),
);
/** Legacy / bookmarked URL — same Support tab as /dashboard/support */
DASHBOARD_SEGMENT_TABS.supportpage = 'support';

const CRP_TAB_SEGMENTS = {
  launchpad: 'launchpad',
  readiness: 'readiness',
  pathways: 'pathways',
};

const CRP_SEGMENT_TABS = { ...CRP_TAB_SEGMENTS };

export function counsellingPath(tab = 'overview', { age } = {}) {
  if (tab === 'programs' && age) return `/counselling/programs/${age}`;
  const seg = COUNSELLING_TAB_SEGMENTS[tab];
  if (!seg) return '/counselling';
  return `/counselling/${seg}`;
}

export function parseCounsellingPath(pathname, search = '') {
  const legacyTab = new URLSearchParams(search).get('tab');
  const legacyAge = new URLSearchParams(search).get('age');
  if (legacyTab) {
    const target = counsellingPath(legacyTab, { age: legacyAge || undefined });
    if (`${pathname}${search}` !== target) return { tab: legacyTab, age: legacyAge, redirect: target };
    return { tab: legacyTab, age: legacyAge };
  }

  const rest = pathname.replace(/^\/counselling\/?/, '');
  if (!rest) return { tab: 'overview' };
  const parts = rest.split('/').filter(Boolean);
  if (parts[0] === 'programs' && parts[1]) return { tab: 'programs', age: parts[1] };
  return { tab: COUNSELLING_SEGMENT_TABS[parts[0]] || 'overview', age: parts[1] || null };
}

export function crpPath(tab = 'launchpad', { audience } = {}) {
  if (tab === 'pathways' && audience) return `/crp/pathways/${audience}`;
  const seg = CRP_TAB_SEGMENTS[tab] || 'launchpad';
  return `/crp/${seg}`;
}

export function parseCrpPath(pathname, search = '') {
  const params = new URLSearchParams(search);
  const legacyTab = params.get('tab');
  const legacyAudience = params.get('audience');
  if (legacyTab) {
    const tab = ['college-students', 'freshers', 'working-professionals'].includes(legacyTab)
      ? 'pathways'
      : legacyTab;
    const audience = tab === 'pathways' ? (legacyAudience || legacyTab) : legacyAudience;
    const target = crpPath(tab === 'overview' ? 'launchpad' : tab, { audience: audience || undefined });
    if (`${pathname}${search}` !== target) return { tab, audience, redirect: target };
    return { tab, audience };
  }

  const rest = pathname.replace(/^\/crp\/?/, '');
  if (!rest) return { tab: 'launchpad' };
  const parts = rest.split('/').filter(Boolean);
  if (parts[0] === 'pathways' && parts[1]) return { tab: 'pathways', audience: parts[1] };
  return { tab: CRP_SEGMENT_TABS[parts[0]] || 'launchpad', audience: legacyAudience };
}

export function dashboardPath(tab = 'assess', { focus, subtab, slotId, section, shop } = {}) {
  const seg = DASHBOARD_TAB_SEGMENTS[tab] || 'book-now';
  let path = `/dashboard/${seg}`;
  const extras = [];
  if (focus) extras.push(`focus-${focus}`);
  if (subtab) extras.push(`view-${subtab}`);
  if (slotId) extras.push(`slot-${slotId}`);
  if (section) extras.push(`section-${section}`);
  if (shop) extras.push(`shop-${shop}`);
  if (extras.length) path += `/${extras.join('/')}`;
  return path;
}

export function parseDashboardPath(pathname, search = '') {
  const params = new URLSearchParams(search);
  const legacyTab = params.get('tab');
  if (legacyTab) {
    const focus = params.get('focus');
    const subtab = params.get('subtab');
    const slotId = params.get('slot_id');
    const section = params.get('section');
    const shop = params.get('shop');
    const target = dashboardPath(legacyTab, { focus, subtab, slotId, section, shop });
    if (`${pathname}${search}` !== target) {
      return {
        tab: legacyTab,
        focus,
        subtab,
        slotId,
        section,
        shop,
        redirect: target,
      };
    }
    return { tab: legacyTab, focus, subtab, slotId, section, shop };
  }

  const rest = pathname.replace(/^\/dashboard\/?/, '');
  if (!rest) return { tab: 'assess' };
  const parts = rest.split('/').filter(Boolean);
  const tab = DASHBOARD_SEGMENT_TABS[parts[0]] || 'assess';
  const meta = {};
  for (const p of parts.slice(1)) {
    if (p.startsWith('focus-')) meta.focus = p.slice(6);
    if (p.startsWith('view-')) meta.subtab = p.slice(5);
    if (p.startsWith('slot-')) meta.slotId = p.slice(5);
    if (p.startsWith('section-')) meta.section = p.slice(8);
    if (p.startsWith('shop-')) meta.shop = p.slice(5);
  }
  return { tab, ...meta };
}

export function marketplacePath(tab = 'counselling') {
  if (!tab || tab === 'counselling') return '/marketplace';
  return `/marketplace/${tab}`;
}

export function parseMarketplacePath(pathname, search = '') {
  const legacy = new URLSearchParams(search).get('tab');
  const map = { tests: 'counselling', ai: 'counselling', library: 'counselling', stream: 'counselling', degree: 'counselling', launchpad: 'training', crp: 'training' };
  if (legacy) {
    const tab = map[legacy] || legacy;
    const target = marketplacePath(tab);
    if (`${pathname}${search}` !== target) return { tab, redirect: target };
    return { tab };
  }
  const rest = pathname.replace(/^\/marketplace\/?/, '');
  if (!rest) return { tab: 'counselling' };
  return { tab: rest.split('/')[0] || 'counselling' };
}

export function assessmentPath(slug) {
  if (!slug) return '/counselling';
  return counsellingAssessmentPath(slug) || `/assessments/${slug}`;
}

export function counsellingAssessmentPath(slug) {
  const map = {
    dmit: 'dmit',
    psychometric: 'psychometric',
    'dmit-psychometric': 'combo',
    combo: 'combo',
    'why-dreams-mantra': 'why',
    why: 'why',
  };
  const tab = map[slug];
  return tab ? counsellingPath(tab) : null;
}

export function programPageForSlug(slug) {
  if (!slug) return '/marketplace';
  const counselling = counsellingAssessmentPath(slug);
  if (counselling) return counselling;
  if (slug === 'crp-test') return crpPath('launchpad');
  if (slug === 'career-readiness') return crpPath('readiness');
  return '/marketplace';
}

export function programPath(slug) {
  return slug ? `/programs/${slug}` : counsellingPath('programs');
}

export function partnerPath(slug) {
  return slug ? `/partner/${slug}` : '/contact';
}

export function careerPath(slug) {
  return slug ? `/careers/${slug}` : '/careers';
}
