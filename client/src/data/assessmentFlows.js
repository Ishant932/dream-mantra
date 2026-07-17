/** Post-payment assessment flow steps */
export const FLOW_STEPS = {
  CLASS: 'class_select',
  PROCESS: 'process',
  QUESTIONNAIRE: 'questionnaire',
  FINGERPRINT: 'fingerprint',
  COMMUNITY: 'community',
  COMPLETE: 'complete',
};

export const PSYCHOMETRIC_CLASS_OPTIONS = [
  { value: 'Class 1-5', label: 'Class 1–5', desc: 'Early learning style & talent awareness' },
  { value: 'Class 6-8', label: 'Class 6–8', desc: 'Self-discovery & personality insights' },
  { value: 'Class 9-10', label: 'Class 9–10', desc: 'Stream selection & subject fit' },
  { value: 'Class 11-12', label: 'Class 11–12', desc: 'Career direction & entrance exam planning' },
  { value: 'College', label: 'College Student', desc: 'Degree relevance, internships & job readiness' },
  { value: 'Working Professional', label: 'Working Professional', desc: 'Career switch, growth & fulfilment' },
];

export function initialStep(slug, progress) {
  if (progress?.step === FLOW_STEPS.COMPLETE) return FLOW_STEPS.COMPLETE;
  if (slug === 'psychometric') {
    if (!progress?.classLevel) return FLOW_STEPS.CLASS;
    if (progress?.step === FLOW_STEPS.QUESTIONNAIRE) return FLOW_STEPS.QUESTIONNAIRE;
    if (progress?.processComplete) return FLOW_STEPS.QUESTIONNAIRE;
    return FLOW_STEPS.PROCESS;
  }
  if (slug === 'dmit') {
    if (progress?.fingerprintDone) return FLOW_STEPS.COMPLETE;
    if (progress?.step === FLOW_STEPS.FINGERPRINT || progress?.processComplete) return FLOW_STEPS.FINGERPRINT;
    return FLOW_STEPS.PROCESS;
  }
  if (slug === 'crp-test') {
    if (progress?.communityJoined) return FLOW_STEPS.COMPLETE;
    if (progress?.step === FLOW_STEPS.COMMUNITY || progress?.processComplete) return FLOW_STEPS.COMMUNITY;
    return FLOW_STEPS.PROCESS;
  }
  if (slug === 'dmit-psychometric') {
    if (progress?.fingerprintDone && progress?.step === FLOW_STEPS.COMPLETE) return FLOW_STEPS.COMPLETE;
    if (progress?.fingerprintDone) return FLOW_STEPS.COMPLETE;
    if (progress?.step === FLOW_STEPS.FINGERPRINT || progress?.processComplete) return FLOW_STEPS.FINGERPRINT;
    return FLOW_STEPS.PROCESS;
  }
  if (progress?.step === FLOW_STEPS.PROCESS) return FLOW_STEPS.PROCESS;
  return FLOW_STEPS.PROCESS;
}

export function nextStep(slug, currentStep) {
  if (slug === 'psychometric') {
    if (currentStep === FLOW_STEPS.CLASS) return FLOW_STEPS.PROCESS;
    if (currentStep === FLOW_STEPS.PROCESS) return FLOW_STEPS.QUESTIONNAIRE;
    return FLOW_STEPS.COMPLETE;
  }
  if (slug === 'dmit') {
    if (currentStep === FLOW_STEPS.PROCESS) return FLOW_STEPS.FINGERPRINT;
    return FLOW_STEPS.COMPLETE;
  }
  if (slug === 'crp-test') {
    if (currentStep === FLOW_STEPS.PROCESS) return FLOW_STEPS.COMMUNITY;
    return FLOW_STEPS.COMPLETE;
  }
  if (slug === 'dmit-psychometric') {
    if (currentStep === FLOW_STEPS.PROCESS) return FLOW_STEPS.FINGERPRINT;
    return FLOW_STEPS.COMPLETE;
  }
  if (currentStep === FLOW_STEPS.PROCESS) return FLOW_STEPS.COMPLETE;
  return FLOW_STEPS.COMPLETE;
}

