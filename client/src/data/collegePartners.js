/** College & university partners shown in the home marquee strip */
export const COLLEGE_PARTNERS = [
  { id: 'manipal', name: 'Manipal University', domain: 'manipal.edu', symbol: '🏛️' },
  { id: 'amity', name: 'Amity University', domain: 'amity.edu', symbol: '🎓' },
  { id: 'bits', name: 'BITS Pilani', domain: 'bits-pilani.ac.in', symbol: '⚙️' },
  { id: 'christ', name: 'Christ University', domain: 'christuniversity.in', symbol: '📚' },
  { id: 'symbiosis', name: 'Symbiosis International', domain: 'siu.edu.in', symbol: '🌐' },
  { id: 'lpu', name: 'LPU Punjab', domain: 'lpu.in', symbol: '🦁' },
  { id: 'nmims', name: 'NMIMS Mumbai', domain: 'nmims.edu', symbol: '💼' },
  { id: 'poornima', name: 'Poornima University Jaipur', domain: 'poornima.edu.in', symbol: '🏗️' },
  { id: 'jnu-jaipur', name: 'Jaipur National University', domain: 'jnujaipur.ac.in', symbol: '🎯' },
  { id: 'maharaja', name: 'Maharaja College Jaipur', domain: 'univraj.org', symbol: '👑' },
  { id: 'xaviers', name: "St. Xavier's Jaipur", domain: 'stxaviersjaipur.org', symbol: '✨' },
  { id: 'pan-india', name: 'Pan-India Online', domain: 'dreammantra.in', symbol: '🇮🇳' },
];

/** Official site favicon via Google (falls back to emoji in UI). */
export function collegeLogoUrl(domain) {
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

export const partnerNames = COLLEGE_PARTNERS.map((p) => p.name);
