/**
 * Normalize bot replies for plain-text chat UI (consistent sections, no markdown asterisks).
 */
export function formatBotReply(text) {
  if (!text || typeof text !== 'string') return '';

  let s = text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_\n]+)_/g, '$1');

  s = s
    .split('\n')
    .map((line) =>
      line
        .replace(/^\s*[-*]\s+/, '• ')
        .replace(/^\s*(\d+)️⃣\s*/, '$1. ')
        .replace(/^\s*(\d+)\.\s*/, '$1. ')
        .replace(/\s+$/u, '')
    )
    .join('\n');

  // Collapse excessive blank lines; keep section breaks after ALL-CAPS headers
  s = s.replace(/\n{3,}/g, '\n\n').trim();

  return s;
}
