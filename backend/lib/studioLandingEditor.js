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
import {
  captureLandingFilesFromDisk,
  deleteLandingFilesFromStore,
  ensureLandingFilesOnDisk,
  persistLandingFiles,
  saveLandingAssetsToStore,
  saveLandingFilesToStore,
} from './studioLandingStore.js';

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
  <link rel="stylesheet" href="/studio/shared/responsive.css">
</head>
<body class="bg-slate-50 text-slate-900 antialiased overflow-x-hidden" data-dm-studio="{{SLUG}}" data-dm-product="{{PRODUCT}}">
  <section class="max-w-4xl mx-auto px-4 py-16 text-center">
    <h1 class="text-3xl sm:text-5xl font-black mb-4">{{LABEL}}</h1>
    <p class="text-slate-600 mb-8">Edit this page from Admin → Landing Pages.</p>
    <button type="button" class="js-open-join-modal bg-orange-500 text-white px-8 py-4 rounded-xl font-bold">{{CTA}}</button>
  </section>
  <div id="join-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div class="bg-white rounded-2xl max-w-md w-full p-6">
      <h2 class="text-2xl font-black mb-4 text-center">Join Now</h2>
      <form id="lead-form" class="space-y-3 text-left">
        <input id="lf-name" class="w-full border rounded-lg px-3 py-2" placeholder="Full name" required />
        <input id="lf-email" type="email" class="w-full border rounded-lg px-3 py-2" placeholder="Email" required />
        <input id="lf-phone" class="w-full border rounded-lg px-3 py-2" placeholder="10-digit mobile" required />
        <input id="lf-password" type="password" class="w-full border rounded-lg px-3 py-2" placeholder="Password (min 6 chars)" required minlength="6" />
        <input id="lf-confirm-password" type="password" class="w-full border rounded-lg px-3 py-2" placeholder="Confirm password" required minlength="6" />
        <p id="password-error" class="hidden text-red-600 text-sm">Passwords do not match</p>
        <button type="submit" class="w-full bg-orange-500 text-white py-3 rounded-xl font-bold">JOIN NOW</button>
      </form>
    </div>
  </div>
  <script src="script.js"></script>
  <script src="/studio/checkout-bridge.js"></script>
