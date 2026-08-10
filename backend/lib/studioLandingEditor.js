import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getAllStudioLandings,
  readCustomLandings,
  saveCustomLandings,
  BUILTIN_STUDIO_LANDINGS,
} from './studioLandings.js';
import { deleteLandingMeta, getLandingMeta, isLandingPublished, setLandingMeta } from './studioLandingMeta.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const landingPagesDir = path.join(__dirname, '../../Landing Pages');

const FILE_KEYS = {
  html: 'index.html',
  css: 'styles.css',
  js: 'script.js',
};

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{LABEL}}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="styles.css">
</head>
<body class="bg-slate-50 text-slate-900 antialiased overflow-x-hidden" data-dm-studio="{{SLUG}}" data-dm-product="{{PRODUCT}}">
  <section class="max-w-4xl mx-auto px-4 py-16 text-center">
    <h1 class="text-3xl sm:text-5xl font-black mb-4">{{LABEL}}</h1>
    <p class="text-slate-600 mb-8">Edit this page from Admin → Landing Pages.</p>
    <button type="button" class="js-open-join-modal bg-orange-500 text-white px-8 py-4 rounded-xl font-bold">Join Now</button>
  </section>
  <script src="script.js"></script>
</body>
</html>`;

function landingDir(slug) {
  const meta = getAllStudioLandings().find((l) => l.slug === slug);
  if (!meta) throw new Error('Landing page not found');
  const dir = path.join(landingPagesDir, meta.folder);
  if (!fs.existsSync(dir)) throw new Error('Landing page folder missing on server');
  return { meta, dir };
}

export function listStudioLandingsForAdmin() {
  return getAllStudioLandings().map((l) => {
    const dir = path.join(landingPagesDir, l.folder);
    const exists = fs.existsSync(dir);
    const meta = getLandingMeta(l.slug);
    const published = isLandingPublished(l.slug, exists);
    return {
      slug: l.slug,
      label: l.label,
      productSlug: l.productSlug,
      folder: l.folder,
      live: published,
      filesExist: exists,
      published,
      custom: !BUILTIN_STUDIO_LANDINGS.some((b) => b.slug === l.slug),
      heroImage: meta.heroImage || '',
      logoImage: meta.logoImage || '',
      ctaLabel: meta.ctaLabel || 'Book Now',
      localPath: `/studio/${l.slug}/`,
      productionPath: `https://dreammantra.in/studio/${l.slug}/`,
    };
  });
}

export function readStudioLanding(slug) {
  const { meta, dir } = landingDir(slug);
  const files = {};
  for (const [key, filename] of Object.entries(FILE_KEYS)) {
    const filePath = path.join(dir, filename);
    files[key] = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  }
  return {
    slug: meta.slug,
    label: meta.label,
    productSlug: meta.productSlug,
    files,
  };
}

