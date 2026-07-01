import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authApi } from '../api';
import { useLang } from '../context/LanguageContext';
import Logo from '../components/Logo';
import PasswordInput from '../components/PasswordInput';

export default function ForgotPassword() {
  const { t } = useLang();
  const navigate = useNavigate();

  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    try {
      const normalized = email.trim().toLowerCase();
      const data = await authApi.forgotPassword(normalized);
      setEmail(normalized);
      setNotice(data.message || t('auth.otpSent'));
      setStep('reset');
    } catch (err) {
      setError(err.message || 'Could not send OTP email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
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
      await authApi.resetPassword({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        password,
      });
      navigate('/login', {
        replace: true,
        state: { notice: t('auth.passwordResetSuccess') },
      });
    } catch (err) {
      setError(err.message || 'Could not reset password. Check the OTP from your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setError('');
    setNotice('');
    setLoading(true);
    try {
      const data = await authApi.forgotPassword(email.trim().toLowerCase());
      setNotice(data.message || t('auth.otpSent'));
    } catch (err) {
      setError(err.message || 'Could not resend OTP email.');
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
            {t('auth.forgotTitle')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-amber-200 text-lg mt-4 max-w-md leading-relaxed"
          >
            {t('auth.forgotSubtitleEmail')}
          </motion.p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10 sm:py-16 pb-safe bg-gradient-to-br from-amber-50 via-[var(--bg-elevated)] to-amber-50 dark:from-[#5c6b2e] dark:via-[#523010] dark:to-[#5c6b2e]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-6 sm:mb-8 flex justify-center">
            <Logo size="md" asLink={false} />
          </div>

          <div className="glass-card auth-form-card p-6 sm:p-8 md:p-10 shadow-2xl border border-amber-100/80 dark:border-sand-700">
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
                <KeyRound className="w-7 h-7 text-amber-600" />
              </div>
              <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
                {step === 'request' ? t('auth.forgotTitle') : t('auth.resetPassword')}
              </h1>
              <p className="text-[var(--text-secondary)] text-sm mt-2">
                {step === 'request' ? t('auth.forgotSubtitleEmail') : t('auth.enterOtpEmail')}
              </p>
            </div>

            {notice && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-sm border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-800/50 flex gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{notice}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200 dark:bg-red-950/30 dark:text-red-200 dark:border-red-800/50">
                {error}
              </div>
            )}

            {step === 'request' ? (
              <form onSubmit={handleRequestOtp} className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-sand-700 dark:text-sand-300 flex items-center gap-2 mb-1.5">
                    <Mail className="w-4 h-4 text-amber-600" /> {t('auth.registeredEmail')}
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? 'Sending email…' : t('auth.sendOtpEmail')}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            ) : (
              <form onSubmit={handleReset} className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-sand-700 dark:text-sand-300 mb-1.5 block">
                    {t('auth.enterOtpEmail')}
                  </label>
                  <input
                    className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                    required
                  />
                  <p className="text-xs text-[var(--text-secondary)] mt-2">{t('auth.checkSpam')}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-sand-700 dark:text-sand-300 flex items-center gap-2 mb-1.5">
                    <Lock className="w-4 h-4 text-amber-600" /> {t('auth.newPassword')}
                  </label>
                  <PasswordInput
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-sand-700 dark:text-sand-300 flex items-center gap-2 mb-1.5">
                    <Lock className="w-4 h-4 text-amber-600" /> {t('auth.confirmPassword')}
                  </label>
                  <PasswordInput
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={6}
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Updating…' : t('auth.resetPassword')}
                </button>
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={loading}
                  className="text-sm text-amber-600 hover:underline w-full text-center disabled:opacity-50"
                >
                  Resend OTP email
                </button>
              </form>
            )}

            <p className="text-center mt-8 text-sm text-[var(--text-secondary)]">
              <Link to="/login" className="text-amber-600 font-semibold hover:underline">
                {t('auth.backToLogin')}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
