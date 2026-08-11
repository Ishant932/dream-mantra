/**
 * Generates sitemap index + split XML sitemaps + human-readable HTML sitemap.
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

const STUDIO_LANDINGS = [
  { path: '/studio/skill-mapping', label: 'Skill Mapping', priority: '0.92' },
  { path: '/studio/brain-mapping', label: 'Brain Mapping', priority: '0.9' },
  { path: '/studio/counselling', label: 'Counselling', priority: '0.9' },
  { path: '/studio/training-and-placement', label: 'Training & Placement', priority: '0.88' },
];

const PROGRAM_SLUGS = [
  'class-1-5', 'class-6-8', 'class-9-10', 'class-11-12', 'college-students', 'working-professionals',
];

const PARTNER_SLUGS = [
  'schools', 'coaching-centers', 'colleges', 'corporates', 'teachers', 'referral-partner',
];

const ASSESSMENT_SLUGS = ['dmit', 'psychometric', 'dmit-psychometric', 'why-dreams-mantra'];

const PAGE_ENTRIES = [
  { path: '/', label: 'Home', group: 'Main', priority: '1.0', changefreq: 'weekly' },
  { path: '/about', label: 'About', group: 'Main', priority: '0.85', changefreq: 'monthly' },
  { path: '/contact', label: 'Contact', group: 'Main', priority: '0.85', changefreq: 'monthly' },
  { path: '/counselling', label: 'Counselling', group: 'Programs', priority: '0.95', changefreq: 'weekly' },
  { path: '/assessments', label: 'Assessments', group: 'Programs', priority: '0.95', changefreq: 'weekly' },
  { path: '/crp', label: 'Career Readiness Program', group: 'Programs', priority: '0.85', changefreq: 'monthly' },
  { path: '/crp/explore', label: 'CRP Explore', group: 'Programs', priority: '0.8', changefreq: 'monthly' },
  { path: '/careers', label: 'Career Library', group: 'Explore', priority: '0.9', changefreq: 'weekly' },
  { path: '/marketplace', label: 'Marketplace', group: 'Explore', priority: '0.8', changefreq: 'weekly' },
  { path: '/signup', label: 'Sign Up', group: 'Account', priority: '0.7', changefreq: 'monthly' },
  { path: '/login', label: 'Login', group: 'Account', priority: '0.6', changefreq: 'monthly' },
  { path: '/terms', label: 'Terms', group: 'Legal', priority: '0.3', changefreq: 'yearly' },
  { path: '/sitemap.html', label: 'Site Map', group: 'Main', priority: '0.4', changefreq: 'monthly' },
];

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeHtml(str) {
  return escapeXml(str);
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
    .map((f) => `  <sitemap>\n    <loc>${SITE}/${f}</loc>\n    <lastmod>${TODAY}</lastmod>\n  </sitemap>`)
    .join('\n');
  fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>
`, 'utf8');
}

function loadCareerSlugs() {
  const file = path.join(OUT_DIR, 'data', 'careers.json');
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  const list = Array.isArray(raw) ? raw : raw.careers || [];
  return list.map((c) => c.slug).filter(Boolean);
}

function writeHtmlSitemap(sections) {
  const groups = sections.map((section) => {
    const links = section.items
      .map((item) => `<li><a href="${escapeHtml(item.url)}">${escapeHtml(item.label)}</a><span>${escapeHtml(item.hint || '')}</span></li>`)
      .join('\n');
    return `<section class="group"><h2>${escapeHtml(section.title)}</h2><ul>${links}</ul></section>`;
  }).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Site Map — Dream Mantra</title>
  <meta name="description" content="Browse every page on Dream Mantra — assessments, programs, career library, studio landing pages, and partner pages.">
  <link rel="canonical" href="${SITE}/sitemap.html">
  <style>
    :root { --orange:#f97316; --slate:#0f172a; --muted:#64748b; }
    * { box-sizing:border-box; }
    body { font-family: system-ui, sans-serif; margin:0; padding:2rem 1rem 3rem; background:#f8fafc; color:var(--slate); line-height:1.5; }
    .wrap { max-width: 960px; margin: 0 auto; }
    h1 { margin:0 0 .35rem; font-size: clamp(1.75rem, 4vw, 2.4rem); }
    .lead { color: var(--muted); margin: 0 0 2rem; max-width: 42rem; }
    .group { background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:1.25rem 1.5rem; margin-bottom:1rem; }
    .group h2 { margin:0 0 .75rem; font-size:1.05rem; color:var(--orange); }
    ul { list-style:none; margin:0; padding:0; display:grid; gap:.55rem; }
    li { display:flex; flex-wrap:wrap; gap:.35rem .75rem; align-items:baseline; }
    a { color:var(--slate); font-weight:700; text-decoration:none; }
    a:hover { color:var(--orange); text-decoration:underline; }
    span { color:var(--muted); font-size:.9rem; }
    .meta { margin-top:2rem; font-size:.85rem; color:var(--muted); }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Dream Mantra Site Map</h1>
    <p class="lead">Quick navigation to every public page — assessments, programs, studio landing pages, careers, and partners. Updated ${TODAY}.</p>
    ${groups}
    <p class="meta">Machine-readable sitemaps: <a href="/sitemap.xml">sitemap.xml</a></p>
  </div>
</body>
</html>`;
  fs.writeFileSync(path.join(OUT_DIR, 'sitemap.html'), html, 'utf8');
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const pages = PAGE_ENTRIES.map((e) => ({
    loc: `${SITE}${e.path}`,
    priority: e.priority,
    changefreq: e.changefreq,
  }));
  const pagesCount = writeUrlset('sitemap-pages.xml', pages);

  const studio = STUDIO_LANDINGS.map((s) => ({
    loc: `${SITE}${s.path}`,
    priority: s.priority,
    changefreq: 'weekly',
  }));
  const studioCount = writeUrlset('sitemap-studio.xml', studio);

  const assessments = [
    { loc: `${SITE}/assessments`, priority: '0.95', changefreq: 'weekly' },
    ...ASSESSMENT_SLUGS.map((slug) => ({
      loc: `${SITE}/assessments/${slug}`,
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
    'sitemap-studio.xml',
    'sitemap-assessments.xml',
    'sitemap-programs.xml',
    'sitemap-partners.xml',
    'sitemap-careers.xml',
  ]);

  writeHtmlSitemap([
    {
      title: 'Main pages',
      items: PAGE_ENTRIES.filter((p) => p.group === 'Main').map((p) => ({
        url: `${SITE}${p.path}`,
        label: p.label,
      })),
    },
    {
      title: 'Assessments & counselling',
      items: [
        { url: `${SITE}/counselling`, label: 'Counselling hub', hint: 'Brain Mapping, Skill Mapping & combo' },
        { url: `${SITE}/assessments`, label: 'All assessments' },
        ...ASSESSMENT_SLUGS.map((slug) => ({
          url: `${SITE}/assessments/${slug}`,
          label: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        })),
      ],
    },
    {
      title: 'Studio landing pages (Join Now → Sign up → Checkout)',
      items: STUDIO_LANDINGS.map((s) => ({ url: `${SITE}${s.path}`, label: s.label })),
    },
    {
      title: 'Programs by age & stage',
      items: PROGRAM_SLUGS.map((slug) => ({
        url: `${SITE}/programs/${slug}`,
        label: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      })),
    },
    {
      title: 'Partner pages',
      items: PARTNER_SLUGS.map((slug) => ({
        url: `${SITE}/partner/${slug}`,
        label: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      })),
    },
    {
      title: 'Career library',
      items: [
        { url: `${SITE}/careers`, label: 'Browse all careers' },
        ...careerSlugs.slice(0, 40).map((slug) => ({
          url: `${SITE}/careers/${slug}`,
          label: slug.replace(/-/g, ' '),
        })),
      ],
    },
  ]);

  const total = pagesCount + studioCount + assessmentsCount + programsCount + partnersCount + careersCount;
  console.log(`Sitemaps written to ${OUT_DIR}`);
  console.log(`  sitemap-pages.xml       ${pagesCount} URLs`);
  console.log(`  sitemap-studio.xml      ${studioCount} URLs`);
  console.log(`  sitemap-assessments.xml ${assessmentsCount} URLs`);
  console.log(`  sitemap-programs.xml    ${programsCount} URLs`);
  console.log(`  sitemap-partners.xml    ${partnersCount} URLs`);
  console.log(`  sitemap-careers.xml     ${careersCount} URLs`);
  console.log(`  sitemap.html            human-readable index`);
  console.log(`  sitemap.xml (index)     6 child sitemaps, ${total} URLs total`);
}

main();
