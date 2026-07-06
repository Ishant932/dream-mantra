/**
 * Build degree-pathways.json from source batch files.
 * Run: node scripts/buildDegreePathways.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SOURCE = path.join(__dirname, 'data', 'degree-pathways-source.json');
const OUT_PATHS = [
  path.join(ROOT, 'client/public/data/degree-pathways.json'),
  path.join(ROOT, 'backend/data/degree-pathways.json'),
];

const VOCATIONAL_FIX = {
  cluster: 'Skilled Trades & Vocational',
  clusterKey: 'vocational',
  subjects: ['Trade Theory', 'Workshop Practice', 'Engineering Drawing'],
  country: 'India (similar trades abroad)',
  entranceExams: ['ITI entrance', 'Skill assessment'],
  whatYouStudy: 'Vocational training builds practical, job-ready trade skills.',
  skills: ['Problem solving', 'Safety', 'Precision', 'Technical know-how', 'Manual dexterity'],
  topCareers: ['Skilled Technician', 'Self-employed Professional', 'Supervisor', 'Service Provider'],
  difficulty: 'Low-Medium',
  costRange: 'Low (INR 0.1-1.5L)',
  scholarship: 'Govt skill scheme support',
  industryDemand: 'Medium',
  futureDemand: 'Medium',
  aiImpactRisk: 'Low',
  aiProofScore: 8,
  salaryEntry: 'INR 2-3 LPA',
  salaryMid: 'INR 3-5 LPA',
  salarySenior: 'INR 6-9 LPA',
  remoteWork: 'Low',
  govtOpportunities: 'Medium',
  privateOpportunities: 'Very High',
  entrepreneurship: 'Medium',
  research: 'Low',
  globalMobility: 6,
  description: 'Vocational training builds practical, job-ready trade skills.',
  workEnvironment: 'Workshops, sites, service centres',
  typicalDay: 'Build, repair, install and service with hands-on skills',
  personalityFit: 'Practical, skilled, hands-on doers',
  riasec: 'Realistic',
  mbti: 'ISTP, ESTP, ISTJ',
  multipleIntelligence: 'Bodily-Kinesthetic, Spatial',
  futureOutlook: 'Steady; skilled trades stay in demand',
};

const ID_FIXES = {
  CU00012: {
    ...VOCATIONAL_FIX,
    subjects: ['Basic Electronics', 'Electrical Technology', 'Mathematics'],
    skills: ['Circuit troubleshooting', 'Safety', 'Precision', 'Technical know-how', 'Problem solving'],
    topCareers: ['Electronics Technician', 'Service Engineer', 'Maintenance Technician', 'Self-employed Repair Specialist'],
    whatYouStudy: 'Learn to install, test and repair electronic equipment and industrial control systems.',
  },
  CU00026: {
    ...VOCATIONAL_FIX,
    subjects: ['English', 'Office Management', 'Computer Applications'],
    skills: ['Shorthand', 'Typing', 'Communication', 'Organization', 'Computer literacy'],
    topCareers: ['Stenographer', 'Secretarial Assistant', 'Court Reporter', 'Office Assistant'],
    whatYouStudy: 'Train in shorthand, typing, office procedures and secretarial support for government and private offices.',
    workEnvironment: 'Offices, courts, government departments',
    typicalDay: 'Take dictation, transcribe notes, manage correspondence and office records',
  },
};

function applyFixes(rows) {
  return rows.map((row) => (ID_FIXES[row.id] ? { ...row, ...ID_FIXES[row.id] } : row));
}

function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error(`Source not found: ${SOURCE}`);
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));
  const rows = applyFixes(Array.isArray(raw) ? raw : raw.pathways || []);
  for (const out of OUT_PATHS) {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(rows, null, 2));
    console.log(`Wrote ${rows.length} pathways → ${path.relative(ROOT, out)}`);
  }
}

main();
