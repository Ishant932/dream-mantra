/**
 * Rebrand user-facing copy:
 * - DMIT / Dermatoglyphics → Mind Mapping
 * - Psychometric → Skill Mapping
 * - AI Career Launchpad Readiness Test → AI Career Launchpad Training
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const TARGET_DIRS = [
  path.join(ROOT, 'client', 'src'),
  path.join(ROOT, 'backend', 'lib'),
  path.join(ROOT, 'backend', 'routes'),
  path.join(ROOT, 'backend', 'config'),
  path.join(ROOT, 'backend', 'data'),
];

const EXTRA_FILES = [
  path.join(ROOT, 'client', 'index.html'),
  path.join(ROOT, 'backend', 'data.json'),
];

const EXT = new Set(['.js', '.jsx', '.html', '.json']);

const REPLACEMENTS = [
  ['AI Career Launchpad Readiness Test', 'AI Career Launchpad Training'],
  ['Dermatoglyphics Multiple Intelligence Test', 'Mind Mapping'],
  ['Dermatoglyphics Multiple Intelligence', 'Mind Mapping'],
  ['DMIT + Psychometric', 'Mind Mapping + Skill Mapping'],
  ['DMIT & Psychometric', 'Mind Mapping & Skill Mapping'],
  ['DMIT+Psychometric', 'Mind Mapping+Skill Mapping'],
  ['Psychometric Tests', 'Skill Mapping'],
  ['Psychometric Test', 'Skill Mapping'],
  ['psychometric tests', 'skill mapping'],
  ['psychometric test', 'skill mapping'],
  ['Psychometric Suite', 'Skill Mapping'],
  ['Psychometric Assessment', 'Skill Mapping'],
  ['5-Dimensional Psychometric', '5-Dimensional Skill Mapping'],
  ['psychometric/DMIT', 'skill mapping/Mind Mapping'],
  ['DMIT/Psychometric', 'Mind Mapping/Skill Mapping'],
  ['psychometrics', 'skill mapping'],
  ['Psychometrics', 'Skill Mapping'],
  ['Psychometric', 'Skill Mapping'],
  ['psychometric', 'skill mapping'],
  ['DMIT Assessment', 'Mind Mapping'],
  ['DMIT talent scan', 'Mind Mapping talent scan'],
  ['DMIT fingerprint', 'Mind Mapping fingerprint'],
  ['DMIT report', 'Mind Mapping report'],
  ['DMIT results', 'Mind Mapping results'],
  ['DMIT science', 'Mind Mapping science'],
  ['DMIT —', 'Mind Mapping —'],
  ['DMIT -', 'Mind Mapping -'],
  ['DMIT,', 'Mind Mapping,'],
  ['DMIT.', 'Mind Mapping.'],
  ['DMIT?', 'Mind Mapping?'],
  ['DMIT!', 'Mind Mapping!'],
  ['(DMIT)', '(Mind Mapping)'],
  ['DMIT ', 'Mind Mapping '],
  [' DMIT', ' Mind Mapping'],
  ['DMIT', 'Mind Mapping'],
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory() && name !== 'node_modules' && name !== 'dist') walk(full, files);
    else if (stat.isFile() && EXT.has(path.extname(name))) files.push(full);
  }
  return files;
}

function applyReplacements(text) {
  let out = text;
  for (const [from, to] of REPLACEMENTS) {
    out = out.split(from).join(to);
  }
  return out;
}

const files = [...EXTRA_FILES.filter((f) => fs.existsSync(f))];
for (const dir of TARGET_DIRS) files.push(...walk(dir));

let changed = 0;
for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const next = applyReplacements(raw);
  if (next !== raw) {
    fs.writeFileSync(file, next, 'utf8');
    changed++;
    console.log('Updated:', path.relative(ROOT, file));
  }
}
console.log(`Done. ${changed} files updated.`);
