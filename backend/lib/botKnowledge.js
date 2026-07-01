/**
 * Esh bot — exact Q&A + improved matching for accurate replies
 */

export const MODULE_PRICING = {
  dmit: { title: 'Mind Mapping', price: 1999, counsellingAddon: 699 },
  psychometric: { title: 'Skill Mapping', price: 699, counsellingAddon: 699 },
  'dmit-psychometric': { title: 'Mind + Skill + Counselling (Combo)', price: 2999, includesCounselling: true },
  'crp-test': { title: 'AI Career Launchpad', price: 1499 },
  'counselling-topup': { title: 'Additional Counselling Session', price: 999 },
};

const PRICING_REPLY_EN = `MODULE PRICING (Dream Mantra Dashboard)

• Mind Mapping — ₹1,999 (+ optional counselling add-on ₹699)
• Skill Mapping — ₹699 (+ optional counselling add-on ₹699)
• Mind + Skill + Counselling (Combo) — ₹2,999 (counselling included)
• AI Career Launchpad (CRP) — ₹1,499
• Additional Counselling Session (follow-up) — ₹999

HOW TO PURCHASE
1. Register / log in at dreammantra.in
2. Dashboard → Modules tab → select module
3. Pay via Razorpay or submit payment proof for admin verification
4. After confirmation → module shows Active → Take test / Book counselling

Coupon: DREAMS20 — 20% off first assessment (if eligible)

Contact: 9680102276 | info@dreammantra.in | Mon–Sat 11am–7pm`;

const BOOK_COUNSELLING_REPLY_EN = `BOOK COUNSELLING SESSION

Counselling slot booking unlocks after you purchase a module with counselling access:
• Mind + Skill + Counselling Combo — ₹2,999 (counselling included)
• Mind Mapping or Skill Mapping + counselling add-on — ₹699
• AI Career Launchpad (CRP) — ₹1,499 (includes session booking)
• Additional Counselling Session (follow-up top-up) — ₹999

STEPS
1. Log in → Dashboard → Modules tab → purchase & pay
2. After payment confirmed → Dashboard → Book tab (/dashboard?tab=book)
3. Live calendar shows admin-approved slots (online Pan-India or offline Jaipur)
4. Pick a slot, choose program, add notes, confirm booking

Your Dream Mantra ID is on Dashboard Overview — use the same registered account.

Phone: 9680102276 | Mon–Sat 11am–7pm | /contact`;

const MULTI_MODULE_REPLY_EN = `MULTIPLE MODULES — SAME ACCOUNT

You can purchase different modules on one Dream Mantra ID (e.g. Mind Mapping first, then Skill Mapping later).

AFTER PURCHASE
• Each paid module stays in "My Purchased Modules" (Active) separately
• Pending payment orders appear only for unpaid bookings — paid modules never move back to pending
• If a module wrongly shows Pending after payment, refresh Dashboard or contact support with your Dream Mantra ID

TO BUY ANOTHER MODULE
Dashboard → Modules → scroll to "Explore modules" → select a different module → checkout

Note: You cannot buy the same module twice once it is Active.

Support: 9680102276 | info@dreammantra.in`;

const TAKE_TEST_REPLY_EN = `TAKE SKILL MAPPING / ASSESSMENT TEST

1. Log in with your registered Dream Mantra ID + password
2. Dashboard → Modules → click "Take test" on your Active module
3. Verify Dream Mantra ID + password (security check)
4. Test opens automatically in a NEW TAB ONLY — prefilled with your ID, name & phone
5. Complete all tests for your band (Class 6–8, 9–12, or Professionals)

Use only your Dream Mantra registration ID — not personal Gmail.

Mind Mapping (fingerprint) is done at Jaipur centres or as guided — online Skill Mapping tests appear after payment confirmation.

Help: 9680102276`;

const DREAMZ_ID_REPLY_EN = `YOUR DREAM MANTRA ID

• Assigned at registration (e.g. 606010001) — shown on Dashboard Overview
• Used for login, test verification, and support
• Tests pre-fill with this ID — always use the ID linked to your paid account
• Lost login access? Contact support at 9680102276

Do not use a personal Gmail as your test ID — only your Dream Mantra registration ID.`;

