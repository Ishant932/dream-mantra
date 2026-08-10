/** Test portal data — sourced from dream-mantra-cursor-package */

export const SKILL_MAPPING_INSTRUMENTS = [
  { id: 'RIASEC', emoji: '🧠', title: 'Career Interest Assessment', framework: 'RIASEC', tag: 'Career Interest Preferences', hint: 'Finds the careers and work environments that match your interests.', total: 24, question: 'I enjoy exploring new places and outdoor activities.', options: ['Agree', 'Neutral', 'Disagree'] },
  { id: 'MIT', emoji: '🌟', title: 'Multiple Talents Assessment', framework: 'Multiple Intelligences Theory - MIT', tag: 'Multiple Talents Profile', hint: 'Identifies your strongest multiple abilities and areas of intelligence.', total: 24, question: 'I can easily pick up new tunes or rhythms.', options: ['Agree', 'Neutral', 'Disagree'] },
  { id: 'MBTI', emoji: '👤', title: 'Personality Assessment', framework: 'MBTI – Myers-Briggs Type Indicator', tag: 'Personality Type Preferences', hint: 'Helps you understand your personality type, work style, and preferences.', total: 20, question: 'I feel energized after spending time with a large group of people.', options: ['Agree', 'Neutral', 'Disagree'] },
  { id: 'VAK', emoji: '📚', title: 'Learning Style Assessment', framework: 'VAK', tag: 'VAK Learning Preferences', hint: 'Discovers how you learn and retain information most effectively.', total: 18, question: 'I remember things best when I see them written down or drawn.', options: ['Agree', 'Neutral', 'Disagree'] },
  { id: 'DISC', emoji: '🤝', title: 'Professional Behaviour & Work Style Analysis', framework: 'DISC', tag: 'Work Style & Behaviour', hint: 'Understands how you communicate, collaborate, and respond in different situations.', total: 16, question: 'I prefer to take charge and make quick decisions in a team.', options: ['Agree', 'Neutral', 'Disagree'] },
  { id: 'BIG5', emoji: '💡', title: 'Workplace Personality & Success Factors Analysis', framework: 'Big Five Personality Traits', tag: 'Workplace Personality Factors', hint: 'Identifies your core personality traits, behavioural patterns, and strengths.', total: 22, question: 'I stay organized and plan things well in advance.', options: ['Agree', 'Neutral', 'Disagree'] },
  { id: 'CARL_JUNG', emoji: '🎯', title: 'Decision-Making & Thinking Style Assessment', framework: 'Carl Jung Personality Test', tag: 'Thinking & Decision Style', hint: 'Explains how you think, process information, and make decisions.', total: 20, question: 'I prefer to rely on logic rather than feelings when making decisions.', options: ['Agree', 'Neutral', 'Disagree'] },
];

export function instrumentLabel(i) {
  return `${i.emoji} ${i.title} (${i.framework})`;
}

export const PROFILE_WIZARD_STEPS = [
  {
    id: 'basics', icon: '👤', title: 'Personal & Contact', subtitle: 'Your details, contact, and family information',
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
      { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'] },
      { key: 'age', label: 'Age', type: 'text' },
      { key: 'academicStage', label: 'What is your current academic or professional stage?', type: 'select', options: ['Class 1-5', 'Class 6-8', 'Class 9-10', 'Class 11-12', 'College UG', 'College PG', 'Working Professional'] },
      { key: 'phone', label: 'Registered Phone and WhatsApp Number', type: 'text', help: 'This number will be used for WhatsApp communication. Please ensure it is active.', span: 2 },
      { key: 'institution', label: 'Name of Institution', type: 'text', span: 2 },
      { key: 'address', label: 'Address', type: 'textarea', span: 2 },
      { key: 'fatherName', label: "Father's Name", type: 'text' },
      { key: 'fatherNumber', label: "Father's Number", type: 'text' },
      { key: 'motherName', label: "Mother's Name", type: 'text' },
      { key: 'motherNumber', label: "Mother's Number", type: 'text' },
    ],
  },
  {
    id: 'goals', icon: '🎯', title: 'Your Goals', subtitle: 'Why you are here and what you hope to gain',
    fields: [
      { key: 'testObjective', label: 'Why are you getting the test done? Write the main objective and expected outcome.', type: 'textarea' },
      { key: 'concerns', label: 'What concerns or confusions do you or your child have about studies, career choices, or overall growth?', help: 'Feel free to write as many questions as you want to.', type: 'textarea' },
      { key: 'referralId', label: 'Referral ID', type: 'text' },
    ],
  },
  {
    id: 'career', icon: '💼', title: 'Career Understanding', subtitle: 'Your academic and career journey',
    fields: [
      { key: 'course', label: 'Current course / degree', type: 'text' },
      { key: 'yearSemester', label: 'Current year / semester', type: 'text' },
    ],
  },
  { id: 'review', icon: '📋', title: 'Review & Confirm', subtitle: 'Review your information' },
];

