import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldCheck, ShieldOff, QrCode, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api';

export default function SecuritySettings() {
  const { user, token, refreshUser } = useAuth();
  const isMandatory2FA = user?.role === 'admin';
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const startSetup = async () => {
    setErr('');
    setMsg('');
    setLoading(true);
    try {
      const data = await authApi.setup2FA(token);
      setSetup(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const enable2FA = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await authApi.enable2FA(token, code);
      setMsg('Two-factor authentication enabled!');
      setSetup(null);
      setCode('');
      await refreshUser();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await authApi.disable2FA(token, { password, code: disableCode });
      setMsg('Two-factor authentication disabled.');
      setPassword('');
      setDisableCode('');
      await refreshUser();
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="infigon-card p-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
          <Shield className="w-6 h-6 text-amber-600" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold">Security & Two-Factor Auth</h2>
          <p className="text-sm text-sand-500 mt-1">
            Protect your account with Google Authenticator, Authy, or Microsoft Authenticator
          </p>
        </div>
      </div>

      {msg && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 text-amber-800 text-sm border border-amber-200">{msg}</div>
      )}
      {err && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">{err}</div>
      )}

      <div className="flex items-center gap-3 p-4 rounded-xl bg-sand-50 dark:bg-sand-800/50 mb-6">
        {user?.twoFactorEnabled ? (
          <>
            <ShieldCheck className="w-6 h-6 text-amber-600" />
            <div>
              <p className="font-semibold text-amber-700">2FA is ON</p>
              <p className="text-xs text-sand-500">Your account is protected with two-factor authentication</p>
            </div>
          </>
        ) : (
          <>
            <ShieldOff className="w-6 h-6 text-sand-400" />
            <div>
              <p className="font-semibold">2FA is OFF</p>
              <p className="text-xs text-sand-500">Recommended for extra security</p>
            </div>
          </>
        )}
      </div>

      {!user?.twoFactorEnabled && !setup && (
        <button type="button" onClick={startSetup} disabled={loading} className="btn-primary flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
          Enable Two-Factor Authentication
        </button>
      )}

      {setup && (
        <motion.form initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} onSubmit={enable2FA} className="space-y-4">
          <p className="text-sm text-sand-600">Scan this QR code with your authenticator app:</p>
          <img src={setup.qrCode} alt="2FA QR Code" className="mx-auto w-48 h-48 rounded-xl border p-2 bg-[var(--bg-elevated)]" />
          <p className="text-xs text-sand-500 text-center font-mono break-all">
            Manual key: {setup.manualEntry}
          </p>
          <input
            className="input-field text-center tracking-widest font-mono"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit code"
            maxLength={6}
            required
          />
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1">Confirm & Enable</button>
            <button type="button" onClick={() => setSetup(null)} className="btn-outline">Cancel</button>
          </div>
        </motion.form>
      )}

      {user?.twoFactorEnabled && !isMandatory2FA && (
        <form onSubmit={disable2FA} className="space-y-4 mt-4 pt-6 border-t">
          <p className="text-sm font-semibold text-sand-700">Disable 2FA</p>
          <input
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            required
          />
          <input
            className="input-field text-center tracking-widest font-mono"
            value={disableCode}
            onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Authenticator code"
            maxLength={6}
            required
          />
          <button type="submit" disabled={loading} className="btn-outline text-red-600 border-red-200 hover:bg-red-50">
            Disable 2FA
          </button>
        </form>
      )}

      {user?.twoFactorEnabled && isMandatory2FA && (
        <p className="text-sm text-sand-600 mt-4 pt-6 border-t">
          Two-factor authentication is required for admin accounts and cannot be disabled.
        </p>
      )}

    </div>
  );
}