export const EXACT_QA = [
  {
    patterns: [
      'how much is skill mapping',
      'how much is mind mapping',
      'how much does mind mapping cost',
      'how much does skill mapping cost',
      'module price',
      'module prices',
      'price list',
      'kitna paisa',
      'cost of mind mapping',
      'cost of skill mapping',
      'price of skill mapping',
      'price of mind mapping',
      'combo price',
      'crp price',
      'what is the price',
      'what are the fees',
    ],
    en: PRICING_REPLY_EN,
    hi: 'मूल्य: Mind Mapping ₹1999, Skill Mapping ₹699, Combo ₹2999, CRP ₹1499, Extra counselling ₹999। Dashboard → Modules से खरीदें। 9680102276',
  },
  {
    patterns: ['buy second module', 'another module', 'multiple modules', 'two modules', 'second module', 'first module pending', 'module disappeared', 'module removed', 'paid module pending', 'active module pending'],
    en: MULTI_MODULE_REPLY_EN,
    hi: 'एक ID पर कई modules खरीद सकते हैं। Paid module Active रहता है। गलत Pending दिखे तो refresh करें या 9680102276।',
  },
  {
    patterns: ['book counselling', 'book consultation', 'book slot', 'book session', 'schedule counselling', 'live calendar', 'counselling booking', 'how to book'],
    en: BOOK_COUNSELLING_REPLY_EN,
    hi: 'Counselling tab तभी unlock जब module + counselling purchase confirm हो। Dashboard → Book (/dashboard?tab=book)। 9680102276',
  },
  {
    patterns: ['take test', 'skill mapping test', 'open test', 'verify test', 'test access', 'google form', 'prefilled form'],
    en: TAKE_TEST_REPLY_EN,
    hi: 'Dashboard → Take test → Dream Mantra ID + password verify → test नई tab में। Gmail ID नहीं। 9680102276',
  },
  {
    patterns: ['dream mantra id', 'dreamz id', 'user id', 'my id', 'registration id', '606010001', 'login id'],
    en: DREAMZ_ID_REPLY_EN,
    hi: 'Dream Mantra ID registration पर मिलता है — Dashboard Overview पर दिखता है। Login और test verify के लिए यही ID।',
  },
  {
    patterns: ['payment pending', 'payment confirmed', 'admin verification', 'submit proof', 'razorpay', 'how to pay', 'pay module'],
    en: `PAYMENT PROCESS

1. Dashboard → Modules → select module → Proceed to payment
2. Pay online (Razorpay) OR upload payment screenshot for admin verification
3. Status: Pending until confirmed → then Active with test access
4. Each module has its own payment — paying for Module B does not affect Module A

Pending = awaiting payment or admin review
Active = payment confirmed — tests & counselling unlock

Dashboard → Modules shows both sections clearly.

9680102276 | info@dreammantra.in`,
    hi: 'Modules → payment → Pending जब तक confirm न हो। Confirm के बाद Active। 9680102276',
  },
  {
    patterns: ['dashboard', 'my dashboard', 'user dashboard', 'modules tab', 'what is modules', 'dashboard tabs'],
    en: `YOUR DASHBOARD (/dashboard)

TABS
• Overview — profile, Dream Mantra ID, next steps
• Profile — class, stream, goals
• Modules — purchase, Active modules, pending orders
• Book — counselling slots (unlocks after paid counselling access)
• Process / Take test — questionnaires & Skill Mapping tests (verify ID first)
• Careers — 950+ career library
• AI Corner — personalised insights
• Roadmap — journey progress
• Security — two-factor authentication

Quick links: Modules /dashboard?tab=assess | Book /dashboard?tab=book`,
    hi: 'Dashboard: Overview, Modules, Book, Take test, Careers, AI, Roadmap, Security। /dashboard',
  },
  {
    patterns: ['register', 'sign up', 'create account', 'how to login', 'login'],
    en: `REGISTER & LOGIN

1. Visit dreammantra.in → Sign up
2. Enter name, email, phone, password — you receive a unique Dream Mantra ID
3. Log in with email/phone + password
4. Complete profile in Dashboard → Profile tab
5. Purchase modules from Modules tab

Login help: contact 9680102276`,
    hi: 'Sign up → Dream Mantra ID मिलेगा → login → Modules से purchase। सहायता: 9680102276',
  },
  {
    patterns: ['tell me about pcm stream', 'pcm stream', 'about pcm', 'what is pcm'],
    en: 'Science (PCM) — Physics, Chemistry, Mathematics\n\nOpens: Engineering (JEE/BITS), Architecture, B.Sc, NDA, Pilot, Data Science & AI\n\nKey exams: JEE Main/Advanced, BITSAT, state CETs, NDA, CUET\n\nWe recommend confirming fit with Mind Mapping (inborn aptitude) + Skill Mapping (personality) before committing.\n\nModules: /dashboard?tab=assess | Call 9680102276',
    hi: 'PCM — Engineering (JEE), Architecture, B.Sc, NDA। Mind Mapping + Skill Mapping से confirm करें। 9680102276',
  },
  {
    patterns: ['what is dmit', 'dmit kya hai', 'dmit kya', 'about dmit', 'mind mapping'],
    en: 'Mind Mapping — fingerprint-based inborn talent analysis (validated in 30+ countries)\n\nReveals: learning styles, memory patterns, intelligence types, natural aptitudes — no exams or pressure\n\nPrice: ₹1,999 (+ optional counselling ₹699)\n\nPurchase: Dashboard → Modules → Mind Mapping\n\nDetails: /assessments/dmit | 9680102276',
    hi: 'Mind Mapping — fingerprint से जन्मजात प्रतिभा। ₹1999। /assessments/dmit | 9680102276',
  },
  {
    patterns: ['what is skill mapping', 'skill mapping', 'skill mapping kya hai', 'about skill mapping', 'psychometric'],
    en: 'Skill Mapping — 7 frameworks in one profile:\nMBTI, DISC, RIASEC, Big 5, VAK, MIT (Gardner), Jung\n\nMaps personality, interests & career alignment — Class 9+ and professionals\n\nPrice: ₹699 (+ optional counselling ₹699)\n\nAfter payment → Dashboard → Take test → verify Dream Mantra ID → complete tests\n\n/assessments/psychometric | 9680102276',
    hi: 'Skill Mapping — 7 frameworks। ₹699। Take test tab से verify करके test दें। /assessments/psychometric',
  },
  {
    patterns: ['dmit + skill mapping', 'dmit and skill mapping', 'combo', 'dmit vs skill mapping', 'difference dmit skill mapping'],
    en: 'Mind Mapping + Skill Mapping Combo — ₹2,999 (counselling included)\n\n• Mind Mapping = INBORN talent (fingerprints)\n• Skill Mapping = CURRENT personality & interests (7 frameworks)\n• Together = complete nature + nurture profile\n• Includes expert counselling session\n\nProcess:\n1. Purchase combo from Dashboard → Modules\n2. Mind Mapping at centre / guided process\n3. Skill Mapping tests online (verify ID first)\n4. Counselling booking unlocks in Book tab\n\n/assessments/dmit-psychometric | 9680102276',
    hi: 'Combo ₹2999 — Mind + Skill + counselling। /assessments/dmit-psychometric',
  },
  {
    patterns: ['what is ai career launchpad', 'ai career launchpad', 'career launchpad kya', 'what is crp'],
    en: 'AI Career Launchpad (CRP) — ₹1,499\n\nFor Class 12+, college students & freshers\n\n5 sessions × 1.5 hrs: Personal Branding, LinkedIn/Naukri, Resume, Interviews & GD, Salary Negotiation\n\nPurchase: Dashboard → Modules → AI Career Launchpad\n\n/crp | 9680102276',
    hi: 'AI Career Launchpad — ₹1499। /crp | 9680102276',
  },
  {
    patterns: ['why career counselling', 'why counselling', 'why counseling', 'career counselling kyun'],
    en: 'Why Career Counselling?\n\nCareer choices shape 40+ years — yet most decide on marks, peer pressure, or parent expectations alone.\n\nDream Mantra uses Mind Mapping (inborn) + 7 Skill Mapping frameworks for scientific, bias-free clarity.\n\nPurchase a module with counselling → book slot in Dashboard → Book tab.\n\n/assessments/why-dreams-mantra | 9680102276',
    hi: 'Career counselling — Mind Mapping + Skill Mapping से scientific decision। Modules से purchase करें।',
  },
  {
    patterns: ['certifications', 'certificates', 'credentials', 'certified counsellor', 'iit madras certificate'],
    en: 'Dream Mantra Certifications:\n• Government of India — Career Counselling\n• International Certified Career Counselling\n• Mind Mapping Certification\n• NLP Practitioner\n• Reliance Foundation\n• IIT Madras\n\nView: /#certifications\nFounder Esha Lohiya — Chief Counsellor\n9680102276',
    hi: 'Certifications: Govt of India, International, Mind Mapping, NLP, IIT Madras। /#certifications',
  },
  {
    patterns: ['programs for class 11-12', 'class 11-12', 'class 11 12 program', 'after 10th career'],
    en: 'Class 11-12 Career Direction Program:\n• Stream subjects & entrance prep (JEE/NEET/CUET/CLAT)\n• College selection & career roadmap\n• Academic audit + Skill Mapping fit + market trends\n\n/programs/class-11-12 | Modules: /dashboard?tab=assess | 9680102276',
    hi: 'Class 11-12: stream, exams, college, roadmap। /programs/class-11-12',
  },
  {
    patterns: ['how does counselling work', 'counselling process', '7 step', 'after report'],
    en: 'Dream Mantra Counselling Process:\n1. Purchase module with counselling access\n2. Mind Mapping assessment\n3. Skill Mapping testing\n4. Academic audit & market trend review\n5. Expert counselling session (Book tab)\n6. Personalised roadmap\n7. Follow-up sessions (top-up ₹999 if needed)\n\n/counselling?tab=process | /dashboard?tab=book | 9680102276',
    hi: '7-Step: purchase → Mind Mapping → Skill Mapping → report → Book tab से counselling → roadmap।',
  },
  {
    patterns: ['contact', 'phone number', '9680102276', 'email address', 'whatsapp'],
    en: 'CONTACT Dream Mantra\n\nPhone: 9680102276\nEmail: info@dreammantra.in\nHours: Mon–Sat, 11am–7pm\nJaipur centres: Raja Park, Shastri Nagar, Nirman Nagar\nOnline: Pan-India\n\n/contact',
    hi: '9680102276 | info@dreammantra.in | सोम-शनि 11am-7pm | जयपुर',
  },
  {
    patterns: ['software engineer', 'software developer', 'become software engineer', 'coding career', 'it career'],
    en: 'Software Engineer — strong growth in Engineering & Technology.\n\nTypical path: PCM stream → B.Tech/B.E (CS/IT) → internships → product/IT roles\nIndia salary: roughly ₹3.7–11.1 LPA starting (varies by college & skills)\nDemand: Very High | Stream: Science (PCM)\n\nExplore full roadmap, skills & exams: /careers/software-engineer\n\nConfirm fit with Skill Mapping (₹699) + Mind Mapping (₹1,999) before committing.\n\n9680102276',
    hi: 'Software Engineer — PCM, B.Tech, high demand। /careers/software-engineer | Skill Mapping ₹699। 9680102276',
  },
  {
    patterns: ['neet', 'mbbs', 'become doctor', 'medical career', 'doctor career'],
    en: 'Medical careers (MBBS/BDS) require PCB stream + NEET.\n\nPath: Class 11–12 PCB → NEET → MBBS/BDS → internship → specialization optional\nStarting salary varies by hospital/govt vs private (often ₹4–8 LPA early career, grows with experience)\n\nUse Skill Mapping + Mind Mapping to check if medical field matches your aptitude — not just marks.\n\n/programs/class-11-12 | /careers | 9680102276',
    hi: 'Doctor/MBBS — PCB + NEET। Aptitude check: Mind Mapping + Skill Mapping। 9680102276',
  },
  {
    patterns: ['jee', 'iit', 'engineering entrance', 'bitsat', 'become engineer'],
    en: 'Engineering (IIT/BITS/state colleges) — PCM stream + JEE Main/Advanced or state CETs.\n\nEarly planning from Class 9–10 recommended.\nDream Mantra: Mind Mapping (inborn aptitude) + Skill Mapping (personality fit) before choosing PCM.\n\nPrograms: /programs/class-11-12 | Assessments: /dashboard?tab=assess | 9680102276',
    hi: 'Engineering — PCM + JEE। Class 9 से planning। Mind Mapping + Skill Mapping लें। 9680102276',
  },
  {
    patterns: ['cancel order', 'cancel payment', 'cancel module', 'refund', 'pending order cancel'],
    en: 'CANCEL PENDING ORDER\n\n• Only unpaid / pending-payment orders can be cancelled from Dashboard → Modules\n• Confirmed (paid) modules cannot be cancelled online — contact support\n• Cancelling a pending order does NOT affect other Active paid modules\n\nSupport: 9680102276 | info@dreammantra.in',
    hi: 'Pending order Modules से cancel। Paid module online cancel नहीं — 9680102276।',
  },
  {
    patterns: ['counselling topup', 'counselling top-up', 'extra counselling', 'follow up session', 'another counselling'],
    en: 'Additional Counselling Session — ₹999\n\nFor follow-up after your first counselling session.\nPurchase: Dashboard → Modules → Additional Counselling Session\nAfter payment confirmed → Book tab unlocks for slot booking.\n\n9680102276',
    hi: 'Extra counselling ₹999। Modules से खरीदें → Book tab। 9680102276',
  },
  {
    patterns: ['crp book', 'crp counselling', 'launchpad book', 'crp session', 'book crp'],
    en: 'AI Career Launchpad (CRP) — ₹1,499 includes career readiness sessions.\n\nAfter payment confirmed:\n1. Dashboard → Book tab — book your counselling/session slot\n2. Process tab — CRP steps & community link\n\nPurchase: Dashboard → Modules → AI Career Launchpad\n\n/crp | 9680102276',
    hi: 'CRP ₹1499 — pay confirm → Book tab से slot। /crp | 9680102276',
  },
  {
    patterns: ['where is book tab', 'book tab not showing', 'cannot book', 'booking locked', 'calendar locked'],
    en: 'BOOK TAB NOT SHOWING?\n\nThe Book tab unlocks only after payment is confirmed for a module that includes counselling:\n• Combo ₹2,999\n• Mind/Skill Mapping + counselling add-on ₹699\n• AI Career Launchpad (CRP) ₹1,499\n• Additional Counselling top-up ₹999\n\nIf payment is still Pending, wait for admin/Razorpay confirmation.\nRefresh Dashboard after confirmation.\n\n9680102276',
    hi: 'Book tab counselling purchase confirm के बाद unlock। Pending payment हो तो wait करें। 9680102276',
  },
  {
    patterns: ['gmail', 'google account', 'wrong email', 'personal email test'],
    en: 'TESTS — USE DREAM MANTRA ID ONLY\n\nSkill Mapping tests pre-fill with your registered Dream Mantra ID — not your personal Gmail.\n\nIf Google asks to sign in, use the email linked to your Dream Mantra registration (Dashboard → Profile).\n\nTake test: Modules → Take test → verify ID + password → form opens in new tab.\n\n9680102276',
    hi: 'Test में Dream Mantra ID use करें — Gmail नहीं। Modules → Take test → verify। 9680102276',
  },
  {
    patterns: ['hours', 'timing', 'open time', 'when open', '11am', '7pm'],
    en: 'Dream Mantra hours: Mon–Sat, 11am–7pm (IST)\nPhone: 9680102276\nJaipur centres + Pan-India online counselling\n\n/contact',
    hi: 'सोम-शनि 11am-7pm | 9680102276',
  },
  {
    patterns: ['coupon', 'discount', 'dreams20', 'offer', 'promo code'],
    en: 'COUPON: DREAMS20 — 20% off your first assessment (if eligible)\n\nApply at checkout in Dashboard → Modules.\n\nModule prices:\nMind Mapping ₹1,999 | Skill Mapping ₹699 | Combo ₹2,999 | CRP ₹1,499 | Extra counselling ₹999\n\n9680102276',
    hi: 'Coupon DREAMS20 — पहले assessment पर 20% off (eligible हो तो)। Modules checkout पर।',
  },
  {
    patterns: ['pcb', 'what is pcb', 'pcb stream', 'medical stream'],
    en: 'Science (PCB) — Physics, Chemistry, Biology\n\nOpens: MBBS/BDS (NEET), Pharmacy, Nursing, Biotechnology, Psychology, Life Sciences\n\nKey exams: NEET, CUET, state medical entrances\n\nConfirm fit with Mind Mapping + Skill Mapping before choosing PCB.\n\n/dashboard?tab=assess | 9680102276',
    hi: 'PCB — NEET, medical, pharmacy, biotech। Mind Mapping + Skill Mapping से confirm। 9680102276',
  },
  {
    patterns: ['commerce stream', 'what is commerce', 'ca career', 'chartered accountant'],
    en: 'Commerce stream — Accountancy, Business Studies, Economics\n\nCareers: CA, CS, CMA, B.Com, BBA, MBA, Banking, Finance\n\nSkill Mapping helps confirm if analytical/commerce fit matches your personality.\n\n/careers | /dashboard?tab=assess | 9680102276',
    hi: 'Commerce — CA, BBA, banking, finance। Skill Mapping से fit check। 9680102276',
  },
  {
    patterns: ['thank you', 'thanks', 'dhanyavad', 'shukriya'],
    en: "You're welcome! I'm Esh — ask anytime about Mind Mapping, Skill Mapping, careers, booking, or your Dashboard.\n\n9680102276 | dreammantra.in",
    hi: 'आपका स्वागत है! Mind Mapping, Skill Mapping, careers, booking — कुछ भी पूछें। 9680102276',
  },
  {
    patterns: ['forgot password', 'reset password', 'change password login', 'lost password'],
    en: 'Forgot your password? Go to Login → Forgot password? and enter your registered email. We email a 6-digit OTP to reset it. Need help? Call 9680102276.',
    hi: 'पासवर्ड भूल गए? Login → Forgot password पर registered email दर्ज करें। OTP ईमेल पर आएगा। सहायता: 9680102276',
  },
  {
    patterns: ['my reports', 'report link', 'where is my report', 'assessment report'],
    en: 'MY REPORTS (Dashboard)\n\nAfter your counsellor publishes your report:\n• Log in → Dashboard → My Reports tab (/dashboard?tab=reports)\n• Open the Google Drive / PDF link\n• You get a notification when a new or updated report is ready\n\nIf empty, your report may still be in review. Call 9680102276 with your Dreams ID.',
    hi: 'Reports: Dashboard → My Reports tab। Notification aayegi jab report ready ho। 9680102276',
  },
  {
    patterns: ['dashboard tabs', 'user dashboard', 'what is in dashboard', 'security tab'],
    en: 'USER DASHBOARD TABS\n\n• Overview — profile, Dreams ID, stats\n• Career Library — 950+ careers\n• AI Corner — ask Esh for guidance\n• Modules — buy Mind Mapping, Skill Mapping, CRP\n• Process & Take test — guides + Skill Mapping tests (after payment)\n• My Reports — published assessment reports\n• Book Session — counselling slots (after counselling module)\n• Security — change password, 2FA\n\nLogin: dreammantra.in/login',
    hi: 'Dashboard tabs: Overview, Careers, AI, Modules, Process, Reports, Book, Security। dreammantra.in/login',
  },
  {
    patterns: ['partner with us', 'school partnership', 'coaching partner', 'referral partner'],
    en: 'PARTNER WITH DREAM MANTRA\n\nCategories at dreammantra.in/partner/*:\n• Schools — campus assessments & stream guidance\n• Coaching centres — white-label assessments & referrals\n• Colleges — placement cell & CRP programs\n• Corporates — CSR & employee career wellness\n• Teachers — certification & referral income\n• Referral partners — commissions on enrollments\n\nDetails: /partner/schools and other categories. Contact: 9680102276 | info@dreammantra.in',
    hi: 'Partner categories: Schools, Coaching, Colleges, Corporates, Teachers, Referral। /partner/schools | 9680102276',
  },
];

