import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { chatApi } from '../api';
import { useLang } from '../context/LanguageContext';
import { formatBotReply } from '../utils/formatBotReply';
import { useWhatsAppAgentLink } from '../hooks/useWhatsAppAgentLink';

const BOT_NAME = 'Esh';

function WhatsAppIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const STREAM_PROMPTS = {
  en: [
    'Tell me about PCM stream',
    'What is Brain Mapping?',
    'Why Career Counselling?',
    'What is AI Career Launchpad?',
    'Career Readiness Program?',
    'Book Now pricing',
    'Book free guidance call',
    'Programs for Class 11-12',
  ],
  hi: [
    'PCM stream के बारे में बताएं',
    'Brain Mapping क्या है?',
    'Career counselling क्यों?',
    'AI Career Launchpad क्या है?',
    'Brain Mapping + Skill Mapping combo?',
    'मुफ्त consultation बुक करें',
    'Class 11-12 programmes',
  ],
};

export default function Chatbot() {
  const { lang } = useLang();
  const waHref = useWhatsAppAgentLink();
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
            ? `नमस्ते! मैं ${BOT_NAME} हूँ — Dream Mantra की AI काउंसलर। Streams, Brain Mapping, careers और counselling — कुछ भी पूछें!\n\nWhatsApp पर चैट करें — पहले *join dream-mantra* भेजें, फिर अपना सवाल पूछें।`
            : `Hi! I'm ${BOT_NAME}, your AI career counsellor at Dream Mantra. Ask about streams, Brain Mapping, careers, AI Launchpad, or book a free session!\n\nOn WhatsApp: send *join dream-mantra* first, then chat with Esh 24/7.`,
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
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="esh-wa-btn"
                title="Continue on WhatsApp"
                aria-label="Continue chat on WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4" />
              </a>
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
                <a href={waHref} target="_blank" rel="noopener noreferrer" className="esh-wa-banner">
                  <WhatsAppIcon className="w-4 h-4 shrink-0" />
                  <span>Prefer WhatsApp? Chat with Esh there</span>
                </a>
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
