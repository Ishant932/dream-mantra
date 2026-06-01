/** Content sourced from Dream Mantra / Dreamz Roadmap Skill Mapping page */

export const PSYCHOMETRIC_TESTS = [
  {
    id: 'mbti',
    icon: '🧠',
    name: 'MBTI Personality Indicator',
    developer: 'Isabel Briggs Myers & Katharine Briggs (1943)',
    basedOn: 'Carl Jung (1921)',
    summary: 'Categorises personality across four preference pairs to reveal study habits, decision-making style, and career environment fit.',
    pairs: ['Introversion / Extraversion', 'Sensing / Intuition', 'Thinking / Feeling', 'Judging / Perceiving'],
    outcome: '16 personality types for clearer self-understanding',
    color: 'amber',
  },
  {
    id: 'disc',
    icon: '⚡',
    name: 'DISC Personality Model',
    developer: 'Dr. William Moulton Marston (1928)',
    basedOn: 'Behavioural psychology',
    summary: 'Explains behaviour across four styles — widely used in education, leadership, and communication profiling.',
    pairs: ['Dominance — assertive, result-driven', 'Influence — expressive, social', 'Steadiness — calm, cooperative', 'Conscientiousness — analytical, precise'],
    outcome: 'Behavioural style map for teamwork & leadership',
    color: 'orange',
  },
  {
    id: 'big5',
    icon: '📊',
    name: 'Big Five Personality Model',
    developer: 'Lewis Goldberg (1981), Costa & McCrae (1985)',
    basedOn: 'Research from the 1940s onward',
    summary: 'The most scientifically validated personality framework used in modern psychology today.',
    pairs: ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'],
    outcome: 'Trait-based profile for academic & career fit',
    color: 'green',
  },
  {
    id: 'vak',
    icon: '👁️',
    name: 'VAK Learning Style Model',
    developer: 'VARK model by Neil Fleming (1987)',
    basedOn: 'Learning style research 1920s–1950s',
    summary: 'Identifies preferred learning modes to improve retention, focus, and academic performance.',
    pairs: ['Visual — images & diagrams', 'Auditory — listening & discussion', 'Kinesthetic — activities & movement'],
    outcome: 'Personalised study strategy recommendations',
    color: 'gold',
  },
  {
    id: 'mit',
    icon: '🎯',
    name: 'Multiple Intelligences (MIT)',
    developer: 'Dr. Howard Gardner (1983), Harvard University',
    basedOn: 'Multidimensional intelligence theory',
    summary: 'Intelligence is multidimensional — talent exists beyond academic marks alone.',
    pairs: ['Logical–Mathematical', 'Linguistic', 'Musical', 'Bodily–Kinesthetic', 'Visual–Spatial', 'Interpersonal', 'Intrapersonal', 'Naturalistic', 'Existential'],
    outcome: 'Talent mapping beyond exam scores',
    color: 'amber',
  },
  {
    id: 'riasec',
    icon: '🧭',
    name: 'RIASEC Career Interest Model',
    developer: 'Dr. John Holland (1959)',
    basedOn: 'Holland Codes — global career guidance standard',
    summary: 'Links personality with career interests through six types — one of the most trusted frameworks worldwide.',
    pairs: ['Realistic — practical, technical', 'Investigative — analytical, scientific', 'Artistic — creative, expressive', 'Social — helping, teaching', 'Enterprising — leadership, business', 'Conventional — organised, structured'],
    outcome: 'Career interest alignment & shortlisting',
    color: 'orange',
  },
  {
    id: 'jung',
    icon: '🔮',
    name: 'Carl Jung Psychological Types',
    developer: 'Carl Gustav Jung (1921)',
    basedOn: 'Psychological Types',
    summary: 'Foundation theory for many modern personality assessments — energy, perception, and decision styles.',
    pairs: ['Energy: Introvert / Extrovert', 'Perception: Sensing / Intuition', 'Decision: Thinking / Feeling'],
    outcome: 'Deep cognitive & personality insight',
    color: 'green',
  },
];

export const PSYCHO_PROBLEMS = [
  'Confusion about career direction',
  'Lack of motivation in studies',
  'Low confidence and self-doubt',
  'Frequent changes in goals',
  'Stress and academic dissatisfaction',
];

export const PSYCHO_BENEFITS = [
  'Natural abilities & aptitudes',
  'Personality traits & temperament',
  'Learning style preferences',
  'Interests and passions',
  'Behavioural strengths & communication style',
];

export const PSYCHO_PROFILE_COvers = [
  'How a student learns',
  'How they think & decide',
  'How they interact socially',
  'What motivates them',
  'Which careers match their natural orientation',
];

export const PSYCHO_PROCESS = [
  { step: '01', title: 'Online Assessment', desc: 'Complete the Skill Mapping battery online — typically 30–45 minutes, at your own pace.', icon: '💻' },
  { step: '02', title: 'Multi-Framework Analysis', desc: 'Certified analysts interpret results across all 7 psychological frameworks together.', icon: '🔬' },
  { step: '03', title: 'Comprehensive Report', desc: 'Receive a detailed report covering personality, interests, learning style, and career alignment.', icon: '📋' },
  { step: '04', title: 'Counselling Session', desc: '1-on-1 session with a Dream Mantra counsellor to translate insights into actionable guidance.', icon: '💬' },
];

export const PSYCHO_AGE_MAP = [
  { age: 'Class 1–5', focus: 'Early learning style & talent awareness', program: '/programs/class-1-5' },
  { age: 'Class 6–8', focus: 'Self-discovery & personality insights', program: '/programs/class-6-8' },
  { age: 'Class 9–10', focus: 'Stream selection & subject fit', program: '/programs/class-9-10' },
  { age: 'Class 11–12', focus: 'Career direction & entrance exam planning', program: '/programs/class-11-12' },
  { age: 'College Students', focus: 'Degree relevance, internships & job readiness', program: '/programs/college-students' },
  { age: 'Working Professionals', focus: 'Career switch, growth & fulfilment', program: '/programs/working-professionals' },
];

export const PSYCHO_WHY = [
  { title: 'Beyond Mind Mapping', desc: 'While Mind Mapping reveals inborn potential, Skill Mapping maps your current personality, interests, behaviour, and decision-making style.' },
  { title: 'Complete Picture', desc: 'Together with Mind Mapping, Skill Mapping creates the full nature + nurture profile for confident career decisions.' },
  { title: 'Scientific & Objective', desc: 'Globally researched frameworks — not assumptions, peer pressure, or guesswork.' },
  { title: '7 Frameworks, One Profile', desc: 'Multiple dimensions ensure guidance is accurate, balanced, and practical — not based on a single test score.' },
];
