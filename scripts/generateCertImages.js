/**
 * Generate certificate SVG images for the certifications showcase.
 * Replaces broken .jpg files that were Google 403 HTML error pages.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '../client/public/certifications');

const certs = [
  {
    file: 'cert-1',
    badge: 'INTERNATIONAL',
    title: 'Internationally Certified Coach',
    issuer: 'Mindler · ICCC Foundation Level',
    accent: '#1e4d8c',
    seal: '🌍',
  },
  {
    file: 'cert-2',
    badge: 'GOVERNMENT',
    title: 'Government Certified Coach',
    issuer: 'Reliance Foundation · Skill India · NSDC',
    accent: '#0d5c2e',
    seal: '🇮🇳',
  },
  {
    file: 'cert-3',
    badge: 'NLP PRACTITIONER',
    title: 'NLP Practitioner Certification',
    issuer: "NLP Workshop Training · Batch Jul'24",
    accent: '#6b21a8',
    seal: '🧠',
  },
  {
    file: 'cert-4',
    badge: 'NLP ADVANCED',
    title: 'NLP Advanced Certified Coach',
    issuer: 'WiseMonk · Advanced NLP Techniques',
    accent: '#7c3aed',
    seal: '✦',
  },
  {
    file: 'cert-5',
    badge: 'IIT MADRAS',
    title: 'IIT Madras Certified Coach',
    issuer: 'IITM Pravartak · BodhBridge · Grade A',
    accent: '#7f1d1d',
    seal: '🎓',
  },
  {
    file: 'cert-6',
    badge: 'RELIANCE FOUNDATION',
    title: 'Reliance Foundation Certified Coach',
    issuer: 'Reliance Foundation Skilling Academy',
    accent: '#0369a1',
    seal: '✨',
  },
  {
    file: 'cert-7',
    badge: 'MIND MAPPING',
    title: 'Mind Mapping & Mid Brain Activation Coach',
    issuer: 'MindTech International · ISO 9001:2015',
    accent: '#b45309',
    seal: '🔬',
  },
];

function wrapText(text, maxChars = 28) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function escapeXml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function makeSvg({ badge, title, issuer, accent, seal }) {
  const titleLines = wrapText(title, 22);
  const issuerLines = wrapText(issuer, 32);

  const titleY = 200;
  const titleSvg = titleLines
    .map(
      (line, i) =>
        `<text x="200" y="${titleY + i * 28}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="20" font-weight="700" fill="#1a2e1a">${escapeXml(line)}</text>`
    )
    .join('\n  ');

  const issuerStartY = titleY + titleLines.length * 28 + 36;
  const issuerSvg = issuerLines
    .map(
      (line, i) =>
        `<text x="200" y="${issuerStartY + i * 22}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="13" fill="#5c5346">${escapeXml(line)}</text>`
    )
    .join('\n  ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" role="img" aria-label="${escapeXml(title)}">
  <defs>
    <linearGradient id="paper" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffef9"/>
      <stop offset="45%" stop-color="#fdf8ee"/>
      <stop offset="100%" stop-color="#f3e8d0"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#a8842e"/>
      <stop offset="35%" stop-color="#e8c96a"/>
      <stop offset="65%" stop-color="#f5e6a8"/>
      <stop offset="100%" stop-color="#a8842e"/>
    </linearGradient>
    <radialGradient id="sealGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="400" height="520" fill="url(#paper)"/>
  <rect x="10" y="10" width="380" height="500" fill="none" stroke="url(#gold)" stroke-width="4" rx="6"/>
  <rect x="18" y="18" width="364" height="484" fill="none" stroke="#c9a84c" stroke-width="1.5" rx="4" opacity="0.55"/>
  <line x1="40" y1="130" x2="360" y2="130" stroke="url(#gold)" stroke-width="1.5" opacity="0.7"/>
  <line x1="40" y1="380" x2="360" y2="380" stroke="url(#gold)" stroke-width="1.5" opacity="0.7"/>
  <text x="200" y="68" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="700" fill="${accent}" letter-spacing="4">${escapeXml(badge)}</text>
  <text x="200" y="98" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#8b6914" letter-spacing="5">CERTIFICATE</text>
  <text x="200" y="118" text-anchor="middle" font-family="Georgia, serif" font-size="11" fill="#a08040" letter-spacing="2">OF EXCELLENCE</text>
  ${titleSvg}
  <text x="200" y="${issuerStartY - 18}" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#9ca3af" letter-spacing="2">AWARDED BY</text>
  ${issuerSvg}
  <circle cx="200" cy="430" r="52" fill="url(#sealGlow)"/>
  <circle cx="200" cy="430" r="38" fill="none" stroke="url(#gold)" stroke-width="2.5"/>
  <circle cx="200" cy="430" r="30" fill="#fffef9" stroke="${accent}" stroke-width="1.5" opacity="0.95"/>
  <text x="200" y="440" text-anchor="middle" font-size="26">${seal}</text>
  <text x="200" y="492" text-anchor="middle" font-family="Georgia, serif" font-size="11" font-weight="600" fill="#8b6914" letter-spacing="1">DREAMS MANTRA</text>
  <text x="200" y="506" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="#b8a070">Education &amp; Career Counselling</text>
</svg>`;
}

fs.mkdirSync(outDir, { recursive: true });

for (const cert of certs) {
  const svgPath = path.join(outDir, `${cert.file}.svg`);
  fs.writeFileSync(svgPath, makeSvg(cert), 'utf8');
  // Remove broken jpg if present
  const jpgPath = path.join(outDir, `${cert.file}.jpg`);
  if (fs.existsSync(jpgPath)) fs.unlinkSync(jpgPath);
  console.log('Wrote', svgPath);
}

console.log('Done — 7 certificate SVGs generated.');
