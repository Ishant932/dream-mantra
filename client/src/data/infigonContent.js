import { IMAGES, PORTRAITS } from './content';
import { partnerNames } from './collegePartners';

export const stats = [
  { value: 50000, suffix: '+', label: 'Students Guided' },
  { value: 1200, suffix: '+', label: 'College Partners' },
  { value: 1000, suffix: '+', label: 'Counsellors' },
  { value: 5000, suffix: '+', label: 'Career Options' },
];

export const whyCards = [
  {
    tag: 'Market Potential',
    title: 'Huge Competition',
    highlight: '35+ crore graduates',
    sub: 'by 2030 in India',
    compare: 'Entire population of USA — 33 Crore',
    image: IMAGES.career,
  },
  {
    tag: 'Employment Reality',
    title: 'Employment Reality',
    highlight: '65%',
    sub: 'of graduates unemployed or underemployed due to poor career decisions',
    image: IMAGES.professional,
  },
  {
    tag: 'Lack of Awareness',
    title: 'Lack of Awareness',
    highlight: '90%',
    sub: 'of Indians know only 7–10 career options while 5000+ exist',
    image: IMAGES.students,
  },
];

export const audienceCards = [
  {
    title: 'Students & Parents',
    services: ['Career Library', 'Skill Mapping', 'Brain Mapping', 'Roadmap', '5 Pillars', 'AI Career Launchpad'],
    desc: 'Expert guidance for subject selection, course planning, college mapping, and choosing the right career path at the right time.',
    image: IMAGES.students,
    link: '/counselling?tab=programs',
  },
  {
    title: 'Working Professionals',
    services: ['Career Library', 'Skill Mapping', 'Brain Mapping', 'Roadmap', 'AI Career Launchpad', 'Career Switch'],
    desc: 'Feeling stuck or planning a career shift? Get clarity on direction, skills you need, and opportunities that fit your goals.',
    image: IMAGES.professional,
    link: '/programs/working-professionals',
    featured: true,
  },
];

export const toolkitServices = [
  { title: 'Career Library', desc: 'Explore 1000+ careers with skills, salaries, education paths, and growth.', icon: '📚', link: '/careers', image: IMAGES.library },
  { title: 'Book Now', desc: 'Counselling assessments and Training & Placement programs in one place.', icon: '🛒', link: '/marketplace?tab=counselling', image: IMAGES.aiTech },
  { title: 'Skill Mapping', desc: '5-dimensional AI-driven assessment for personality and career fit.', icon: '🧠', link: '/counselling?tab=psychometric', image: IMAGES.psychometric },
  { title: 'Career Roadmap', desc: 'Step-by-step roadmap for every stage to your dream career.', icon: '🗺️', link: '/counselling?tab=overview', image: IMAGES.career },
];

export const processSteps = [
  {
    title: 'Inborn Talent (Brain Mapping)',
    points: ['Learning style & natural strengths', 'No exams or pressure'],
  },
  {
    title: 'Acquired Talent (Skill Mapping)',
    points: ['Personality, interests & behaviour', 'Fit for stream & career choices'],
  },
  {
    title: 'What You Have Learned',
    points: ['Subjects, grades & projects audited', 'Academics aligned to real paths'],
  },
  {
    title: 'Market Trend',
    points: ['Growing careers matched to you', 'Demand, salary & opportunity data'],
  },
  {
    title: 'AI Proof Career',
    points: ['Roles that stay human-strong', 'Built for long-term employability'],
  },
];

export const premiumServices = [
  { title: 'Internship Assistance', desc: 'Find internships matching your skills and career goals.', image: IMAGES.internship },
  { title: 'Skill Development Roadmap', desc: 'Personalised skill roadmap to grow faster in your career.', image: IMAGES.skills },
  { title: 'Profile Building', desc: 'Strengthen profile with projects aligned to your dream career.', image: IMAGES.profile },
  { title: 'Industry Mentorship', desc: 'Experts help you understand trends and stay future-ready.', image: IMAGES.mentorship },
  { title: 'Long-Term Handholding', desc: 'Continuous support and regular check-ins throughout your journey.', image: IMAGES.handholding },
];

export const counsellors = [
  { name: 'Mehul Shah', city: 'Vadodara', role: 'Career Consulting', initials: 'MS', image: PORTRAITS.counsellor1 },
  { name: 'Amritanshu Singh', city: 'Lucknow', role: 'Freelancer', initials: 'AS', image: PORTRAITS.counsellor2 },
  { name: 'Munira Haider', city: 'Pune', role: 'Teacher', initials: 'MH', image: PORTRAITS.counsellor3 },
  { name: 'Dr. Mahendra Gupta', city: 'Navi Mumbai', role: 'Co-Founder, MEETCS', initials: 'MG', image: PORTRAITS.counsellor4 },
  { name: 'Pallavi Pankaj Bhaiya', city: 'Jalgaon', role: 'Interior Designer', initials: 'PP', image: PORTRAITS.counsellor5 },
  { name: 'Esha Lohiya', city: 'Jaipur', role: 'Founder & Chief Counselor', initials: 'EL', image: IMAGES.founder },
];

export const partners = partnerNames;

export const advisors = [
  { name: 'Esha Lohiya', role: 'Founder & Chief Counsellor', initials: 'EL' },
  { name: 'Shivam Lohiya', role: 'Co-Founder', initials: 'SL' },
];

export const faqs = [
  { q: 'What is career counselling and why is it important?', a: 'Career counselling helps you understand strengths, interests, and opportunities to make informed education and career decisions.' },
  { q: 'How does career counselling benefit students?', a: 'Students gain clarity on streams, courses, colleges, and careers aligned with aptitude — avoiding costly wrong choices.' },
  { q: 'What does a career counsellor do?', a: 'Assesses your profile, interprets Skill Mapping/Brain Mapping results, shortlists careers and institutions, and guides admissions.' },
  { q: 'How accurate is Skill Mapping?', a: 'When scientifically designed and expert-interpreted, they offer reliable personality and aptitude insights.' },
  { q: 'Who needs career counselling?', a: 'Students Class 8–12, college students, parents, and working professionals considering shifts or upskilling.' },
  { q: 'How does AI help in career counselling?', a: 'AI powers career libraries, roadmaps, and faster analysis while counsellors ensure empathy and accountability.' },
  { q: 'Is online career counselling effective?', a: 'Yes — same assessments, expert counsellors, and tools with greater accessibility across India.' },
  { q: 'How long does the process take?', a: 'Typically 3–7 sessions over a few weeks depending on goals.' },
];

export const counsellingTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'why', label: 'Why Career Counselling' },
  { id: 'dmit', label: 'Brain Mapping' },
  { id: 'psychometric', label: 'Skill Mapping' },
  { id: 'combo', label: 'Brain + Skill Mapping' },
  { id: 'programs', label: 'Age Pathways' },
  { id: 'book', label: 'Book Session' },
  { id: 'institutions', label: 'Institutions' },
];

export const counsellorsTabs = [
  { id: 'network', label: 'Our Counsellors' },
  { id: 'become', label: 'Become a Counsellor' },
  { id: 'certification', label: 'Certification' },
  { id: 'join', label: 'Join Network' },
];

export const studyAbroadTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'countries', label: 'Countries' },
  { id: 'universities', label: 'Universities' },
  { id: 'loans', label: 'Education Loans' },
  { id: 'visa', label: 'Visa Support' },
];

export const marketplaceTabs = [
  { id: 'counselling', label: 'Counselling' },
  { id: 'training', label: 'Training & Placement' },
];
