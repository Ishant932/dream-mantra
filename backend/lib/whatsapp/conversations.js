import { getData, saveData, repo } from '../database.js';
import { normalizeProfile } from '../profile.js';
import { getBotReply } from '../botReply.js';
import { sendTextMessage } from './client.js';
import { findUserByWhatsAppId, fromWhatsAppId } from './phone.js';
import { getWhatsAppPublicConfig, isWhatsAppEnabled, siteUrl } from './config.js';
import { messageCatalog, supportLine } from './catalog.js';
import { banner, bullet, cta, miniPulse, sparkleBar } from './format.js';
import { processOutbox } from './outbox.js';

function ensureConvos() {
  const data = getData();
  if (!data.whatsapp_conversations) data.whatsapp_conversations = [];
}

function upsertConversation(waId, patch) {
  ensureConvos();
  const data = getData();
  const phone = String(waId).replace(/\D/g, '');
  let row = data.whatsapp_conversations.find((c) => c.phone === phone);
  const now = new Date().toISOString();

  if (!row) {
    row = {
      phone,
      user_id: null,
      flow: 'idle',
      flow_step: 0,
      lang: 'en',
      opt_in: false,
      greeted: false,
      sandbox_joined: false,
      history: [],
      last_inbound_at: null,
      last_outbound_at: null,
      created_at: now,
    };
    data.whatsapp_conversations.push(row);
  }

  Object.assign(row, patch, { updated_at: now });
  saveData();
  return row;
}

function pushHistory(convo, role, text) {
  const history = Array.isArray(convo.history) ? convo.history : [];
  history.push({ role, text: String(text).slice(0, 500), at: new Date().toISOString() });
  convo.history = history.slice(-12);
}

function sandboxJoinPhrase() {
  const { sandboxJoinCode } = getWhatsAppPublicConfig();
  const code = (sandboxJoinCode || 'dream-mantra').trim();
  return /^join\s+/i.test(code) ? code : `join ${code}`;
}

function isSandboxJoinMessage(text) {
  const trimmed = text.trim();
  const upper = trimmed.toUpperCase();
  if (!upper.startsWith('JOIN ')) return false;

  const phrase = sandboxJoinPhrase();
  const normalized = trimmed.toLowerCase().replace(/\s+/g, ' ');
  const expected = phrase.toLowerCase().replace(/\s+/g, ' ');

  if (normalized === expected) return true;
  if (/join\s+dream[\s-]?mantra/i.test(trimmed)) return true;
  if (/join\s+atomic/i.test(trimmed)) return true;
  return false;
}

function menuReply(lang) {
  const base = siteUrl();
  if (lang === 'hi') {
    return `${sparkleBar()}
${banner('Dream Mantra Menu', '📋', '✨')}

1️⃣ 💎 Modules & pricing
2️⃣ 📅 Counselling book करें
3️⃣ 🏠 Dashboard — ${base}/dashboard
4️⃣ 💼 Careers — ${base}/careers

सवाल लिखें या *HELP* भेजें 🙌`;
  }
  return `${sparkleBar()}
${banner('Dream Mantra Menu', '📋', '✨')}

1️⃣ 💎 Modules & pricing
2️⃣ 📅 Book counselling
3️⃣ 🏠 Dashboard — ${base}/dashboard
4️⃣ 💼 Explore careers — ${base}/careers

Ask me anything, or type *HELP* for support ${miniPulse('🚀', '💬')}`;
}

function helpReply(lang) {
  const base = siteUrl();
  if (lang === 'hi') {
    return `${banner('सहायता', '🆘', '✨')}
${bullet('📧', supportLine())}
${bullet('📞', '9680102276')}
${bullet('🌐', `${base}/contact`)}
${bullet('🕐', 'Mon–Sat 11am–7pm IST')}

${cta('Contact form', `${base}/contact`)}`;
  }
  return `${banner('Dream Mantra Support', '🆘', '✨')}
${bullet('📧', supportLine())}
${bullet('📞', '9680102276')}
${bullet('🌐', `${base}/contact`)}
${bullet('🕐', 'Mon–Sat 11am–7pm IST')}

${cta('Get help — contact us', `${base}/contact`)}
Reply *MENU* to jump back 🚀`;
}

function idReply(user, lang) {
  const base = siteUrl();
  if (!user?.user_uid) {
    return lang === 'hi'
      ? `${banner('Account नहीं मिला', '🔐', '✨')}\n\n${cta('Sign up free', `${base}/signup`)}`
      : `${banner('No account yet', '🔐', '✨')}\n\n${cta('Create free account', `${base}/signup`)}`;
  }
  return lang === 'hi'
    ? `${sparkleBar()}\n🆔 *Dreams ID:* \`${user.user_uid}\`\n\n${cta('Login', `${base}/login`)}`
    : `${sparkleBar()}\n🆔 *Your Dreams ID:* \`${user.user_uid}\`\n\n${cta('Open dashboard', `${base}/dashboard`)}\n${cta('Login', `${base}/login`)}`;
}

