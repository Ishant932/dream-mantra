/** WhatsApp-friendly visual helpers (bold, emojis, unicode bars — no real GIF animation). */

export function sparkleBar() {
  return '✨ ━━━━━━━━━━━━━━━━━━━━ ✨';
}

export function fireBar() {
  return '🔥 ═══════════════════ 🔥';
}

export function banner(title, left = '🌟', right = '🌟') {
  return `${left} *${String(title).toUpperCase()}* ${right}`;
}

export function progressBar(percent, width = 10) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0));
  const filled = Math.round((p / 100) * width);
  return `${'▰'.repeat(filled)}${'▱'.repeat(width - filled)} ${p}%`;
}

export function cta(label, url) {
  return `👉 *${label}*\n🔗 ${url}`;
}

export function bullet(emoji, text) {
  return `${emoji} ${text}`;
}

export function priceTag(name, price, perk = '') {
  const perkLine = perk ? `\n   _${perk}_` : '';
  return `💎 *${name}* — *${price}*${perkLine}`;
}

export function miniPulse(...emojis) {
  return emojis.join('✨');
}
