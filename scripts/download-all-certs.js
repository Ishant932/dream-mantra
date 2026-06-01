import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '../client/public/certifications');

const html = await fetch('https://sites.google.com/view/dreamz-roadmap/home').then((r) => r.text());
const certIdx = html.search(/OUR CERTIFICATIONS|Our Certifications/i);
const snippet = html.slice(Math.max(0, certIdx - 500), certIdx + 12000);
const certSectionUrls = [...snippet.matchAll(/https:\/\/lh3\.googleusercontent\.com\/sitesv\/[^"'\s)]+/g)]
  .map((m) => m[0].replace(/\\u003d/g, '=').replace(/=w16383$/, '=w1280'));

const allPageUrls = [...html.matchAll(/https:\/\/lh3\.googleusercontent\.com\/sitesv\/[^"'\s)]+=w1280/g)].map((m) => m[0]);

const hdr = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Referer: 'https://sites.google.com/view/dreamz-roadmap/home',
};

async function tryDownload(url, dest) {
  const res = await fetch(url, { headers: hdr });
  if (!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 10000) return false;
  fs.writeFileSync(dest, buf);
  return buf.length;
}

fs.mkdirSync(outDir, { recursive: true });

// Try cert section URLs first (7 slots)
for (let i = 0; i < 7; i++) {
  const url = certSectionUrls[i];
  if (!url) continue;
  const dest = path.join(outDir, `cert-${i + 1}.jpg`);
  const ok = await tryDownload(url, dest);
  console.log(`cert-${i + 1}`, ok ? `OK (${ok} bytes)` : 'FAILED', url.slice(-30));
}

// Fill missing cert-2 and cert-7 from other page images
const missing = [2, 7].filter((n) => {
  const f = path.join(outDir, `cert-${n}.jpg`);
  return !fs.existsSync(f) || fs.statSync(f).size < 10000;
});

if (missing.length) {
  console.log('\nTrying alternate URLs for missing:', missing);
  let altIdx = 0;
  for (const url of allPageUrls) {
    if (certSectionUrls.includes(url)) continue;
    const dest = path.join(outDir, `alt-${++altIdx}.jpg`);
    const size = await tryDownload(url, dest);
    if (size) console.log(`alt-${altIdx}: ${size} bytes`);
  }
}

console.log('\nFinal cert files:');
for (let i = 1; i <= 7; i++) {
  const f = path.join(outDir, `cert-${i}.jpg`);
  if (fs.existsSync(f)) console.log(`cert-${i}.jpg`, fs.statSync(f).size);
  else console.log(`cert-${i}.jpg MISSING`);
}