</body>
</html>`;

function landingDir(slug) {
  const meta = getAllStudioLandings().find((l) => l.slug === slug);
  if (!meta) throw new Error('Landing page not found');
  if (!ensureLandingFilesOnDisk(meta)) {
    throw new Error('Landing page folder missing on server');
  }
  const dir = path.join(landingPagesDir, meta.folder);
  return { meta, dir };
}

export function listStudioLandingsForAdmin() {
  return getAllStudioLandings().map((l) => {
    const exists = ensureLandingFilesOnDisk(l);
    const meta = getLandingMeta(l.slug);
    const published = isLandingPublished(l.slug, exists);
    const productSlug = meta.productSlug || l.productSlug;
    return {
      slug: l.slug,
      label: l.label,
      productSlug,
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
  const meta = getAllStudioLandings().find((l) => l.slug === slug);
  if (!meta) throw new Error('Landing page not found');
  persistLandingFiles(meta, files);
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

function applyLandingAssetPaths(html, { hasHero, hasLogo }) {
  let content = html;
  if (hasHero) {
    content = content
      .replace(/assets\/founder[^"']*\.(png|jpg|webp)/gi, 'assets/hero.png')
      .replace(/assets\/esha-new\.png/gi, 'assets/hero.png');
  }
  if (hasLogo) {
    content = content.replace(/assets\/logo\.png/g, 'assets/logo.png');
  }
  return content;
}

function copyTemplateFiles(targetDir, { slug, label, productSlug, ctaLabel, assets = {} }) {
  const templateDir = path.join(landingPagesDir, 'Counselling');
  const assetsDir = path.join(targetDir, 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });

  const heroB64 = assets.heroImage || assets.hero;
  const logoB64 = assets.logoImage || assets.logo;
  if (heroB64) fs.writeFileSync(path.join(assetsDir, 'hero.png'), Buffer.from(heroB64, 'base64'));
  if (logoB64) fs.writeFileSync(path.join(assetsDir, 'logo.png'), Buffer.from(logoB64, 'base64'));

  const templateAssets = path.join(templateDir, 'assets');
  if (fs.existsSync(templateAssets)) {
    for (const file of fs.readdirSync(templateAssets)) {
      const src = path.join(templateAssets, file);
      const dest = path.join(assetsDir, file);
      if (fs.statSync(src).isFile()) {
        if ((file === 'hero.png' && heroB64) || (file === 'logo.png' && logoB64)) continue;
        fs.copyFileSync(src, dest);
      }
    }
  }

  if (fs.existsSync(templateDir)) {
    for (const filename of Object.values(FILE_KEYS)) {
      const src = path.join(templateDir, filename);
      if (fs.existsSync(src)) {
        let content = fs.readFileSync(src, 'utf8');
        content = personalizeTemplate(content, { slug, label, productSlug, ctaLabel });
        if (filename === 'index.html') {
          content = applyLandingAssetPaths(content, { hasHero: !!heroB64, hasLogo: !!logoB64 });
        }
        fs.writeFileSync(path.join(targetDir, filename), content, 'utf8');
      }
    }
    return;
  }
  const html = DEFAULT_HTML
    .replace(/\{\{LABEL\}\}/g, label)
    .replace(/\{\{SLUG\}\}/g, slug)
    .replace(/\{\{PRODUCT\}\}/g, productSlug)
    .replace(/\{\{CTA\}\}/g, ctaLabel || 'Join Now');
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');
  fs.writeFileSync(path.join(targetDir, 'styles.css'), 'body { font-family: system-ui, sans-serif; }\n', 'utf8');
  fs.writeFileSync(path.join(targetDir, 'script.js'), `document.querySelectorAll('.js-open-join-modal').forEach((btn) => {
  btn.addEventListener('click', () => document.getElementById('join-modal')?.classList.remove('hidden'));
});
document.getElementById('lead-form')?.addEventListener('submit', (e) => window.dmHandleLandingCheckout(e, {}));
`, 'utf8');
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
  captureLandingFilesFromDisk(cleanSlug, cleanFolder);

  return listStudioLandingsForAdmin().find((l) => l.slug === cleanSlug);
}

export function updateStudioLandingAssets(slug, { heroImage, logoImage } = {}) {
  const meta = getAllStudioLandings().find((l) => l.slug === slug);
  if (!meta) throw new Error('Landing page not found');
  const dir = path.join(landingPagesDir, meta.folder);
  if (!fs.existsSync(dir)) throw new Error('Landing page folder missing on server');

  const assetsDir = path.join(dir, 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });
  const assetPatch = {};
  if (heroImage) {
    fs.writeFileSync(path.join(assetsDir, 'hero.png'), Buffer.from(heroImage, 'base64'));
    assetPatch.hero = heroImage;
  }
  if (logoImage) {
    fs.writeFileSync(path.join(assetsDir, 'logo.png'), Buffer.from(logoImage, 'base64'));
    assetPatch.logo = logoImage;
  }

  const htmlPath = path.join(dir, 'index.html');
  if (fs.existsSync(htmlPath)) {
    let html = fs.readFileSync(htmlPath, 'utf8');
    html = applyLandingAssetPaths(html, { hasHero: !!heroImage, hasLogo: !!logoImage });
    fs.writeFileSync(htmlPath, html, 'utf8');
    saveLandingFilesToStore(slug, { html });
  }

  if (Object.keys(assetPatch).length) {
    saveLandingAssetsToStore(slug, assetPatch);
    captureLandingFilesFromDisk(slug, meta.folder);
  }

  setLandingMeta(slug, {
    heroImage: heroImage ? 'assets/hero.png' : getLandingMeta(slug).heroImage,
    logoImage: logoImage ? 'assets/logo.png' : getLandingMeta(slug).logoImage,
  });

  return listStudioLandingsForAdmin().find((l) => l.slug === slug);
}

export function updateStudioLandingMeta(slug, patch) {
  if (!getAllStudioLandings().some((l) => l.slug === slug)) throw new Error('Landing page not found');

  if (patch.heroImage || patch.logoImage) {
    updateStudioLandingAssets(slug, {
      heroImage: patch.heroImage,
      logoImage: patch.logoImage,
    });
    const { heroImage, logoImage, ...rest } = patch;
    if (Object.keys(rest).length === 0) {
      return getLandingMeta(slug);
    }
    patch = rest;
  }

  if (patch.productSlug) {
    const custom = readCustomLandings();
    const builtin = BUILTIN_STUDIO_LANDINGS.find((l) => l.slug === slug);
    if (builtin) {
      setLandingMeta(slug, { productSlug: patch.productSlug });
    } else {
      const idx = custom.findIndex((l) => l.slug === slug);
      if (idx >= 0) {
        custom[idx] = { ...custom[idx], productSlug: patch.productSlug };
        saveCustomLandings(custom);
      }
    }
    try {
      const { dir } = landingDir(slug);
      const htmlPath = path.join(dir, 'index.html');
      if (fs.existsSync(htmlPath)) {
        let html = fs.readFileSync(htmlPath, 'utf8');
        html = html.replace(/data-dm-product="[^"]*"/, `data-dm-product="${patch.productSlug}"`);
        fs.writeFileSync(htmlPath, html, 'utf8');
      }
    } catch {
      /* folder may be missing */
    }
  }

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
  deleteLandingFilesFromStore(slug);
  return { deleted: true };
}
