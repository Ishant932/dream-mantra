/** Class 11+ stream options — after 10th / 11th subject selection */
export const CLASS_11_STREAMS = [
  { value: 'PCM', label: 'Science (PCM)', shortLabel: 'PCM' },
  { value: 'PCB', label: 'Science (PCB)', shortLabel: 'PCB' },
  { value: 'PCMB', label: 'Science (PCMB)', shortLabel: 'PCMB' },
  { value: 'Commerce', label: 'Commerce', shortLabel: 'Commerce' },
  { value: 'Arts', label: 'Humanities / Arts', shortLabel: 'Arts' },
  { value: 'Vocational', label: 'Vocational', shortLabel: 'Vocational' },
];

export const CLASS_11_STREAM_VALUES = CLASS_11_STREAMS.map((s) => s.value);

/** Map profile stream text → career library filter value */
export function profileStreamToFilter(profileStream) {
  if (!profileStream) return null;
  const s = String(profileStream).toLowerCase();
  if (s.includes('pcm') && s.includes('pcb')) return 'PCMB';
  if (s.includes('pcb')) return 'PCB';
  if (s.includes('pcm')) return 'PCM';
  if (s.includes('commerce')) return 'Commerce';
  if (s.includes('arts') || s.includes('humanities')) return 'Arts';
  if (s.includes('vocational')) return 'Vocational';
  if (s.includes('technology') || s.includes(' it')) return 'PCM';
  return null;
}

const PCM_CATS = new Set(['Engineering & Technology']);
const PCB_CATS = new Set(['Medical & Healthcare']);
const COMMERCE_CATS = new Set(['Commerce & Finance', 'Business & Management']);
const ARTS_CATS = new Set(['Arts & Humanities', 'Design & Creative', 'Media & Communication']);

/** Categories where careers are typically open regardless of 11th stream */
const VOCATIONAL_CATEGORIES = new Set([
  'Trades & Vocational',
  'Sports & Fitness',
  'Education & Training',
  'Hospitality & Tourism',
  'Defence & Security',
  'Law & Public Service',
  'Media & Communication',
  'Design & Creative',
  'Arts & Humanities',
]);

function blob(career) {
  return [
    career.title,
    career.category,
    career.shortDescription,
    ...(career.exams || []),
    ...(career.skills || []),
  ]
    .join(' ')
    .toLowerCase();
}

function isVocationalCareer(category, legacyStream = []) {
  if (VOCATIONAL_CATEGORIES.has(category)) return true;
  if (legacyStream.includes('Any')) return true;
  return false;
}

/** Resolve class streams for a career record (used when generating data). */
export function resolveClassStreams(category, title, legacyStream = []) {
  const t = (title || '').toLowerCase();
  const out = new Set();

  if (PCM_CATS.has(category)) out.add('PCM');
  if (PCB_CATS.has(category)) out.add('PCB');
  if (COMMERCE_CATS.has(category)) out.add('Commerce');
  if (ARTS_CATS.has(category)) out.add('Arts');

  if (category === 'Science & Research') {
    if (/bio|micro|genetic|zoolog|botany|ecolog|marine|immun|virol|food sci/.test(t)) out.add('PCB');
    else out.add('PCM');
  }

  if (category === 'IT & Digital') {
    out.add('PCM');
    out.add('Commerce');
    if (legacyStream.includes('Any')) out.add('Arts');
  }

  if (category === 'Emerging & Future Careers') {
    out.add('PCM');
    out.add('Commerce');
    if (/bio|health|medical/.test(t)) out.add('PCB');
    if (legacyStream.includes('Any')) out.add('Arts');
  }

  if (category === 'Agriculture & Environment') {
    if (/engineer|technologist/.test(t)) out.add('PCM');
    else {
      out.add('PCB');
      out.add('PCM');
    }
    if (legacyStream.includes('Any')) out.add('Commerce');
  }

  if (category === 'Law & Public Service') {
    out.add('Arts');
    out.add('Commerce');
  }

  if (category === 'Hospitality & Tourism') {
    out.add('Commerce');
    out.add('Arts');
    out.add('PCM');
    out.add('PCB');
  }

  if (category === 'Defence & Security') {
    out.add('PCM');
    out.add('PCB');
    out.add('Arts');
    out.add('Commerce');
  }

  if (category === 'Sports & Fitness' || category === 'Education & Training' || category === 'Trades & Vocational') {
    ['PCM', 'PCB', 'Commerce', 'Arts'].forEach((s) => out.add(s));
  }

  if (/\b(doctor|mbbs|dentist|nurse|pharm|medical|neet|surgeon|vet|physio|clinical|patholog)\b/.test(t)) out.add('PCB');
  if (/engineer|software|developer|architect|jee|b\.tech|data sc|machine learning/.test(t)) out.add('PCM');
  if (/chartered|accountant|finance|bank|bcom|bba|ca |commerce/.test(t)) out.add('Commerce');
  if (/journalist|designer|artist|writer|media|humanities|fashion|graphic|animation/.test(t)) out.add('Arts');

  if (legacyStream.includes('Commerce')) out.add('Commerce');
  if (legacyStream.includes('Arts')) out.add('Arts');
  if (legacyStream.includes('Science') && !out.size) out.add('PCM');

  if (isVocationalCareer(category, legacyStream)) {
    out.add('Vocational');
  }

  if (out.size === 0) out.add('PCM');

  if (out.has('PCM') && out.has('PCB')) out.add('PCMB');

  return [...out];
}

