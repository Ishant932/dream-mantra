import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useLang } from './LanguageContext';
import PasswordInput from '../components/PasswordInput';

const BookNowModalContext = createContext({ openBookNow: () => {}, closeBookNow: () => {} });

export function useBookNowModal() {
  return useContext(BookNowModalContext);
}

function BookNowModal({ open, onClose }) {
  const { register, user } = useAuth();
  const { d } = useLang();
  const navigate = useNavigate();
  const fg = d('freeGuidance') || {};

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const bookTarget = user ? '/dashboard?tab=assess' : null;

  useEffect(() => {
    if (open && user && bookTarget) {
      onClose();
      navigate(bookTarget, { replace: false });
    }
  }, [open, user, navigate, onClose, bookTarget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() && !phone.trim()) {
      setError('Enter email or phone');
      return;
    }
    const phoneDigits = phone.replace(/\D/g, '');
    const mobile = phoneDigits.length === 12 && phoneDigits.startsWith('91')
      ? phoneDigits.slice(2)
      : phoneDigits.length === 11 && phoneDigits.startsWith('0')
        ? phoneDigits.slice(1)
        : phoneDigits;
    if (phone.trim() && !/^[6-9]\d{9}$/.test(mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!phone.trim()) {
      setError('Mobile number is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: mobile,
        password,
        whatsappOptIn: true,
      });
      onClose();
      navigate('/dashboard?tab=assess');
    } catch (err) {
      setError(err.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div key="book-now" className="guidance-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className="guidance-modal__panel guidance-modal__panel--pro"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="guidance-modal__close" onClick={onClose} aria-label="Close">
              <X className="w-5 h-5" />
            </button>
            <div className="guidance-modal__head guidance-modal__head--pro">
              <span className="guidance-modal__badge guidance-modal__badge--pro">
                <Calendar className="w-3.5 h-3.5 inline" /> Book now
              </span>
              <h2 className="guidance-modal__title guidance-modal__title--orange">Create account & pick your program</h2>
              <p className="guidance-modal__sub">Sign up in seconds, then choose your age pathway and module checkout.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3 px-1">
              <input className="input-field w-full" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
              <input className="input-field w-full" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className="input-field w-full" type="tel" placeholder="10-digit mobile number *" value={phone} onChange={(e) => setPhone(e.target.value)} required inputMode="numeric" />
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input-field w-full" />
              <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" className="input-field w-full" />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full !py-3 inline-flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Creating account…' : 'Sign up & continue'}
              </button>
              <p className="text-xs text-center opacity-60">{fg.loginHint || 'Already have an account? Sign in from the menu.'}</p>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}

export function BookNowModalProvider({ children }) {
  const [open, setOpen] = useState(false);
  const openBookNow = useCallback(() => setOpen(true), []);
  const closeBookNow = useCallback(() => setOpen(false), []);

  return (
    <BookNowModalContext.Provider value={{ openBookNow, closeBookNow }}>
      {children}
      <BookNowModal open={open} onClose={closeBookNow} />
    </BookNowModalContext.Provider>
  );
}
