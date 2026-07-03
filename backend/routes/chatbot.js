import { Router } from 'express';
import {
  detectStreamFromMessage,
  buildStreamReply,
} from '../lib/streamKnowledge.js';
import { SITE_CONTEXT, DREAMZ_KNOWLEDGE, matchDreamzKnowledge } from '../lib/dreamzKnowledge.js';
import { matchExactQA, matchKeywordKnowledgeImproved } from '../lib/botKnowledge.js';
import { formatBotReply } from '../lib/formatBotReply.js';

const router = Router();

const knowledge = [
  ...DREAMZ_KNOWLEDGE,
  { keys: ['ai career launchpad', 'career launchpad', 'launchpad', 'ai launch', 'ai launch blueprint', 'crp', 'career readiness', 'readiness programme', 'after 12', 'linkedin', 'resume', 'interview', 'naukri', 'elevator pitch', 'mock interview', 'salary negotiation', 'recruiter jaipur'], en: '**AI Career Launchpad** is Dream Mantra\'s 7th pillar for after Class 12, college students & freshers.\n\n5 power sessions × 1.5 hours (7.5 hrs total):\n1. Personal Branding, Elevator Pitch, Video Resume\n2. LinkedIn & Naukri Optimization\n3. Resume/CV & Cover Letter\n4. Interview Skills, Mock Interviews, GD\n5. Campus to Corporate, Salary Negotiation, Jaipur Recruiter Contacts\n\nVisit /crp or call 9680102276 to enroll!', hi: '**AI Career Launchpad** — Class 12+, college और freshers के लिए। 5 सेशन × 1.5 घंटे: LinkedIn, resume, interview, GD, salary negotiation। /crp | 9680102276' },
  { keys: ['what is dmit', 'dmit kya', 'dmit kya hai'], en: '**Mind Mapping** maps your inborn potential through fingerprint analysis — validated in 30+ countries.\n\nIt reveals: learning styles (visual/auditory/kinesthetic), memory patterns, intelligence types, and natural aptitudes — without exams or pressure.\n\nBest for: Class 1-8 (early talent discovery) and stream decisions Class 9+.\n\nBook Mind Mapping: /assessments/dmit | Combo with Skill Mapping: /assessments/dmit-psychometric | Call 9680102276', hi: '**Mind Mapping** — fingerprint analysis से जन्मजात प्रतिभा, learning style और aptitude पता चलता है। 30+ देशों में validated। /assessments/dmit | 9680102276' },
  { keys: ['pillar', 'pillars', '7 pillar', 'six pillar', 'framework'], en: 'Dream Mantra has 7 Pillars: 1) Counselling 2) Mind Mapping Inborn Talent 3) Skill Mapping Acquired Talent 4) What You Studied 5) Market Trend 6) Future AI Proof 7) Career Ready + AI Career Launchpad for college. See /pillars', hi: '7 स्तंभ: काउंसलिंग, Mind Mapping, Skill Mapping, पढ़ाई, मार्केट, AI-proof, करियर रेडी + AI Career Launchpad। /pillars' },
  { keys: ['dmit + skill mapping', 'dmit and skill mapping', 'dmit skill mapping combo', 'both dmit', 'combo assessment', 'complete profile', 'nature nurture'], en: '**Mind Mapping + Skill Mapping Combo** at Dream Mantra:\n\n1️⃣ **Mind Mapping** — fingerprint assessment for inborn talent\n2️⃣ **Skill Mapping** — 7 frameworks for personality & interests\n3️⃣ **Combined Report** — nature + nurture profile\n4️⃣ **Expert Counselling** — certified counsellor interprets both reports & builds your roadmap\n\nRecommended for Class 6+ stream & career decisions.\n\n/assessments/dmit-psychometric | 9680102276', hi: 'Mind Mapping + Skill Mapping combo: दोनों tests + combined report + counselling session। /assessments/dmit-psychometric' },
  { keys: ['skill mapping', 'mbti', 'disc', 'riasec', 'personality'], en: 'Skill Mapping includes 7 frameworks: MBTI (personality), DISC (behavior), RIASEC (career interests), Big 5, VAK (learning styles), MIT, Jung archetypes. Best for Class 9+ for stream/career decisions. Visit /assessments/psychometric', hi: 'Skill Mapping: MBTI, DISC, RIASEC। Class 9+ के लिए।' },
  { keys: ['career', 'careers', '950', '380', 'opportunities', 'explore'], en: '950+ careers at /careers — each with education path, salary, skills, exam requirements & future scope. Filter by interest, stream, education level.', hi: '950+ करियर /careers पर — शिक्षा, वेतन, कौशल।' },
  { keys: ['contact', 'phone', '9680102276', 'email', 'address', 'location'], en: '📞 9680102276 | 📧 info@dreammantra.in | Mon-Sat 11am-7pm | 📍 Jaipur: Raja Park, Shastri Nagar, Nirman Nagar | Pan-India online counselling', hi: '9680102276 | info@dreammantra.in | सोम-शनि 11am-7pm | जयपुर' },
  { keys: ['esha', 'esh', 'founder', 'who are you', 'your name', 'about esh', 'about esha'], en: "I'm Esh, Dream Mantra's AI career counsellor — trained on our full programs, Mind Mapping, AI Career Launchpad, 950+ careers, and founder Esha Lohiya's expertise. Ask me anything!", hi: 'मैं एश हूँ, Dream Mantra की AI काउंसलर। कुछ भी पूछें!' },
  { keys: ['book', 'consultation', 'enroll', 'appointment', 'session', 'slot', 'calendar'], en: 'BOOK COUNSELLING\n\nUnlocks after confirmed payment for a module with counselling:\n• Combo ₹2,999 | Counselling add-on ₹699 | CRP ₹1,499 | Top-up ₹999\n\n1. Dashboard → Modules → purchase & pay\n2. After confirmation → Dashboard → Book tab (/dashboard?tab=book)\n3. Pick online or Jaipur offline slot → confirm\n\n9680102276 | Mon–Sat 11am–7pm', hi: 'Book tab purchase confirm के बाद unlock (Combo/add-on/CRP/top-up)। /dashboard?tab=book | 9680102276' },
  { keys: ['stream', 'pcm', 'pcb', 'commerce', 'arts', 'choose'], en: 'Stream selection depends on interests, aptitude & market demand. Take our Skill Mapping test to identify your strengths. Mind Mapping maps learning style. Our counsellors help decide between PCM, PCB, Commerce, Humanities. Visit /counselling or /assessments/psychometric', hi: 'Stream चुनें aptitude और interest से। Skill Mapping टेस्ट लें।' },
  { keys: ['engineering', 'iit', 'neet', 'doctor', 'mbbs'], en: 'Engineering (IIT/BITS) requires strong PCM + JEE prep. NEET for MBBS/BDS requires PCB + intense study. Both need early planning from Class 9. Our Mind Mapping & Skill Mapping assessments identify if you\'re naturally suited. Book /counselling to explore options.', hi: 'Engineering के लिए PCM + JEE। NEET के लिए PCB + NEET coaching।' },
  { keys: ['class 9', 'class 10', 'stream selection', 'board exams'], en: 'Class 9-10 is crucial! Stream selection impacts entire career. We recommend: 1) Mind Mapping assessment (inborn talent) 2) Skill Mapping test (personality fit) 3) Academic audit (strengths/gaps) 4) 1-on-1 counselling. Book /counselling?tab=book now!', hi: 'Class 9-10 महत्वपूर्ण है। Skill Mapping test लें। /counselling बुक करें।' },
  { keys: ['college', 'admission', 'entrance exam', 'cut-off'], en: '380+ colleges across India offering 5000+ courses. Choose based on: 1) Your interests (Skill Mapping) 2) College ranking 3) Placement record 4) Course curriculum. Our AI Career Launchpad helps after admission. Visit /careers for college-wise career data.', hi: 'College admission के लिए interest और ranking देखें।' },
  { keys: ['salary', 'salary expectation', 'starting salary', 'package'], en: 'Starting salary varies: Software Engineer (4-7 LPA), Doctor (3-6 LPA initially), Consultant (2-5 LPA), IAS (₹56,100/month). Depends on college, performance & skills. Explore /careers for detailed salary data by role.', hi: 'Salary stream और college पर निर्भर करती है। /careers देखें।' },
  { keys: ['gap year', 'dropped year', 'deferred admission'], en: 'Gap years are okay if used productively! Develop skills, gain experience, explore interests. Many successful people took gap years. Discuss with our counsellors before deciding. Book /counselling or call 9680102276.', hi: 'Gap year ठीक है अगर सही से use करें।' },
  { keys: ['ai proof', 'future job', 'automation'], en: 'Some careers are AI-proof: healthcare, creative arts, leadership roles, trades. Others at risk: data entry, routine analysis. Our 6th pillar identifies "Future AI Proof" careers. Explore /pillars or /careers to see AI resilience scores.', hi: 'AI-proof करियर: healthcare, creative, leadership। /pillars देखें।' },
  { keys: ['mistakes', 'regret', 'wrong choice'], en: 'Career mistakes happen! But it\'s never too late to pivot. We help students & professionals make informed changes. Skill Mapping + counselling reveal your true direction. Call 9680102276 for course correction guidance.', hi: 'गलत choice से पहचान सकते हैं। Counselling लें।' },
  { keys: ['parent', 'parents', 'pressure', 'expectations'], en: 'Parent pressure is real. We involve parents in counselling to align expectations with student\'s aptitude. Scientific data (Mind Mapping/Skill Mapping) helps parents understand child\'s strengths. Book family session: 9680102276.', hi: 'Parents को भी involve करते हैं। Family session बुक करें।' },
  { keys: ['online', 'offline', 'mode'], en: 'Choose! Both online & offline counselling available. Online: flexible, Pan-India. Offline: Jaipur locations — Raja Park, Shastri Nagar, Nirman Nagar. Book /contact or 9680102276.', hi: 'Online या Offline दोनों उपलब्ध हैं।' },
  { keys: ['cost', 'price', 'fees', 'affordable', 'kitna', 'charges', '1999', '699', '2999'], en: 'MODULE PRICING\n\n• Mind Mapping — ₹1,999 (+ counselling add-on ₹699)\n• Skill Mapping — ₹699 (+ counselling add-on ₹699)\n• Mind + Skill + Counselling Combo — ₹2,999\n• AI Career Launchpad — ₹1,499\n• Additional Counselling — ₹999\n\nPurchase: Dashboard → Modules tab\nCoupon DREAMS20: 20% off first assessment\n\n9680102276', hi: 'Mind Mapping ₹1999, Skill Mapping ₹699, Combo ₹2999, CRP ₹1499। Dashboard → Modules। 9680102276' },
  { keys: ['dreamz', 'Dream Mantra', 'promise', 'brilliance', 'unique key'], en: 'The Dream Mantra Promise: every child holds untapped brilliance. We use Mind Mapping & Skill Mapping — validated in 30+ countries, bias-free, no exam pressure. From Class 1 to First Job. Start at Dashboard → Modules or call 9680102276.', hi: 'ड्रीम Mantra वादा: हर बच्चे में प्रतिभा। Mind Mapping + Skill Mapping। कक्षा 1 से नौकरी तक।' },
  { keys: ['class 1', 'class 5', 'talent discovery', 'young'], en: 'Class 1-5: Talent Discovery program — early Mind Mapping to map learning styles and inborn strengths. Visit /programs/class-1-5', hi: 'कक्षा 1-5: प्रतिभा खोज। /programs/class-1-5' },
  { keys: ['class 6', 'class 8', 'self discovery'], en: 'Class 6-8: Self Discovery — bridge academics with personality insights. /programs/class-6-8', hi: 'कक्षा 6-8: आत्म-खोज।' },
  { keys: ['working professional', 'career change', 'stuck', 'monday'], en: 'Working Professionals: identify real strengths and pivot careers with skill mapping + counselling. Success stories on our site. Book /contact', hi: 'प्रोफेशनल्स: करियर बदलाव के लिए counselling।' },
  { keys: ['certification', 'certified', 'government', 'iit madras', 'nlp'], en: 'Certifications: Govt of India, International Career Counselling, Mind Mapping, NLP, Reliance Foundation, IIT Madras. Founder Esha Lohiya — Chief Counsellor.', hi: 'प्रमाणन: भारत सरकार, Mind Mapping, NLP, IIT Madras।' },
  { keys: ['testimonial', 'review', 'rohan', 'priya', 'feedback'], en: 'Parents and students love Dreamz! Mind Mapping helped Rohan (Class 7), Priya chose Commerce+Math for CA, professionals switched to fulfilling careers. See /about', hi: 'हजारों खुश परिवार। /about देखें।' },
  { keys: ['jaipur', 'raja park', 'shastri', 'nirman', 'location', 'offline'], en: 'Jaipur centres: Raja Park, Shastri Nagar, Nirman Nagar. Pan-India online too. Mon-Sat 11am-7pm. Call 9680102276', hi: 'जयपुर: राजा पार्क, शास्त्री नगर, निर्माण नगर।' },
  { keys: ['partner', 'school', 'teacher', 'coaching', 'corporate', 'referral'], en: 'Partner with us: Schools, Coaching Centers, Colleges, Corporates, Teachers, Referral Partners. Visit /partner/schools or /contact', hi: 'साझेदारी: स्कूल, कोचिंग, कॉलेज। /partner/schools' },
  { keys: ['dashboard', 'modules tab', 'my modules', 'purchased'], en: 'DASHBOARD (/dashboard)\n\n• Overview — Dream Mantra ID & next steps\n• Modules — purchase, Active modules, pending orders\n• Book — counselling slots (after paid counselling access)\n• Take test — verify ID + password, then open tests\n• Careers — 950+ options\n\nModules: /dashboard?tab=assess | Book: /dashboard?tab=book', hi: 'Dashboard: Modules, Book, Take test, Careers। /dashboard' },
  { keys: ['take test', 'verify', 'test access', 'skill mapping test', 'google form', 'open test'], en: 'TAKE TEST\n\n1. Dashboard → Modules → "Take test" on your Active module\n2. Verify Dream Mantra ID + password\n3. Test opens in a NEW TAB ONLY — prefilled with your ID, name, phone\n\nUse Dream Mantra ID — not Gmail. 9680102276', hi: 'Modules → Take test → ID + password verify → test नई tab में। Gmail नहीं।' },
  { keys: ['dream mantra id', 'user id', 'registration id', 'my id'], en: 'Your Dream Mantra ID is assigned at signup (shown on Dashboard Overview). Use it for login verification, tests, and support. Login issues: contact 9680102276.', hi: 'Dream Mantra ID signup पर मिलता है — Dashboard Overview पर।' },
  { keys: ['payment', 'pending payment', 'pay module', 'razorpay', 'proof'], en: 'PAYMENT\n\n1. Dashboard → Modules → select module → pay\n2. Razorpay online OR upload proof for admin verification\n3. Pending until confirmed → then Active\n4. Each module has separate payment — buying a second module does not affect the first\n\n9680102276', hi: 'Modules → pay → confirm होने पर Active। 9680102276' },
  { keys: ['second module', 'multiple modules', 'another module', 'two modules'], en: 'You can buy multiple different modules on one Dream Mantra ID. Each paid module stays Active in My Purchased Modules. Buy another from Dashboard → Modules → Explore modules. Same module cannot be purchased twice.', hi: 'एक ID पर अलग-अलग modules खरीद सकते हैं। Paid module Active रहता है।' },
];