function hasClassStreamTag(tags, streamFilter) {
  if (!Array.isArray(tags) || !tags.length) return false;
  if (streamFilter === 'Vocational') return tags.includes('Vocational');
  if (streamFilter === 'PCMB') {
    return tags.includes('PCMB') || (tags.includes('PCM') && tags.includes('PCB'));
  }
  if (tags.includes(streamFilter)) return true;
  if (tags.includes('PCMB') && (streamFilter === 'PCM' || streamFilter === 'PCB')) return true;
  return false;
}

/** Filter match — prefers classStreams on record, falls back to heuristics. */
export function matchesClassStream(career, streamFilter) {
  if (!streamFilter || streamFilter === 'all') return true;

  if (streamFilter === 'Arts' && career.category === 'Engineering & Technology') {
    const tags = career.classStreams;
    return Array.isArray(tags) && tags.includes('Arts');
  }

  const tags = career.classStreams;
  if (Array.isArray(tags) && tags.length) {
    return hasClassStreamTag(tags, streamFilter);
  }

  return matchesClassStreamHeuristic(career, streamFilter);
}

function matchesClassStreamHeuristic(career, stream) {
  const cat = career.category || '';
  const legacy = career.stream || [];
  const b = blob(career);

  if (stream === 'Vocational') {
    return isVocationalCareer(cat, legacy);
  }

  if (stream === 'PCMB') {
    return matchesClassStreamHeuristic(career, 'PCM') || matchesClassStreamHeuristic(career, 'PCB');
  }

  switch (stream) {
    case 'PCM':
      if (PCM_CATS.has(cat)) return true;
      if (PCB_CATS.has(cat)) return false;
      if (cat === 'IT & Digital') return true;
      if (cat === 'Science & Research' && !/bio|micro|genetic|zoolog|botany|medical/.test(b)) return true;
      return /engineer|software|developer|architect|jee|bitsat|b\.tech|mechanical|electrical|civil|aerospace|robotics|data sc|machine learning/.test(b);
    case 'PCB':
      if (PCB_CATS.has(cat)) return true;
      if (cat === 'Science & Research' && /bio|micro|genetic|zoolog|botany|ecolog|marine|immun|virol/.test(b)) return true;
      return /doctor|mbbs|dentist|nurse|pharm|medical|neet|surgeon|vet |physio|nutrition|clinical|biotech|microbio/.test(b);
    case 'Commerce':
      if (COMMERCE_CATS.has(cat)) return true;
      if (legacy.includes('Commerce')) return true;
      return /chartered|accountant|finance|bank|commerce|bcom|bba|investment|stock|audit|tax |economist|marketing manager|business development|hr manager/.test(b);
    case 'Arts':
      if (ARTS_CATS.has(cat)) return true;
      if (cat === 'Law & Public Service') return true;
      if (legacy.includes('Arts')) return true;
      return /journalist|designer|artist|writer|editor|media|communication|humanities|history|sociolog|political|philosopher|translator|social work|fashion|interior|graphic|animation|film|music|psycholog/.test(b);
    default:
      return true;
  }
}
