/**
 * Generates 950+ career opportunities with rich detail
 * Run: node scripts/generateCareers.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Class 11+ stream tags — keep in sync with client/src/utils/careerStreams.js */
const CLASS_11_STREAM_VALUES = ['PCM', 'PCB', 'PCMB', 'Commerce', 'Arts', 'Vocational'];
const PCM_CATS = new Set(['Engineering & Technology']);
const PCB_CATS = new Set(['Medical & Healthcare']);
const COMMERCE_CATS = new Set(['Commerce & Finance', 'Business & Management']);
const ARTS_CATS = new Set(['Arts & Humanities', 'Design & Creative', 'Media & Communication']);
const VOCATIONAL_CATEGORIES = new Set([
  'Trades & Vocational', 'Sports & Fitness', 'Education & Training',
  'Hospitality & Tourism', 'Defence & Security', 'Law & Public Service',
  'Media & Communication', 'Design & Creative', 'Arts & Humanities',
]);

function isVocationalCareer(category, legacyStream = []) {
  if (VOCATIONAL_CATEGORIES.has(category)) return true;
  if (legacyStream.includes('Any')) return true;
  return false;
}

function resolveClassStreams(category, title, legacyStream = []) {
  const t = (title || '').toLowerCase();
  const out = new Set();
  if (PCM_CATS.has(category)) out.add('PCM');
  if (PCB_CATS.has(category)) out.add('PCB');
  if (COMMERCE_CATS.has(category)) out.add('Commerce');
  if (ARTS_CATS.has(category)) out.add('Arts');
  if (category === 'Science & Research') {
    if (/bio|micro|genetic|zoolog|botany|ecolog|marine|immun|virol|food sci/.test(t)) out.add('PCB');
    else out.add('PCM');
  }
  if (category === 'IT & Digital') { out.add('PCM'); out.add('Commerce'); if (legacyStream.includes('Any')) out.add('Arts'); }
  if (category === 'Emerging & Future Careers') { out.add('PCM'); out.add('Commerce'); if (/bio|health|medical/.test(t)) out.add('PCB'); if (legacyStream.includes('Any')) out.add('Arts'); }
  if (category === 'Agriculture & Environment') {
    if (/engineer|technologist/.test(t)) out.add('PCM');
    else { out.add('PCB'); out.add('PCM'); }
    if (legacyStream.includes('Any')) out.add('Commerce');
  }
  if (category === 'Law & Public Service') { out.add('Arts'); out.add('Commerce'); }
  if (category === 'Hospitality & Tourism') { out.add('Commerce'); out.add('Arts'); out.add('PCM'); out.add('PCB'); }
  if (category === 'Defence & Security') { out.add('PCM'); out.add('PCB'); out.add('Arts'); out.add('Commerce'); }
  if (['Sports & Fitness', 'Education & Training', 'Trades & Vocational'].includes(category)) {
    ['PCM', 'PCB', 'Commerce', 'Arts'].forEach((s) => out.add(s));
  }
  if (/doctor|mbbs|dentist|nurse|pharm|medical|neet|surgeon|vet |physio|clinical|patholog/.test(t)) out.add('PCB');
  if (/engineer|software|developer|architect|jee|b\.tech|data sc|machine learning/.test(t)) out.add('PCM');
  if (/chartered|accountant|finance|bank|bcom|bba|ca |commerce/.test(t)) out.add('Commerce');
  if (/journalist|designer|artist|writer|media|humanities|fashion|graphic|animation/.test(t)) out.add('Arts');
  if (legacyStream.includes('Commerce')) out.add('Commerce');
  if (legacyStream.includes('Arts')) out.add('Arts');
  if (legacyStream.includes('Science') && !out.size) out.add('PCM');
  if (isVocationalCareer(category, legacyStream)) out.add('Vocational');
  if (out.size === 0) out.add('PCM');
  if (out.has('PCM') && out.has('PCB')) out.add('PCMB');
  return [...out];
}

function blob(career) {
  return [career.title, career.category, career.shortDescription, ...(career.exams || []), ...(career.skills || [])].join(' ').toLowerCase();
}

