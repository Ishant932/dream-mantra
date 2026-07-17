/** Stream-specific career guidance — answer about the stream first, then promote Dream Mantra */

const PROMOTE_EN = `
✨ **How Dream Mantra helps with stream decisions:**
• **Brain Mapping** maps your inborn learning style & aptitude (validated in 30+ countries)
• **Skill Mapping** (MBTI, DISC, RIASEC + 4 more) confirms stream fit scientifically
• **7-Step Counselling Process** — from assessment to personalised roadmap
• **950+ Career Library** with salary, skills & step-by-step roadmaps
• **Free consultation** — Mon–Sat 11am–7pm | 📞 9680102276 | Book at /contact`;

const PROMOTE_HI = `
✨ **Dream Mantra कैसे मदद करता है:**
• **Brain Mapping** — जन्मजात प्रतिभा और learning style
• **Skill Mapping** — MBTI, DISC, RIASEC से stream fit
• **7-Step Counselling** — assessment से roadmap तक
• **950+ Career Library** — salary, skills, roadmap
• **मुफ्त परामर्श** — सोम–शनि 11am–7pm | 📞 9680102276 | /contact`;

export const STREAM_PROFILES = [
  {
    id: 'science_pcm',
    keys: [
      'pcm', 'science pcm', 'physics chemistry math', 'physics chemistry maths',
      'non medical', 'non-medical', 'engineering stream', 'jee', 'iit', 'bits',
      'b.tech', 'btech', 'mathematics stream',
    ],
    en: {
      title: 'Science (PCM) — Physics, Chemistry, Mathematics',
      body: `**What PCM opens up:**
PCM is ideal if you enjoy logic, problem-solving, and quantitative thinking. Core subjects build strong analytical foundations.

**Top career paths:**
• Engineering — Software, Mechanical, Civil, Aerospace (via JEE Main/Advanced, BITSAT, state CETs)
• Architecture — NATA / JEE Paper 2
• Pure Sciences — B.Sc Physics/Chemistry/Math → M.Sc, research, ISRO, DRDO
• Defence — NDA (after Class 12)
• Commercial Pilot — CPL after Class 12 + medical fitness
• Data Science / AI — B.Tech CS or B.Sc Math + coding skills

**Key exams:** JEE Main & Advanced, BITSAT, VITEEE, MHT-CET, KCET, NDA, CUET

**Skills to build:** Mathematics depth, physics concepts, coding basics, logical reasoning

**Tip:** PCM suits students with strong math aptitude and interest in how things work — but confirm with aptitude testing before committing, as PCB or Commerce may fit better for some profiles.`,
    },
    hi: {
      title: 'Science (PCM) — Physics, Chemistry, Mathematics',
      body: `**PCM से क्या संभव है:**
PCM logic, problem-solving और maths में रुचि वाले students के लिए है।

**करियर:** Engineering (JEE), Architecture, B.Sc, NDA, Pilot, Data Science/AI

**परीक्षाएं:** JEE Main/Advanced, BITSAT, state CET, NDA, CUET

**कौशल:** Maths, Physics, coding basics, reasoning

**सुझाव:** PCM से पहले aptitude test से confirm करें — कुछ students के लिए PCB या Commerce बेहतर हो सकता है।`,
    },
  },
  {
    id: 'science_pcb',
    keys: [
      'pcb', 'science pcb', 'biology', 'medical stream', 'neet', 'mbbs', 'doctor',
      'bds', 'pharmacy', 'biotech', 'life science', 'pcmb',
    ],
    en: {
      title: 'Science (PCB) — Physics, Chemistry, Biology',
      body: `**What PCB opens up:**
PCB is the gateway to healthcare, life sciences, and biology-driven careers. Requires dedication, memory, and genuine interest in living systems.

**Top career paths:**
• Medicine — MBBS, BDS (via NEET-UG)
• Pharmacy — B.Pharm, D.Pharm
• Nursing & Allied Health — B.Sc Nursing, Physiotherapy, Occupational Therapy
• Biotechnology & Microbiology — B.Sc/M.Sc → research, pharma, food tech
• Veterinary Science — BVSc
• Nutrition & Dietetics, Psychology (with biology base)

**Key exams:** NEET-UG (MBBS/BDS/Ayush), AIIMS (via NEET), CUET, state veterinary entrances

**Skills to build:** Biology concepts, chemistry fundamentals, NEET-level problem practice, empathy & patience

**Tip:** NEET is highly competitive — start early planning from Class 9-10. If biology feels forced, explore PCM or paramedical alternatives with our counsellors.`,
    },
    hi: {
      title: 'Science (PCB) — Physics, Chemistry, Biology',
      body: `**PCB से क्या संभव है:**
Healthcare, life sciences और biology-based careers के लिए PCB best है।

**करियर:** MBBS/BDS (NEET), Pharmacy, Nursing, Biotech, Veterinary

**परीक्षाएं:** NEET-UG, CUET, state entrances

**कौशल:** Biology, Chemistry, NEET practice, empathy

**सुझाव:** NEET competitive है — Class 9-10 से planning शुरू करें। Biology में natural interest confirm करें।`,
    },
  },
  {
    id: 'commerce',
    keys: [
      'commerce', 'commerse', 'accounts', 'accountancy', 'business studies',
      'economics stream', 'ca ', 'chartered accountant', 'cs ', 'company secretary',
      'bba', 'bcom', 'b.com', 'finance stream',
    ],
    en: {
      title: 'Commerce Stream',
      body: `**What Commerce opens up:**
Commerce builds skills in finance, business, economics, and management — one of the most versatile streams for corporate and entrepreneurial careers.

**Top career paths:**
• Chartered Accountancy (CA) — after Class 12 via Foundation
• Company Secretary (CS), CMA
• B.Com / BBA → MBA, banking, finance roles
• Investment Banking, Financial Analyst, Stock Market
• Entrepreneurship & family business management
• Actuarial Science (with strong math)
• Law — BA LLB (after Class 12)

**Key exams:** CA Foundation, CUET, IPMAT (IIM Indore/Rohtak), CLAT (law), NPAT

**Skills to build:** Accounts, economics reasoning, communication, Excel/financial literacy, analytical thinking

**Tip:** Commerce + Mathematics opens CA, economics honours, and quant finance paths. Without maths, focus on B.Com, BBA, and professional courses like CS.`,
    },
    hi: {
      title: 'Commerce Stream',
      body: `**Commerce से क्या संभव है:**
Finance, business, economics और management careers के लिए बहुत versatile stream।

**करियर:** CA, CS, CMA, B.Com/BBA, MBA, Banking, Finance, Law, Entrepreneurship

**परीक्षाएं:** CA Foundation, CUET, IPMAT, CLAT

**कौशल:** Accounts, Economics, communication, Excel

**सुझाव:** Commerce + Maths CA और finance paths खोलता है।`,
    },
  },
  {
    id: 'arts',
    keys: [
      'arts', 'humanities', 'humanities stream', 'ba ', 'b.a', 'political science',
      'history stream', 'psychology stream', 'sociology', 'literature', 'fine arts',
      'design stream', 'media', 'journalism', 'civil services', 'upsc', 'law arts',
    ],
    en: {
      title: 'Arts / Humanities Stream',
      body: `**What Arts/Humanities opens up:**
Often underestimated — Arts develops critical thinking, communication, creativity, and social understanding. Many top leaders, lawyers, designers, and civil servants come from humanities backgrounds.

**Top career paths:**
• Civil Services — UPSC IAS/IPS/IFS (any graduate can apply)
• Law — BA LLB, CLAT
• Psychology & Counselling — BA → MA Psychology, RCI certification
• Journalism & Mass Communication, Content Creation
• Design — NID, NIFT, UCEED (with aptitude prep)
• Hotel Management — NCHM JEE
• Teaching, Social Work, NGO sector
• Foreign Languages → translation, diplomacy, MNC roles

**Key exams:** CUET, CLAT, NID/NIFT entrances, NCHM JEE, UPSC (after graduation)

**Skills to build:** Reading & writing, critical analysis, public speaking, research, creativity

**Tip:** Arts is NOT "easy" or "lesser" — it suits analytical-creative minds. Pair with Skill Mapping testing to find the right specialisation (law vs design vs psychology).`,
    },
    hi: {
      title: 'Arts / Humanities Stream',
      body: `**Arts/Humanities से क्या संभव है:**
Critical thinking, communication और creativity — UPSC, Law, Psychology, Design, Journalism, Hotel Management।

**करियर:** IAS/IPS, Law, Psychology, Design (NID/NIFT), Media, Teaching

**परीक्षाएं:** CUET, CLAT, NID/NIFT, NCHM JEE, UPSC (graduation के बाद)

**सुझाव:** Arts "आसान" नहीं — analytical-creative minds के लिए powerful है।`,
    },
  },
  {
    id: 'technology',
    keys: [
      'technology', 'it stream', 'computer science', 'coding', 'programming',
      'software', 'tech career', 'ai career', 'data science', 'cyber security',
    ],
    en: {
      title: 'Technology / IT Career Path',
      body: `**Technology careers in India:**
Tech is one of the fastest-growing sectors — but success depends on skills, not just stream choice.

**Routes in:**
• PCM → B.Tech CS/IT (JEE) → Software Engineer, AI/ML Engineer
• Commerce + self-taught coding → Product roles, fintech
• Any stream + bootcamps/certifications → Web dev, UI/UX, digital marketing tech
• BCA/MCA, B.Sc IT — alternative to engineering

**Hot roles 2025:** AI Engineer, Cloud Architect, Cybersecurity Analyst, Full-Stack Developer, Data Analyst

**Skills to build:** Python, JavaScript, DSA, cloud basics, Git, problem-solving

**Tip:** Tech rewards skill-builders. Even without PCM, many careers exist — but PCM + B.Tech gives the strongest foundation. Our Skill Mapping test reveals if your personality fits builder vs analyst vs creative tech roles.`,
    },
    hi: {
      title: 'Technology / IT Career Path',
      body: `**Tech careers:**
Software, AI/ML, Cybersecurity, Data Science — skills matter most.

**Routes:** B.Tech CS (JEE), BCA/MCA, bootcamps + certifications

**Hot roles:** AI Engineer, Cloud, Cybersecurity, Full-Stack Dev

**कौशल:** Python, JavaScript, DSA, problem-solving`,
    },
  },
];

