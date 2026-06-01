/**
 * Second pass: restore valid JS keys/routes/imports; capitalize Skill Mapping in prose.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const FILES = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory() && !['node_modules', 'dist'].includes(name)) walk(full);
    else if (/\.(js|jsx|css)$/.test(name)) FILES.push(full);
  }
}
walk(path.join(ROOT, 'client', 'src'));

const FIXES = [
  ["import Mind MappingPage from './pages/Mind MappingPage'", "import DMITPage from './pages/DMITPage'"],
  ["import Skill MappingPage from './pages/Skill MappingPage'", "import PsychometricPage from './pages/PsychometricPage'"],
  ["import DMSkill MappingPage from './pages/DMSkill MappingPage'", "import DMPsychometricPage from './pages/DMPsychometricPage'"],
  ['<Mind MappingPage />', '<DMITPage />'],
  ['<Skill MappingPage />', '<PsychometricPage />'],
  ['<DMSkill MappingPage />', '<DMPsychometricPage />'],
  ['path="assessments/skill mapping"', 'path="assessments/psychometric"'],
  ['path="assessments/dmit-skill mapping"', 'path="assessments/dmit-psychometric"'],
  ['export default function Mind MappingPage', 'export default function DMITPage'],
  ['export default function Skill MappingPage', 'export default function PsychometricPage'],
  ["d('pages.skill mapping')", "d('pages.psychometric')"],
  ["d('data.skill mappingTests')", "d('data.psychometricTests')"],
  ['skill mappingDesc:', 'psychometricDesc:'],
  ['skill mappingTitle:', 'psychometricTitle:'],
  ['skill mappingTests:', 'psychometricTests:'],
  ['skill mappingAlt:', 'psychometricAlt:'],
  ['skill mappingOnly:', 'psychometricOnly:'],
  ["slug: 'dmit-skill mapping'", "slug: 'dmit-psychometric'"],
  ["tab === 'skill mapping'", "tab === 'psychometric'"],
  ['tabs.skill mapping.', 'tabs.psychometric.'],
  ['twoPillars.skill mapping.', 'twoPillars.psychometric.'],
  ['home.aiToolkit.skill mapping', 'home.aiToolkit.psychometric'],
  ['page.counselling.skill mappingOnly', 'page.counselling.psychometricOnly'],
  ['/* ── Psychometric page ── */', '/* ── Skill Mapping page ── */'],
  ['How accurate are skill mapping', 'How accurate is Skill Mapping'],
  ['skill mapping map your', 'Skill Mapping maps your'],
  ['skill mapping create the', 'Skill Mapping creates the'],
  ['skill mapping/Mind Mapping', 'Skill Mapping/Mind Mapping'],
  ['Mind Mapping & skill mapping', 'Mind Mapping & Skill Mapping'],
  ['Mind Mapping and skill mapping', 'Mind Mapping and Skill Mapping'],
  ['interprets skill mapping/', 'interprets Skill Mapping/'],
  ['from skill mapping', 'from Skill Mapping'],
  ['(from skill mapping)', '(from Skill Mapping)'],
  ['with the skill mapping', 'with Skill Mapping'],
  ['Combined with the skill mapping', 'Combined with Skill Mapping'],
  ['And the skill mapping analysis', 'And the Skill Mapping analysis'],
  ['current interests (skill mapping)', 'current interests (Skill Mapping)'],
  ['Mind Mapping & skill mapping modules', 'Mind Mapping & Skill Mapping modules'],
  ['Mind Mapping और skill mapping modules', 'Mind Mapping और Skill Mapping modules'],
  ['Complete the skill mapping battery', 'Complete the Skill Mapping battery'],
  ['skill mapping assessment', 'Skill Mapping assessment'],
  ['skill mapping counselling', 'Skill Mapping counselling'],
  ['Mind Mapping, skill mapping,', 'Mind Mapping, Skill Mapping,'],
  ['Mind Mapping, skill mapping ', 'Mind Mapping, Skill Mapping '],
  ['Mind Mapping और skill mapping', 'Mind Mapping और Skill Mapping'],
  ['That is where skill mapping assessment', 'That is where Skill Mapping assessment'],
  ['Offer Mind Mapping & skill mapping', 'Offer Mind Mapping & Skill Mapping'],
  ['Skill Mapping tests (', 'Skill Mapping ('],
  ['Skill Mapping tests ', 'Skill Mapping '],
  ['Skill Mapping test.', 'Skill Mapping.'],
  ['Book Skill Mapping test', 'Book Skill Mapping'],
  ['Choose Mind Mapping or Skill Mapping test', 'Choose Mind Mapping or Skill Mapping'],
  ['book your first Mind Mapping or Skill Mapping test', 'book your first Mind Mapping or Skill Mapping session'],
  ['Take Mind Mapping + Skill Mapping test', 'Take Mind Mapping + Skill Mapping'],
  ['takeTest', 'takeAssessment'],
];

for (const file of FILES) {
  let text = fs.readFileSync(file, 'utf8');
  const orig = text;
  for (const [from, to] of FIXES) text = text.split(from).join(to);
  if (text !== orig) {
    fs.writeFileSync(file, text, 'utf8');
    console.log('Fixed:', path.relative(ROOT, file));
  }
}
console.log('Pass 2 done.');