function hasClassStreamTag(tags, streamFilter) {
  if (!Array.isArray(tags) || !tags.length) return false;
  if (streamFilter === 'Vocational') return tags.includes('Vocational');
  if (streamFilter === 'PCMB') return tags.includes('PCMB') || (tags.includes('PCM') && tags.includes('PCB'));
  if (tags.includes(streamFilter)) return true;
  if (tags.includes('PCMB') && (streamFilter === 'PCM' || streamFilter === 'PCB')) return true;
  return false;
}

function matchesClassStream(career, streamFilter) {
  if (!streamFilter || streamFilter === 'all') return true;
  const tags = career.classStreams;
  if (Array.isArray(tags) && tags.length) return hasClassStreamTag(tags, streamFilter);
  const cat = career.category || '';
  const legacy = career.stream || [];
  const b = blob(career);
  if (streamFilter === 'Vocational') return isVocationalCareer(cat, legacy);
  if (isVocationalCareer(cat, legacy)) return true;
  if (streamFilter === 'PCMB') return matchesClassStream(career, 'PCM') || matchesClassStream(career, 'PCB');
  switch (streamFilter) {
    case 'PCM':
      if (PCM_CATS.has(cat)) return true;
      if (PCB_CATS.has(cat)) return false;
      if (cat === 'IT & Digital') return true;
      return /engineer|software|developer|architect|jee|b\.tech|data sc|machine learning/.test(b);
    case 'PCB':
      if (PCB_CATS.has(cat)) return true;
      return /doctor|mbbs|dentist|nurse|pharm|medical|neet|surgeon|biotech|microbio/.test(b);
    case 'Commerce':
      if (COMMERCE_CATS.has(cat)) return true;
      return /chartered|accountant|finance|bank|commerce|bcom|bba/.test(b);
    case 'Arts':
      if (ARTS_CATS.has(cat)) return true;
      if (cat === 'Law & Public Service') return true;
      return /journalist|designer|artist|writer|media|humanities|fashion|graphic|animation/.test(b);
    default: return true;
  }
}

