/** Class 11+ stream filter — sync with client/src/utils/careerStreams.js */

export const CLASS_11_STREAM_VALUES = ['PCM', 'PCB', 'PCMB', 'Commerce', 'Arts', 'Vocational'];

const PCM_CATS = new Set(['Engineering & Technology']);
const PCB_CATS = new Set(['Medical & Healthcare']);
const COMMERCE_CATS = new Set(['Commerce & Finance', 'Business & Management']);
const ARTS_CATS = new Set(['Arts & Humanities', 'Design & Creative', 'Media & Communication']);

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
  return [career.title, career.category, career.shortDescription, ...(career.exams || []), ...(career.skills || [])]
    .join(' ')
    .toLowerCase();
}

function isVocationalCareer(category, legacyStream = []) {
  if (VOCATIONAL_CATEGORIES.has(category)) return true;
  if (legacyStream.includes('Any')) return true;
  return false;
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

  const cat = career.category || '';
  const legacy = career.stream || [];
  const b = blob(career);

  if (streamFilter === 'Vocational') {
    return isVocationalCareer(cat, legacy);
  }

  if (streamFilter === 'PCMB') {
    return matchesClassStream(career, 'PCM') || matchesClassStream(career, 'PCB');
  }

  switch (streamFilter) {
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
