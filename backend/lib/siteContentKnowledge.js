/**
 * Searchable website knowledge for Esh (web chat + WhatsApp).
 * Pulls live CMS page catalog + static product/readiness content.
 */
import { listPageCatalog, getPageCatalog } from './pageCatalog.js';
import { PRODUCTS } from '../config/products.js';
import {
  CAREER_READINESS_SUMMARY_EN,
  CAREER_READINESS_SUMMARY_HI,
  CAREER_READINESS_SESSIONS_LIST,
  CAREER_READINESS_PRICE,
} from './careerReadinessKnowledge.js';

const SITE_BASE = (process.env.WHATSAPP_SITE_URL || process.env.SITE_URL || 'https://dreammantra.in').replace(/\/$/, '');

function pageToReply(page) {
  if (!page) return '';
  const lines = [
    `${page.heroTitle || page.label}`,
    page.heroSubtitle ? `— ${page.heroSubtitle}` : '',
    page.intro ? `\n${page.intro}` : '',
  ].filter(Boolean);

  for (const sec of page.sections || []) {
    if (sec?.title && sec?.content) lines.push(`\n${sec.title}: ${sec.content}`);
  }
  if (page.route) lines.push(`\nMore: ${SITE_BASE}${page.route}`);
  lines.push('\n9680102276 | info@dreammantra.in');
  return lines.join('');
}

function productToReply(slug) {
  const p = PRODUCTS[slug];
  if (!p) return '';
  return `${p.title} — ₹${Number(p.price).toLocaleString('en-IN')}\n${p.description || ''}\n\nEnrol: ${SITE_BASE}/dashboard?tab=assess&shop=${slug}`;
}

const STATIC_ENTRIES = [
  {
    patterns: [
      'personalised career readiness',
      'personalized career readiness',
      'career readiness program',
      'readiness program',
      'pcrp',
      '8 session',
      '8 sessions',
      'mock interview',
      'mock interviews',
      'career launch system',
      'readiness course',
      'job ready program',
      'placement program dream mantra',
    ],
    en: CAREER_READINESS_SUMMARY_EN,
    hi: CAREER_READINESS_SUMMARY_HI,
  },
  {
    patterns: [
      'readiness session 1',
      'session 1 know yourself',
      'know yourself session',
    ],
    en: `Career Readiness Session 1 — Know Yourself\n\nBuild clarity before building your career: personality assessment, strengths, SWOT, interests, ideal work environment, 60-second elevator pitch.\n\nOutput: Personal Career Profile + SWOT + Professional Introduction\n\nFull program (8 sessions + 2 mocks): ₹${CAREER_READINESS_PRICE.toLocaleString('en-IN')} — ${SITE_BASE}/crp?tab=readiness`,
    hi: 'Session 1 — Know Yourself: SWOT, strengths, elevator pitch।',
  },
  {
    patterns: [
      'readiness sessions list',
      'all readiness sessions',
      'what sessions in readiness',
      '8 live sessions',
    ],
    en: `Career Readiness — all sessions:\n\n${CAREER_READINESS_SESSIONS_LIST.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nProgram ₹${CAREER_READINESS_PRICE.toLocaleString('en-IN')}: ${SITE_BASE}/crp?tab=readiness`,
    hi: `8 sessions + 2 mock interviews। ${SITE_BASE}/crp?tab=readiness`,
  },
  {
    patterns: ['ai career launchpad vs career readiness', 'launchpad vs readiness', 'difference crp readiness', 'crp or readiness'],
    en: `AI Career Launchpad vs Personalised Career Readiness Program:

AI Career Launchpad — ₹1,499
• 5 training sessions (branding, LinkedIn, resume, interviews, salary)
• Best for college students & freshers wanting job-ready skills
• ${SITE_BASE}/crp?tab=launchpad

Personalised Career Readiness Program — ₹${CAREER_READINESS_PRICE.toLocaleString('en-IN')}
• Brain Mapping + Skill Mapping + counselling INCLUDED
• 8 live career sessions + 2 mock interviews
• Profile reviews (LinkedIn, CV, Naukri), AI job search, offer negotiation, 90-day launch plan
• Complete DISCOVER → DECIDE → BUILD → SEARCH → PERFORM → LAUNCH system
• ${SITE_BASE}/crp?tab=readiness

Call 9680102276 to choose the right fit.`,
    hi: 'Launchpad ₹1499 (5 sessions)। Readiness ₹2999 (assessments + 8 sessions + 2 mocks + placement)।',
  },
  {
    patterns: ['schedule readiness', 'book readiness sessions', 'readiness schedule', '8 sessions book'],
    en: `SCHEDULE CAREER READINESS SESSIONS

After payment is confirmed:
1. Dashboard → Training & Placement tab
2. Select Personalised Career Readiness Program
3. Journey → Schedule all 8 sessions in order (Session 1 first, then 2…8)
4. After all 8 are booked → 2 additional mock interview slots unlock

Purchase: ${SITE_BASE}/dashboard?tab=assess&shop=career-readiness
Help: 9680102276`,
    hi: 'Payment confirm → Dashboard → Training → schedule 8 sessions। 9680102276',
  },
];