export function matchExactQA(message, lang = 'en') {
  const text = message.toLowerCase().replace(/[^\w\s+@.?]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text.split(/\s+/).filter((w) => w.length > 2);
  let best = null;
  let bestScore = 0;

  for (const item of EXACT_QA) {
    for (const pattern of item.patterns) {
      const p = pattern.toLowerCase().trim();
      if (!p) continue;

      let score = 0;
      if (text === p) score = 100 + p.length;
      else if (text.includes(p) && p.length >= 4) score = 50 + p.length;
      else if (p.includes(text) && text.length >= 6) score = 40 + text.length;
      else {
        const pWords = p.split(/\s+/).filter((w) => w.length > 2);
        const overlap = pWords.filter((w) => words.includes(w) || text.includes(w)).length;
        if (overlap >= 2 && overlap >= Math.ceil(pWords.length * 0.6)) {
          score = 20 + overlap * 5 + p.length;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    }
  }

  return bestScore >= 20 ? (best[lang] || best.en) : null;
}

export function matchKeywordKnowledgeImproved(message, knowledge, lang = 'en') {
  const text = message.toLowerCase().replace(/[^\w\s@.?+]/g, ' ');
  const words = text.split(/\s+/).filter((w) => w.length > 1);

  let best = null;
  let bestScore = 0;

  for (const item of knowledge) {
    let score = 0;
    for (const key of item.keys) {
      const k = key.toLowerCase().trim();
      if (!k) continue;
      if (text.includes(k)) {
        score += k.split(/\s+/).length * 4;
      } else if (k.split(/\s+/).length === 1 && words.includes(k)) {
        score += 3;
      } else if (words.some((w) => w.length > 3 && (k.includes(w) || k.split(/\s+/).some((p) => p.startsWith(w.slice(0, 4)))))) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  if (bestScore >= 4) return best[lang] || best.en;
  return null;
}
