export const PROFILE_FIELDS = [
  { key: 'dateOfBirth', label: 'Date of Birth', weight: 6 },
  { key: 'gender', label: 'Gender', weight: 5 },
  { key: 'city', label: 'City', weight: 8 },
  { key: 'state', label: 'State', weight: 6 },
  { key: 'classLevel', label: 'Class / Level', weight: 10 },
  { key: 'stream', label: 'Stream / Interest', weight: 10 },
  { key: 'board', label: 'Board / Curriculum', weight: 6 },
  { key: 'schoolOrCollege', label: 'School / College', weight: 8 },
  { key: 'careerGoal', label: 'Career Goal', weight: 12 },
  { key: 'hobbies', label: 'Hobbies & Interests', weight: 8 },
  { key: 'biggestChallenge', label: 'Biggest Challenge', weight: 6 },
  { key: 'parentName', label: 'Parent / Guardian Name', weight: 5 },
  { key: 'parentPhone', label: 'Parent Contact', weight: 5 },
  { key: 'whatsappNumber', label: 'WhatsApp Number', weight: 8 },
  { key: 'preferredMode', label: 'Counselling Mode', weight: 5 },
  { key: 'howHeard', label: 'How You Found Us', weight: 4 },
];

export function defaultProfile() {
  return {
    classLevel: '',
    stream: '',
    city: '',
    state: '',
    board: '',
    schoolOrCollege: '',
    careerGoal: '',
    dateOfBirth: '',
    gender: '',
    hobbies: '',
    biggestChallenge: '',
    parentName: '',
    parentPhone: '',
    whatsappNumber: '',
    whatsappOptIn: false,
    preferredMode: '',
    howHeard: '',
    setupComplete: false,
  };
}

export function normalizeProfile(raw) {
  const base = defaultProfile();
  if (!raw || typeof raw !== 'object') return base;
  return { ...base, ...raw };
}

export function calcProfileCompletion(user, { paidTests = 0, consultations = 0 } = {}) {
  const profile = normalizeProfile(user?.profile);
  let score = 0;

  if (user?.name?.trim()) score += 8;
  if (user?.email || user?.phone) score += 8;

  for (const f of PROFILE_FIELDS) {
    if (String(profile[f.key] || '').trim()) score += f.weight;
  }

  score += Math.min(12, paidTests * 8);
  score += Math.min(8, consultations * 5);

  return Math.min(100, Math.round(score));
}

export function profileChecklist(user) {
  const profile = normalizeProfile(user?.profile);
  return PROFILE_FIELDS.map((f) => ({
    key: f.key,
    label: f.label,
    done: !!String(profile[f.key] || '').trim(),
  }));
}

export function isProfileIncomplete(user) {
  const profile = normalizeProfile(user?.profile);
  if (profile.setupComplete) return false;
  const core = ['classLevel', 'stream', 'city', 'careerGoal', 'dateOfBirth', 'whatsappNumber'];
  return core.some((k) => !String(profile[k] || '').trim());
}
