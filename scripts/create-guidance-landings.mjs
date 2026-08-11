import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const landingRoot = path.join(root, 'Landing Pages');

const GUIDANCE_MODAL = `
  <div id="guidance-modal-overlay" class="guidance-modal-overlay" aria-hidden="true">
    <div class="guidance-modal-panel" role="dialog" aria-modal="true" aria-labelledby="guidance-modal-title">
      <button type="button" id="guidance-modal-close-btn" class="guidance-modal-close" aria-label="Close">
        <i class="fa-solid fa-xmark"></i>
      </button>
      <div class="text-center">
        <span class="guidance-modal-badge"><i class="fa-solid fa-phone"></i> Free guidance call</span>
        <h2 id="guidance-modal-title" class="guidance-modal-title">Book a Free Guidance Call</h2>
        <p class="guidance-modal-sub">Share your details. A Dream Mantra counsellor will call you back — Mon–Sat, 11 AM – 7 PM.</p>
      </div>
      <form id="guidance-form" class="max-w-md mx-auto" novalidate>
        <div class="guidance-form-field">
          <label for="gf-name">Full name</label>
          <input type="text" id="gf-name" required placeholder="Your name">
        </div>
        <div class="guidance-form-field">
          <label for="gf-email">Email</label>
          <input type="email" id="gf-email" required placeholder="your@email.com">
        </div>
        <div class="guidance-form-field">
          <label for="gf-phone">Mobile / WhatsApp</label>
          <input type="tel" id="gf-phone" placeholder="10-digit number">
        </div>
        <div class="guidance-form-field">
          <label for="gf-message">How can we help?</label>
          <textarea id="gf-message" placeholder="Tell us about your goals or questions…"></textarea>
        </div>
        <button type="submit" class="guidance-form-submit">Book a Free Guidance Call</button>
        <p id="guidance-form-msg" class="guidance-form-msg" hidden></p>
      </form>
    </div>
  </div>`;

const PAGES = [
  {
    slug: 'counselling-guidance',
    folder: 'Counselling Guidance',
    source: 'Counselling',
    productSlug: 'dmit-psychometric',
    title: 'Career & Education Counselling — Free Guidance',
  },
  {
    slug: 'brain-mapping-guidance',
    folder: 'Brain Mapping Guidance',
    source: 'Brain Mapping',
    productSlug: 'dmit',
    title: 'Brain Mapping — Free Guidance Call',
  },
  {
    slug: 'skill-mapping-guidance',
    folder: 'Skill Mapping Guidance',
    source: 'Skill Mapping',
    productSlug: 'psychometric',
    title: 'Skill Mapping — Free Guidance Call',
  },
  {
    slug: 'brain-skill-mapping-guidance',
    folder: 'Brain Skill Mapping Guidance',
    source: 'Counselling',
    productSlug: 'dmit-psychometric',
    title: 'Brain + Skill Mapping — Free Guidance Call',
    replaceTitle: true,
  },
];

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function transformHtml(html, meta) {
  let out = html;
  out = out.replace(/data-dm-studio="[^"]*"/, `data-dm-studio="${meta.slug}"`);
  out = out.replace(/data-dm-product="[^"]*"/, `data-dm-product="${meta.productSlug}"`);
  if (meta.title) {
    out = out.replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`);
  }
  if (meta.replaceTitle) {
    out = out.replace(/Career & Education Counselling/g, 'Brain + Skill Mapping');
    out = out.replace(/Brain Mapping & Skill Mapping powered/g, 'Complete Brain + Skill Mapping powered');
  }

  const replacements = [
    [/JOIN NOW/g, 'Book a Free Guidance Call'],
    [/Join Now — Limited Seats Left!/g, 'Book a Free Guidance Call'],
    [/Join Now/g, 'Book a Free Guidance Call'],
    [/join now to secure your seat/gi, 'book a free guidance call to secure your slot'],
    [/js-open-join-modal/g, 'js-open-guidance-modal'],
    [/Sign up below — you will be taken to checkout after registration/gi, 'Share your details and our counsellor will call you back'],
  ];
  for (const [pattern, value] of replacements) {
    out = out.replace(pattern, value);
  }

  out = out.replace(
    /<div id="join-modal-overlay"[\s\S]*?<\/div>\s*\n\s*<\/div>\s*\n\s*(?:<script src="\/studio\/checkout-bridge\.js"><\/script>\s*\n\s*)?/,
    `${GUIDANCE_MODAL}\n\n  <link rel="stylesheet" href="/studio/shared/guidance-modal.css">\n\n  `
  );

  if (!out.includes('guidance-modal.js')) {
    out = out.replace(
      '<script src="script.js"></script>',
      '<script src="script.js"></script>\n  <script src="/studio/shared/guidance-modal.js"></script>'
    );
  }

  if (!out.includes('responsive.css')) {
    out = out.replace(
      '<link rel="stylesheet" href="styles.css">',
      '<link rel="stylesheet" href="styles.css">\n  <link rel="stylesheet" href="/studio/shared/responsive.css">'
    );
  }

  return out;
}

const custom = [];

for (const page of PAGES) {
  const srcDir = path.join(landingRoot, page.source);
  const destDir = path.join(landingRoot, page.folder);
  if (!fs.existsSync(srcDir)) {
    console.error('Missing source:', srcDir);
    process.exit(1);
  }
  if (fs.existsSync(destDir)) fs.rmSync(destDir, { recursive: true, force: true });
  copyDir(srcDir, destDir);
  const indexPath = path.join(destDir, 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');
  fs.writeFileSync(indexPath, transformHtml(html, page), 'utf8');
  custom.push({
    slug: page.slug,
    label: page.folder,
    folder: page.folder,
    productSlug: page.productSlug,
    guidance: true,
  });
  console.log('Created', page.folder);
}

const customPath = path.join(root, 'backend/data/studio-landings-custom.json');
const existing = JSON.parse(fs.readFileSync(customPath, 'utf8'));
const kept = existing.filter((e) => !e.guidance);
fs.writeFileSync(customPath, JSON.stringify([...kept, ...custom], null, 2), 'utf8');
console.log('Updated studio-landings-custom.json');
