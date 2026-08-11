// Content from Dream Mantra / Dream Mantra Roadmap
// Unsplash IDs verified via scripts/check-images.mjs (HEAD 200)
const u = (id, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;

export const IMAGES = {
  hero: u('photo-1523240795612-9a054b0db644', 1200),
  heroStudents: u('photo-1529390079861-591de354faf5', 1200),
  dmit: u('photo-1596495577886-d920f1fb0e42', 640),
  fingerprint: u('photo-1576091160550-2173dba999ef'),
  psychometric: u('photo-1529156069898-49953e39b3ac', 640),
  skillMapping: u('photo-1434030216411-0b793f4b4173', 640),
  comboMind: u('photo-1517486808906-6ca97bc40924', 640),
  comboSkill: u('photo-1544717297-fa95b6ee9643', 640),
  /** Small Indian classroom / peer collages for mapping heroes */
  dmitCollage: [
    u('photo-1596495577886-d920f1fb0e42', 480),
    u('photo-1577896851231-70ef18881754', 480),
    u('photo-1517486808906-6ca97bc40924', 480),
    u('photo-1544717297-fa95b6ee9643', 480),
  ],
  psychoCollage: [
    u('photo-1529156069898-49953e39b3ac', 480),
    u('photo-1434030216411-0b793f4b4173', 480),
    u('photo-1513258496099-48168024aec0', 480),
    u('photo-1509062522246-3755977927d7', 480),
  ],
  comboCollage: [
    u('photo-1517486808906-6ca97bc40924', 480),
    u('photo-1544717297-fa95b6ee9643', 480),
    u('photo-1529156069898-49953e39b3ac', 480),
    u('photo-1596495577886-d920f1fb0e42', 480),
  ],
  students: u('photo-1503676260728-1c00da094a0b'),
  studentsGroup: u('photo-1543269865-cbf97eff37da'),
  classroom: u('photo-1582719478250-c89cae4dc85b'),
  /** Class 6–8 program — middle-school students learning together */
  class6to8: u('photo-1529390079861-591de354faf5'),
  /** Schools partnership — campus / institutional setting */
  schoolsCampus: u('photo-1582719478250-c89cae4dc85b'),
  career: u('photo-1600880292203-757bb62b4baf'),
  founder: '/team/esha-lohiya.png',
  coFounder: '/team/shivam-lohiya.png',
  anilLohiya: '/team/anil-lohiya.jpg',
  sunilLohiya: '/team/sunil-lohiya.jpg',
  seemaLohiya: '/team/seema-lohiya.jpg',
  vinitaTibrewal: '/team/vinita-tibrewal.jpg',
  ishantGoyal: '/team/ishant-goyal.jpg',
  counselling: u('photo-1552664730-d307ca884978'),
  counsellingSession: u('photo-1573497019940-1c28c88b4f3e'),
  professional: u('photo-1521737604893-d14cc237f11d'),
  science: u('photo-1581091226825-a6a2a5aee158'),
  kids: u('photo-1544776193-352d25ca82cd'),
  college: u('photo-1498243691581-b145c3f54a5a'),
  /** Jaipur street & market scenes (not Taj Mahal / Agra) */
  jaipur: u('photo-1763291966927-740c48e6afe5'),
  jaipurStreets: [
    u('photo-1763291966927-740c48e6afe5'), // Hawa Mahal market stall
    u('photo-1756995427928-dcc15d3d091b'), // Jaipur street market
    u('photo-1599669454699-248893623440'), // Jaipur old city street
  ],
  aiTech: u('photo-1677442136019-21780ecad995'),
  team: u('photo-1522071820081-009f0129c71c'),
  parentChild: u('photo-1544776193-352d25ca82cd'),
  success: u('photo-1553877522-43269d4ea984'),
  crp: u('photo-1586281380349-632531db7ed4'),
  studyAbroad: u('photo-1427504494785-3a9ca7044f45'),
  internship: u('photo-1517694712202-14dd9538aa97'),
  skills: u('photo-1516321318423-f06f85e504b3'),
  profile: u('photo-1586281380349-632531db7ed4'),
  /** Marketplace hero — modern career workspace / laptop desk */
  marketplace: u('photo-1486312338219-ce68d2c6f44d', 1200),
  mentorship: u('photo-1556761175-b413da4baf72'),
  handholding: u('photo-1522202176988-66273c2fd55f'),
  promise: u('photo-1427504494785-3a9ca7044f45'),
  workshop: u('photo-1517245386807-bb43f82c33c4'),
  library: u('photo-1481627834876-b7833e8f5570'),
};

export const PORTRAITS = {
  parent1: u('photo-1580894732444-565139d71cfd', 400),
  parent2: u('photo-1612349317150-e413f6a5b16d', 400),
  student1: u('photo-1594824476967-48c8b964270f', 400),
  student2: u('photo-1629904853716-fdaef0d44bf0', 400),
  professional1: u('photo-1566492031773-4fc4c0bcc9f5', 400),
  counsellor1: u('photo-1500648767791-00dcc994a43e', 400),
  counsellor2: u('photo-1580489944761-15a19d654956', 400),
  counsellor3: u('photo-1438761681033-6461ffad8d80', 400),
  counsellor4: u('photo-1472099645785-5658abf4ff4e', 400),
  counsellor5: u('photo-1580489944761-15a19d654956', 400),
};

export const assessments = [
  {
    slug: 'dmit',
    title: 'Brain Mapping',
    titleHi: 'Brain Mapping',
    icon: '🔬',
    subtitle: 'Fingerprint Analysis, Inborn Potential Mapping',
    image: IMAGES.dmit,
    points: [
      'Validated in 30+ countries',
      'Maps learning styles, memory patterns, intelligence types',
      'Bias-free insight without exams or pressure',
      'Rooted in neuroscience, genetics, and psychology',
    ],
  },
  {
    slug: 'psychometric',
    title: 'Skill Mapping',
    titleHi: 'Skill Mapping',
    icon: '📊',
    subtitle: '7 Frameworks: 7 assessments: Career Interest, Multiple Talents, Personality, Learning Style, Professional Behaviour, Workplace Personality & Decision-Making',
    image: IMAGES.psychometric,
    points: [
      'Personality Assessment profiling',
      'Professional Behaviour & Work Style Analysis',
      'Career Interest Assessment mapping',
      'Workplace Personality, Learning Style, Multiple Talents & Decision-Making assessments',
    ],
  },
  {
    slug: 'dmit-psychometric',
    title: 'Brain Mapping + Skill Mapping',
    titleHi: 'Brain Mapping + Skill Mapping',
    icon: '🧬',
    subtitle: 'Complete Inborn + Acquired Talent Profile — Best of Both',
    image: IMAGES.science,
    points: [
      'Brain Mapping fingerprint analysis for inborn intelligence & learning style',
      'Skill Mapping suite for personality, interests & behaviour',
      'Holistic profile combining nature + nurture for career decisions',
      'Recommended for Class 6+ stream and career selection',
      'Single combined report with counsellor interpretation session',
    ],
  },
  {
    slug: 'why-dreams-mantra',
    title: 'Why Career Counselling',
    titleHi: 'करियर counselling क्यों?',
    icon: '💜',
    subtitle: 'Scientific career guidance — No pressure. No comparison. Just clarity.',
    image: IMAGES.counsellingSession,
    points: [
      'The Dream Mantra Promise — every child holds untapped brilliance',
      'Brain Mapping validated in 30+ countries + 7 Skill Mapping frameworks',
      'Assess → Analyze → Guide: from Class 1 to First Job',
      'Founder Esha Lohiya — Govt of India, IIT Madras, NLP certified',
      'Jaipur centres + Pan-India online · 9680102276',
    ],
  },
];

export const programs = [
  { slug: 'class-1-5', title: 'Class 1-5', titleHi: 'कक्षा 1-5', subtitle: 'Talent Discovery', image: IMAGES.kids },
  { slug: 'class-6-8', title: 'Class 6-8', titleHi: 'कक्षा 6-8', subtitle: 'Self Discovery', image: IMAGES.class6to8 },
  { slug: 'class-9-10', title: 'Class 9-10', titleHi: 'कक्षा 9-10', subtitle: 'Stream Selection', image: IMAGES.students },
  { slug: 'class-11-12', title: 'Class 11-12', titleHi: 'कक्षा 11-12', subtitle: 'Career Direction', image: IMAGES.college },
  { slug: 'college-students', title: 'College Students', titleHi: 'कॉलेज छात्र', subtitle: 'Degree & Career Clarity', image: IMAGES.college },
  { slug: 'working-professionals', title: 'Working Professionals', titleHi: 'वर्किंग प्रोफेशनल', subtitle: 'Career Switch & Growth', image: IMAGES.professional },
];

export const partners = [
  { slug: 'schools', title: 'Schools', icon: '🏫', image: IMAGES.schoolsCampus },
  { slug: 'coaching-centers', title: 'Coaching Centers', icon: '📖', image: IMAGES.studentsGroup },
  { slug: 'colleges', title: 'Colleges', icon: '🎓', image: IMAGES.college },
  { slug: 'corporates', title: 'Corporates', icon: '🏢', image: IMAGES.professional },
  { slug: 'teachers', title: 'Teachers', icon: '👩‍🏫', image: IMAGES.workshop },
  { slug: 'referral-partner', title: 'Referral Partner', icon: '🤝', image: IMAGES.team },
];

export const testimonials = [
  {
    name: 'Parents of Rohan',
    role: 'Class 7 · Jaipur',
    image: PORTRAITS.parent1,
    text: 'Dream Mantra helped us understand our son\'s learning style. He\'s a kinesthetic learner. Now we use activities to teach him. His grades improved and so did his confidence!',
    stars: 5,
  },
  {
    name: 'Priya',
    role: 'Class 11 — Commerce',
    image: PORTRAITS.student2,
    text: 'I was confused between Commerce and Science. The Brain Mapping showed my natural strength in logical-mathematical thinking. I took Commerce with Math and now I\'m pursuing CA. Best decision ever!',
    stars: 5,
  },
  {
    name: 'Parent of Myra',
    role: 'Class 8',
    image: PORTRAITS.parent2,
    text: 'The career awareness sessions opened my daughter\'s mind to possibilities she never knew existed. She\'s excited about her future now.',
    stars: 5,
  },
  {
    name: 'Vikram',
    role: 'Marketing Professional',
    image: PORTRAITS.professional1,
    text: 'As a working professional, I was stuck in a role that didn\'t fit me. Dream Mantra helped me identify my real strengths. I switched careers and now I actually enjoy Mondays!',
    stars: 5,
  },
  {
    name: 'Parent of Kabir',
    role: 'Class 5',
    image: PORTRAITS.parent1,
    text: 'The Brain Mapping report was eye-opening — it matched exactly with what we observed but gave us the scientific backing. And the Skill Mapping analysis helped us understand our son\'s current personality. The combination is powerful.',
    stars: 5,
  },
  {
    name: 'College Student',
    role: 'B.Tech 2nd Year',
    image: PORTRAITS.student1,
    text: 'Esha ma\'am explained how my natural strengths (from Brain Mapping) align with my current interests (from Skill Mapping) and what the market actually needs. For the first time, I have a clear path forward.',
    stars: 5,
  },
  {
    name: 'Parent of Ananya',
    role: 'Class 10',
    image: PORTRAITS.parent2,
    text: 'The team at Dream Mantra doesn\'t just give you a report — they hand-hold you through it. The simplified visuals made it easy for even us as parents to understand. No stress, just clarity.',
    stars: 5,
  },
  {
    name: 'Working Professional',
    role: 'Career Switch Success',
    image: PORTRAITS.professional1,
    text: 'I was skeptical about fingerprint analysis, but the science behind Brain Mapping convinced me. Combined with Skill Mapping, I got a complete picture of who I am and what I should do next.',
    stars: 5,
  },
];

/** Certification images — current credentials for Our Certifications showcase */
export const certifications = [
  { id: 'iccc', category: 'international', image: '/certifications/cert-iccc.png' },
  { id: 'govt', category: 'government', image: '/certifications/cert-govt.png' },
  { id: 'nlp-practitioner', category: 'nlp', image: '/certifications/cert-nlp-practitioner.png' },
  { id: 'nlp-advanced', category: 'nlp', image: '/certifications/cert-nlp-advanced.png' },
  { id: 'nlp-hindi', category: 'nlp', image: '/certifications/cert-nlp-hindi.png' },
  { id: 'iit', category: 'iit', image: '/certifications/cert-iit.png' },
  { id: 'reliance', category: 'reliance', image: '/certifications/cert-reliance.png' },
];

export const managementTeam = [
  {
    name: 'Esha Tibrewal',
    role: 'Founder & CEO',
    initials: 'EL',
    image: IMAGES.founder,
    tagline: 'From Naukri.com to unlocking every child\'s potential',
    bio: 'A passionate counsellor and the guiding force behind Dream Mantra, Esha brings a unique blend of corporate recruitment experience and counseling expertise. She witnessed firsthand the gap between what people study, what they\'re suited for, and what the market actually needs.',
    before: [
      'Former Key Accounts Manager at Naukri.com for Rajasthan',
      'Worked closely with 15,000+ job seekers across industries',
      'Collaborated with 2,500+ HR professionals and recruiters',
      'Witnessed the recurring mismatch between education, natural strengths, and market demands',
    ],
    insight: 'Through her recruitment experience, Esha saw that most career problems start early — students choose streams without understanding their natural strengths, and end up as unhappy professionals. The solution isn\'t fixing careers later — it\'s getting the foundation right from school itself.',
    vision: 'To unlock every child\'s unique potential — before they face career struggles.',
    responsibilities: [
      'Specializes in Brain Mapping counselling and child development insights',
      'Expert in Skill Mapping assessment interpretation',
      'Aligns what the child studies × natural strengths (Brain Mapping) × current personality (Skill Mapping) × market demands',
      'Turns scientific insight into real-life strategies with simplified visuals for parents and students',
    ],
    certs: ['Government of India', 'International Certified Career Counselling', 'Brain Mapping', 'NLP', 'Reliance Foundation', 'IIT Madras'],
  },
  {
    name: 'Shivam Lohiya',
    role: 'Co-Founder – Operations & Technology',
    initials: 'SL',
    image: IMAGES.coFounder,
    tagline: 'PwC consulting rigor powering Dream Mantra at scale',
    bio: 'A strategic leader who builds the technology and operations backbone of Dream Mantra, Shivam brings consulting rigor from large-scale government projects. He understood that impact at scale requires robust technology, seamless operations, and processes that thousands can trust.',
    before: [
      'Consultant with PwC (PricewaterhouseCoopers) for Government of Rajasthan projects',
      'Technology and operations backbone for large-scale government initiatives',
      'Expertise in managing complex, state-level project implementations',
      'Background in technology consulting and operational strategy',
    ],
    insight: 'Through his work on government-scale systems, Shivam understood that impact at scale requires robust technology, seamless operations, and processes that thousands can trust. This philosophy now powers Dream Mantra\'s growth.',
    vision: 'To make Dream Mantra future-ready through innovation, scalability, and government-level process orientation.',
    responsibilities: [
      'Drives business growth and technical infrastructure',
      'Manages finance, operations, and digital systems integration',
      'Brings consulting rigor and government-level process orientation',
      'Focuses on innovation and scalability to make Dream Mantra future-ready',
      'Creates smooth, reliable processes serving thousands of families seamlessly',
    ],
  },
];

export const founder = {
  name: 'Esha Tibrewal',
  role: 'Founder & CEO',
  quote: 'Every child is a unique key, meant to unlock different doors. At Dream Mantra, we don\'t label or judge — we simply reveal the brilliance that already exists. With science, heart, and lifelong value.',
  longNote: 'In my years at Naukri.com, I saw thousands of professionals stuck in jobs they hated. Bright, capable people who chose the wrong path because of pressure, confusion, or lack of guidance. There was always a mismatch between what they studied, what they were naturally good at, and what the job market actually needed. That\'s why we use Brain Mapping — validated in 30+ countries — and Skill Mapping assessments with 7 frameworks to create the complete picture. We\'re not just decoding fingerprints — we\'re unlocking futures.',
  certs: ['Government of India', 'International Certified Career Counselling', 'Brain Mapping', 'NLP', 'Reliance Foundation', 'IIT Madras'],
  email: 'info@dreammantra.in',
  phone: '9680102276',
};

export const missionVision = {
  mission: 'To replace confusion, pressure, and guesswork with clarity, awareness, and informed decision-making — for every individual.',
  vision: 'To empower every individual—especially children and youth—to discover their true potential through scientific self-awareness, and guide them toward a life of confidence, clarity, and purpose.',
  purpose: 'To bridge the gap between education, natural intelligence, and career alignment — enabling students to progress with direction, supported by informed parents and empowered institutions.',
  philosophy: 'We are all unique keys, meant to unlock different doors. At Dream Mantra, we don\'t try to fit people into boxes — we use Brain Mapping and Skill Mapping science to help them discover which path they naturally belong in.',
};

export const programDetails = {
  'class-1-5': {
    desc: 'Early talent discovery through playful, scientific assessment. Identify learning styles before academic pressure builds.',
    features: ['Brain Mapping for young learners', 'Parent counselling session', 'Learning style report', 'Activity-based recommendations'],
  },
  'class-6-8': {
    desc: 'Self-discovery phase — build confidence and awareness before critical stream decisions in Class 9.',
    features: ['Skill Mapping + Brain Mapping combo', 'Interest mapping', 'Subject affinity analysis', 'Parent-student joint session'],
  },
  'class-9-10': {
    desc: 'Stream selection backed by science — Science, Commerce, Arts with clarity on boards and future careers.',
    features: ['Brain Mapping + Skill Mapping for stream clarity', 'Career library access', 'Board strategy', '2 follow-up sessions'],
  },
  'class-11-12': {
    desc: 'Career direction before board exams — courses, colleges, entrance exams, and backup plans.',
    features: ['Career shortlisting', 'College mapping', 'Entrance exam roadmap', 'Profile building tips'],
  },
  'college-students': {
    desc: 'Degree validation, internship planning, and first-job readiness for undergraduates and graduates.',
    features: ['Career fit reassessment', 'Internship guidance', 'Skill roadmap', 'Higher studies planning'],
  },
  'working-professionals': {
    desc: 'Career switch, upskilling, and role alignment for professionals feeling stuck or seeking growth.',
    features: ['Personality-career alignment', 'Industry trend briefing', 'Switch roadmap', 'Mentorship connect'],
  },
};

export const partnerDetails = {
  schools: { desc: 'Integrate scientific career guidance into your school curriculum with certified counsellors and parent workshops.' },
  'coaching-centers': { desc: 'Offer Brain Mapping & Skill Mapping assessments as value-add for your students preparing for competitive exams.' },
  colleges: { desc: 'Campus career cells powered by Dream Mantra — placement prep, internships, and alumni mentoring.' },
  corporates: { desc: 'Employee career wellness programs, team assessments, and leadership development workshops.' },
  teachers: { desc: 'Become a certified career guide — training, certification, and referral income opportunities.' },
  'referral-partner': { desc: 'Earn commissions by referring students and professionals to Dream Mantra programs.' },
};