function getLocalReply(message, lang) {
  const trimmed = message.trim();

  const exact = matchExactQA(trimmed, lang);
  if (exact) return { reply: exact, source: 'exact-qa' };

  const streamMatch = detectStreamFromMessage(trimmed);
  if (streamMatch) {
    const streamReply = buildStreamReply(streamMatch, lang, { includeGreeting: true });
    if (streamReply) return { reply: streamReply, source: 'stream-knowledge' };
  }

  const keywordMatch = matchKeywordKnowledgeImproved(trimmed, knowledge, lang);
  if (keywordMatch) return { reply: keywordMatch, source: 'knowledge' };

  const dreamzMatch = matchDreamzKnowledge(trimmed, lang);
  if (dreamzMatch) return { reply: dreamzMatch, source: 'dreamz-knowledge' };

  const text = trimmed.toLowerCase().replace(/[^\w\s@.?]/g, ' ');
  if (/hello|hi|hey|namaste|नमस्ते/.test(text)) {
    return {
      reply: lang === 'hi'
        ? 'नमस्ते! मैं एश। Mind Mapping, Skill Mapping, streams, करियर — कुछ भी पूछें!'
        : "Hello! I'm Esh. Ask about Mind Mapping, Skill Mapping, AI Career Launchpad, streams, 950+ careers, programs, or booking — I'm here to help!",
      source: 'greeting',
    };
  }

  return null;
}