const STREAM_ALIASES = {
  science: 'science_pcm',
  pcm: 'science_pcm',
  pcb: 'science_pcb',
  medical: 'science_pcb',
  commerce: 'commerce',
  arts: 'arts',
  humanities: 'arts',
  technology: 'technology',
  it: 'technology',
};

export function normalizeStreamInput(stream) {
  if (!stream) return null;
  const s = stream.toLowerCase().trim();
  if (s.includes('pcb') || s.includes('biology') || s.includes('medical')) return 'science_pcb';
  if (s.includes('pcm') || s.includes('math') || s.includes('engineering')) return 'science_pcm';
  if (s.includes('commerce') || s.includes('account')) return 'commerce';
  if (s.includes('arts') || s.includes('humanities')) return 'arts';
  if (s.includes('tech') || s.includes('it') || s.includes('computer')) return 'technology';
  return STREAM_ALIASES[s] || null;
}

export function detectStreamFromMessage(message) {
  const text = message.toLowerCase().replace(/[^\w\s]/g, ' ');
  let best = null;
  let bestScore = 0;

  for (const profile of STREAM_PROFILES) {
    let score = 0;
    for (const key of profile.keys) {
      const k = key.toLowerCase().trim();
      if (text.includes(k)) score += k.split(/\s+/).length * 3;
      else if (k.length > 3 && text.split(/\s+/).some((w) => w.includes(k) || k.includes(w))) score += 1;
    }
    if (/about (pcm|pcb|commerce|arts|science stream|humanities)/.test(text)) {
      const hint = text.match(/about (pcm|pcb|commerce|arts|science|humanities|technology)/);
      if (hint) {
        const id = normalizeStreamInput(hint[1]);
        if (id === profile.id) score += 5;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = profile;
    }
  }

  if (bestScore >= 2) return best;
  if (/which stream|stream select|choose stream|stream should|best stream|stream for me/.test(text)) {
    return { id: 'stream_selection', generic: true };
  }
  return null;
}

export function buildStreamReply(profileOrId, lang = 'en', options = {}) {
  const langKey = lang === 'hi' ? 'hi' : 'en';
  const promote = langKey === 'hi' ? PROMOTE_HI : PROMOTE_EN;

  if (profileOrId?.generic || profileOrId?.id === 'stream_selection') {
    return langKey === 'hi'
      ? `**Stream चुनाव — सही approach:**\n\nहर stream (PCM, PCB, Commerce, Arts) में excellent careers हैं — सही stream = आपकी aptitude + interest + market demand का match।\n\n**Compare quickly:**\n• **PCM** → Engineering, Architecture, Pure Science, Defence\n• **PCB** → Medicine, Pharmacy, Biotech, Allied Health\n• **Commerce** → CA, CS, BBA/MBA, Finance, Law\n• **Arts** → UPSC, Law, Psychology, Design, Media\n\nGuesswork avoid करें — scientific assessment से decide करें।${promote}`
      : `**Choosing the right stream:**\n\nEvery stream (PCM, PCB, Commerce, Arts) leads to excellent careers — the right choice matches your aptitude, interests, and market demand.\n\n**Quick comparison:**\n• **PCM** → Engineering, Architecture, Pure Science, Defence\n• **PCB** → Medicine, Pharmacy, Biotech, Allied Health\n• **Commerce** → CA, CS, BBA/MBA, Finance, Law\n• **Arts** → UPSC, Law, Psychology, Design, Media\n\nDon't guess — decide with scientific assessment.${promote}`;
  }

  const profile = typeof profileOrId === 'string'
    ? STREAM_PROFILES.find((p) => p.id === profileOrId)
    : profileOrId;

  if (!profile) return null;

  const content = profile[langKey];
  const prefix = options.includeGreeting
    ? (langKey === 'hi' ? `बढ़िया सवाल! **${content.title}** के बारे में:\n\n` : `Great question! Here's about **${content.title}**:\n\n`)
    : '';

  return `${prefix}${content.body}${promote}`;
}

export function getStreamProfile(streamId) {
  return STREAM_PROFILES.find((p) => p.id === streamId) || null;
}

export function getStreamInsight(streamId, lang = 'en') {
  const profile = getStreamProfile(normalizeStreamInput(streamId) || streamId);
  if (!profile) return null;
  const langKey = lang === 'hi' ? 'hi' : 'en';
  return {
    id: profile.id,
    title: profile[langKey].title,
    summary: profile[langKey].body.split('\n\n')[0].replace(/\*\*/g, ''),
    exams: extractExams(profile[langKey].body),
    careers: extractCareers(profile[langKey].body),
  };
}

function extractExams(body) {
  const match = body.match(/\*\*Key exams?:\*\*([^\n]+)|\*\*परीक्षाएं?:\*\*([^\n]+)/i);
  return match ? (match[1] || match[2] || '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 5) : [];
}

function extractCareers(body) {
  const lines = body.split('\n').filter((l) => l.startsWith('•'));
  return lines.map((l) => l.replace(/^•\s*/, '').replace(/\*\*/g, '').split('—')[0].trim()).slice(0, 5);
}
