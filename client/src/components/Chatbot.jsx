import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { chatApi } from '../api';
import { useLang } from '../context/LanguageContext';
import { formatBotReply } from '../utils/formatBotReply';

const BOT_NAME = 'Esh';

const STREAM_PROMPTS = {
  en: [
    'Tell me about PCM stream',
    'What is Mind Mapping?',
    'Why Career Counselling?',
    'What is AI Career Launchpad?',
    'Mind Mapping + Skill Mapping combo?',
    'Book free consultation',
    'Programs for Class 11-12',
  ],
  hi: [
    'PCM stream के बारे में बताएं',
    'Mind Mapping क्या है?',
    'Career counselling क्यों?',
    'AI Career Launchpad क्या है?',
    'Mind Mapping + Skill Mapping combo?',
    'मुफ्त consultation बुक करें',
    'Class 11-12 programmes',
  ],
};

export default function Chatbot() {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const messagesRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMessages([
      {
        role: 'bot',
        text:
          lang === 'hi'
            ? `नमस्ते! मैं ${BOT_NAME} हूँ — Dream Mantra की AI काउंसलर। Streams, Mind Mapping, careers और counselling — कुछ भी पूछें!`
            : `Hi! I'm ${BOT_NAME}, your AI career counsellor at Dream Mantra. Ask about streams, Mind Mapping, careers, AI Launchpad, or book a free session!`,
      },
    ]);
  }, [lang]);

  useEffect(() => {
    if (open && messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  const sendMessage = async (userMsg) => {
    if (!userMsg.trim() || loading) return;
    const newMessages = [...messages, { role: 'user', text: userMsg.trim() }];
    setMessages(newMessages);
    setLoading(true);

    const history = newMessages
      .filter((m) => m.role === 'user' || m.role === 'bot')
      .map((m) => ({ role: m.role, text: m.text }));

    try {
      const { reply } = await chatApi.message(userMsg.trim(), lang, history);
      setMessages((m) => [...m, { role: 'bot', text: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'bot',
          text:
            lang === 'hi'
              ? 'क्षमा करें, कृपया पुनः प्रयास करें या 9680102276 पर कॉल करें।'
              : 'Sorry, please try again or call us at 9680102276.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const send = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    await sendMessage(userMsg);
  };

  const prompts = STREAM_PROMPTS[lang] || STREAM_PROMPTS.en;

  if (!mounted) return null;

  return createPortal(
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            key="esh-fab"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setOpen(true)}
            className="esh-fab"
            aria-label={`Chat with ${BOT_NAME}`}
          >
            <span className="esh-fab-pulse" aria-hidden="true" />
            <span className="esh-live-dot" aria-hidden="true" />
            <MessageCircle className="w-6 h-6 relative z-10" />
            <span className="font-semibold text-sm hidden sm:inline relative z-10">Ask {BOT_NAME}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="esh-panel"
          >
            <div className="esh-header">
              <div className="esh-header-avatar">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="font-bold text-base">{BOT_NAME}</span>
                <p className="text-xs text-amber-100/90">AI Career Counsellor · Dream Mantra</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="esh-close-btn" aria-label="Close chat">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div ref={messagesRef} className="esh-messages">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, x: msg.role === 'user' ? 12 : -12 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={msg.role === 'user' ? 'esh-bubble-user' : 'esh-bubble-bot'}>
                    {formatBotReply(msg.text)}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="esh-typing">
                  <span className="esh-typing-dots">
                    <span /><span /><span />
                  </span>
                  {BOT_NAME} is typing...
                </div>
              )}
              <div ref={endRef} />
            </div>

            {messages.length <= 1 && !loading && (
              <div className="esh-prompts">
                {prompts.map((p) => (
                  <button key={p} type="button" onClick={() => sendMessage(p)} className="esh-prompt-chip">
                    {p}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={send} className="esh-input-row">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={lang === 'hi' ? 'Stream या career के बारे में पूछें...' : 'Ask about a stream or career...'}
                className="esh-input"
              />
              <motion.button
                whileTap={{ scale: 0.92 }}
                type="submit"
                disabled={loading}
                className="esh-send-btn"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
}
