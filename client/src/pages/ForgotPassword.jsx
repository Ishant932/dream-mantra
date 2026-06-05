import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { persist } = useAuth();
  const [step, setStep] = useState('request');
  const [identifier, setIdentifier] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const data = await authApi.forgotPassword({ identifier: identifier.trim() });
      setMaskedEmail(data.email || '');
      setInfo(data.message || 'Check your email for the reset code.');
      setStep('reset');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.resetPassword({
        identifier: identifier.trim(),
        otp: otp.trim(),
        newPassword,
      });
      persist(data.token, data.user);
      setStep('done');
      setTimeout(() => {
        navigate(data.user?.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
      }, 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-var(--site-header-h)-var(--safe-top))] flex items-center justify-center px-4 py-10 sm:py-16 pb-safe bg-gradient-to-br from-amber-50 via-[var(--bg-elevated)] to-amber-50 dark:from-[#5c6b2e] dark:via-[#523010] dark:to-[#5c6b2e]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-6 flex justify-center">
          <Logo size="md" asLink={false} />
        </div>

        <div className="glass-card auth-form-card p-6 sm:p-8 shadow-2xl border border-amber-100/80 dark:border-sand-700">
          {step === 'request' && (
            <>
              <div className="text-center mb-8">
                <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Forgot password?</h1>
                <p className="text-[var(--text-secondary)] text-sm mt-2">
                  Enter your email or phone. We&apos;ll send a 6-digit code to your registered email.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>
              )}

              <form onSubmit={handleRequest} className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-sand-700 dark:text-sand-300 flex items-center gap-2 mb-1.5">
                    <Mail className="w-4 h-4 text-amber-600" /> Email or phone
                  </label>
                  <input
                    className="input-field"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="email@example.com or 98XXXXXXXX"
                    autoComplete="username"
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? 'Sending…' : 'Send reset code'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </>
          )}

          {step === 'reset' && (
            <>
              <div className="text-center mb-6">
                <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Reset password</h1>
                <p className="text-[var(--text-secondary)] text-sm mt-2">
                  {maskedEmail ? `Code sent to ${maskedEmail}` : info || 'Enter the 6-digit code from your email.'}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>
              )}

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-sand-700 dark:text-sand-300 flex items-center gap-2 mb-1.5">
                    <KeyRound className="w-4 h-4 text-amber-600" /> Reset code
                  </label>
                  <input
                    className="input-field text-center text-xl tracking-[0.4em] font-mono"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-sand-700 dark:text-sand-300 flex items-center gap-2 mb-1.5">
                    <Lock className="w-4 h-4 text-amber-600" /> New password
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-sand-700 dark:text-sand-300 mb-1.5 block">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    className="input-field"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Updating…' : 'Update password & sign in'}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('request'); setError(''); setOtp(''); }}
                  className="text-sm text-amber-600 hover:underline w-full text-center flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Resend code
                </button>
              </form>
            </>
          )}

          {step === 'done' && (
            <div className="text-center py-6">
              <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
              <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Password updated</h1>
              <p className="text-[var(--text-secondary)] text-sm mt-2">Redirecting to your dashboard…</p>
            </div>
          )}

          {step !== 'done' && (
            <p className="text-center mt-8 text-sm text-[var(--text-secondary)]">
              Remember your password?{' '}
              <Link to="/login" className="text-amber-600 font-semibold hover:underline">
                Back to login
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
