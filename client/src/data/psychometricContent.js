/** Content sourced from Dream Mantra / Dreamz Roadmap Skill Mapping page */

export const PSYCHOMETRIC_TESTS = [
  {
    id: 'riasec',
    icon: '🧠',
    name: '🧠 Career Interest Assessment (RIASEC)',
    developer: 'Dr. John Holland (1959)',
    summary: 'Finds the careers and work environments that match your interests.',
    pairs: ['Realistic', 'Investigative', 'Artistic', 'Social', 'Enterprising', 'Conventional'],
    outcome: 'Career interest alignment & shortlisting',
    color: 'orange',
  },
  {
    id: 'mit',
    icon: '🌟',
    name: '🌟 Multiple Talents Assessment (Multiple Intelligences Theory - MIT)',
    developer: 'Dr. Howard Gardner (1983), Harvard University',
    summary: 'Identifies your strongest multiple abilities and areas of intelligence.',
    pairs: ['Logical–Mathematical', 'Linguistic', 'Musical', 'Interpersonal', 'Intrapersonal'],
    outcome: 'Talent mapping beyond exam scores',
    color: 'amber',
  },
  {
    id: 'mbti',
    icon: '👤',
    name: '👤 Personality Assessment (MBTI – Myers-Briggs Type Indicator)',
    developer: 'Isabel Briggs Myers & Katharine Briggs (1943)',
    summary: 'Helps you understand your personality type, work style, and preferences.',
    pairs: ['Introversion / Extraversion', 'Sensing / Intuition', 'Thinking / Feeling', 'Judging / Perceiving'],
    outcome: '16 personality types for clearer self-understanding',
    color: 'amber',
  },
  {
    id: 'vak',
    icon: '📚',
    name: '📚 Learning Style Assessment (VAK)',
    developer: 'VARK model by Neil Fleming (1987)',
    summary: 'Discovers how you learn and retain information most effectively.',
    pairs: ['Visual', 'Auditory', 'Kinesthetic'],
    outcome: 'Personalised study strategy recommendations',
    color: 'gold',
  },
  {
    id: 'disc',
    icon: '🤝',
    name: '🤝 Professional Behaviour & Work Style Analysis (DISC)',
    developer: 'Dr. William Moulton Marston (1928)',
    summary: 'Understands how you communicate, collaborate, and respond in different situations.',
    pairs: ['Dominance', 'Influence', 'Steadiness', 'Conscientiousness'],
    outcome: 'Behavioural style map for teamwork & leadership',
    color: 'orange',
  },
  {
    id: 'big5',
    icon: '💡',
    name: '💡 Workplace Personality & Success Factors Analysis (Big Five Personality Traits)',
    developer: 'Lewis Goldberg (1981), Costa & McCrae (1985)',
    summary: 'Identifies your core personality traits, behavioural patterns, and strengths.',
    pairs: ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'],
    outcome: 'Trait-based profile for academic & career fit',
    color: 'green',
  },
  {
    id: 'jung',
    icon: '🎯',
    name: '🎯 Decision-Making & Thinking Style Assessment (Carl Jung Personality Test)',
    developer: 'Carl Gustav Jung (1921)',
    summary: 'Explains how you think, process information, and make decisions.',
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
  { title: 'Beyond Brain Mapping', desc: 'While Brain Mapping reveals inborn potential, Skill Mapping maps your current personality, interests, behaviour, and decision-making style.' },
  { title: 'Complete Picture', desc: 'Together with Brain Mapping, Skill Mapping creates the full nature + nurture profile for confident career decisions.' },
  { title: 'Scientific & Objective', desc: 'Globally researched frameworks — not assumptions, peer pressure, or guesswork.' },
  { title: '7 Frameworks, One Profile', desc: 'Multiple dimensions ensure guidance is accurate, balanced, and practical — not based on a single test score.' },
];
