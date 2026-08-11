import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const srcDir = path.join(root, 'Landing Pages', 'Training And Placement');
const destDir = path.join(root, 'Landing Pages', 'landing page');

const SESSIONS = [
  { n: 1, title: 'Know Yourself', bullets: ['Personality & career assessment', 'Strengths & SWOT analysis', '60-second elevator pitch'] },
  { n: 2, title: 'Choose Your Career Direction', bullets: ['Career-role mapping', 'Industry & role exploration', 'Target role shortlist'] },
  { n: 3, title: 'Build Your Career Strategy', bullets: ['Skill-gap analysis', 'Learning priorities', '6–12 month roadmap'] },
  { n: 4, title: 'Build Your Professional Brand', bullets: ['LinkedIn optimisation', 'Personal positioning', 'Networking strategy'] },
  { n: 5, title: 'Build Your Job-Ready Profile', bullets: ['ATS-friendly resume', 'JD keyword matching', 'Portfolio strategy'] },
  { n: 6, title: 'AI-Powered Job Search', bullets: ['AI job-search workflow', 'Application tailoring', 'Hidden job market'] },
  { n: 7, title: 'Interview & Selection Mastery', bullets: ['STAR method & mock practice', 'HR & behavioural rounds', 'Group discussion prep'] },
  { n: 8, title: 'Offer to Career Launch', bullets: ['Offer evaluation', 'Salary negotiation', '90-day launch plan'] },
];

const INCLUDED = [
  '8 live career readiness sessions + 2 mock interviews',
  'Personal career direction & roadmap',
  'CV, LinkedIn & Naukri profile review',
  'AI-powered job search strategy',
  'Interview preparation & mock interviews',
  'Offer evaluation & salary guidance',
  '90-day career launch plan',
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

function sessionCardsHtml() {
  return SESSIONS.map((s, i) => `
        <div class="session-card reveal delay-${(i % 5 + 1) * 100}">
          <div class="session-num">${s.n}</div>
          <h4 class="font-bold text-slate-900 mt-3 text-sm">${s.title}</h4>
          <ul class="session-bullets">
            ${s.bullets.map((b) => `<li><i class="fa-solid fa-check"></i>${b}</li>`).join('\n            ')}
          </ul>
        </div>`).join('\n');
}

function includedListHtml() {
  return INCLUDED.map((item) => `
            <li class="flex items-start gap-3">
              <i class="fa-solid fa-check-circle text-orange-500 mt-1"></i>
              <p class="text-slate-600 text-sm"><strong class="text-slate-900">${item.split(' ').slice(0, 3).join(' ')}</strong> ${item.split(' ').slice(3).join(' ')}</p>
            </li>`).join('\n');
}

if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}
copyDir(srcDir, destDir);

