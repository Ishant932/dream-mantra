/** Content from https://sites.google.com/view/dreamz-roadmap/home */
import { IMAGES, founder, testimonials } from './content';

export const dreamzPromise = {
  title: 'The Dreamz Promise',
  text: 'At Dream Mantra (Dreamz Roadmap), we believe every child holds untapped brilliance. In a world driven by pressure and comparison, we offer something rare: clarity, confidence, and direction.',
  subtext: 'We use Mind Mapping & Skill Mapping — a globally trusted, scientific method that maps brain potential through fingerprint analysis.',
  benefits: [
    'Validated in 30+ countries',
    'Reveals learning styles, memory patterns, intelligence types, and behavioural traits',
    'Deep, bias-free insight — without exams, pressure, or labels',
    'Rooted in neuroscience, genetics, and psychology',
  ],
};

export const howDreamzWorks = [
  { step: 1, icon: '📊', title: 'ASSESS', desc: 'Scientific Mind Mapping fingerprint scanning + Skill Mapping (MBTI, DISC, RIASEC, Big 5, VAK, MIT, Jung)' },
  { step: 2, icon: '🔬', title: 'ANALYZE', desc: 'Neuroscience-backed analysis by certified counsellors — Govt of India aligned, NLP trained' },
  { step: 3, icon: '🎯', title: 'GUIDE', desc: 'Personalized roadmap for academics, career & life success — from Class 1 to First Job' },
];

export const whoWeGuide = [
  { title: 'Class 1-5', subtitle: 'Talent Discovery', link: '/programs/class-1-5' },
  { title: 'Class 6-8', subtitle: 'Self Discovery', link: '/programs/class-6-8' },
  { title: 'Class 9-10', subtitle: 'Stream Selection', link: '/programs/class-9-10' },
  { title: 'Class 11-12', subtitle: 'Career Direction', link: '/programs/class-11-12' },
  { title: 'College Students', subtitle: 'Degree & Career Clarity', link: '/programs/college-students' },
  { title: 'Working Professionals', subtitle: 'Career Switch & Growth', link: '/programs/working-professionals' },
];

export const featuredAssessments = [
  { title: 'Mind Mapping', desc: 'Fingerprint Analysis, Inborn Potential Mapping', link: '/assessments/dmit', icon: '🔬' },
  { title: 'Skill Mapping', desc: '7 Frameworks: MBTI, DISC, RIASEC, Big 5, VAK, MIT, Jung', link: '/assessments/psychometric', icon: '📊' },
  { title: 'Mind Mapping + Skill Mapping', desc: 'Complete inborn + acquired talent profile', link: '/assessments/dmit-psychometric', icon: '🧬' },
];

export const whyDifferent = [
  'Science-backed Mind Mapping + 7 Skill Mapping frameworks — not guesswork',
  '7-Pillar holistic career model (Counselling → Job Ready + AI Career Launchpad)',
  '950+ career library with detailed roadmaps',
  'Free consultation — Mon–Sat 11am–7pm',
  'Certified counsellors: Govt of India, IIT Madras, NLP, Reliance Foundation',
  'Jaipur centres + Pan-India online counselling',
  'No pressure. No comparison. Just clarity.',
];

export const locations = ['Raja Park, Jaipur', 'Shastri Nagar, Jaipur', 'Nirman Nagar, Jaipur', 'Pan-India (Online)'];

export const contactInfo = {
  phone: '9680102276',
  email: 'info@dreammantra.in',
  hours: 'Mon–Sat, 11am–7pm',
};

export const whyDreamsMantraPage = {
  hero: {
    title: 'Why Career Counselling?',
    subtitle: 'Scientific Education & Career Guidance — We are all unique keys, meant to unlock different doors.',
    tagline: 'Discover Your Hidden Brilliance — No Pressure. No Comparison. Just Clarity.',
    image: IMAGES.hero,
  },
  dreamzPromise,
  howDreamzWorks,
  whoWeGuide,
  featuredAssessments,
  whyDifferent,
  founder,
  testimonials,
  locations,
  contactInfo,
};
