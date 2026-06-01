import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Fingerprint } from 'lucide-react';

export default function CopyableUserId({ uid, compact = false, onDark = false, className = '', animate = true }) {
  const [copied, setCopied] = useState(false);
  if (!uid) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard unavailable */
    }
  };

  const Wrapper = animate ? motion.div : 'div';
  const wrapperProps = animate
    ? {
        initial: { opacity: 0, y: 8, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { type: 'spring', stiffness: 380, damping: 26, delay: 0.12 },
      }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`copy-user-id ${compact ? 'copy-user-id--compact' : ''} ${onDark ? 'copy-user-id--on-dark' : ''} ${animate ? 'copy-user-id--animated' : ''} ${className}`.trim()}
    >
      <motion.span
        className="copy-user-id__badge"
        animate={animate ? { boxShadow: ['0 0 0 rgba(251,191,36,0)', '0 0 14px rgba(251,191,36,0.35)', '0 0 0 rgba(251,191,36,0)'] } : undefined}
        transition={animate ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : undefined}
      >
        <Fingerprint className="w-3.5 h-3.5 shrink-0 opacity-80" aria-hidden="true" />
        <code className="copy-user-id__code">{uid}</code>
      </motion.span>
      <motion.button
        type="button"
        onClick={copy}
        className="copy-user-id__btn"
        title="Copy ID"
        aria-label={`Copy user ID ${uid}`}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.span
              key="ok"
              initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="inline-flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              {!compact && <span>Copied!</span>}
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="inline-flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              {!compact && <span>Copy</span>}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </Wrapper>
  );
}