const indexPath = path.join(destDir, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const sessionsSection = `  <!-- 4. 8 CAREER READINESS SESSIONS -->
  <section class="relative z-10 py-16 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-10 reveal">
        <span class="text-sm font-bold text-orange-500 uppercase tracking-widest">Personalised Career Readiness Program</span>
        <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading mt-2 multicolor-text">8 Live Career Readiness Sessions</h2>
        <p class="text-slate-500 mt-2">Plus 2 mock interview sessions — from self-discovery to career launch.</p>
        <p class="text-xs font-bold text-orange-600 mt-2 uppercase tracking-wide">DISCOVER → DECIDE → BUILD → SEARCH → PERFORM → LAUNCH</p>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
${sessionCardsHtml()}
      </div>

      <div class="mt-10 grid md:grid-cols-2 gap-6 reveal">
        <div class="glass-card p-6 rounded-3xl">
          <h3 class="text-lg font-extrabold text-slate-900 mb-3"><i class="fa-solid fa-user-tie text-orange-500"></i> Profile Reviews Included</h3>
          <ul class="space-y-2 text-sm text-slate-600">
            <li><i class="fa-solid fa-check text-emerald-500"></i> LinkedIn profile review & optimisation</li>
            <li><i class="fa-solid fa-check text-emerald-500"></i> CV / Resume review for target roles</li>
            <li><i class="fa-solid fa-check text-emerald-500"></i> Naukri profile keywords & visibility</li>
            <li><i class="fa-solid fa-check text-emerald-500"></i> Personal branding guidance</li>
          </ul>
        </div>
        <div class="glass-card p-6 rounded-3xl">
          <h3 class="text-lg font-extrabold text-slate-900 mb-3"><i class="fa-solid fa-microphone text-orange-500"></i> 2 Mock Interviews</h3>
          <p class="text-sm text-slate-600 mb-3">Realistic interview simulations with personalised feedback — HR, behavioural, situational and role-specific rounds.</p>
          <p class="text-xs font-bold text-slate-500 uppercase">Output: Interview question bank + STAR story bank + feedback report</p>
        </div>
      </div>
    </div>
  </section>`;

html = html
  .replace(/<title>.*?<\/title>/, '<title>Personalised Career Readiness Program — Dream Mantra</title>')
  .replace(
    /content="Job Ready Accelerator:.*?"/,
    'content="8 live career readiness sessions + 2 mock interviews. CV, LinkedIn, Naukri review, job search strategy & interview prep with Esha Lohiya."',
  )
  .replace('data-dm-studio="training-and-placement"', 'data-dm-studio="personalized-career-readiness-program"')
  .replace('<span>AI Career Launchpad — Job Ready Accelerator</span>', '<span>Personalised Career Readiness Program</span>')
  .replace('Turn Your Potential Into A', 'Your Career. Your Strategy.')
  .replace(
    /5 live sessions\. 7\.5 hours of practical training\. From personal branding to salary negotiation — guided by Ex-Naukri\.com recruitment expert, <strong>Esha Lohiya<\/strong>\./,
    '8 live career readiness sessions + 2 mock interviews. From self-discovery to CV, LinkedIn, job search, interviews & offer negotiation — guided by Ex-Naukri.com expert, <strong>Esha Lohiya</strong>.',
  )
  .replace('data-target="7.5" data-suffix=" hrs" data-decimal="1"', 'data-target="8" data-suffix=""')
  .replace('data-target="20" data-suffix=""', 'data-target="2" data-suffix=""')
  .replace(
    '<p class="text-[11px] sm:text-xs font-bold text-slate-500 uppercase mt-1">Total Training</p>',
    '<p class="text-[11px] sm:text-xs font-bold text-slate-500 uppercase mt-1">Live Sessions</p>',
  )
  .replace(
    '<p class="text-[11px] sm:text-xs font-bold text-slate-500 uppercase mt-1">Parameters Covered</p>',
    '<p class="text-[11px] sm:text-xs font-bold text-slate-500 uppercase mt-1">Mock Interviews</p>',
  )
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
  .replace('<i class="fa-solid fa-briefcase"></i>', '<i class="fa-solid fa-route"></i>')
  .replace('Ex-Naukri.com | Govt Certified', 'Career Readiness Expert')
  .replace(
    'Corporate Hiring • Recruitment Strategy • Career & Talent Advisory',
    'Discover → Decide → Build → Search → Perform → Launch',
  )
  .replace(
    'Not Just Training. <br/>Scientific Career Alignment.',
    'Not Just Training. <br/>A Complete Career Launch System.',
  )
  .replace(
    '<p class="text-3xl font-black text-orange-500 font-heading mt-1">5</p>\n            <p class="text-xs font-bold text-slate-500 uppercase mt-1">Live Sessions</p>',
    '<p class="text-3xl font-black text-orange-500 font-heading mt-1">8</p>\n            <p class="text-xs font-bold text-slate-500 uppercase mt-1">Live Sessions</p>',
  )
  .replace(
    '<p class="text-3xl font-black text-amber-500 font-heading mt-1">30</p>\n            <p class="text-xs font-bold text-slate-500 uppercase mt-1">Day Action Plan</p>',
    '<p class="text-3xl font-black text-amber-500 font-heading mt-1">2</p>\n            <p class="text-xs font-bold text-slate-500 uppercase mt-1">Mock Interviews</p>',
  )
  .replace(
    '<p class="coach-card-tagline">I will be your coach for 7.5 Hours</p>',
    '<p class="coach-card-tagline">Your coach for 8 live sessions + 2 mocks</p>',
  )
  .replace(
    '<p class="coach-card-role">Training & Placement Expert</p>',
    '<p class="coach-card-role">Career Readiness Expert</p>',
  )
  .replace(
    '<p class="coach-card-subrole-tagline">Corporate Hiring • Recruitment Strategy • Career & Talent Advisory</p>',
    '<p class="coach-card-subrole-tagline">Career Direction • Job Search • Interview & Offer Strategy</p>',
  )
  .replace(
    /<!-- 4\. 5 AI SKILL SESSIONS[\s\S]*?<!-- MID-PAGE CTA BANNER 2 -->/,
    `${sessionsSection}\n\n  <!-- MID-PAGE CTA BANNER 2 -->`,
  )
  .replace('5 Sessions<br>A Lifetime Of Impact', '8 Sessions + 2 Mocks<br>Your Career Launch System')
  .replace(
    '<div class="mt-cell"><span>⏱️</span> 5 Sessions × 1.5 Hrs (7.5 hrs total)</div>',
    '<div class="mt-cell"><span>⏱️</span> 8 Live Sessions + 2 Mock Interviews</div>',
  )
  .replace(
    '<div class="mt-cell"><span>📄</span> Job-ready resume, LinkedIn & portfolio</div>',
    '<div class="mt-cell"><span>📄</span> CV, LinkedIn & Naukri optimised</div>',
  )
  .replace(
    '<div class="mt-cell"><span>🏢</span> Direct recruiter contacts in Jaipur</div>',
    '<div class="mt-cell"><span>🎯</span> 90-day career launch plan</div>',
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