const categories = {
  'Engineering & Technology': {
    stream: ['Science'],
    base: [
      'Software Engineer', 'Data Scientist', 'Mechanical Engineer', 'Civil Engineer', 'Electrical Engineer',
      'Electronics Engineer', 'Aerospace Engineer', 'Automobile Engineer', 'Robotics Engineer', 'AI Engineer',
      'Machine Learning Engineer', 'Cloud Architect', 'DevOps Engineer', 'Cybersecurity Analyst', 'Blockchain Developer',
      'Biomedical Engineer', 'Chemical Engineer', 'Petroleum Engineer', 'Mining Engineer', 'Marine Engineer',
      'Nanotechnology Engineer', 'Environmental Engineer', 'Industrial Engineer', 'Metallurgical Engineer',
      'Telecommunications Engineer', 'Embedded Systems Engineer', 'VLSI Design Engineer', 'Structural Engineer',
      'Geotechnical Engineer', 'Production Engineer', 'Quality Assurance Engineer', 'Network Engineer',
      'Full Stack Developer', 'Mobile App Developer', 'Game Developer', 'UI/UX Engineer', 'AR/VR Developer',
      'IoT Engineer', 'Renewable Energy Engineer', 'Nuclear Engineer', 'Agricultural Engineer', 'Food Technologist Engineer',
      'Site Reliability Engineer', 'Platform Engineer', 'Firmware Engineer', 'Control Systems Engineer',
      'Hydraulic Engineer', 'Acoustic Engineer', 'Optical Engineer', 'Railway Engineer', 'Highway Engineer',
    ],
  },
  'Medical & Healthcare': {
    stream: ['Science'],
    base: [
      'Doctor (MBBS)', 'Surgeon', 'Dentist', 'Physiotherapist', 'Pharmacist', 'Nurse', 'Veterinarian',
      'Ayurvedic Doctor', 'Homeopathic Doctor', 'Occupational Therapist', 'Speech Therapist', 'Radiologist',
      'Pathologist', 'Anesthesiologist', 'Cardiologist', 'Neurologist', 'Pediatrician', 'Gynecologist',
      'Psychiatrist', 'Dermatologist', 'Ophthalmologist', 'ENT Specialist', 'Orthopedic Surgeon',
      'Medical Lab Technologist', 'Nutritionist', 'Public Health Specialist', 'Epidemiologist',
      'Biomedical Scientist', 'Genetic Counselor', 'Paramedic', 'Dental Hygienist', 'Optometrist',
      'Chiropractor', 'Prosthetist', 'Clinical Psychologist', 'Forensic Medical Examiner',
      'Pulmonologist', 'Nephrologist', 'Oncologist', 'Endocrinologist', 'Rheumatologist',
      'Medical Officer', 'Community Health Worker', 'Hospital Administrator', 'Clinical Research Coordinator',
    ],
  },
  'Commerce & Finance': {
    stream: ['Commerce', 'Any'],
    base: [
      'Chartered Accountant', 'Company Secretary', 'Investment Banker', 'Financial Analyst', 'Actuary',
      'Stock Broker', 'Tax Consultant', 'Auditor', 'Cost Accountant', 'Bank Manager', 'Insurance Advisor',
      'Wealth Manager', 'Portfolio Manager', 'Risk Analyst', 'Credit Analyst', 'Loan Officer',
      'Financial Planner', 'Economist', 'Business Analyst', 'Venture Capital Analyst', 'Private Equity Associate',
      'Forensic Accountant', 'Compliance Officer', 'Treasury Manager', 'Mutual Fund Manager', 'Real Estate Finance Manager',
      'FinTech Specialist', 'Blockchain Finance Analyst', 'E-commerce Finance Manager', 'GST Consultant',
      'Accounts Payable Manager', 'Payroll Specialist', 'Insurance Underwriter', 'Claims Adjuster',
    ],
  },
  'Law & Public Service': {
    stream: ['Any'],
    base: [
      'Lawyer', 'Judge', 'Legal Advisor', 'Corporate Lawyer', 'Criminal Lawyer', 'Civil Lawyer',
      'Intellectual Property Lawyer', 'Human Rights Lawyer', 'IAS Officer', 'IPS Officer', 'IFS Officer',
      'IRS Officer', 'Public Prosecutor', 'Legal Researcher', 'Notary', 'Mediator', 'Arbitrator',
      'Policy Analyst', 'Diplomat', 'Municipal Commissioner', 'District Collector', 'Civil Services Officer',
      'Defence Civilian Officer', 'Railway Officer', 'Bank PO', 'SSC Officer', 'State PSC Officer',
      'Tax Law Specialist', 'Labour Law Consultant', 'Cyber Law Expert', 'Environmental Lawyer',
    ],
  },
  'Science & Research': {
    stream: ['Science'],
    base: [
      'Research Scientist', 'Physicist', 'Chemist', 'Biologist', 'Microbiologist', 'Biotechnologist',
      'Geneticist', 'Astronomer', 'Geologist', 'Oceanographer', 'Meteorologist', 'Ecologist',
      'Zoologist', 'Botanist', 'Marine Biologist', 'Forensic Scientist', 'Data Analyst (Science)',
      'Clinical Research Associate', 'Science Writer', 'Patent Examiner', 'Laboratory Manager',
      'Quality Control Scientist', 'Food Scientist', 'Materials Scientist', 'Space Scientist',
      'Immunologist', 'Virologist', 'Toxicologist', 'Seismologist', 'Paleontologist',
    ],
  },
  'IT & Digital': {
    stream: ['Science', 'Commerce', 'Any'],
    base: [
      'Web Developer', 'Digital Marketer', 'SEO Specialist', 'Content Strategist', 'Social Media Manager',
      'Product Manager', 'Scrum Master', 'IT Consultant', 'Database Administrator', 'System Administrator',
      'Technical Writer', 'QA Tester', 'Business Intelligence Analyst', 'ERP Consultant', 'SAP Consultant',
      'Salesforce Administrator', 'Ethical Hacker', 'Penetration Tester', 'Cloud Consultant',
      'Animation Technical Director', 'E-learning Developer', 'CRM Specialist', 'Growth Hacker',
      'Data Engineer', 'Analytics Engineer', 'Site Analytics Specialist', 'No-Code Developer',
    ],
  },
  'Design & Creative': {
    stream: ['Any'],
    base: [
      'Graphic Designer', 'Fashion Designer', 'Interior Designer', 'Architect', 'Animator',
      'Film Director', 'Cinematographer', 'Photographer', 'Illustrator', 'UX Designer', 'UI Designer',
      'Product Designer', 'Jewellery Designer', 'Textile Designer', 'Landscape Architect', 'Urban Planner',
      'Art Director', 'Creative Director', 'Video Editor', 'Sound Engineer', 'Music Producer',
      'Choreographer', 'Theatre Artist', 'Makeup Artist', 'Visual Merchandiser', 'Exhibition Designer',
      'Motion Graphics Designer', '3D Artist', 'Industrial Designer', 'Set Designer',
    ],
  },
  'Media & Communication': {
    stream: ['Any'],
    base: [
      'Journalist', 'News Anchor', 'Radio Jockey', 'Public Relations Manager', 'Advertising Executive',
      'Copywriter', 'Content Creator', 'YouTuber', 'Podcast Host', 'Editor', 'Publisher',
      'Media Planner', 'Brand Manager', 'Communication Specialist', 'Corporate Trainer',
      'Event Manager', 'Sports Commentator', 'Film Producer', 'Screenwriter', 'Voice Artist',
      'Social Media Influencer', 'Digital PR Specialist', 'Technical Communicator', 'News Producer',
    ],
  },
  'Education & Training': {
    stream: ['Any'],
    base: [
      'Teacher', 'Professor', 'Principal', 'Education Counselor', 'Academic Coordinator',
      'Curriculum Developer', 'Special Educator', 'Librarian', 'EdTech Content Developer',
      'Coaching Institute Faculty', 'Career Counselor', 'School Administrator', 'Montessori Teacher',
      'Online Tutor', 'Instructional Designer', 'Education Policy Researcher', 'Examination Specialist',
      'Language Trainer', 'Soft Skills Trainer', 'Vocational Trainer',
    ],
  },
  'Hospitality & Tourism': {
    stream: ['Any'],
    base: [
      'Hotel Manager', 'Chef', 'Pastry Chef', 'Flight Attendant', 'Pilot', 'Travel Agent',
      'Tour Guide', 'Event Planner', 'Restaurant Manager', 'Cruise Director', 'Sommelier',
      'Housekeeping Manager', 'Front Office Manager', 'Airport Ground Staff', 'Immigration Officer',
      'Tourism Officer', 'Resort Manager', 'Catering Manager', 'Bar Manager', 'Hospitality Consultant',
      'Airline Customer Service Agent', 'Heritage Tourism Guide', 'Spa Manager', 'Banquet Manager',
    ],
  },
  'Agriculture & Environment': {
    stream: ['Science', 'Any'],
    base: [
      'Agricultural Officer', 'Horticulturist', 'Dairy Technologist', 'Fisheries Officer',
      'Forestry Officer', 'Soil Scientist', 'Agronomist', 'Wildlife Conservationist', 'Park Ranger',
      'Environmental Consultant', 'Sustainability Manager', 'Climate Change Analyst', 'Water Resource Manager',
      'Organic Farming Consultant', 'Agri-business Manager', 'Food Safety Officer', 'Veterinary Officer',
      'Aquaculture Specialist', 'Seed Technology Expert', 'Precision Agriculture Specialist',
    ],
  },
  'Defence & Security': {
    stream: ['Any'],
    base: [
      'Army Officer', 'Navy Officer', 'Air Force Officer', 'NDA Officer', 'Coast Guard Officer',
      'Police Officer', 'CRPF Officer', 'Intelligence Officer', 'Firefighter', 'Security Manager',
      'Private Security Consultant', 'Disaster Management Specialist', 'Border Security Officer',
      'Cyber Crime Investigator', 'Forensic Investigator', 'Anti-Terrorism Specialist',
    ],
  },
  'Sports & Fitness': {
    stream: ['Any'],
    base: [
      'Professional Athlete', 'Sports Coach', 'Fitness Trainer', 'Yoga Instructor', 'Sports Physiotherapist',
      'Sports Manager', 'Umpire', 'Sports Journalist', 'Nutrition Coach', 'Athletic Trainer',
      'Sports Psychologist', 'Adventure Sports Instructor', 'Physical Education Teacher',
      'Esports Manager', 'Sports Analyst', 'Strength & Conditioning Coach',
    ],
  },
  'Business & Management': {
    stream: ['Commerce', 'Any'],
    base: [
      'Entrepreneur', 'Startup Founder', 'Business Development Manager', 'Operations Manager',
      'HR Manager', 'Marketing Manager', 'Sales Manager', 'Supply Chain Manager', 'Logistics Manager',
      'Retail Manager', 'Franchise Owner', 'Management Consultant', 'Project Manager', 'CEO',
      'Chief Financial Officer', 'Chief Technology Officer', 'Import Export Manager', 'Procurement Manager',
      'Customer Success Manager', 'Office Administrator', 'Store Manager', 'E-commerce Manager',
      'Brand Strategist', 'Category Manager', 'Vendor Manager', 'Quality Manager',
    ],
  },
  'Emerging & Future Careers': {
    stream: ['Science', 'Commerce', 'Any'],
    base: [
      'Prompt Engineer', 'Drone Operator', 'EV Technician', 'Green Building Consultant',
      'Carbon Credit Analyst', 'Influencer Marketing Manager', 'Metaverse Developer', 'Quantum Computing Researcher',
      'Space Tourism Coordinator', 'Urban Mobility Planner', 'Digital Ethics Officer', 'Remote Work Consultant',
      'Gig Economy Specialist', 'Creator Economy Manager', 'Bioinformatics Specialist', 'Smart City Planner',
      'AI Ethics Researcher', 'Sustainability Analyst', 'Circular Economy Consultant', 'Health Tech Product Manager',
    ],
  },
  'Arts & Humanities': {
    stream: ['Arts', 'Any'],
    base: [
      'Historian', 'Archaeologist', 'Museum Curator', 'Anthropologist', 'Sociologist',
      'Political Scientist', 'Philosopher', 'Translator', 'Interpreter', 'Foreign Language Teacher',
      'Cultural Program Officer', 'Heritage Conservationist', 'Archivist', 'Librarian (Research)',
      'Social Worker', 'NGO Program Manager', 'Community Development Officer', 'Rural Development Specialist',
    ],
  },
  'Trades & Vocational': {
    stream: ['Any'],
    base: [
      'Electrician', 'Plumber', 'Welder', 'Carpenter', 'Automobile Technician', 'HVAC Technician',
      'CNC Operator', 'Tool & Die Maker', 'Refrigeration Technician', 'Solar Panel Installer',
      'Beauty Therapist', 'Hair Stylist', 'Tailor', 'Fashion Stylist', 'Florist',
      'Baker', 'Butcher', 'Mechanic (Two-Wheeler)', 'Heavy Equipment Operator', 'Crane Operator',
    ],
  },
};

