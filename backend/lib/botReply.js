import {
  detectStreamFromMessage,
  buildStreamReply,
} from './streamKnowledge.js';
import { SITE_CONTEXT, DREAMZ_KNOWLEDGE, matchDreamzKnowledge } from './dreamzKnowledge.js';
import { matchExactQA, matchKeywordKnowledgeImproved } from './botKnowledge.js';
import { formatBotReply } from './formatBotReply.js';
import { searchSiteKnowledge, buildGeminiSiteContext } from './siteContentKnowledge.js';

export const BOT_KNOWLEDGE = [
  ...DREAMZ_KNOWLEDGE,
  { keys: ['career readiness', 'readiness program', 'personalised career readiness', 'personalized career readiness', 'pcrp'], en: 'See full Personalised Career Readiness Program details — ask "What is Career Readiness Program?" or visit dreammantra.in/crp?tab=readiness', hi: 'Career Readiness Program — dreammantra.in/crp?tab=readiness | ₹2999' },
  { keys: ['ai career launchpad', 'career launchpad', 'launchpad'], en: '**AI Career Launchpad** — 5 sessions. ₹1,499 | /crp?tab=launchpad | 9680102276', hi: 'AI Career Launchpad — /crp?tab=launchpad' },
  { keys: ['cost', 'price', 'fees', '1999', '699', '2999'], en: 'Brain Mapping ₹1,999 | Skill Mapping ₹699 | Combo ₹2,999 | Launchpad ₹1,499. Dashboard → Book Now.', hi: 'Brain Mapping ₹1999, Skill Mapping ₹699, Combo ₹2999.' },
  { keys: ['dashboard', 'book now', 'modules'], en: 'Dashboard: Book Now, Counselling, Training & Placement, Support, Career Library. dreammantra.in/dashboard', hi: 'Dashboard: Book Now, Counselling, Training.' },
  { keys: ['what is dmit', 'dmit kya', 'brain mapping'], en: '**Brain Mapping** — fingerprint inborn talent analysis. ₹1,999 | /counselling?tab=dmit | 9680102276', hi: 'Brain Mapping — fingerprint analysis' },
  { keys: ['skill mapping', 'psychometric', 'career interest'], en: 'Skill Mapping: 7 assessments from ₹699 | /counselling?tab=psychometric', hi: 'Skill Mapping — 7 assessments' },
  { keys: ['contact', 'phone', '9680102276'], en: '📞 9680102276 | info@dreammantra.in | Mon-Sat 11am-7pm', hi: '9680102276 | info@dreammantra.in' },
  { keys: ['payment', 'pending payment', 'pay'], en: 'Pay from Dashboard → Book Now. Razorpay or UPI proof.', hi: 'Book Now से pay करें।' },
  { keys: ['book', 'consultation', 'slot'], en: 'Book counselling: Dashboard → Counselling after payment. 9680102276', hi: 'Payment के बाद Counselling tab' },
];

function getLocalReply(message, lang) {
  const trimmed = message.trim();
  const exact = matchExactQA(trimmed, lang);
  if (exact) return { reply: exact, source: 'exact-qa' };

  const siteHit = searchSiteKnowledge(trimmed, lang);
  if (siteHit?.reply) return { reply: siteHit.reply, source: siteHit.source };

  const streamMatch = detectStreamFromMessage(trimmed);
  if (streamMatch) {
    const streamReply = buildStreamReply(streamMatch, lang, { includeGreeting: true });
    if (streamReply) return { reply: streamReply, source: 'stream-knowledge' };
  }

  const keywordMatch = matchKeywordKnowledgeImproved(trimmed, BOT_KNOWLEDGE, lang);
  if (keywordMatch) return { reply: keywordMatch, source: 'knowledge' };

  const dreamzMatch = matchDreamzKnowledge(trimmed, lang);
  if (dreamzMatch) return { reply: dreamzMatch, source: 'dreamz-knowledge' };

  const text = trimmed.toLowerCase().replace(/[^\w\s@.?]/g, ' ');
  if (/hello|hi|hey|namaste|नमस्ते/.test(text)) {
    return {
      reply: lang === 'hi'
        ? 'नमस्ते! मैं एश, Dream Mantra की AI counsellor। Brain Mapping, Skill Mapping, careers — पूछें!'
        : "Hello! I'm Esh, Dream Mantra's AI counsellor. Ask about modules, pricing, booking, or careers!",
      source: 'greeting',
    };
  }
  return null;
}

async function askGemini(message, history, lang) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const langNote = lang === 'hi' ? 'Respond in Hindi (Devanagari).' : 'Respond in English.';
  const contents = [];
  for (const h of (history || []).slice(-8)) {
    contents.push({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }],
    });
  }
  contents.push({
    role: 'user',
    parts: [{ text: `${langNote}\n\nUser question: ${message}` }],
  });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${SITE_CONTEXT}\n\n${buildGeminiSiteContext()}` }] },
        contents,
        generationConfig: { temperature: 0.3, maxOutputTokens: 1200, topP: 0.9 },
      }),
    }
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

const FALLBACK_EN = `I'm Esh, Dream Mantra's AI counsellor.

• Brain Mapping ₹1,999 | Skill Mapping ₹699 | Combo ₹2,999
• AI Career Launchpad ₹1,499 | Personalised Career Readiness Program ₹2,999
• Dashboard — dreammantra.in/dashboard
• Career Readiness — dreammantra.in/crp?tab=readiness (8 sessions + 2 mock interviews)

Reply MENU for quick options | HELP for human support
Call 9680102276 | Mon–Sat 11am–7pm`;

const FALLBACK_HI = `मैं एश, Dream Mantra की AI counsellor।

• कीमत — Brain Mapping ₹1999, Skill Mapping ₹699, Combo ₹2999
• Dashboard — dreammantra.in/dashboard
• MENU — विकल्प | HELP — सपोर्ट

कॉल: 9680102276`;

/** Shared Esh reply for web chatbot and WhatsApp */
export async function getBotReply(message, { lang = 'en', history = [] } = {}) {
  const trimmed = String(message || '').trim();
  if (!trimmed) {
    return { reply: lang === 'hi' ? 'कृपया अपना सवाल लिखें।' : 'Please type your question.', source: 'empty' };
  }

  let reply = null;
  let source = 'fallback';

  const local = getLocalReply(trimmed, lang);
  if (local) {
    reply = local.reply;
    source = local.source;
  }

  if (!reply) {
    try {
      reply = await askGemini(trimmed, history, lang);
      if (reply) source = 'gemini';
    } catch {
      /* ignore */
    }
  }

  if (!reply) {
    const retry = matchKeywordKnowledgeImproved(trimmed, BOT_KNOWLEDGE, lang);
    if (retry) {
      reply = retry;
      source = 'knowledge-retry';
    }
  }

  if (!reply) {
    reply = lang === 'hi' ? FALLBACK_HI : FALLBACK_EN;
    source = 'fallback';
  }

  return {
    reply: formatBotReply(reply),
    source,
    botName: 'Esh',
  };
}