const QUESTIONNAIRES = {
  'Class 1-5': [
    { id: 'learning_style', label: 'How do you learn best?', options: ['Pictures & videos', 'Listening to teacher', 'Hands-on activities', 'Reading books'] },
    { id: 'favorite_subject', label: 'Which subject do you enjoy most?', options: ['Math', 'Science', 'Languages', 'Arts & crafts', 'Sports'] },
    { id: 'study_habit', label: 'When do you focus best?', options: ['Morning', 'Afternoon', 'Evening', 'Varies day to day'] },
    { id: 'group_work', label: 'Do you prefer studying alone or with others?', options: ['Alone', 'With friends', 'With family', 'Mix of both'] },
    { id: 'hobby_energy', label: 'What activity gives you the most energy?', options: ['Drawing / music', 'Sports / dance', 'Building / puzzles', 'Reading / stories'] },
    { id: 'future_curiosity', label: 'What would you like to explore more?', options: ['Science experiments', 'Creative arts', 'Helping people', 'Business / leadership'] },
  ],
  'Class 6-8': [
    { id: 'strength_area', label: 'Which area feels strongest for you?', options: ['Logical & analytical', 'Creative & expressive', 'People & communication', 'Practical & hands-on'] },
    { id: 'subject_interest', label: 'Which subjects excite you most?', options: ['Math & Science', 'Languages & Social', 'Arts & Design', 'Computer & Technology'] },
    { id: 'decision_style', label: 'How do you usually make decisions?', options: ['Think it through carefully', 'Ask parents / teachers', 'Go with gut feeling', 'Discuss with friends'] },
    { id: 'stress_response', label: 'When school feels hard, you usually…', options: ['Try harder on your own', 'Ask for help quickly', 'Take a break & return', 'Feel stuck for a while'] },
    { id: 'team_role', label: 'In group projects, you often…', options: ['Lead the team', 'Organize the work', 'Generate ideas', 'Support others'] },
    { id: 'career_curiosity', label: 'Which career area curious you most?', options: ['Doctor / engineer', 'Designer / artist', 'Teacher / counsellor', 'Entrepreneur / business'] },
  ],
  'Class 9-10': [
    { id: 'stream_lean', label: 'Which stream are you leaning toward?', options: ['Science (PCM)', 'Science (PCB)', 'Commerce', 'Arts / Humanities', 'Not sure yet'] },
    { id: 'subject_confidence', label: 'Where do you score highest confidence?', options: ['Math & Physics', 'Biology & Chemistry', 'Accounts & Economics', 'Languages & Social studies'] },
    { id: 'parent_influence', label: 'How much do family opinions affect your stream choice?', options: ['A lot', 'Somewhat', 'A little', 'I decide mostly on my own'] },
    { id: 'exam_interest', label: 'Which entrance / exam path interests you?', options: ['JEE / engineering', 'NEET / medical', 'CA / commerce', 'Design / law / other', 'Not decided'] },
    { id: 'work_style', label: 'Your preferred work style is…', options: ['Research & analysis', 'Creative problem solving', 'Helping & teaching', 'Leading & managing'] },
    { id: 'biggest_worry', label: 'Biggest worry about stream selection?', options: ['Choosing wrong stream', 'Marks / competition', 'Family expectations', 'Not knowing options'] },
  ],
  'Class 11-12': [
    { id: 'career_shortlist', label: 'How clear is your career shortlist?', options: ['Very clear (1–2 options)', 'Few options in mind', 'Many options', 'Still exploring'] },
    { id: 'entrance_prep', label: 'Current entrance exam preparation status?', options: ['Actively preparing', 'Starting soon', 'Not planning entrance', 'Already appeared'] },
    { id: 'motivation', label: 'What motivates your career choice most?', options: ['Interest & passion', 'Job opportunities', 'Family guidance', 'Income potential'] },
    { id: 'backup_plan', label: 'Do you have a backup career plan?', options: ['Yes, clearly defined', 'Thinking about it', 'No backup yet', 'Not needed'] },
    { id: 'skill_gap', label: 'Which skill do you want to build most?', options: ['Technical / domain', 'Communication', 'Leadership', 'Creative thinking'] },
    { id: 'counselling_need', label: 'What guidance would help you most?', options: ['Career shortlisting', 'Exam strategy', 'College selection', 'Confidence & clarity'] },
  ],
  College: [
    { id: 'degree_fit', label: 'How well does your degree match your interests?', options: ['Very well', 'Somewhat', 'Not much', 'Still figuring out'] },
    { id: 'internship_status', label: 'Internship / work experience status?', options: ['Completed one or more', 'Currently doing', 'Planning to start', 'None yet'] },
    { id: 'job_timeline', label: 'When do you plan to start full-time work?', options: ['Within 6 months', '6–12 months', 'After post-grad', 'Not sure'] },
    { id: 'skill_focus', label: 'Top skill you want to improve for jobs?', options: ['Technical skills', 'Communication & GD', 'Resume & LinkedIn', 'Interview confidence'] },
    { id: 'industry_interest', label: 'Preferred industry / role type?', options: ['IT / tech', 'Finance / consulting', 'Creative / media', 'Core engineering / science', 'Open to explore'] },
    { id: 'support_needed', label: 'What support would help you most now?', options: ['Job search strategy', 'Interview prep', 'Personal branding', 'Career direction clarity'] },
  ],
  'Working Professional': [
    { id: 'satisfaction', label: 'How satisfied are you in your current role?', options: ['Very satisfied', 'Somewhat satisfied', 'Neutral', 'Unsatisfied / stuck'] },
    { id: 'switch_interest', label: 'Are you considering a career switch?', options: ['Yes, actively', 'Maybe in 1–2 years', 'No, want growth here', 'Not sure'] },
    { id: 'growth_blocker', label: 'Biggest blocker to career growth?', options: ['Skills gap', 'Limited opportunities', 'Work-life balance', 'Unclear direction'] },
    { id: 'strength_use', label: 'How often do you use your natural strengths at work?', options: ['Daily', 'Sometimes', 'Rarely', 'Not sure what they are'] },
    { id: 'learning_goal', label: 'Primary upskilling goal?', options: ['Leadership & management', 'Technical depth', 'Communication & brand', 'Entrepreneurship'] },
    { id: 'guidance_type', label: 'What kind of guidance do you need?', options: ['Career pivot roadmap', 'Role / industry fit', 'Skill mapping report', 'Work-life alignment'] },
  ],
};