const CAREER_FIELDS_BY_STAGE = {
  'Class 1-5': [
    { key: 'favoriteSubjects', label: 'Favourite subjects', type: 'text' },
    { key: 'schoolActivities', label: 'School activities / hobbies', type: 'textarea' },
    { key: 'careerDream', label: 'What do you want to become when you grow up?', type: 'text' },
  ],
  'Class 6-8': [
    { key: 'favoriteSubjects', label: 'Favourite subjects', type: 'text' },
    { key: 'streamInterest', label: 'Subjects you enjoy most', type: 'text' },
    { key: 'careerDream', label: 'Career ideas you are curious about', type: 'textarea' },
  ],
  'Class 9-10': [
    { key: 'streamInterest', label: 'Preferred stream after Class 10', type: 'select', options: ['Science', 'Commerce', 'Arts / Humanities', 'Undecided'] },
    { key: 'targetExams', label: 'Entrance exams you are preparing for', type: 'text' },
    { key: 'careerGoal', label: 'Career goals at this stage', type: 'textarea' },
  ],
  'Class 11-12': [
    { key: 'course', label: 'Current stream / subjects', type: 'text' },
    { key: 'yearSemester', label: 'Class & board', type: 'text' },
    { key: 'targetExams', label: 'Target entrance exams / colleges', type: 'text' },
    { key: 'careerGoal', label: 'Career direction you are exploring', type: 'textarea' },
  ],
  'College UG': [
    { key: 'course', label: 'Current degree / course', type: 'text' },
    { key: 'yearSemester', label: 'Year / semester', type: 'text' },
    { key: 'internships', label: 'Internships / projects so far', type: 'textarea' },
    { key: 'careerGoal', label: 'Target role after graduation', type: 'text' },
  ],
  'College PG': [
    { key: 'course', label: 'Postgraduate program', type: 'text' },
    { key: 'yearSemester', label: 'Year / semester', type: 'text' },
    { key: 'specialization', label: 'Specialization / research area', type: 'text' },
    { key: 'careerGoal', label: 'Career goal after PG', type: 'textarea' },
  ],
  'Working Professional': [
    { key: 'currentRole', label: 'Current job role', type: 'text' },
    { key: 'yearsExperience', label: 'Years of experience', type: 'text' },
    { key: 'industry', label: 'Industry / domain', type: 'text' },
    { key: 'careerGoal', label: 'Career switch or growth goal', type: 'textarea' },
  ],
};

export function getCareerFieldsForStage(stage) {
  return CAREER_FIELDS_BY_STAGE[stage] || [
    { key: 'course', label: 'Current course / degree', type: 'text' },
    { key: 'yearSemester', label: 'Current year / semester', type: 'text' },
  ];
}

/** Map wizard academic stage → dashboard classLevel */
export function academicStageToClassLevel(stage) {
  const map = {
    'Class 1-5': 'Class 1-5', 'Class 6-8': 'Class 6-8', 'Class 9-10': 'Class 9-10',
    'Class 11-12': 'Class 11-12', 'College UG': 'College', 'College PG': 'College',
    'Working Professional': 'Working Professional',
  };
  return map[stage] || stage || '';
}

export function profileToWizardForm(profile = {}, user = {}) {
  return {
    name: user.name || '',
    dateOfBirth: profile.dateOfBirth || '',
    gender: profile.gender || '',
    age: profile.age || '',
    academicStage: profile.academicStage || profile.classLevel || '',
    phone: profile.whatsappNumber || user.phone || '',
    institution: profile.institution || profile.schoolOrCollege || '',
    address: profile.address || '',
    fatherName: profile.fatherName || profile.parentName || '',
    fatherNumber: profile.fatherNumber || '',
    motherName: profile.motherName || '',
    motherNumber: profile.motherNumber || profile.parentPhone || '',
    testObjective: profile.testObjective || profile.careerGoal || '',
    concerns: profile.concerns || profile.biggestChallenge || '',
    referralId: profile.referralId || '',
    course: profile.course || '',
    yearSemester: profile.yearSemester || '',
    favoriteSubjects: profile.favoriteSubjects || '',
    schoolActivities: profile.schoolActivities || '',
    careerDream: profile.careerDream || '',
    streamInterest: profile.streamInterest || '',
    targetExams: profile.targetExams || '',
    careerGoal: profile.careerGoal || '',
    internships: profile.internships || '',
    specialization: profile.specialization || '',
    currentRole: profile.currentRole || '',
    yearsExperience: profile.yearsExperience || '',
    industry: profile.industry || '',
  };
}

export function wizardFormToProfile(form) {
  return {
    dateOfBirth: form.dateOfBirth || '',
    gender: form.gender || '',
    age: form.age || '',
    academicStage: form.academicStage || '',
    classLevel: academicStageToClassLevel(form.academicStage),
    whatsappNumber: form.phone || '',
    institution: form.institution || '',
    schoolOrCollege: form.institution || '',
    address: form.address || '',
    fatherName: form.fatherName || '',
    fatherNumber: form.fatherNumber || '',
    motherName: form.motherName || '',
    motherNumber: form.motherNumber || '',
    parentName: form.fatherName || form.motherName || '',
    parentPhone: form.fatherNumber || form.motherNumber || '',
    testObjective: form.testObjective || '',
    careerGoal: form.testObjective || '',
    concerns: form.concerns || '',
    biggestChallenge: form.concerns || '',
    referralId: form.referralId || '',
    course: form.course || '',
    yearSemester: form.yearSemester || '',
    favoriteSubjects: form.favoriteSubjects || '',
    schoolActivities: form.schoolActivities || '',
    careerDream: form.careerDream || '',
    streamInterest: form.streamInterest || '',
    targetExams: form.targetExams || '',
    careerGoal: form.careerGoal || form.testObjective || '',
    internships: form.internships || '',
    specialization: form.specialization || '',
    currentRole: form.currentRole || '',
    yearsExperience: form.yearsExperience || '',
    industry: form.industry || '',
    setupComplete: true,
  };
}