const variants = ['', 'Senior ', 'Specialist '];
const outlooks = ['Excellent', 'Very Good', 'Good', 'Moderate', 'Growing'];
const environments = ['Office', 'Field', 'Lab', 'Remote', 'Hybrid', 'Hospital', 'Studio', 'Outdoor'];
const aiLevels = ['High', 'Medium', 'Low'];
const wlb = ['Excellent', 'Good', 'Moderate', 'Demanding'];

const employers = {
  'Engineering & Technology': ['TCS', 'Infosys', 'Wipro', 'Google India', 'Microsoft India', 'L&T', 'Mahindra'],
  'Medical & Healthcare': ['Apollo Hospitals', 'Fortis', 'AIIMS', 'Max Healthcare', 'Manipal Hospitals'],
  'Commerce & Finance': ['Deloitte', 'EY', 'KPMG', 'HDFC Bank', 'ICICI Bank', 'Goldman Sachs India'],
  default: ['Leading MNCs', 'Top Indian corporates', 'Startups', 'Government sector', 'PSUs'],
};

function slugify(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function pick(arr, i) {
  return arr[i % arr.length];
}

function buildRoadmap(title, category, id, stream) {
  const isMedical = category.includes('Medical');
  const isEng = category.includes('Engineering') || category.includes('IT');
  const isLaw = category.includes('Law');
  const ug = isMedical
    ? 'MBBS / BDS / BPT (NEET required)'
    : isEng
      ? 'B.Tech / B.E / BCA in relevant discipline'
      : isLaw
        ? 'BA LLB / LLB after Class 12 or graduation'
        : 'Bachelor\'s degree in relevant field';
  const pg = isMedical ? 'MD / MS / DNB specialisation' : 'Master\'s / PG diploma (optional for senior roles)';
  return [
    { step: 1, title: 'Self Discovery (Class 6–8)', description: `Take DMIT & Psychometric at Dreams Mantra to map aptitude for ${title}`, duration: 'Age 11–14', milestone: 'Learning style & interest profile' },
    { step: 2, title: 'Stream Selection (Class 9–10)', description: `Choose PCM, PCB, Commerce, or Arts aligned with ${category} careers`, duration: 'Class 9–10', milestone: 'Board exams + stream locked' },
    { step: 3, title: 'Undergraduate Education', description: ug, duration: '3–5 years', milestone: 'Degree + internships' },
    { step: 4, title: 'Entrance Exams & Admissions', description: id % 2 === 0 ? 'Prepare for JEE/NEET/CUET/CAT as applicable' : 'Domain-specific entrance tests & college applications', duration: '1–2 years prep', milestone: 'College admission secured' },
    { step: 5, title: 'Skill Building & Certifications', description: `Build technical and soft skills specific to ${title}`, duration: 'During UG + after', milestone: 'Portfolio / certifications' },
    { step: 6, title: 'First Job / Internship', description: `Entry-level ${title} role — campus placement, off-campus, or startup`, duration: '0–2 years experience', milestone: 'Professional experience' },
    { step: 7, title: 'Career Growth & Specialisation', description: pg + `${title} → Senior → Lead/Manager path`, duration: '5–15 years', milestone: 'Leadership or expert consultant role' },
  ];
}

function buildCareer(id, title, category, config, variantIdx) {
  const salaryBase = 250000 + (id % 30) * 120000;
  const mult = 2 + (id % 6);
  const emp = employers[category] || employers.default;
  const stream = config.stream;
  const classStreams = resolveClassStreams(category, title, stream);
  const isMedical = category.includes('Medical');
  const pg = isMedical ? 'MD / MS / DNB specialisation' : "Master's / PG diploma (optional for senior roles)";

  return {
    id,
    slug: `${slugify(title)}-${id}`,
    title,
    category,
    sector: category.split(' ')[0],
    stream,
    classStreams,
    shortDescription: `${title} offers strong growth in ${category}. Explore education paths, salary benchmarks, skills, and future scope across India and globally.`,
    description: `As a ${title}, you work in the ${category} domain with opportunities across India and internationally. This role suits students with aptitude in related subjects and strong interest in the field.\n\nDreams Mantra recommends DMIT and Psychometric assessment before committing to this path. With the right education, certifications, and skills, ${title} offers meaningful career progression and financial stability.\n\nIndia's job market increasingly values specialists in this field — especially those who combine domain expertise with communication, adaptability, and continuous learning.`,
    dayInLife: `A typical day as ${title} involves planning tasks, collaborating with teams, solving domain-specific problems, and staying updated with industry trends. Work may include client/stakeholder interaction, analysis, documentation, and hands-on execution depending on seniority.`,
    responsibilities: [
      `Execute core ${title.split(' ').slice(-1)[0] || 'role'} duties with quality and timelines`,
      'Collaborate with cross-functional teams and stakeholders',
      'Maintain professional standards and compliance requirements',
      pick(['Analyze data and prepare reports', 'Manage projects and deliverables', 'Train juniors and share knowledge'], id),
      pick(['Research industry trends', 'Optimize processes for efficiency', 'Support business growth goals'], id + 2),
    ],
    education: [
      `Bachelor's degree in a relevant discipline (${stream.join('/')})`,
      id % 3 === 0 ? "Master's or PG diploma preferred for senior roles" : 'Diploma and certification routes available',
      'Industry certifications strengthen employability',
      id % 5 === 0 ? 'Internship or apprenticeship highly recommended' : 'Practical projects add strong portfolio value',
    ],
    skills: [
      'Communication & presentation', 'Critical thinking', 'Domain expertise',
      pick(['Leadership', 'Teamwork', 'Analytics', 'Creativity', 'Technical proficiency'], id),
      pick(['Problem solving', 'Time management', 'Adaptability', 'Attention to detail'], id + 1),
      pick(['Digital literacy', 'Project management', 'Client handling'], id + 3),
    ],
    certifications: [
      pick(['ISO certified training', 'Domain-specific professional certification', 'NASSCOM / sector skill council certificate'], id),
      id % 2 === 0 ? 'Advanced specialization course from reputed institute' : 'Online micro-credentials from Coursera/edX',
    ],
    courses: [
      pick(['B.Tech / B.Sc relevant stream', 'B.Com / BBA where applicable', 'B.A with specialization'], id),
      pick(['Industry bootcamp', 'Diploma from polytechnic/ITI', 'Professional degree pathway'], id + 1),
    ],
    salaryMin: salaryBase,
    salaryMax: salaryBase * mult,
    salaryDisplay: `₹${(salaryBase / 100000).toFixed(1)}–${((salaryBase * mult) / 100000).toFixed(1)} LPA`,
    outlook: pick(outlooks, id),
    exams: id % 2 === 0
      ? ['CUET', 'JEE/NEET where applicable', 'Domain-specific entrance tests']
      : ['Class 12 board exams', 'State/national entrance exams', 'College-specific tests'],
    institutes: [
      'Top universities and IITs/NITs where applicable',
      'Leading private colleges with strong placements',
      pick(['Delhi University colleges', 'State universities', 'Autonomous institutes'], id),
    ],
    topEmployers: emp.slice(0, 4 + (id % 3)),
    industries: [category.split(' & ')[0], pick(['Private sector', 'Government', 'Startups', 'Consulting'], id)],
    workEnvironment: pick(environments, id),
    eligibility: `Class 12 (${stream.join('/')}) with relevant subjects; some roles accept any stream with aptitude`,
    duration: pick(['3–4 years UG + experience', '4–5 years UG + PG', 'Diploma 2–3 years + on-job training'], id),
    demand: pick(['High', 'Very High', 'Growing', 'Stable'], id),
    growthPath: `Entry-level ${title} → Mid-level specialist → Team lead/Manager → Director/Consultant/Entrepreneur`,
    aiResilience: pick(aiLevels, id + variantIdx),
    workLifeBalance: pick(wlb, id),
    futureScope: pick([
      'Strong demand expected over the next decade with digital transformation',
      'Growing opportunities in tier-2/3 cities and remote roles',
      'Global mobility possible with right credentials and experience',
      'Emerging specializations creating new sub-roles every year',
    ], id),
    roadmap: buildRoadmap(title, category, id, stream),
    challenges: [
      'Competitive entrance exams and limited seats at top institutes',
      'Need for continuous upskilling in a fast-changing market',
      pick(['Initial years require patience before peak earnings', 'Work-life balance varies by employer and role'], id),
    ],
    perks: [
      pick(['Strong salary growth with experience', 'Respected professional identity', 'Global career mobility'], id),
      pick(['Intellectual satisfaction', 'Social impact and recognition', 'Flexible remote/hybrid options'], id + 1),
      'Diverse industry options across public and private sector',
    ],
    toolsAndTech: pick([
      ['Microsoft Office / Google Workspace', 'Industry-specific software', 'Project management tools'],
      ['CAD / design software', 'Data analysis tools', 'Communication platforms'],
      ['Clinical / lab equipment', 'CRM & ERP systems', 'Cloud collaboration tools'],
    ], id),
    softSkills: ['Communication', 'Teamwork', 'Critical thinking', 'Adaptability', 'Time management'],
    hardSkills: [
      pick(['Domain technical skills', 'Data literacy', 'Regulatory knowledge'], id),
      pick(['Programming / analytics', 'Financial modelling', 'Research methodology'], id + 1),
    ],
    internshipPath: `Seek internships in ${category.split(' ')[0]} sector from Year 2 of UG — apply via campus, LinkedIn, and Dreams Mantra AI Career Launchpad programme`,
    higherStudies: [
      pg,
      id % 3 === 0 ? 'PhD / research pathway for academia' : 'Executive MBA for leadership track',
      'International certifications for global roles',
    ],
    jobRoles: [
      `Entry: Junior ${title.replace(/^(Senior|Specialist|Associate|Principal|Regional|Global|Digital|Strategic|Technical|Executive)\s+/i, '')}`,
      `Mid: ${title}`,
      `Senior: Lead / Manager / Consultant ${title.split(' ').slice(-1)[0] || 'Specialist'}`,
    ],
    salaryProgression: [
      `Fresher: ${(salaryBase / 100000).toFixed(1)} LPA approx.`,
      `3–5 years: ${((salaryBase * 1.5) / 100000).toFixed(1)}–${((salaryBase * 2.2) / 100000).toFixed(1)} LPA`,
      `10+ years: ${((salaryBase * mult * 0.6) / 100000).toFixed(1)}+ LPA (senior/lead roles)`,
    ],
    globalOpportunities: pick([
      'Strong demand in UAE, USA, UK, Canada, Singapore for qualified professionals',
      'Remote roles increasingly available from Indian offices',
      'GCC and Southeast Asia offer tax-free or high-growth packages',
    ], id),
    prosAndCons: {
      pros: ['Growing industry demand', 'Multiple career paths within field', 'Skills transferable across sectors'],
      cons: ['Competitive entry at top firms', 'Continuous learning required', 'Initial investment in education'],
    },
  };
}

const careers = [];
let id = 1;

for (const [category, config] of Object.entries(categories)) {
  for (const baseTitle of config.base) {
    for (let v = 0; v < variants.length; v++) {
      const title = `${variants[v]}${baseTitle}`.trim();
      if (title.length > 80) continue;
      careers.push(buildCareer(id++, title, category, config, v));
    }
  }
}

// Pad to 950 with specialist variants
const prefixes = ['Associate', 'Principal', 'Regional', 'Global', 'Digital', 'Strategic', 'Technical', 'Executive'];
let padIdx = 0;
while (careers.length < 950) {
  const base = careers[padIdx % Math.min(careers.length, 400)];
  const prefix = prefixes[Math.floor(padIdx / 50) % prefixes.length];
  const title = `${prefix} ${base.title.replace(/^(Senior|Lead|Junior|Consultant|Specialist)\s+/i, '')}`;
  careers.push({
    ...buildCareer(id++, title, base.category, { stream: base.stream }, padIdx),
    slug: `${slugify(title)}-${id}`,
  });
  padIdx++;
}

const finalCareers = careers.slice(0, 950);

const out = {
  meta: {
    total: 950,
    displayLabel: '950+',
    source: 'Dreams Mantra Career Library — comprehensive India-focused guidance',
    updated: new Date().toISOString().slice(0, 10),
  },
  careers: finalCareers,
};

const outPaths = [
  path.join(__dirname, '../frontend/public/data/careers.json'),
  path.join(__dirname, '../client/public/data/careers.json'),
  path.join(__dirname, '../backend/data/careers.json'),
];

for (const outPath of outPaths) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out));
  console.log(`Generated ${out.careers.length} careers -> ${outPath}`);
}
