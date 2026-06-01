import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Zap, RotateCcw, User } from 'lucide-react';
import { chatApi } from '../api';
import { useLang } from '../context/LanguageContext';

const QUICK_PROMPTS = {
  en: [
    'What is Mind Mapping?',
    'Tell me about PCM stream',
    'Why Career Counselling?',
    'Mind Mapping vs Skill Mapping',
    'Book free consultation',
    'What is AI Career Launchpad?',
    'Commerce career options',
    'Class 9-10 stream selection',
    '950+ careers — how to explore?',
    'Jaipur centre locations',
  ],
  hi: [
    'Mind Mapping क्या है?',
    'PCM stream के बारे में',
    'Career counselling क्यों?',
    'Mind Mapping vs Skill Mapping',
    'मुफ्त consultation',
    'AI Career Launchpad',
    'Commerce careers',
    'Class 9-10 stream',
    '950+ careers',
    'Jaipur location',
  ],
};

export default function AICornerPanel({ profile = {}, userName = 'there' }) {
  const { lang } = useLang();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    const ctx = profile.stream
      ? ` I see you're interested in ${profile.stream}${profile.classLevel ? ` (Class ${profile.classLevel})` : ''}.`
      : '';
    setMessages([
      {
        role: 'bot',
        text:
          lang === 'hi'
            ? `नमस्ते ${userName}! मैं Esh हूँ — Dream Mantra का AI career counsellor।${ctx} Streams, Mind Mapping, careers, programs, booking — कुछ भी पूछें!`
            : `Hi ${userName}! I'm Esh, your AI career counsellor at Dream Mantra.${ctx} Ask about streams, Mind Mapping, careers, programs, booking — anything!`,
      },
    ]);
  }, [lang, userName, profile.stream, profile.classLevel]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMsg = text.trim();
    if (!userMsg || loading) return;

    const enriched =
      profile.stream || profile.classLevel || profile.careerGoal
        ? `[User profile: class=${profile.classLevel || 'N/A'}, stream=${profile.stream || 'N/A'}, goal=${profile.careerGoal || 'N/A'}]\n${userMsg}`
        : userMsg;

    const newMessages = [...messages, { role: 'user', text: userMsg }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const history = newMessages
      .filter((m) => m.role === 'user' || m.role === 'bot')
      .slice(-10)
      .map((m) => ({ role: m.role, text: m.text }));

    try {
      const { reply } = await chatApi.message(enriched, lang, history);
      setMessages((m) => [...m, { role: 'bot', text: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'bot',
          text: lang === 'hi' ? 'क्षमा करें, पुनः प्रयास करें या 9680102276 पर कॉल करें।' : 'Sorry, please try again or call 9680102276.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const prompts = QUICK_PROMPTS[lang] || QUICK_PROMPTS.en;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="infigon-card p-6 bg-gradient-to-br from-amber-600 via-orange-600 to-orange-700 text-amber-50 overflow-hidden relative"
      >
        <motion.div
          animate={{ x: ['-20%', '120%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[var(--bg-elevated)]/10 to-transparent skew-x-12"
        />
        <div className="relative flex items-start gap-4">
          <motion.span
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-14 h-14 rounded-2xl bg-[var(--bg-elevated)]/20 backdrop-blur flex items-center justify-center shrink-0"
          >
            <Zap className="w-7 h-7 text-amber-300" />
          </motion.span>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              AI Corner <Sparkles className="w-5 h-5 text-amber-300" />
            </h2>
            <p className="text-amber-100 mt-1 text-sm">
              Full-powered Esh AI — streams, Mind Mapping, careers, programs, booking &amp; more. Same intelligence as our site chatbot.
            </p>
            {profile.stream && (
              <span className="inline-flex items-center gap-1 mt-2 text-xs bg-[var(--bg-elevated)]/15 px-3 py-1 rounded-full">
                <User className="w-3 h-3" /> Profile: {profile.stream}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      <div className="infigon-card overflow-hidden flex flex-col min-h-[480px] max-h-[min(640px,70vh)]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-amber-50/50 to-[var(--bg-base)] dark:from-[var(--bg-muted)] dark:to-[var(--bg-base)] min-h-[320px]">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-amber-600 text-amber-50 rounded-br-md'
                      : 'bg-[var(--bg-elevated)] border border-amber-100 dark:border-[rgba(201,168,76,0.22)] text-sand-700 dark:text-[var(--text-body)] rounded-bl-md shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex items-center gap-2 text-amber-500 text-sm px-2">
              <span className="flex gap-1">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0.3s]" />
              </span>
              Esh is thinking...
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="p-3 border-t border-amber-100 dark:border-[rgba(201,168,76,0.22)] bg-[var(--bg-elevated)]">
          <div className="flex flex-wrap gap-2 mb-3 max-h-24 overflow-y-auto">
            {prompts.map((p) => (
              <motion.button
                key={p}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => sendMessage(p)}
                disabled={loading}
                className="text-xs px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700 hover:bg-amber-100 transition disabled:opacity-50"
              >
                {p}
              </motion.button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={lang === 'hi' ? 'कुछ भी पूछें — stream, Mind Mapping, career...' : 'Ask anything — streams, Mind Mapping, careers, booking...'}
              className="flex-1 input-field !py-2.5 !text-sm !rounded-xl"
            />
            <motion.button
              type="submit"
              disabled={loading || !input.trim()}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 text-amber-50 disabled:opacity-50 shadow-lg"
            >
              <Send className="w-5 h-5" />
            </motion.button>
            <button
              type="button"
              onClick={() => setMessages(messages.slice(0, 1))}
              className="p-3 rounded-xl border border-sand-200 text-sand-500 hover:text-amber-600 transition"
              title="Clear chat"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
