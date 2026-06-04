import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Mail, UserCircle, Lock, AlertCircle } from 'lucide-react';
import CopyableUserId from './CopyableUserId';

export default function VerifyTestAccessModal({
  open,
  onClose,
  registeredUid,
  registeredEmail,
  registeredName,
  testTitle,
  onVerify,
  verifying = false,
  error = '',
}) {
  const [userUidInput, setUserUidInput] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!open) return;
    setUserUidInput('');
    setPassword('');
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onVerify?.({ userUid: userUidInput.trim(), password });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-label="Close"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="verify-test-title"
            className="relative w-full max-w-md rounded-2xl bg-white dark:bg-stone-900 shadow-2xl border border-stone-200/80 dark:border-stone-700 overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
          >
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-5 py-4 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide opacity-90 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Registered account only
                  </p>
                  <h2 id="verify-test-title" className="font-bold text-lg mt-1">
                    Verify before taking test
                  </h2>
                  {testTitle && (
                    <p className="text-sm opacity-90 mt-0.5">{testTitle}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/15 transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-sm">
                <p className="font-semibold text-emerald-900 dark:text-emerald-200 mb-2">
                  Your registered Dream Mantra account
                </p>
                <div className="space-y-1.5">
                  <CopyableUserId uid={registeredUid} compact animate={false} />
                  {registeredName && (
                    <p className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300">
                      <UserCircle className="w-4 h-4 shrink-0" />
                      {registeredName}
                    </p>
                  )}
                  {registeredEmail && (
                    <p className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300 break-all">
                      <Mail className="w-4 h-4 shrink-0" />
                      {registeredEmail}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-sm dash-card-meta">
                Enter your registered ID and password to unlock this test. Only your account details will be used — not any other email or Google login.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label htmlFor="verify-test-uid" className="block text-xs font-bold uppercase tracking-wide mb-1.5">
                    Dreams ID
                  </label>
                  <input
                    id="verify-test-uid"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    className="input-field font-mono"
                    placeholder={registeredUid || 'Your 9-digit ID'}
                    value={userUidInput}
                    onChange={(e) => setUserUidInput(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="verify-test-password" className="block text-xs font-bold uppercase tracking-wide mb-1.5">
                    Account password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                    <input
                      id="verify-test-password"
                      type="password"
                      autoComplete="current-password"
                      className="input-field !pl-10"
                      placeholder="Your Dream Mantra login password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn-primary w-full !py-3"
                  disabled={verifying}
                >
                  {verifying ? 'Verifying…' : 'Verify & open test'}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
