import {
  detectStreamFromMessage,
  buildStreamReply,
} from './streamKnowledge.js';
import { SITE_CONTEXT, DREAMZ_KNOWLEDGE, matchDreamzKnowledge } from './dreamzKnowledge.js';
import { matchExactQA, matchKeywordKnowledgeImproved } from './botKnowledge.js';
import { formatBotReply } from './formatBotReply.js';

export const BOT_KNOWLEDGE = [
  ...DREAMZ_KNOWLEDGE,
  { keys: ['ai career launchpad', 'career launchpad', 'launchpad', 'crp'], en: '**AI Career Launchpad** — 5 sessions for Class 12+, college & freshers. LinkedIn, resume, interviews. ₹1,499 | dreammantra.in/crp | 9680102276', hi: 'AI Career Launchpad — Class 12+ के लिए। /crp | 9680102276' },
  { keys: ['what is dmit', 'dmit kya', 'brain mapping'], en: '**Brain Mapping** maps inborn potential via fingerprint analysis. ₹1,999 | dreammantra.in/assessments/dmit | 9680102276', hi: 'Brain Mapping — fingerprint analysis। /assessments/dmit' },
  { keys: ['skill mapping', 'mbti', 'disc', 'riasec'], en: 'Skill Mapping: MBTI, DISC, RIASEC, Big 5, VAK. ₹699 | /assessments/psychometric', hi: 'Skill Mapping: MBTI, DISC, RIASEC।' },
  { keys: ['contact', 'phone', '9680102276'], en: '📞 9680102276 | info@dreammantra.in | Mon-Sat 11am-7pm | Jaipur & Pan-India online', hi: '9680102276 | info@dreammantra.in' },
  { keys: ['book', 'consultation', 'slot'], en: 'Book counselling after payment: Dashboard → Book tab. dreammantra.in/dashboard?tab=book | 9680102276', hi: 'Payment confirm के बाद Book tab। /dashboard?tab=book' },
  { keys: ['cost', 'price', 'fees', '1999', '699', '2999'], en: 'Brain Mapping ₹1,999 | Skill Mapping ₹699 | Combo ₹2,999 | CRP ₹1,499. Dashboard → Modules.', hi: 'Brain Mapping ₹1999, Skill Mapping ₹699, Combo ₹2999।' },
  { keys: ['dashboard', 'modules'], en: 'Dashboard: dreammantra.in/dashboard — Modules, Book, Take test, Reports, Careers.', hi: 'Dashboard: Modules, Book, Take test। dreammantra.in/dashboard' },
  { keys: ['payment', 'pending payment', 'pay'], en: 'Pay from Dashboard → Modules. Razorpay online or upload UPI proof. Pending until confirmed.', hi: 'Modules से pay करें।' },
];

function getLocalReply(message, lang) {
  const trimmed = message.trim();
  const exact = matchExactQA(trimmed, lang);
  if (exact) return { reply: exact, source: 'exact-qa' };

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
        systemInstruction: { parts: [{ text: SITE_CONTEXT }] },
        contents,
        generationConfig: { temperature: 0.3, maxOutputTokens: 800, topP: 0.9 },
      }),
    }
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
}

const FALLBACK_EN = `I'm Esh, Dream Mantra's AI counsellor.

• Pricing — Brain Mapping ₹1,999 | Skill Mapping ₹699 | Combo ₹2,999 | CRP ₹1,499
• Dashboard — dreammantra.in/dashboard
• Book counselling — after payment confirmed
• Reply MENU for quick options | HELP for human support

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
