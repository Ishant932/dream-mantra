import { useState, useEffect } from 'react';
import { dashboardPath } from '../utils/pathRoutes';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, Sparkles, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import Logo from '../components/Logo';
import PasswordInput from '../components/PasswordInput';
import { getWhatsAppAgentLink } from '../data/siteLinks';

export default function Signup() {
  const { register, user, loading: authLoading } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const slotId = new URLSearchParams(location.search).get('slot_id');
  const returnTo = typeof location.state?.from === 'string' ? location.state.from : '';
  const postAuthPath = () => {
    if (returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//')) return returnTo;
    return slotId ? dashboardPath('book', { slotId }) : '/dashboard/book-now';
  };

  useEffect(() => {
    if (authLoading || !user) return;
    navigate(postAuthPath(), { replace: true });
  }, [authLoading, user, navigate, slotId, returnTo]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const phoneDigits = phone.replace(/\D/g, '');
    const mobile = phoneDigits.length === 12 && phoneDigits.startsWith('91')
      ? phoneDigits.slice(2)
      : phoneDigits.length === 11 && phoneDigits.startsWith('0')
        ? phoneDigits.slice(1)
        : phoneDigits;
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Please enter a valid 10-digit mobile number');
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
      const optedIn = whatsappOptIn && !!mobile;
      const data = await register({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: mobile,
        password,
        whatsappOptIn: optedIn,
        signupInterest: 'counselling',
      });

      // Free Twilio sandbox: one-tap join (prefilled). User only presses Send.
      if (optedIn && typeof window !== 'undefined') {
        try {
          let href = getWhatsAppAgentLink({ sandbox: true });
          const health = await fetch('/api/health', { cache: 'no-store' }).then((r) => r.json()).catch(() => null);
          const wa = health?.whatsapp;
          if (wa?.sandboxJoinCode) {
            href = getWhatsAppAgentLink({ sandbox: true, joinCode: wa.sandboxJoinCode });
          }
          window.open(href, '_blank', 'noopener,noreferrer');
        } catch {
          /* non-blocking */
        }
      }

      navigate(postAuthPath(), {
        state: { welcomeUid: data.user?.user_uid || data.user_uid },
        replace: true,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-[var(--bg-elevated)] to-amber-50">
        <Loader2 className="w-10 h-10 animate-spin text-amber-600" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-var(--site-header-h)-var(--safe-top))] flex flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#92400e] via-[#b45309] to-[#f97316]">
        <div className="relative z-10 flex flex-col justify-center px-16 text-amber-50">
          <Logo size="lg" variant="brand" asLink={false} />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl font-bold mt-10 leading-tight"
          >
            Start your Dream Mantra journey
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-amber-200 text-lg mt-4 max-w-md"
          >
            Create your free account in seconds and access assessments, bookings, and your Dreams ID.
          </motion.p>
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 space-y-4"
          >
            {[
              'Instant access to dashboard & career library',
              'Book Brain Mapping & Skill Mapping assessments',
              'Enable 2FA anytime from Security settings',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-amber-100">
                <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10 sm:py-16 pb-safe bg-gradient-to-br from-amber-50/50 via-[var(--bg-elevated)] to-amber-50 dark:from-[#5c6b2e] dark:via-[#523010]">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="lg:hidden mb-6 sm:mb-8 flex justify-center">
            <Logo size="md" asLink={false} />
          </div>

          <div className="glass-card auth-form-card p-6 sm:p-8 md:p-10 shadow-2xl border border-amber-100/80">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Free Account
              </span>
              <h1 className="font-display text-2xl font-bold">{t('auth.signupTitle')}</h1>
              <p className="text-sand-500 text-sm mt-2">One form — you&apos;re in</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-sand-700 flex items-center gap-2 mb-1.5">
                  <User className="w-4 h-4 text-amber-600" /> {t('auth.name')}
                </label>
                <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-semibold text-sand-700 flex items-center gap-2 mb-1.5">
                  <Mail className="w-4 h-4 text-amber-600" /> Email
                </label>
                <input
                  type="email"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-sand-700 flex items-center gap-2 mb-1.5">
                  <Phone className="w-4 h-4 text-amber-600" /> Mobile / WhatsApp <span className="text-red-600">*</span>
                </label>
                <input
                  className="input-field"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit WhatsApp number"
                  required
                  inputMode="numeric"
                />
                <p className="text-xs text-sand-500 mt-1">Registration updates & reminders are sent on WhatsApp.</p>
              </div>
              {phone.trim() && (
                <label className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/80 border border-amber-100 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    checked={whatsappOptIn}
                    onChange={(e) => setWhatsappOptIn(e.target.checked)}
                  />
                  <span className="text-sm text-sand-700">
                    Yes — WhatsApp updates &amp; AI counsellor (free). After signup, WhatsApp opens with a ready message — just tap <strong>Send</strong> once.
                  </span>
                </label>
              )}
              <div>
                <label className="text-sm font-semibold text-sand-700 flex items-center gap-2 mb-1.5">
                  <Lock className="w-4 h-4 text-amber-600" /> {t('auth.password')}
                </label>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-sand-700 mb-1.5 block">Confirm Password</label>
                <PasswordInput
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                {loading ? 'Creating account...' : 'Create Account'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <p className="text-center mt-8 text-sm text-sand-600">
              Already have an account?{' '}
              <Link
                to="/login"
                state={returnTo ? { from: returnTo } : undefined}
                className="text-amber-600 font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
