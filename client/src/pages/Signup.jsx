import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, Sparkles, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import Logo from '../components/Logo';

export default function Signup() {
  const { persist, user, loading: authLoading } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const slotId = new URLSearchParams(location.search).get('slot_id');

  useEffect(() => {
    if (authLoading || !user) return;
    navigate(slotId ? `/dashboard?tab=book&slot_id=${slotId}` : '/dashboard', { replace: true });
  }, [authLoading, user, navigate, slotId]);

  const [step, setStep] = useState('details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const validateDetails = () => {
    if (!name.trim() || name.trim().length < 2) return 'Full name is required';
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Enter a valid email address';
    if (!phone.trim()) return 'Mobile number is required';
    const digits = phone.replace(/\D/g, '').slice(-10);
    if (digits.length !== 10) return 'Enter a valid 10-digit mobile number';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password !== confirm) return 'Passwords do not match';
    return null;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    const err = validateDetails();
    if (err) {
      setError(err);
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.sendRegisterOtp({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      setInfo(data.message);
      if (data.devOtp) setDevOtp(data.devOtp);
      setStep('otp');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Enter the 6-digit code from your email');
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        otp: otp.trim(),
      });
      persist(data.token, data.user);
      navigate(
        slotId ? `/dashboard?tab=book&slot_id=${slotId}` : '/dashboard',
        { state: { welcomeUid: data.user?.user_uid || data.user_uid } }
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
            Secure signup with email verification. Name, email, and mobile are required.
          </motion.p>
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 space-y-4"
          >
            {[
              '6-digit OTP sent to your email',
              'JWT login — works on any device',
              'Book assessments & track your Dreams ID',
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
              <p className="text-sand-500 text-sm mt-2">
                {step === 'details' ? 'All fields required — email & mobile verified' : 'Check your email for the code'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>
            )}
            {info && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-sm border border-emerald-200">{info}</div>
            )}
            {devOtp && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 text-amber-800 text-sm border border-amber-200">
                Dev OTP: <strong>{devOtp}</strong>
              </div>
            )}

            {step === 'details' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-sand-700 flex items-center gap-2 mb-1.5">
                    <User className="w-4 h-4 text-amber-600" /> Full name *
                  </label>
                  <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm font-semibold text-sand-700 flex items-center gap-2 mb-1.5">
                    <Mail className="w-4 h-4 text-amber-600" /> Email *
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-sand-700 flex items-center gap-2 mb-1.5">
                    <Phone className="w-4 h-4 text-amber-600" /> Mobile number *
                  </label>
                  <input
                    className="input-field"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    inputMode="tel"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-sand-700 flex items-center gap-2 mb-1.5">
                    <Lock className="w-4 h-4 text-amber-600" /> {t('auth.password')} *
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-sand-700 mb-1.5 block">Confirm password *</label>
                  <input
                    type="password"
                    className="input-field"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                  {loading ? 'Sending code…' : 'Send verification code'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-sand-700 flex items-center gap-2 mb-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" /> Email verification code *
                  </label>
                  <input
                    className="input-field text-center text-lg tracking-[0.4em] font-mono"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-sand-500 mt-1.5">Code sent to {email}. Check spam if needed.</p>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? 'Creating account…' : 'Verify & create account'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  className="w-full text-sm text-amber-600 font-semibold hover:underline"
                  onClick={() => { setStep('details'); setOtp(''); setDevOtp(''); setInfo(''); }}
                >
                  ← Edit details & resend code
                </button>
              </form>
            )}

            <p className="text-center mt-8 text-sm text-sand-600">
              Already have an account?{' '}
              <Link to="/login" className="text-amber-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