function scorePatterns(text, patterns) {
  const words = text.split(/\s+/).filter((w) => w.length > 2);
  let best = 0;
  for (const pattern of patterns) {
    const p = pattern.toLowerCase().trim();
    if (!p) continue;
    if (text === p) return 100 + p.length;
    if (text.includes(p) && p.length >= 4) best = Math.max(best, 50 + p.length);
    else {
      const pWords = p.split(/\s+/).filter((w) => w.length > 2);
      const overlap = pWords.filter((w) => words.includes(w) || text.includes(w)).length;
      if (overlap >= 2 && overlap >= Math.ceil(pWords.length * 0.5)) {
        best = Math.max(best, 20 + overlap * 6 + p.length);
      }
    }
  }
  return best;
}

function searchStaticEntries(text, lang) {
  let best = null;
  let bestScore = 0;
  for (const entry of STATIC_ENTRIES) {
    const score = scorePatterns(text, entry.patterns);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }
  if (bestScore >= 20) return best[lang] || best.en;
  return null;
}

function searchPageCatalog(text, lang) {
  const pages = listPageCatalog();
  let best = null;
  let bestScore = 0;

  for (const page of pages) {
    const slug = page.slug || '';
    const label = (page.label || '').toLowerCase();
    const title = (page.heroTitle || '').toLowerCase();
    const intro = (page.intro || '').toLowerCase();
    const blob = `${slug} ${label} ${title} ${intro}`.toLowerCase();

    let score = 0;
    if (text.includes(slug.replace(/-/g, ' '))) score += 30;
    if (text.includes(slug)) score += 25;
    if (label && text.includes(label)) score += 40;
    if (title && title.length > 4 && text.includes(title)) score += 35;

    const words = text.split(/\s+/).filter((w) => w.length > 3);
    for (const w of words) {
      if (blob.includes(w)) score += 2;
    }

    if (score > bestScore) {
      bestScore = score;
      best = page;
    }
  }

  if (bestScore >= 12 && best) return pageToReply(best);
  return null;
}

function searchProducts(text) {
  const map = [
    { keys: ['brain mapping', 'dmit', 'fingerprint'], slug: 'dmit' },
    { keys: ['skill mapping', 'psychometric', 'mbti'], slug: 'psychometric' },
    { keys: ['combo', 'brain + skill', 'brain and skill'], slug: 'dmit-psychometric' },
    { keys: ['launchpad', 'crp-test', 'ai career'], slug: 'crp-test' },
    { keys: ['career readiness', 'readiness program', 'personalised career', 'personalized career'], slug: 'career-readiness' },
    { keys: ['counselling top', 'top-up', 'topup', 'extra counselling'], slug: 'counselling-topup' },
  ];
  for (const row of map) {
    if (row.keys.some((k) => text.includes(k))) return productToReply(row.slug);
  }
  return null;
}

/** Primary search: website CMS + products + readiness content */
export function searchSiteKnowledge(message, lang = 'en') {
  const text = String(message || '').toLowerCase().replace(/[^\w\s+@.?-]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return null;

  const staticHit = searchStaticEntries(text, lang);
  if (staticHit) return { reply: staticHit, source: 'site-static' };

  const productHit = searchProducts(text);
  if (productHit) return { reply: productHit, source: 'site-product' };

  const pageHit = searchPageCatalog(text, lang);
  if (pageHit) return { reply: pageHit, source: 'site-page-catalog' };

  return null;
}

/** Extra context injected into Gemini so answers stay aligned with the live site */
export function buildGeminiSiteContext() {
  const pages = listPageCatalog()
    .slice(0, 14)
    .map((p) => `- ${p.label}: ${p.heroTitle}. ${p.intro || ''} Route: ${SITE_BASE}${p.route}`)
    .join('\n');

  const products = Object.values(PRODUCTS)
    .map((p) => `- ${p.title}: ₹${p.price} — ${p.description || ''}`)
    .join('\n');

  return `
LIVE WEBSITE PAGES (dreammantra.in):
${pages}

MODULE PRICING:
${products}

PERSONALISED CAREER READINESS PROGRAM (flagship training):
${CAREER_READINESS_SUMMARY_EN}

RULES: Answer using ONLY the facts above and your Dream Mantra knowledge. If the user asks about Career Readiness, give full session list, price ₹${CAREER_READINESS_PRICE}, and enrolment steps. Always include relevant links and 9680102276 when helpful.
`.trim();
}

export function getPageKnowledge(slug) {
  return pageToReply(getPageCatalog(slug));
}
