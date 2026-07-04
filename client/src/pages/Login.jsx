import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Shield, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import Logo from '../components/Logo';
import PasswordInput from '../components/PasswordInput';
import AuthenticatorQrScanner from '../components/AuthenticatorQrScanner';

export default function Login() {
  const { login, verify2FA, complete2FASetup, user, loading: authLoading } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const slotId = new URLSearchParams(location.search).get('slot_id');
  const prefilledEmail = location.state?.email || '';
  const loginNotice = location.state?.notice || '';
  const postAuthPath = (role) => {
    if (role === 'admin') return '/admin';
    if (role === 'counsellor') return '/counsellor';
    return slotId ? `/dashboard?tab=book&slot_id=${slotId}` : '/dashboard';
  };

  const finishLogin = (data) => {
    navigate(postAuthPath(data.user.role), { replace: true });
  };

  useEffect(() => {
    if (authLoading || !user) return;
    navigate(postAuthPath(user.role), { replace: true });
  }, [authLoading, user, navigate, slotId]);

  const [step, setStep] = useState('credentials');
  const [identifier, setIdentifier] = useState(prefilledEmail);
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [setupToken, setSetupToken] = useState('');
  const [setupQr, setSetupQr] = useState('');
  const [setupManualEntry, setSetupManualEntry] = useState('');
  const [setupAdminLabel, setSetupAdminLabel] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const trimmed = identifier.trim();
      const loginId = trimmed.includes('@') ? trimmed.toLowerCase() : trimmed.replace(/\s+/g, '');
      const data = await login(loginId, password);
      if (data.requires2FASetup) {
        setSetupToken(data.setupToken);
        setSetupQr(data.qrCode);
        setSetupManualEntry(data.manualEntry || '');
        setSetupAdminLabel(data.adminName || data.adminEmail || 'Admin');
        setStep('2fa-setup');
      } else if (data.requires2FA) {
        setTempToken(data.tempToken);
        setStep('2fa');
      } else {
        finishLogin(data);
      }
    } catch (err) {
      setError(err.message || 'Sign in failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FA = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await verify2FA(tempToken, code);
      finishLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handle2FASetup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await complete2FASetup(setupToken, code);
      finishLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetToCredentials = () => {
    setStep('credentials');
    setCode('');
    setTempToken('');
    setSetupToken('');
    setSetupQr('');
    setSetupManualEntry('');
    setSetupAdminLabel('');
    setError('');
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
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#b45309] via-[#ea580c] to-[#f97316]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-amber-50">
          <Logo size="lg" variant="brand" asLink={false} />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl font-bold mt-10 leading-tight"
          >
            Login to Dream Mantra
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-amber-200 text-lg mt-4 max-w-md leading-relaxed"
          >
            Access your dashboard, career library, assessments, and counselling bookings.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 space-y-3"
          >
            {['950+ Career Opportunities', 'AI Career Advisor (Esh)', 'Mind Mapping & Skill Mapping access'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-amber-100">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right panel — form */}
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
            {step === 'credentials' ? (
              <>
                <div className="text-center mb-8">
                  <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">{t('auth.loginTitle')}</h1>
                  <p className="text-[var(--text-secondary)] text-sm mt-2">{t('auth.loginSubtitle')}</p>
                </div>

                {loginNotice && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-sm border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-800/50">
                    {loginNotice}
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200 dark:bg-red-950/30 dark:text-red-200 dark:border-red-800/50">{error}</div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="text-sm font-semibold text-sand-700 dark:text-sand-300 flex items-center gap-2 mb-1.5">
                      <Mail className="w-4 h-4 text-amber-600" /> {t('auth.emailOrPhone')}
                    </label>
                    <input
                      className="input-field"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="email@example.com, phone, or Dreams ID"
                      autoComplete="username"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-sand-700 dark:text-sand-300 flex items-center gap-2 mb-1.5">
                      <Lock className="w-4 h-4 text-amber-600" /> {t('auth.password')}
                    </label>
                    <PasswordInput
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                    {loading ? 'Signing in...' : 'Sign In'}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>

                <p className="text-center mt-4 text-sm">
                  <Link to="/forgot-password" className="text-amber-600 font-semibold hover:underline">
                    {t('auth.forgotPassword')}
                  </Link>
                </p>

                <p className="text-center mt-4 text-sm text-[var(--text-secondary)]">
                  New here?{' '}
                  <Link to="/signup" className="text-amber-600 font-semibold hover:underline">
                    Create an account
                  </Link>
                </p>
              </>
            ) : step === '2fa-setup' ? (
              <>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
                    <Shield className="w-7 h-7 text-amber-600" />
                  </div>
                  <h1 className="font-display text-2xl font-bold">Google Authenticator Setup</h1>
                  {setupAdminLabel && (
                    <p className="text-amber-700 font-semibold text-sm mt-1">{setupAdminLabel}</p>
                  )}
                  <p className="text-sand-500 text-sm mt-2">
                    Scan this QR code with Google Authenticator to secure your admin account
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>
                )}

                <AuthenticatorQrScanner
                  qrSrc={setupQr}
                  manualEntry={setupManualEntry}
                  badge="Google Auth"
                  caption="Open Google Authenticator → tap + → Scan QR code"
                  downloadName="dream-mantra-admin-2fa-qr.png"
                />

                <form onSubmit={handle2FASetup} className="space-y-5 mt-5">
                  <input
                    className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                    required
                  />
                  <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? 'Enabling 2FA...' : 'Enable 2FA & Continue'}
                  </button>
                  <button
                    type="button"
                    onClick={resetToCredentials}
                    className="text-sm text-amber-600 hover:underline w-full text-center"
                  >
                    Back to login
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
                    <Shield className="w-7 h-7 text-amber-600" />
                  </div>
                  <h1 className="font-display text-2xl font-bold">Google Authenticator</h1>
                  <p className="text-sand-500 text-sm mt-2">Enter the 6-digit code from your Google Authenticator app</p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>
                )}

                <form onSubmit={handle2FA} className="space-y-5">
                  <input
                    className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                    required
                  />
                  <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                  <button
                    type="button"
                    onClick={resetToCredentials}
                    className="text-sm text-amber-600 hover:underline w-full text-center"
                  >
                    Back to login
                  </button>
                </form>
              </>
            )}

          </div>
        </motion.div>
      </div>
    </div>
  );
}