export function getQuestionnaire(classLevel) {
  return QUESTIONNAIRES[classLevel] || QUESTIONNAIRES['Class 9-10'];
}

export function psychometricProcessIntro(classLevel) {
  const map = {
    'Class 1-5': 'Tailored for young learners — focus on learning style, talents, and early strengths.',
    'Class 6-8': 'Designed for self-discovery — personality patterns and subject interests before big decisions.',
    'Class 9-10': 'Built for stream selection — align PCM, PCB, Commerce, or Arts with your profile.',
    'Class 11-12': 'Career direction focus — entrance exams, college paths, and confident shortlisting.',
    College: 'Job-readiness focus — internships, skills, and aligning your degree with market opportunities.',
    'Working Professional': 'Growth & pivot focus — strengths, satisfaction, and your next career move.',
  };
  return map[classLevel] || map['Class 9-10'];
}

export const PRODUCT_META = {
  dmit: {
    title: 'Brain Mapping',
    icon: 'fingerprint',
    completeTitle: 'Fingerprint step recorded',
    completeDesc: 'Our team will contact you to schedule your fingerprint scan. Your detailed report will be ready in 3–7 days and appear in My Reports.',
  },
  psychometric: {
    title: 'Skill Mapping',
    icon: 'flask',
    completeTitle: 'Questionnaire submitted',
    completeDesc: 'Our analysts will prepare your multi-framework Skill Mapping report in 3–7 days. A counsellor will reach out for your interpretation session.',
  },
  'crp-test': {
    title: 'AI Career Launchpad Training',
    icon: 'rocket',
    completeTitle: 'Welcome to the community',
    completeDesc: 'You have joined the AI Career Launchpad community. Session details and your training report will be shared within 3–7 days.',
  },
  'dmit-psychometric': {
    title: 'Brain + Skill Mapping',
    icon: 'sparkles',
    completeTitle: 'Assessment steps recorded',
    completeDesc: 'Brain Mapping fingerprint step is recorded. Complete your Skill Mapping questionnaire from the Take Test tab. Your combined report and counselling session will follow in 3–7 days.',
  },
};
