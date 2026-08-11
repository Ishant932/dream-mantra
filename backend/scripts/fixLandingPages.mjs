import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../Landing Pages');
const dirs = fs.readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory() && d.name !== 'shared');

const TEXT = [
  ['â€"', '—'], ['â€"', '—'], ['â€¢', '•'], ['â€™', "'"], ['â€œ', '"'], ['â€', '"'],
  ['Ã—', '×'], ['Â·', '·'], ['â˜…', '★'], ['Monâ€"Sat', 'Mon–Sat'], ['Mon"“Sat', 'Mon–Sat'],
  ['11am"“7pm', '11am–7pm'],
];

const GUIDANCE_REPLACEMENTS = [
  [/Free guidance call ends in/gi, 'Limited slots — offer ends in'],
  [/Free guidance call\s*—\s*limited slots today/gi, 'Limited slots — join now to secure your seat'],
  [/Free guidance call before you start/gi, 'Secure your assessment slot online'],
  [/No fees for initial guidance call\.?/gi, 'Sign up online, then complete checkout'],
  [/Fill out the form below to secure your (?:free )?guidance call slot\.?/gi, 'Sign up below — you will be taken to checkout after registration'],
  [/Book A Free Guidance Call/gi, 'Join Now'],
  [/Book Your Free Guidance Call/gi, 'Start Your Journey Today'],
  [/Book (?:Skill Mapping|Brain Mapping|Counselling|Training(?:\s*&\s*Placement)?)/gi, 'Join Now'],
  [/BOOK NOW/g, 'JOIN NOW'],
  [/BOOK SKILL MAPPING/g, 'JOIN NOW'],
  [/BOOK BRAIN MAPPING/g, 'JOIN NOW'],
  [/BOOK A FREE GUIDANCE CALL/g, 'JOIN NOW'],
  [/BOOK YOUR SEAT/g, 'JOIN NOW'],
];

function fixHtml(text) {
  let s = text;
  for (const [a, b] of TEXT) s = s.split(a).join(b);
  for (const [re, rep] of GUIDANCE_REPLACEMENTS) s = s.replace(re, rep);
  s = s.replace(/\/studio\/shared-responsive\.css/g, '/studio/shared/responsive.css');
  s = s.replace(/<span class="flash-icon">[^<]*<\/span>/g, '<span class="flash-icon"><i class="fa-solid fa-fire"></i></span>');
  if (!s.includes('checkout-bridge.js')) {
    s = s.replace(/<script src="script\.js"><\/script>/, '<script src="/studio/checkout-bridge.js"></script>\n  <script src="script.js"></script>');
  }
  return s;
}

for (const dir of dirs) {
  const html = path.join(root, dir.name, 'index.html');
  if (!fs.existsSync(html)) continue;
  fs.writeFileSync(html, fixHtml(fs.readFileSync(html, 'utf8')), 'utf8');
  console.log('fixed', dir.name);
}
