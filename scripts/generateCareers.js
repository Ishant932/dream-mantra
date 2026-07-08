/**
 * Generates 1000+ unique career pathways with rich detail (no Senior/Specialist duplicates).
 * Run: node scripts/generateCareers.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllCareerEntries } from './careerTitleBank.js';
import {
  roleDayInLife,
  roleResponsibilities,
  roleHardSkills,
  roleTools,
  roleCertifications,
  roleInternshipPath,
} from './careerRoleSnippets.js';

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

const outlooks = ['Excellent', 'Very Good', 'Good', 'Moderate', 'Growing'];
const environments = ['Office', 'Field', 'Lab', 'Remote', 'Hybrid', 'Hospital', 'Studio', 'Outdoor'];
const aiLevels = ['High', 'Medium', 'Low'];
const wlb = ['Excellent', 'Good', 'Moderate', 'Demanding'];

const employers = {
  'Engineering & Technology': ['TCS', 'Infosys', 'Wipro', 'L&T', 'Mahindra', 'Google India', 'Microsoft India'],
  'Medical & Healthcare': ['AIIMS', 'Apollo Hospitals', 'Fortis', 'Max Healthcare', 'Manipal Hospitals', 'Medanta'],
  'Commerce & Finance': ['Deloitte India', 'EY India', 'KPMG', 'HDFC Bank', 'ICICI Bank', 'SBI', 'Razorpay'],
  'IT & Digital': ['TCS', 'Infosys', 'Wipro', 'HCL', 'Flipkart', 'Zomato', 'Freshworks'],
  'Law & Public Service': ['District Courts', 'High Courts', 'UPSC cadre', 'State PSC', 'Corporate law firms'],
  default: ['Leading Indian MNCs', 'PSUs', 'Startups', 'Government departments', 'Top private firms'],
};

const INDIAN_SALARY_BANDS = {
  'Engineering & Technology': { base: 450000, step: 90000, multMin: 3, multMax: 16 },
  'Medical & Healthcare': { base: 600000, step: 120000, multMin: 2.5, multMax: 12 },
  'Commerce & Finance': { base: 350000, step: 70000, multMin: 2.5, multMax: 10 },
  'IT & Digital': { base: 500000, step: 100000, multMin: 3, multMax: 18 },
  'Science & Research': { base: 400000, step: 80000, multMin: 2.5, multMax: 9 },
  'Arts & Humanities': { base: 280000, step: 55000, multMin: 2, multMax: 8 },
  'Design & Creative': { base: 320000, step: 65000, multMin: 2.5, multMax: 9 },
  'Law & Public Service': { base: 380000, step: 75000, multMin: 2.5, multMax: 10 },
  'Defence & Security': { base: 420000, step: 85000, multMin: 2, multMax: 7 },
  'Education & Training': { base: 300000, step: 60000, multMin: 2, multMax: 7 },
  'Hospitality & Tourism': { base: 250000, step: 50000, multMin: 2, multMax: 6 },
  'Agriculture & Environment': { base: 320000, step: 65000, multMin: 2, multMax: 8 },
  'Sports & Fitness': { base: 280000, step: 55000, multMin: 2, multMax: 7 },
  'Trades & Vocational': { base: 220000, step: 45000, multMin: 2, multMax: 6 },
  'Business & Management': { base: 450000, step: 90000, multMin: 3, multMax: 12 },
  'Media & Communication': { base: 300000, step: 60000, multMin: 2, multMax: 8 },
  'Emerging & Future Careers': { base: 480000, step: 95000, multMin: 3, multMax: 14 },
};

const CATEGORY_EXAMS = {
  'Engineering & Technology': ['JEE Main', 'JEE Advanced', 'BITSAT', 'State CET', 'CUET (UG)'],
  'Medical & Healthcare': ['NEET UG', 'NEET PG', 'INI CET', 'State medical entrance'],
  'Commerce & Finance': ['CUET', 'CA Foundation', 'CS Executive', 'CMA Foundation', 'IPMAT'],
  'IT & Digital': ['JEE Main', 'CUET', 'NIMCET', 'State BCA entrance'],
  'Law & Public Service': ['CLAT', 'AILET', 'UPSC CSE', 'State PSC', 'Judiciary exams'],
  'Defence & Security': ['NDA', 'CDS', 'AFCAT', 'SSC CGL', 'State police recruitment'],
  'Education & Training': ['CUET', 'B.Ed entrance', 'CTET', 'State TET'],
  default: ['Class 12 board exams', 'CUET', 'State entrance tests', 'University-specific tests'],
};

const CATEGORY_INSTITUTES = {
  'Engineering & Technology': ['IITs', 'NITs', 'IIITs', 'GFTIs', 'State engineering colleges'],
  'Medical & Healthcare': ['AIIMS', 'JIPMER', 'Government medical colleges', 'Private medical colleges (NEET)'],
  'Commerce & Finance': ['SRCC (Delhi University)', 'Christ University', 'NMIMS', 'Symbiosis', 'Local commerce colleges'],
  'IT & Digital': ['NITs', 'IIITs', 'BCA/MCA colleges', 'Coding bootcamps (Masai, Scaler)'],
  default: ['Central universities', 'State universities', 'Autonomous colleges', 'NAAC-accredited institutes'],
};

function detectRoleTier(title, variantIdx) {
  const t = String(title || '').trim();
  if (/^senior\s/i.test(t)) return 'senior';
  if (/^specialist\s/i.test(t)) return 'specialist';
  if (/^(principal|executive|global|strategic|regional)\s/i.test(t)) return 'senior';
  if (/^(technical|digital)\s/i.test(t)) return 'specialist';
  if (variantIdx === 1) return 'senior';
  if (variantIdx === 2) return 'specialist';
  return 'entry';
}

function baseRoleTitle(title) {
  return String(title || '')
    .trim()
    .replace(/^(senior|specialist|associate|principal|regional|global|digital|strategic|technical|executive)\s+/i, '')
    .trim();
}

function indianSalary(category, id, tier = 'entry') {
  const band = INDIAN_SALARY_BANDS[category] || { base: 300000, step: 60000, multMin: 2, multMax: 8 };
  let salaryMin = band.base + (id % 12) * band.step;
  let mult = band.multMin + (id % Math.ceil(band.multMax - band.multMin));
  if (tier === 'senior') {
    salaryMin = Math.round(salaryMin * 2.1 + 180000);
    mult = Math.min(band.multMax + 4, mult + 2.5);
  } else if (tier === 'specialist') {
    salaryMin = Math.round(salaryMin * 1.55 + 120000);
    mult = Math.min(band.multMax + 3, mult + 1.8);
  }
  const salaryMax = Math.round(salaryMin * mult);
  return {
    salaryMin,
    salaryMax,
    salaryDisplay: `₹${(salaryMin / 100000).toFixed(1)}–${(salaryMax / 100000).toFixed(1)} LPA (India)`,
  };
}

function categoryExams(category, id) {
  const list = CATEGORY_EXAMS[category] || CATEGORY_EXAMS.default;
  return list.slice(0, 3 + (id % 2));
}

function categoryInstitutes(category, id) {
  const list = CATEGORY_INSTITUTES[category] || CATEGORY_INSTITUTES.default;
  return list.slice(0, 3 + (id % 2));
}

function slugify(t) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function pick(arr, i) {
  return arr[i % arr.length];
}

function categoryEducation(category, title, stream, id) {
  const t = title.toLowerCase();
  if (category === 'Medical & Healthcare') {
    if (/doctor|mbbs|surgeon/.test(t)) return ['Class 12 PCB with NEET UG', 'MBBS (5.5 years incl. internship)', 'NEET PG for MD/MS specialisation'];
    if (/dentist/.test(t)) return ['Class 12 PCB with NEET UG', 'BDS (5 years)', 'MDS for specialisation'];
    if (/nurse/.test(t)) return ['Class 12 PCB/PCMB', 'B.Sc Nursing / GNM', 'M.Sc Nursing / staff nurse recruitment'];
    if (/pharm/.test(t)) return ['Class 12 PCB/PCM', 'B.Pharm / D.Pharm', 'M.Pharm / drug inspector exams'];
    if (/physio|occupational|speech/.test(t)) return ['Class 12 PCB', 'BPT / BOT / BSLP', 'MPT / clinical practice licence'];
    if (/ayurved|homeopath/.test(t)) return ['Class 12 PCB with NEET', 'BAMS / BHMS', 'MD Ayurveda / Homeopathy'];
    return ['Class 12 PCB (NEET where applicable)', 'Relevant UG (MBBS/BDS/BPT/B.Pharm/B.Sc Nursing)', 'PG / registration with council'];
  }
  if (category === 'Engineering & Technology' || category === 'IT & Digital') {
    if (/software|developer|full stack|mobile app/.test(t)) return ['Class 12 PCM / CS in school', 'B.Tech CSE / BCA / B.Sc CS', 'Internships + system design / cloud certs'];
    if (/data sc|machine learning|ai engineer/.test(t)) return ['Class 12 PCM + Maths', 'B.Tech / B.Sc Statistics / Maths', 'M.Tech / PG diploma in ML-AI'];
    if (/civil|structural|geotechnical/.test(t)) return ['Class 12 PCM', 'B.Tech Civil Engineering', 'GATE / M.Tech / site experience'];
    return ['Class 12 PCM', 'B.Tech / B.E in relevant branch', 'GATE / M.Tech or industry certifications'];
  }
  if (category === 'Commerce & Finance') {
    if (/chartered account/.test(t)) return ['Class 12 Commerce (Maths helpful)', 'CA Foundation → Intermediate → Final', 'Articleship + ICAI membership'];
    if (/company secretary/.test(t)) return ['Class 12 any stream', 'CS Executive → Professional', 'ICSI membership'];
    return ['Class 12 Commerce / Maths', 'B.Com / BBA / professional course', 'MBA / CA / CFA as applicable'];
  }
  if (category === 'Law & Public Service') {
    if (/ias|ips|ifs|irs|civil services/.test(t)) return ['Bachelor\'s degree (any discipline)', 'UPSC CSE prelims → mains → interview', 'Foundation course at LBSNAA after selection'];
    if (/lawyer|legal|advocate/.test(t)) return ['Class 12 any stream', 'BA LLB / LLB (CLAT/AILET)', 'Bar Council enrolment + practice'];
    return ['Class 12 any stream', 'Relevant UG + competitive exam prep', 'State / central recruitment or PG'];
  }
  if (category === 'Defence & Security') {
    return ['Class 12 (PCM for NDA/AFCAT technical)', 'NDA / CDS / AFCAT / SSC selection', 'Training at academy + commission'];
  }
  if (category === 'Design & Creative') {
    return ['Class 12 any stream', 'B.Des / BFA / diploma from NID/NIFT/PEARL', 'Portfolio + industry internship'];
  }
  if (category === 'Trades & Vocational') {
    if (/^iti -/i.test(t)) {
      return ['Class 10 pass (stream/trade dependent)', 'ITI 6 months–2 years (NCVT/SCVT recognised institute)', 'Apprenticeship + ITI entrance / skill assessment'];
    }
    if (/^certificate in/i.test(t)) {
      return ['Class 8–12 depending on course', '3–12 month certificate from ITI / NSDC / private skill centre', 'Skill India / sector skill council assessment'];
    }
    if (/^bachelor of vocation/i.test(t)) {
      return ['Class 12 any stream', '3-year B.Voc (UGC recognised university)', 'Internship + NSQF-aligned skill certification'];
    }
    return ['Class 8–12 (varies by trade)', 'ITI / NSQF diploma / apprenticeship', 'Skill India certification + on-job experience'];
  }
  if (/^diploma in/i.test(t)) {
    return ['Class 10 (PCM/PCB/Commerce as per trade)', '2–3 year polytechnic / recognised diploma', 'Lateral entry to B.Tech / industry placement'];
  }
  if (/^b\.tech/i.test(t) || /^b\.e\./i.test(t)) {
    return ['Class 12 PCM', '4-year B.Tech / B.E. (AICTE recognised)', 'GATE / campus placement / M.Tech optional'];
  }
  if (/^b\.sc/i.test(t)) {
    return ['Class 12 PCM or PCB as per subject', '3-year B.Sc', 'M.Sc / research / industry roles'];
  }
  if (/^certificate in/i.test(t)) {
    return ['Class 10–12 (course dependent)', 'Short-term certificate (3–12 months)', 'Practical assessment + placement support'];
  }
  return [
    `Class 12 (${stream.join('/')}) with relevant subjects`,
    id % 3 === 0 ? "Master's or PG diploma for senior roles" : 'Bachelor\'s / diploma in relevant field',
    'Industry certifications and internships in India',
  ];
}

function buildRoadmap(title, category, id, stream, tier = 'entry') {
  const base = baseRoleTitle(title);
  const isMedical = category.includes('Medical');
  const isEng = category.includes('Engineering') || category.includes('IT');
  const isLaw = category.includes('Law');
  const isResearch = category.includes('Science') || category.includes('Research');
  const ug = isMedical
    ? 'MBBS / BDS / BPT (NEET required)'
    : isEng
      ? 'B.Tech / B.E / BCA in relevant discipline'
      : isLaw
        ? 'BA LLB / LLB after Class 12 or graduation'
        : 'Bachelor\'s degree in relevant field';
  const pg = isMedical ? 'MD / MS / DNB specialisation' : isResearch ? 'M.Sc / Ph.D in domain specialisation' : 'Master\'s / PG diploma';

  if (tier === 'senior') {
    return [
      { step: 1, title: 'Strong Academic Foundation', description: `Completed ${ug} plus ${pg} or equivalent experience for ${base} careers`, duration: 'Already completed', milestone: 'Recognised degree + 5+ years track record' },
      { step: 2, title: 'Mid-Career Experience (5–8 years)', description: `Led projects, mentored juniors, and delivered measurable outcomes as ${base}`, duration: '5–8 years', milestone: 'Independent ownership of key deliverables' },
      { step: 3, title: 'Leadership & People Management', description: `Manage teams, budgets, and cross-functional stakeholders as Senior ${base}`, duration: '2–4 years in lead role', milestone: 'Team lead / manager title' },
      { step: 4, title: 'Advanced Credentials', description: id % 2 === 0 ? 'Executive education, PMP, or domain fellowships' : 'Published work, patents, or senior professional certifications', duration: '1–2 years parallel', milestone: 'Senior expert recognition' },
      { step: 5, title: 'Strategic Ownership', description: `Own business unit goals, P&L awareness, and long-range planning for ${category.split(' ')[0]} initiatives`, duration: 'Ongoing', milestone: 'Department / practice head responsibilities' },
      { step: 6, title: 'Industry Influence', description: 'Speak at conferences, guide policy, or represent organisation with clients and partners', duration: '3–5 years', milestone: 'External visibility as senior leader' },
      { step: 7, title: 'Director / Principal Path', description: `Senior ${base} → Director, VP, Principal Consultant, or practice head`, duration: '10–20 years total', milestone: 'C-suite or principal leadership role' },
    ];
  }

  if (tier === 'specialist') {
    return [
      { step: 1, title: 'Deep Domain Education', description: `${pg} or advanced diploma focused on a narrow ${base} specialisation`, duration: '2–6 years post-UG', milestone: 'Specialist academic credentials' },
      { step: 2, title: 'Niche Skill Mastery', description: `Master tools, methods, and standards specific to Specialist ${base} work`, duration: '2–4 years', milestone: 'Portfolio of specialist projects' },
      { step: 3, title: 'Certifications & Research', description: isResearch ? 'Lab techniques, peer-reviewed papers, or grant-funded research' : 'Vendor / industry certifications in sub-domain', duration: '1–3 years', milestone: 'Recognised specialist credentials' },
      { step: 4, title: 'Consulting & Advisory Roles', description: `Advise multiple teams or clients as subject-matter expert in ${base}`, duration: '3–5 years', milestone: 'Trusted go-to expert internally' },
      { step: 5, title: 'Complex Problem Solving', description: 'Handle high-stakes, ambiguous challenges others escalate to you', duration: 'Ongoing', milestone: 'Critical-path specialist assignments' },
      { step: 6, title: 'Thought Leadership', description: 'Train others, author guides, or lead standards committees in your niche', duration: '2–4 years', milestone: 'Industry recognition in specialisation' },
      { step: 7, title: 'Principal Specialist / Fellow', description: `Specialist ${base} → Principal Scientist, Fellow, or chief specialist architect`, duration: '8–15 years', milestone: 'Top-tier expert consultant role' },
    ];
  }

  return [
    { step: 1, title: 'Self Discovery (Class 6–8)', description: `Take DMIT & Psychometric at Dreams Mantra to map aptitude for ${base}`, duration: 'Age 11–14', milestone: 'Learning style & interest profile' },
    { step: 2, title: 'Stream Selection (Class 9–10)', description: `Choose PCM, PCB, Commerce, or Arts aligned with ${category} careers`, duration: 'Class 9–10', milestone: 'Board exams + stream locked' },
    { step: 3, title: 'Undergraduate Education', description: ug, duration: '3–5 years', milestone: 'Degree + internships' },
    { step: 4, title: 'Entrance Exams & Admissions', description: id % 2 === 0 ? 'Prepare for JEE/NEET/CUET/CAT as applicable' : 'Domain-specific entrance tests & college applications', duration: '1–2 years prep', milestone: 'College admission secured' },
    { step: 5, title: 'Skill Building & Certifications', description: `Build technical and soft skills specific to ${base}`, duration: 'During UG + after', milestone: 'Portfolio / certifications' },
    { step: 6, title: 'First Job / Internship', description: `Entry-level ${base} role — campus placement, off-campus, or startup`, duration: '0–2 years experience', milestone: 'First professional role secured' },
    { step: 7, title: 'Career Growth & Specialisation', description: `${pg} optional — grow toward Senior ${base} or Specialist ${base} tracks`, duration: '5–12 years', milestone: 'Mid-level professional with clear specialisation' },
  ];
}

function isResearchCategory(category) {
  return String(category || '').includes('Science') || String(category || '').includes('Research');
}

function buildCareer(id, title, category, config, variantIdx) {
  const tier = detectRoleTier(title, variantIdx);
  const base = baseRoleTitle(title);
  const { salaryMin, salaryMax, salaryDisplay } = indianSalary(category, id, tier);
  const emp = employers[category] || employers.default;
  const stream = config.stream;
  const classStreams = resolveClassStreams(category, title, stream);
  const exams = categoryExams(category, id);
  const institutes = categoryInstitutes(category, id);

  const shortDescription = tier === 'senior'
    ? `Senior ${base} is a leadership-track role in India — typically 6–12 years of experience, team ownership, and significantly higher pay than entry-level ${base} positions.`
    : tier === 'specialist'
      ? `Specialist ${base} is a deep-expert track in India — niche skills, advanced credentials, and advisory roles with premium compensation in ${category.toLowerCase()}.`
      : `${title} is a recognised career path in India for students from ${classStreams.filter((s) => s !== 'Vocational').join(', ') || 'relevant'} streams — with clear UG/PG routes, entrance exams, and growing demand across metros and tier-2 cities.`;

  const description = tier === 'senior'
    ? `Senior ${base} professionals in India usually have 6–12+ years of experience after their UG/PG, with proven delivery on complex projects and people-management exposure.\n\nThey are hired by ${emp.slice(0, 3).join(', ')} and similar employers for lead, manager, or principal roles. Compensation is typically 2–3× entry-level ${base} salaries.\n\nDream Mantra recommends Skill Mapping + career counselling to plan the leap from mid-level ${base} to senior leadership.`
    : tier === 'specialist'
      ? `Specialist ${base} professionals are narrow-domain experts — often with M.Sc/Ph.D, advanced certifications, or 5–10 years of focused practice in one sub-field.\n\nIndian employers in ${category.toLowerCase()} hire specialists for R&D, consulting, compliance, and high-stakes technical decisions. Pay can match or exceed general senior roles in the same field.\n\nDream Mantra helps students identify whether the specialist or senior leadership track fits their aptitude and interests.`
      : `${title} professionals in India typically enter through board exams and competitive entrances (where applicable), followed by a domain degree from a recognised Indian university or institute.\n\nIn the Indian job market, ${title} roles are hired by ${emp.slice(0, 3).join(', ')} and similar employers. Freshers often start through campus placements, off-campus drives, or government recruitment.\n\nDream Mantra recommends Mind Mapping + Skill Mapping before finalising this path — to match aptitude, learning style, and family expectations with realistic Indian salary bands and exam timelines.`;

  const dayInLife = roleDayInLife(title, category, tier);

  const growthPath = tier === 'senior'
    ? `${base} (3–5 yrs) → Senior ${base} (6–10 yrs) → Lead / Manager → Director / VP / Practice Head`
    : tier === 'specialist'
      ? `${base} (2–4 yrs) → Specialist ${base} (5–8 yrs) → Principal Specialist / Fellow → Chief Architect / Head of R&D`
      : `Entry-level ${base} → Mid-level ${base} → Senior ${base} or Specialist ${base} → Director / Consultant`;

  const eligibility = tier === 'senior'
    ? `Bachelor's + typically 6–12 years relevant experience; Master's preferred for research-heavy ${category.toLowerCase()} roles`
    : tier === 'specialist'
      ? `UG + PG/advanced certification in sub-domain; 4–8 years focused practice or research credentials`
      : `Class 12 (${stream.join('/')}) with relevant subjects; some roles accept any stream with aptitude`;

  const duration = tier === 'senior'
    ? '6–12+ years total experience (post-education)'
    : tier === 'specialist'
      ? '4–10 years to establish specialist credibility'
      : pick(['3–4 years UG + experience', '4–5 years UG + PG', 'Diploma 2–3 years + on-job training'], id);

  const demand = tier === 'senior'
    ? pick(['High', 'Stable', 'Growing'], id + 1)
    : tier === 'specialist'
      ? pick(['High', 'Very High', 'Growing'], id + 2)
      : pick(['High', 'Very High', 'Growing', 'Stable'], id);

  const workLifeBalance = tier === 'senior'
    ? pick(['Moderate', 'Demanding'], id)
    : tier === 'specialist'
      ? pick(['Good', 'Moderate'], id + 1)
      : pick(wlb, id);

  return {
    id,
    slug: `${slugify(title)}-${id}`,
    title,
    careerTier: tier,
    category,
    sector: category.split(' ')[0],
    stream,
    classStreams,
    shortDescription,
    description,
    dayInLife,
    responsibilities: roleResponsibilities(title, category, tier, id),
    education: categoryEducation(category, title, stream, id),
    skills: [
      ...roleHardSkills(title, category).slice(0, 4),
      pick(['Leadership', 'Teamwork', 'Analytics', 'Creativity', 'Problem solving'], id),
      pick(['Time management', 'Adaptability', 'Attention to detail', 'Client handling'], id + 1),
    ],
    certifications: roleCertifications(title, category, id),
    courses: [
      pick(['B.Tech / B.Sc relevant stream', 'B.Com / BBA where applicable', 'B.A with specialization'], id),
      pick(['Industry bootcamp', 'Diploma from polytechnic/ITI', 'Professional degree pathway'], id + 1),
    ],
    salaryMin,
    salaryMax,
    salaryDisplay,
    outlook: pick(outlooks, id),
    exams,
    institutes,
    topEmployers: emp.slice(0, 4 + (id % 3)),
    industries: [category.split(' & ')[0], pick(['Private sector', 'Government', 'Startups', 'Consulting'], id)],
    workEnvironment: pick(environments, id + (tier === 'senior' ? 0 : tier === 'specialist' ? 2 : 1)),
    eligibility,
    duration,
    demand,
    growthPath,
    aiResilience: tier === 'senior' ? pick(['Medium', 'Low'], id) : tier === 'specialist' ? pick(['Low', 'Medium'], id) : pick(aiLevels, id + variantIdx),
    workLifeBalance,
    futureScope: pick([
      'Strong demand expected over the next decade with digital transformation',
      'Growing opportunities in tier-2/3 cities and remote roles',
      'Global mobility possible with right credentials and experience',
      'Emerging specializations creating new sub-roles every year',
    ], id),
    roadmap: buildRoadmap(title, category, id, stream, tier),
    challenges: tier === 'senior'
      ? [
          'Balancing people management with staying technically credible',
          'Higher accountability for team failures and business outcomes',
          pick(['Longer hours during deadlines and organisational change', 'Politics and stakeholder alignment at senior levels'], id),
        ]
      : tier === 'specialist'
        ? [
            'Risk of over-specialising in a niche that may shrink',
            'Fewer promotion paths unless you move into leadership or consulting',
            pick(['Pressure to stay current in a fast-evolving sub-field', 'Limited roles outside metro hubs for some specialisations'], id),
          ]
        : [
          'Competitive entrance exams and limited seats at top institutes',
          'Need for continuous upskilling in a fast-changing market',
          pick(['Initial years require patience before peak earnings', 'Work-life balance varies by employer and role'], id),
        ],
    perks: tier === 'senior'
      ? [
          'Significantly higher compensation and bonus potential',
          'Authority to shape team culture and hiring',
          pick(['Executive education and leadership programmes', 'Equity or profit-sharing at growth companies', 'Industry recognition as a leader'], id),
        ]
      : tier === 'specialist'
        ? [
            'Premium pay for rare, high-demand expertise',
            'Respected as the go-to expert in your organisation',
            pick(['Flexible consulting and advisory opportunities', 'Conference speaking and publication credits', 'Strong job security in regulated or R&D roles'], id),
          ]
        : [
          pick(['Strong salary growth with experience', 'Respected professional identity', 'Global career mobility'], id),
          pick(['Intellectual satisfaction', 'Social impact and recognition', 'Flexible remote/hybrid options'], id + 1),
          'Diverse industry options across public and private sector',
        ],
    toolsAndTech: roleTools(title, category),
    softSkills: ['Communication', 'Teamwork', 'Critical thinking', 'Adaptability', 'Time management'],
    hardSkills: roleHardSkills(title, category),
    internshipPath: roleInternshipPath(title, category, tier) || (tier === 'entry'
      ? `Seek internships in ${category.split(' ')[0]} sector from Year 2 of UG — apply via campus, LinkedIn, and Dreams Mantra AI Career Launchpad programme`
      : tier === 'senior'
        ? `Senior roles are reached through internal promotion, head-hunter networks, and LinkedIn — build a track record of leading teams and delivering outcomes as ${base}`
        : `Specialist roles often come via PG research, niche certifications, and referrals — demonstrate depth through publications, portfolios, or complex project ownership`),
    higherStudies: tier === 'senior'
      ? [
          'Executive MBA or leadership programmes (IIMs, ISB, global EMBA)',
          category.includes('Medical') ? 'MD / MS / DNB for clinical leadership' : "Master's for research-track senior roles",
          'Industry fellowships and senior management certifications',
        ]
      : tier === 'specialist'
        ? [
            isResearchCategory(category) ? 'Ph.D / post-doctoral research in sub-domain' : "Master's + advanced vendor/domain certifications",
            'International specialist credentials and workshop training',
            'Cross-training in adjacent niches to broaden advisory scope',
          ]
        : [
          category.includes('Medical') ? 'MD / MS / DNB specialisation' : "Master's / PG diploma in India (optional for senior roles)",
          id % 3 === 0 ? 'PhD / research pathway for academia' : 'Executive MBA for leadership track',
          'International certifications for global roles',
        ],
    jobRoles: tier === 'senior'
      ? [
          `Mid: ${base} (3–5 years)`,
          `Senior: ${title}`,
          `Lead: Manager / Principal ${base} → Director`,
        ]
      : tier === 'specialist'
        ? [
            `Foundation: ${base} (2–4 years)`,
            `Specialist: ${title}`,
            `Expert: Principal / Fellow ${base}`,
          ]
        : [
          `Entry: Junior ${base}`,
          `Mid: ${base}`,
          `Senior: Lead ${base} or Specialist ${base}`,
        ],
    salaryProgression: tier === 'senior'
      ? [
          `At senior level: ${(salaryMin / 100000).toFixed(1)}–${(salaryMax / 100000).toFixed(1)} LPA typical`,
          `Lead / manager: ${((salaryMin * 1.15) / 100000).toFixed(1)}–${((salaryMax * 1.1) / 100000).toFixed(1)} LPA`,
          `Director+: ${((salaryMax * 0.9) / 100000).toFixed(1)}+ LPA with equity potential`,
        ]
      : tier === 'specialist'
        ? [
          `Specialist band: ${(salaryMin / 100000).toFixed(1)}–${(salaryMax / 100000).toFixed(1)} LPA`,
          `Principal specialist: ${((salaryMin * 1.3) / 100000).toFixed(1)}–${((salaryMax * 1.15) / 100000).toFixed(1)} LPA`,
          `Fellow / chief expert: ${((salaryMax * 0.85) / 100000).toFixed(1)}+ LPA`,
        ]
        : [
          `Fresher: ${(salaryMin / 100000).toFixed(1)} LPA approx.`,
          `3–5 years: ${((salaryMin * 1.5) / 100000).toFixed(1)}–${((salaryMin * 2.2) / 100000).toFixed(1)} LPA`,
          `10+ years: ${((salaryMax * 0.75) / 100000).toFixed(1)}+ LPA (senior/lead roles)`,
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

const careerEntries = getAllCareerEntries();

for (const { title, category } of careerEntries) {
  if (title.length > 100) continue;
  const config = categories[category] || { stream: ['Any'] };
  careers.push(buildCareer(id++, title, category, config, 0));
}

const total = careers.length;
const displayLabel = total >= 1000 ? `${Math.floor(total / 100) * 100}+` : `${total}+`;

const out = {
  meta: {
    total,
    displayLabel,
    source: 'Dreams Mantra Career Library — comprehensive India-focused guidance',
    updated: new Date().toISOString().slice(0, 10),
  },
  careers,
};

const outPaths = [
  path.join(__dirname, '../client/public/data/careers.json'),
  path.join(__dirname, '../backend/data/careers.json'),
];

for (const outPath of outPaths) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(out));
  console.log(`Generated ${out.careers.length} careers -> ${outPath}`);
}