async function askGemini(message, history, lang) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const langNote = lang === 'hi' ? 'Respond in Hindi (Devanagari).' : 'Respond in English.';
  const contents = [];

  for (const h of (history || []).slice(-8)) {
    contents.push({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }],
    });
  }
  contents.push({
    role: 'user',
    parts: [{ text: `${langNote}\n\nUser question: ${message}` }],
  });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SITE_CONTEXT }] },
        contents,
        generationConfig: { temperature: 0.3, maxOutputTokens: 1200, topP: 0.9 },
      }),
    }
  );

  if (!res.ok) {
    console.error('Gemini error', res.status, await res.text());
    return null;
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text?.trim() || null;
}

router.post('/message', async (req, res) => {
  const { message, lang = 'en', history = [] } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ message: 'Message required' });
  }

  let reply = null;
  let source = 'fallback';

  const local = getLocalReply(message.trim(), lang);
  if (local) {
    reply = local.reply;
    source = local.source;
  }

  if (!reply) {
    try {
      reply = await askGemini(message.trim(), history, lang);
      if (reply) source = 'gemini';
    } catch (e) {
      console.error('Gemini failed', e.message);
    }
  }

  if (!reply && local?.source !== 'exact-qa') {
    const retry = matchKeywordKnowledgeImproved(message.trim(), knowledge, lang);
    if (retry) {
      reply = retry;
      source = 'knowledge-retry';
    }
  }

  if (!reply) {
    reply = lang === 'hi'
      ? `मैं एश, Dream Mantra की AI counsellor। इन topics पर पूछें:

• कीमत — Mind Mapping ₹1999, Skill Mapping ₹699, Combo ₹2999, CRP ₹1499
• Take test — Modules → Take test → ID verify → test नई tab में
• Book counselling — Dashboard Book tab (purchase confirm के बाद)
• Streams — PCM, PCB, Commerce
• 950+ careers — dreammantra.in Career Library

कॉल: 9680102276 | info@dreammantra.in`
      : `I'm Esh, Dream Mantra's AI counsellor. Ask me about:

• Pricing — Mind Mapping ₹1,999 | Skill Mapping ₹699 | Combo ₹2,999 | CRP ₹1,499
• Take test — Dashboard → Modules → Take test → verify ID → opens in new tab
• Book counselling — Dashboard Book tab (after payment confirmed)
• Streams — PCM, PCB, Commerce, Arts
• 950+ careers — Career Library on dreammantra.in

Call 9680102276 | info@dreammantra.in | Mon–Sat 11am–7pm`;
    source = 'fallback';
  }

  res.json({ reply: formatBotReply(reply), source, botName: 'Esh' });
});

export default router;
