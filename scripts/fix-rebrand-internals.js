/**
 * Fix internal slugs/keys broken by rebrand script — keep display labels as Mind Mapping / Skill Mapping.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const TARGET_DIRS = [
  path.join(ROOT, 'client', 'src'),
  path.join(ROOT, 'backend'),
  path.join(ROOT, 'client', 'index.html'),
  path.join(ROOT, 'client', 'public', 'data', 'careers.json'),
];

const EXT = new Set(['.js', '.jsx', '.html', '.json']);

const FIXES = [
  // URLs & slugs (internal — keep psychometric)
  ['/assessments/dmit-skill mapping', '/assessments/dmit-psychometric'],
  ['/assessments/skill mapping', '/assessments/psychometric'],
  ["slug: 'skill mapping'", "slug: 'psychometric'"],
  ['slug: "skill mapping"', 'slug: "psychometric"'],
  ["{ slug: 'skill mapping'", "{ slug: 'psychometric'"],
  ["id: 'skill mapping'", "id: 'psychometric'"],
  ["id: 'dmit-skill mapping'", "id: 'dmit-psychometric'"],
  ['skill mapping-portal', 'psychometric-portal'],

  // JS object keys & identifiers
  ['pages.dmitSkill Mapping', 'pages.dmitPsychometric'],
  ['dmitSkill Mapping:', 'dmitPsychometric:'],
  ['skill mapping:', 'psychometric:'],
  ['IMAGES.skill mapping', 'IMAGES.psychometric'],
  ['TEST_CONTENT.skill mapping', 'TEST_CONTENT.psychometric'],
  ['row.skill mapping', 'row.psychometric'],
  ['page.compare.skill mapping', 'page.compare.psychometric'],
  ['hero.skill mappingAlt', 'hero.psychometricAlt'],
  ['skill mappingTitle:', 'psychometricTitle:'],
  ['DMSkill MappingPage', 'DMPsychometricPage'],
  ['Skill MappingPage', 'PsychometricPage'],
  ["from './pages/Skill MappingPage'", "from './pages/PsychometricPage'"],
  ["from './pages/DMSkill MappingPage'", "from './pages/DMPsychometricPage'"],
  ['export default function DMSkill MappingPage', 'export default function DMPsychometricPage'],

  // Duplicate / awkward copy
  ['Mind Mapping (Mind Mapping)', 'Mind Mapping'],
  ['Mind Mapping (Mind Mapping) &', 'Mind Mapping &'],
  ['Dermatoglyphics, Multiple Intelligence mapping', 'Fingerprint-based multiple intelligence mapping'],

  // Careers.json descriptions
  ['Mind Mapping and Skill Mapping assessment', 'Mind Mapping and Skill Mapping assessment'],
  ['DMIT and Psychometric assessment', 'Mind Mapping and Skill Mapping assessment'],
  ['DMIT and Psychometric', 'Mind Mapping and Skill Mapping'],
  ['DMIT & Psychometric', 'Mind Mapping & Skill Mapping'],
  ['DMIT', 'Mind Mapping'],
  ['Psychometric', 'Skill Mapping'],
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const stat = fs.statSync(dir);
  if (stat.isFile()) {
    if (EXT.has(path.extname(dir))) files.push(dir);
    return files;
  }
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const s = fs.statSync(full);
    if (s.isDirectory() && !['node_modules', 'dist'].includes(name)) walk(full, files);
    else if (s.isFile() && EXT.has(path.extname(name))) files.push(full);
  }
  return files;
}

const files = [];
for (const t of TARGET_DIRS) {
  if (t.endsWith('.html') || t.endsWith('.json')) {
    if (fs.existsSync(t)) files.push(t);
  } else walk(t, files);
}

let changed = 0;
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const orig = text;
  for (const [from, to] of FIXES) {
    text = text.split(from).join(to);
  }
  if (text !== orig) {
    fs.writeFileSync(file, text, 'utf8');
    changed++;
    console.log('Fixed:', path.relative(ROOT, file));
  }
}
console.log(`Done. ${changed} files fixed.`);
