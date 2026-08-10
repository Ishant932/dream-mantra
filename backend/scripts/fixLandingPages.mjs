import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../Landing Pages');
const dirs = fs.readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory() && d.name !== 'shared');

const TEXT = [
  ['â€"', '—'], ['â€"', '—'], ['â€¢', '•'], ['â€™', "'"], ['â€œ', '"'], ['â€', '"'],
  ['Ã—', '×'], ['Â·', '·'], ['â˜…', '★'], ['Monâ€"Sat', 'Mon–Sat'],
];

function fixHtml(text) {
  let s = text;
  for (const [a, b] of TEXT) s = s.split(a).join(b);
  s = s.replace(/\/studio\/shared-responsive\.css/g, '/studio/shared/responsive.css');
  s = s.replace(/<span class="flash-icon">[^<]*<\/span>/g, '<span class="flash-icon"><i class="fa-solid fa-fire"></i></span>');
  s = s.replace(/\bBOOK NOW\b/g, 'JOIN NOW');
  s = s.replace(/\bBOOK SKILL MAPPING\b/g, 'JOIN NOW');
  s = s.replace(/\bBOOK BRAIN MAPPING\b/g, 'JOIN NOW');
  s = s.replace(/\bBOOK A FREE GUIDANCE CALL\b/g, 'JOIN NOW');
  s = s.replace(/\bBOOK YOUR SEAT\b/g, 'JOIN NOW');
  return s;
}

for (const dir of dirs) {
  const html = path.join(root, dir.name, 'index.html');
  if (!fs.existsSync(html)) continue;
  fs.writeFileSync(html, fixHtml(fs.readFileSync(html, 'utf8')), 'utf8');
  console.log('fixed', dir.name);
}
