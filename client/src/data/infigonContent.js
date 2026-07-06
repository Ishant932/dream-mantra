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
    services: ['Career Library', 'AI Corner', 'Skill Mapping', 'Mind Mapping', 'Roadmap', '7 Pillars', 'AI Career Launchpad'],
    desc: 'Expert guidance for subject selection, course planning, college mapping, and choosing the right career path at the right time.',
    image: IMAGES.students,
    link: '/counselling?tab=programs',
  },
  {
    title: 'Working Professionals',
    services: ['Career Library', 'AI Corner', 'Skill Mapping', 'Mind Mapping', 'Roadmap', 'AI Career Launchpad', 'Career Switch'],
    desc: 'Feeling stuck or planning a career shift? Get clarity on direction, skills you need, and opportunities that fit your goals.',
    image: IMAGES.professional,
    link: '/programs/working-professionals',
    featured: true,
  },
];

export const toolkitServices = [
  { title: 'Career Library', desc: 'Explore 1000+ careers with skills, salaries, education paths, and growth.', icon: '📚', link: '/careers', image: IMAGES.library },
  { title: 'AI Corner', desc: 'AI-powered skill plans and career roadmaps within seconds.', icon: '🤖', link: '/marketplace?tab=ai', image: IMAGES.aiTech },
  { title: 'Skill Mapping', desc: '5-dimensional AI-driven assessment for personality and career fit.', icon: '🧠', link: '/assessments/psychometric', image: IMAGES.psychometric },
  { title: 'Career Roadmap', desc: 'Step-by-step roadmap for every stage to your dream career.', icon: '🗺️', link: '/counselling?tab=process', image: IMAGES.career },
];

export const processSteps = [
  { title: 'Understanding Your Journey', desc: 'We begin by understanding your goals, background, interests, and challenges.' },
  { title: '5-Dimensional Skill Mapping', desc: 'Scientific assessment across personality, aptitude, and interests.' },
  { title: 'Tailored Career Shortlisting', desc: 'Shortlist careers aligned with strengths, demand, and aspirations.' },
  { title: 'Country, University & Course', desc: 'Pick the right geography, institution, and programme.' },
  { title: 'Best Admissions Provider', desc: 'Connect with trusted partners for applications and documentation.' },
  { title: 'End-to-End Admissions', desc: 'Handholding through applications, interviews, visas, and enrolment.' },
  { title: 'Ancillary Services', desc: 'Loans, accommodation, travel, and post-admission support.' },
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
  { q: 'What does a career counsellor do?', a: 'Assesses your profile, interprets Skill Mapping/Mind Mapping results, shortlists careers and institutions, and guides admissions.' },
  { q: 'How accurate is Skill Mapping?', a: 'When scientifically designed and expert-interpreted, they offer reliable personality and aptitude insights.' },
  { q: 'Who needs career counselling?', a: 'Students Class 8–12, college students, parents, and working professionals considering shifts or upskilling.' },
  { q: 'How does AI help in career counselling?', a: 'AI powers career libraries, roadmaps, and faster analysis while counsellors ensure empathy and accountability.' },
  { q: 'Is online career counselling effective?', a: 'Yes — same assessments, expert counsellors, and tools with greater accessibility across India.' },
  { q: 'How long does the process take?', a: 'Typically 3–7 sessions over a few weeks depending on goals.' },
];

export const counsellingTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'dmit', label: 'Mind Mapping' },
  { id: 'psychometric', label: 'Skill Mapping' },
  { id: 'process', label: '7-Step Process' },
  { id: 'programs', label: 'Programs' },
  { id: 'book', label: 'Book Session' },
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
  { id: 'tests', label: 'Tests' },
  { id: 'library', label: 'Career Library' },
  { id: 'ai', label: 'AI Corner' },
  { id: 'stream', label: 'Stream Selector' },
  { id: 'degree', label: 'Degree Selector' },
];
