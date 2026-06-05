import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { authApi } from '../api';
import Logo from '../components/Logo';

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      setError('Registered email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address');
      return;
    }
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
      await authApi.resetPassword({
        email: normalizedEmail,
        newPassword,
        confirmPassword,
      });
      setDone(true);
      setTimeout(() => {
        navigate('/login', {
          replace: true,
          state: {
            passwordReset: true,
            email: normalizedEmail,
          },
        });
      }, 1800);
    } catch (err) {
      setError(err.message || 'Could not reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-var(--site-header-h)-var(--safe-top))] flex items-center justify-center px-4 py-10 sm:py-16 pb-safe bg-gradient-to-br from-amber-50 via-[var(--bg-elevated)] to-amber-50 dark:from-[#5c6b2e] dark:via-[#523010] dark:to-[#5c6b2e]">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo size="md" asLink={false} />
        </div>

        <div className="glass-card auth-form-card p-6 sm:p-8 shadow-2xl border border-amber-100/80 dark:border-sand-700">
          {done ? (
            <div className="text-center py-6">
              <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
              <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Password updated</h1>
              <p className="text-[var(--text-secondary)] text-sm mt-2">Redirecting to login…</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">Reset password</h1>
                <p className="text-[var(--text-secondary)] text-sm mt-2">
                  Enter the email address you used when creating your account, then set a new password.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200 dark:bg-red-950/30 dark:text-red-200 dark:border-red-800/50">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-sand-700 dark:text-sand-300 flex items-center gap-2 mb-1.5">
                    <Mail className="w-4 h-4 text-amber-600" /> Registered email
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoComplete="email"
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
                    Confirm new password
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
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? 'Updating…' : 'Update password'}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              <p className="text-center mt-6 text-xs text-[var(--text-secondary)]">
                Signed up with mobile only? Use your phone number on the login page instead.
              </p>

              <p className="text-center mt-4 text-sm text-[var(--text-secondary)]">
                Remember your password?{' '}
                <Link to="/login" className="text-amber-600 font-semibold hover:underline">
                  Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