export function writeStudioLanding(slug, files = {}) {
  const { meta, dir } = landingDir(slug);
  for (const [key, content] of Object.entries(files)) {
    const filename = FILE_KEYS[key];
    if (!filename || typeof content !== 'string') continue;
    fs.writeFileSync(path.join(dir, filename), content, 'utf8');
  }
  return readStudioLanding(slug);
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function personalizeTemplate(content, { slug, label, productSlug, ctaLabel = 'Book Now' }) {
  return content
    .replace(/data-dm-studio="[^"]*"/, `data-dm-studio="${slug}"`)
    .replace(/data-dm-product="[^"]*"/, `data-dm-product="${productSlug}"`)
    .replace(/<title>[^<]*<\/title>/, `<title>${label}</title>`)
    .replace(/free guidance call/gi, ctaLabel)
    .replace(/Free Guidance Call/gi, ctaLabel)
    .replace(/JOIN NOW/g, ctaLabel.toUpperCase())
    .replace(/Book a free guidance call/gi, ctaLabel)
    .replace(/guidance call/gi, 'session')
    .replace(/<link rel="stylesheet" href="styles.css">/, '<link rel="stylesheet" href="styles.css">\n  <link rel="stylesheet" href="/studio/shared/responsive.css">');
}

function copyTemplateFiles(targetDir, { slug, label, productSlug, ctaLabel, assets = {} }) {
  const templateDir = path.join(landingPagesDir, 'Counselling');
  const assetsDir = path.join(targetDir, 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });

  if (assets.heroImage) fs.writeFileSync(path.join(assetsDir, 'hero.png'), Buffer.from(assets.heroImage, 'base64'));
  if (assets.logoImage) fs.writeFileSync(path.join(assetsDir, 'logo.png'), Buffer.from(assets.logoImage, 'base64'));

  if (fs.existsSync(templateDir)) {
    for (const filename of Object.values(FILE_KEYS)) {
      const src = path.join(templateDir, filename);
      if (fs.existsSync(src)) {
        let content = fs.readFileSync(src, 'utf8');
        content = personalizeTemplate(content, { slug, label, productSlug, ctaLabel });
        if (assets.heroImage && filename === 'index.html') {
          content = content.replace(/assets\/founder[^"']*\.(png|jpg|webp)/gi, 'assets/hero.png');
        }
        if (assets.logoImage && filename === 'index.html') {
          content = content.replace(/assets\/logo\.png/g, 'assets/logo.png');
        }
        fs.writeFileSync(path.join(targetDir, filename), content, 'utf8');
      }
    }
    return;
  }
  const html = DEFAULT_HTML
    .replace(/\{\{LABEL\}\}/g, label)
    .replace(/\{\{SLUG\}\}/g, slug)
    .replace(/\{\{PRODUCT\}\}/g, productSlug);
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');
  fs.writeFileSync(path.join(targetDir, 'styles.css'), 'body { font-family: system-ui, sans-serif; }\n', 'utf8');
  fs.writeFileSync(path.join(targetDir, 'script.js'), '', 'utf8');
}

export function createStudioLanding({ slug, label, productSlug, folder, ctaLabel, heroImage, logoImage }) {
  const cleanSlug = slugify(slug);
  const cleanLabel = String(label || '').trim();
  const cleanProduct = String(productSlug || '').trim();
  const cleanFolder = String(folder || cleanLabel || cleanSlug).trim();
  const cleanCta = String(ctaLabel || 'Book Now').trim();

  if (!cleanSlug) throw new Error('URL slug is required');
  if (!cleanLabel) throw new Error('Page label is required');
  if (!cleanProduct) throw new Error('Checkout module is required');
  if (getAllStudioLandings().some((l) => l.slug === cleanSlug)) {
    throw new Error('A landing page with this slug already exists');
  }

  const targetDir = path.join(landingPagesDir, cleanFolder);
  if (fs.existsSync(targetDir)) throw new Error('Folder already exists — choose a different name');

  fs.mkdirSync(targetDir, { recursive: true });
  copyTemplateFiles(targetDir, {
    slug: cleanSlug,
    label: cleanLabel,
    productSlug: cleanProduct,
    ctaLabel: cleanCta,
    assets: { heroImage, logoImage },
  });

  const entry = { slug: cleanSlug, label: cleanLabel, folder: cleanFolder, productSlug: cleanProduct };
  const custom = readCustomLandings();
  custom.push(entry);
  saveCustomLandings(custom);
  setLandingMeta(cleanSlug, { published: true, ctaLabel: cleanCta, heroImage: heroImage ? 'assets/hero.png' : '', logoImage: logoImage ? 'assets/logo.png' : '' });

  return listStudioLandingsForAdmin().find((l) => l.slug === cleanSlug);
}

export function updateStudioLandingMeta(slug, patch) {
  if (!getAllStudioLandings().some((l) => l.slug === slug)) throw new Error('Landing page not found');
  return setLandingMeta(slug, patch);
}

export function deleteStudioLanding(slug) {
  const all = getAllStudioLandings();
  const meta = all.find((l) => l.slug === slug);
  if (!meta) throw new Error('Landing page not found');
  const isBuiltin = BUILTIN_STUDIO_LANDINGS.some((b) => b.slug === slug);
  if (isBuiltin) {
    setLandingMeta(slug, { published: false });
    return { deleted: false, unpublished: true };
  }
  const dir = path.join(landingPagesDir, meta.folder);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  saveCustomLandings(readCustomLandings().filter((l) => l.slug !== slug));
  deleteLandingMeta(slug);
  return { deleted: true };
}