function menuSelection(num, user, lang) {
  const base = siteUrl();
  switch (num) {
    case '1':
      return lang === 'hi'
        ? `${banner('Modules & Pricing', '💎', '🔥')}\n\n${bullet('🧠', 'Brain Mapping — ₹1,999')}\n${bullet('🎯', 'Skill Mapping — ₹699')}\n${bullet('💎', 'Combo + Counselling — ₹2,999')}\n${bullet('🤖', 'AI Career Launchpad — ₹1,499')}\n\n${cta('खरीदें', `${base}/dashboard?tab=assess`)}`
        : `${banner('Modules & Pricing', '💎', '🔥')}\n\n${bullet('🧠', 'Brain Mapping — ₹1,999 (fingerprint talent mapping)')}\n${bullet('🎯', 'Skill Mapping — ₹699 (personality + career fit)')}\n${bullet('💎', 'Combo + Counselling — ₹2,999 (best value)')}\n${bullet('🤖', 'AI Career Launchpad — ₹1,499 (community access)')}\n\n${cta('Browse & pay', `${base}/dashboard?tab=assess`)}\n${cta('All programs', `${base}/programs`)}`;
    case '2':
      return lang === 'hi'
        ? `${banner('Counselling', '📅', '✨')}\n\nPayment confirm के बाद Book tab से बुक करें:\n${cta('Book session', `${base}/dashboard?tab=counselling`)}`
        : `${banner('Book Counselling', '📅', '✨')}\n\n${bullet('1️⃣', 'Confirm payment on dashboard')}\n${bullet('2️⃣', 'Complete profile + required tests')}\n${bullet('3️⃣', 'Dashboard → Counselling → pick slot')}\n\n${cta('Book now', `${base}/dashboard?tab=counselling`)}`;
    case '3':
      return idReply(user, lang);
    case '4':
      return helpReply(lang);
    default:
      return null;
  }
}

async function buildReply(text, user, convo) {
  const trimmed = text.trim();
  const upper = trimmed.toUpperCase();
  const lang = convo.lang || 'en';

  if (upper === 'MENU' || upper === 'MENÚ' || upper === 'START') return menuReply(lang);
  if (upper === 'HELP' || upper === 'SUPPORT') return helpReply(lang);
  if (upper === 'ID' || upper === 'MY ID' || upper === 'DREAMS ID') return idReply(user, lang);

  if (/^[1-4]$/.test(trimmed)) {
    const picked = menuSelection(trimmed, user, lang);
    if (picked) return picked;
  }

  if (/hindi|हिंदी/.test(trimmed.toLowerCase())) {
    convo.lang = 'hi';
  }

  const { reply } = await getBotReply(trimmed, {
    lang: convo.lang,
    history: (convo.history || []).map((h) => ({ role: h.role, text: h.text })),
  });
  return reply;
}

export async function handleInboundMessage({ from, text, messageId }) {
  if (!from || !text?.trim()) return { ok: false, reason: 'empty' };

  const waId = String(from).replace(/\D/g, '');
  const user = findUserByWhatsAppId(waId);
  const convo = upsertConversation(waId, {
    user_id: user?.id || null,
    opt_in: true,
    last_inbound_at: new Date().toISOString(),
  });

  pushHistory(convo, 'user', text);

  const waConfig = getWhatsAppPublicConfig();
  const joinPhrase = sandboxJoinPhrase();
  const isJoin = isSandboxJoinMessage(text);

  if (waConfig.sandbox && !convo.sandbox_joined && !isJoin) {
    const prompt = messageCatalog('sandbox_join_prompt', user || { name: 'there' }, { joinPhrase });
    if (prompt) {
      pushHistory(convo, 'assistant', prompt);
      convo.last_outbound_at = new Date().toISOString();
      saveData();
      if (isWhatsAppEnabled()) {
        try {
          await sendTextMessage(waId, prompt);
        } catch (err) {
          console.error('[whatsapp] sandbox join prompt failed:', err.message);
          return { ok: false, reason: err.message, reply: prompt };
        }
      }
      return { ok: true, reply: prompt, userId: user?.id || null, messageId, sandboxGate: true };
    }
  }

  if (isJoin) {
    convo.sandbox_joined = true;
    convo.greeted = true;
  }

  if (user) {
    const profile = normalizeProfile(user.profile);
    if (!profile.whatsappOptIn) {
      repo.updateUser(user.id, {
        profile: { ...profile, whatsappOptIn: true },
      });
    }
    try {
      await processOutbox({ limit: 30, userId: user.id });
    } catch (err) {
      console.error('[whatsapp] outbox flush on inbound failed:', err.message);
    }
  }

  const replies = [];

  if (!convo.greeted && !isJoin) {
    convo.greeted = true;
    const welcome = messageCatalog('chat_welcome', user || { name: 'there' });
    if (welcome) replies.push(welcome);
  }

  let replyText = null;
  if (!isJoin) {
    try {
      replyText = await buildReply(text, user, convo);
    } catch (err) {
      console.error('[whatsapp] reply error:', err.message);
      replyText = `Oops — hit a snag 😅\n\nReply *MENU* for options or *HELP* for our team (9680102276).`;
    }
  } else {
    replyText = messageCatalog('registration_success', user || { name: 'there' })
      || messageCatalog('chat_welcome', user || { name: 'there' })
      || null;
  }

  if (replyText) replies.push(replyText);
  const fullReply = replies.filter(Boolean).join('\n\n');

  if (fullReply) {
    pushHistory(convo, 'assistant', fullReply);
  }
  convo.last_outbound_at = new Date().toISOString();
  saveData();

  if (fullReply && isWhatsAppEnabled()) {
    try {
      await sendTextMessage(waId, fullReply);
    } catch (err) {
      console.error('[whatsapp] outbound reply failed:', err.message);
      return { ok: false, reason: err.message, reply: fullReply };
    }
  } else if (!isWhatsAppEnabled()) {
    console.log('[whatsapp] dev inbound:', fromWhatsAppId(waId), text.slice(0, 80));
  }

  return { ok: true, reply: fullReply, userId: user?.id || null, messageId };
}

export function markOptIn(userId, waId) {
  return upsertConversation(waId, { user_id: Number(userId), opt_in: true, sandbox_joined: true });
}
