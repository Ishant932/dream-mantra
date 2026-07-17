/**
 * Generates sitemap index + split sitemaps for dreammantra.in
 * Run: node scripts/generate-sitemaps.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'client', 'public');
const SITE = 'https://dreammantra.in';
const TODAY = new Date().toISOString().slice(0, 10);

const DEDICATED_ASSESSMENT_ROUTES = {
  dmit: '/assessments/dmit',
  psychometric: '/assessments/psychometric',
  'dmit-psychometric': '/assessments/dmit-psychometric',
  'why-dreams-mantra': '/assessments/why-dreams-mantra',
};

const ASSESSMENT_SLUGS = ['dmit', 'psychometric', 'dmit-psychometric', 'why-dreams-mantra'];

const PROGRAM_SLUGS = [
  'class-1-5',
  'class-6-8',
  'class-9-10',
  'class-11-12',
  'college-students',
  'working-professionals',
];

const PARTNER_SLUGS = [
  'schools',
  'coaching-centers',
  'colleges',
  'corporates',
  'teachers',
  'referral-partner',
];

const PAGE_ENTRIES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/about', priority: '0.85', changefreq: 'monthly' },
  { path: '/contact', priority: '0.85', changefreq: 'monthly' },
  { path: '/counselling', priority: '0.95', changefreq: 'weekly' },
  { path: '/crp', priority: '0.85', changefreq: 'monthly' },
  { path: '/crp/explore', priority: '0.8', changefreq: 'monthly' },
  { path: '/crp/launch', priority: '0.8', changefreq: 'monthly' },
  { path: '/careers', priority: '0.9', changefreq: 'weekly' },
  { path: '/marketplace', priority: '0.8', changefreq: 'weekly' },
  { path: '/assessments', priority: '0.95', changefreq: 'weekly' },
  { path: '/signup', priority: '0.7', changefreq: 'monthly' },
  { path: '/login', priority: '0.6', changefreq: 'monthly' },
  { path: '/forgot-password', priority: '0.4', changefreq: 'yearly' },
  { path: '/terms', priority: '0.3', changefreq: 'yearly' },
];

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc, { priority = '0.5', changefreq = 'monthly', lastmod = TODAY } = {}) {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function writeUrlset(filename, urls) {
  const body = urls.map((u) => urlEntry(u.loc, u)).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
  fs.writeFileSync(path.join(OUT_DIR, filename), xml, 'utf8');
  return urls.length;
}

function writeSitemapIndex(files) {
  const entries = files
    .map(
      (f) => `  <sitemap>
    <loc>${SITE}/${f}</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>`,
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>
`;
  fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), xml, 'utf8');
}

function loadCareerSlugs() {
  const file = path.join(OUT_DIR, 'data', 'careers.json');
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  const list = Array.isArray(raw) ? raw : raw.careers || [];
  return list.map((c) => c.slug).filter(Boolean);
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const pages = PAGE_ENTRIES.map((e) => ({
    loc: `${SITE}${e.path}`,
    priority: e.priority,
    changefreq: e.changefreq,
  }));
  const pagesCount = writeUrlset('sitemap-pages.xml', pages);

  const assessments = [
    { loc: `${SITE}/assessments`, priority: '0.95', changefreq: 'weekly' },
    ...ASSESSMENT_SLUGS.map((slug) => ({
      loc: `${SITE}${DEDICATED_ASSESSMENT_ROUTES[slug]}`,
      priority: '0.88',
      changefreq: 'monthly',
    })),
  ];
  const assessmentsCount = writeUrlset('sitemap-assessments.xml', assessments);

  const programs = PROGRAM_SLUGS.map((slug) => ({
    loc: `${SITE}/programs/${slug}`,
    priority: '0.82',
    changefreq: 'monthly',
  }));
  const programsCount = writeUrlset('sitemap-programs.xml', programs);

  const partners = PARTNER_SLUGS.map((slug) => ({
    loc: `${SITE}/partner/${slug}`,
    priority: '0.78',
    changefreq: 'monthly',
  }));
  const partnersCount = writeUrlset('sitemap-partners.xml', partners);

  const careerSlugs = loadCareerSlugs();
  const careers = careerSlugs.map((slug) => ({
    loc: `${SITE}/careers/${slug}`,
    priority: '0.65',
    changefreq: 'monthly',
  }));
  const careersCount = writeUrlset('sitemap-careers.xml', careers);

  writeSitemapIndex([
    'sitemap-pages.xml',
    'sitemap-assessments.xml',
    'sitemap-programs.xml',
    'sitemap-partners.xml',
    'sitemap-careers.xml',
  ]);

  const total = pagesCount + assessmentsCount + programsCount + partnersCount + careersCount;
  console.log(`Sitemaps written to ${OUT_DIR}`);
  console.log(`  sitemap-pages.xml       ${pagesCount} URLs`);
  console.log(`  sitemap-assessments.xml ${assessmentsCount} URLs`);
  console.log(`  sitemap-programs.xml    ${programsCount} URLs`);
  console.log(`  sitemap-partners.xml    ${partnersCount} URLs`);
  console.log(`  sitemap-careers.xml     ${careersCount} URLs`);
  console.log(`  sitemap.xml (index)     5 child sitemaps, ${total} URLs total`);
}

main();
