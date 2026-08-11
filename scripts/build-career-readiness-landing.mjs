import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const srcDir = path.join(root, 'Landing Pages', 'Training And Placement');
const destDir = path.join(root, 'Landing Pages', 'landing page');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

// Fresh copy from Training And Placement template (join modal + checkout)
if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}
copyDir(srcDir, destDir);

const indexPath = path.join(destDir, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

html = html
  .replace(/<title>.*?<\/title>/, '<title>Personalised Career Readiness Program — Dream Mantra</title>')
  .replace(
    /content="Job Ready Accelerator:.*?"/,
    'content="8 live career readiness sessions + 2 mock interviews. CV, LinkedIn, Naukri review, job search strategy & interview prep with Esha Lohiya."',
  )
  .replace(
    'data-dm-studio="training-and-placement"',
    'data-dm-studio="personalized-career-readiness-program"',
  )
  .replace(
    '<span>AI Career Launchpad — Job Ready Accelerator</span>',
    '<span>Personalised Career Readiness Program</span>',
  )
  .replace(
    'Turn Your Potential Into A',
    'Your Career. Your Strategy.',
  )
  .replace(
    /5 live sessions\. 7\.5 hours of practical training\. From personal branding to salary negotiation — guided by Ex-Naukri\.com recruitment expert, <strong>Esha Lohiya<\/strong>\./,
    '8 live career readiness sessions + 2 mock interviews. From self-discovery to CV, LinkedIn, job search, interviews & offer negotiation — guided by Ex-Naukri.com expert, <strong>Esha Lohiya</strong>.',
  )
  .replace(
    '<p class="text-[11px] sm:text-xs font-bold text-slate-500 uppercase mt-1">Total Training</p>',
    '<p class="text-[11px] sm:text-xs font-bold text-slate-500 uppercase mt-1">Live Sessions</p>',
  )
  .replace('data-target="7.5" data-suffix=" hrs" data-decimal="1"', 'data-target="8" data-suffix=""')
  .replace(
    '<p class="text-[11px] sm:text-xs font-bold text-slate-500 uppercase mt-1">Parameters Covered</p>',
    '<p class="text-[11px] sm:text-xs font-bold text-slate-500 uppercase mt-1">Mock Interviews</p>',
  )
  .replace('data-target="20" data-suffix=""', 'data-target="2" data-suffix=""')
  .replace(
    '<p class="text-[11px] sm:text-xs font-bold text-slate-500 uppercase mt-1">Practical Focus</p>',
    '<p class="text-[11px] sm:text-xs font-bold text-slate-500 uppercase mt-1">Career Launch</p>',
  )
  .replace(
    'Everything you need to secure your ideal career role.',
    'A complete career launch system — not just training.',
  )
  .replace(
    '<h3 class="text-lg font-bold text-slate-900">ATS Resume Builder</h3>\n          <p class="text-sm text-slate-600">High-impact resume formatting that passes recruiter software filters easily.</p>',
    '<h3 class="text-lg font-bold text-slate-900">CV & LinkedIn Review</h3>\n          <p class="text-sm text-slate-600">Professional positioning, keywords and recruiter visibility optimised for your target roles.</p>',
  )
  .replace(
    '<h3 class="text-lg font-bold text-slate-900">Mock Interviews</h3>\n          <p class="text-sm text-slate-600">Live practice sessions to fix hesitation, build confidence, and master communication.</p>',
    '<h3 class="text-lg font-bold text-slate-900">Mock Interviews</h3>\n          <p class="text-sm text-slate-600">Two realistic interview simulations with personalised feedback before your real interviews.</p>',
  )
  .replace(
    '<h3 class="text-lg font-bold text-slate-900">Direct Recruiter Contacts</h3>\n          <p class="text-sm text-slate-600">Jaipur recruiter network access, referrals, and handholding until you get your offer letter.</p>',
    '<h3 class="text-lg font-bold text-slate-900">Job Search Strategy</h3>\n          <p class="text-sm text-slate-600">AI-powered job search, Naukri optimisation, application strategy and 90-day career launch plan.</p>',
  )
  .replace('Ready To Launch Your Career?', 'Ready To Build Your Career System?')
  .replace(
    'Seats for the next batch are filling up. Don\'t wait for "someday" — start today.',
    'From clarity to offer letter — personalised for your goals. Limited seats per batch.',
  )
  .replace(
    '<i class="fa-solid fa-briefcase"></i>',
    '<i class="fa-solid fa-route"></i>',
  )
  .replace(
    'Ex-Naukri.com | Govt Certified',
    'Career Readiness Expert',
  )
  .replace(
    'Corporate Hiring • Recruitment Strategy • Career & Talent Advisory',
    'Discover → Decide → Build → Search → Perform → Launch',
  );

fs.writeFileSync(indexPath, html);

const scriptPath = path.join(destDir, 'script.js');
let script = fs.readFileSync(scriptPath, 'utf8');
script = script.replace(
  /const words = \[.*?\];/s,
  'const words = ["Career Roadmap", "Interview Success", "Dream Job Offer", "Professional Brand"];',
);
fs.writeFileSync(scriptPath, script);

console.log('Career Readiness landing page built at:', destDir);
