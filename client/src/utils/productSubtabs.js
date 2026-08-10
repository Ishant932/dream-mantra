/** Product-specific dashboard subtabs */

export function getCounsellingSubtabs(focus) {
  const journey = { id: 'journey', label: 'Your Journey', lock: true };
  const profile = { id: 'profile', label: 'Profile', lock: true };
  const takeTest = { id: 'take-test', label: 'Take test', lock: true };
  const counselling = { id: 'counselling', label: 'Counselling', lock: true };
  const report = { id: 'report', label: 'Report', lock: true };
  if (focus === 'brain') return [journey, profile, counselling, report];
  if (focus === 'skill') return [journey, profile, takeTest, report];
  if (focus === 'combo') return [journey, profile, takeTest, counselling, report];
  return [journey, counselling, report];
}

export function getTrainingSubtabs(focus) {
  const journey = { id: 'journey', label: 'Your Journey', lock: true };
  const community = { id: 'community', label: 'Community links', lock: true };
  const schedule = { id: 'schedule', label: 'Schedule your Session', lock: true };
  const resources = { id: 'resources', label: 'Resources', lock: true };
  const cv = { id: 'cv', label: 'CV Maker', lock: true };
  if (focus === 'launchpad') return [journey, community, resources, cv];
  if (focus === 'readiness') return [journey, schedule, resources, cv];
  return [journey, resources, cv];
}
