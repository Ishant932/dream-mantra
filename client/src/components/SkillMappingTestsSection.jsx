import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Lock, Sparkles, CheckCircle2, AlertCircle, UserCircle, Mail, Copy, Play, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api';
import CopyableUserId from './CopyableUserId';
import SkillMappingBandPicker from './SkillMappingBandPicker';
import VerifyTestAccessModal from './VerifyTestAccessModal';
import {
  isTestAccessVerified,
  setTestAccessVerified,
} from '../utils/testAccessSession';
import {
  SKILL_MAPPING_BANDS,
  getSkillMappingTestsForBand,
  isSkillMappingBandAllowed,
  resolveSkillMappingBand,
  buildSkillMappingTestUrl,
} from '../data/moduleCatalog';

const ease = [0.22, 1, 0.36, 1];

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const bandTabMotion = {
  initial: { opacity: 0, y: 14, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease } },
};

const testPillMotion = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.32, ease } },
};

const panelMotion = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease } },
  exit: { opacity: 0, y: -12, scale: 0.98, transition: { duration: 0.28 } },
};

function buildPrefilledTests(bandId, { userUid, userName, userPhone }) {
  return getSkillMappingTestsForBand(bandId).map((t) => ({
    id: t.id,
    title: t.title,
    shortTitle: t.shortTitle,
    desc: t.desc,
    duration: t.duration,
    icon: t.icon,
    url: buildSkillMappingTestUrl(
      t.url,
      { userUid, userName, phone: userPhone },
      t.prefill || {},
      { embedded: false }
    ),
  }));
}

export default function SkillMappingTestsSection({
  assessment,
  userUid: propUid,
  userName: propName,
  userPhone: propPhone,
  userEmail: propEmail,
  onBandSaved,
  openTestOnLoad = false,
}) {
  const { token } = useAuth();
  const unlockedBand = resolveSkillMappingBand(assessment);
  const [bandId, setBandId] = useState(unlockedBand || 'class-6-8');
  const [testId, setTestId] = useState(
    () => getSkillMappingTestsForBand(unlockedBand || 'class-6-8')[0]?.id || 'vak'
  );
  const [savingBand, setSavingBand] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [identity, setIdentity] = useState(null);
  const [bandTests, setBandTests] = useState([]);
  const [copied, setCopied] = useState(false);
  const [testVerified, setTestVerified] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [openTestAfterVerify, setOpenTestAfterVerify] = useState(false);
  const [testToOpenAfterVerify, setTestToOpenAfterVerify] = useState(null);
  const autoOpenHandled = useRef(false);
  const [testOpenedDirect, setTestOpenedDirect] = useState(false);

  const setBandTestsForBand = useCallback((nextBandId, id) => {
    if (!nextBandId || !id?.userUid) {
      setBandTests([]);
      return;
    }
    setBandTests(buildPrefilledTests(nextBandId, {
      userUid: id.userUid,
      userName: id.userName,
      userPhone: id.userPhone,
    }));
  }, []);

  useEffect(() => {
    if (unlockedBand) setBandId(unlockedBand);
  }, [unlockedBand]);

  const loadTests = useCallback(async () => {
    if (!assessment?.id || !token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError('');

    try {
      const data = await userApi.getSkillTests(token, assessment.id);
      const nextIdentity = {
        userUid: String(data.registeredUserUid || '').trim(),
        userName: data.userName || '',
        userPhone: data.phone || '',
        userEmail: data.registeredEmail || '',
      };
      setIdentity(nextIdentity);
      const nextBand = data.band || resolveSkillMappingBand(assessment) || bandId;
      if (data.band) setBandId(data.band);
      setBandTestsForBand(nextBand, nextIdentity);
    } catch (err) {
      const uid = String(propUid || '').trim();
      const band = resolveSkillMappingBand(assessment);
      if (uid && band) {
        const fallback = {
          userUid: uid,
          userName: propName || '',
          userPhone: propPhone || '',
          userEmail: propEmail || '',
        };
        setIdentity(fallback);
        setBandTestsForBand(band, fallback);
      } else {
        setIdentity(null);
        setLoadError(err.message || 'Could not load tests');
      }
    } finally {
      setLoading(false);
    }
  }, [assessment, token, propUid, propName, propPhone, propEmail, bandId, setBandTestsForBand]);

  useEffect(() => {
    loadTests();
  }, [loadTests]);

  useEffect(() => {
    if (!identity?.userUid || !bandId) return;
    setBandTestsForBand(bandId, identity);
  }, [bandId, identity, setBandTestsForBand]);

  useEffect(() => {
    if (!bandTests.some((t) => t.id === testId)) {
      setTestId(bandTests[0]?.id || 'vak');
    }
  }, [bandId, bandTests, testId]);

  const registeredUid = identity?.userUid || '';
  const registeredEmail = identity?.userEmail || '';
  const registeredName = identity?.userName || '';

  useEffect(() => {
    setTestVerified(isTestAccessVerified(registeredUid));
  }, [registeredUid]);

  const activeBand = useMemo(
    () => SKILL_MAPPING_BANDS.find((b) => b.id === bandId) || SKILL_MAPPING_BANDS[0],
    [bandId]
  );
  const activeTest = useMemo(
    () => bandTests.find((t) => t.id === testId) || bandTests[0],
    [bandTests, testId]
  );
  const activeTestIndex = bandTests.findIndex((t) => t.id === testId);
  const testCount = bandTests.length;

  const handleLegacyBandSelect = async (band) => {
    if (!assessment?.id || !onBandSaved) return;
    setSavingBand(true);
    try {
      await onBandSaved(band);
    } finally {
      setSavingBand(false);
    }
  };

  const copyTestLink = async (test) => {
    const t = test || activeTest;
    if (!t?.url) return;
    try {
      await navigator.clipboard.writeText(t.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this test link:', t.url);
    }
  };

  const openInNewTab = (test) => {
    const t = test || activeTest;
    if (t?.url) {
      window.open(t.url, '_blank', 'noopener,noreferrer');
      setTestOpenedDirect(true);
    }
  };

  const promptVerify = (openAfter = true, test = null) => {
    setVerifyError('');
    setOpenTestAfterVerify(openAfter);
    if (openAfter) setTestToOpenAfterVerify(test || activeTest);
    setVerifyOpen(true);
  };

  const handleTestSelect = (t) => {
    setTestId(t.id);
    if (testVerified) {
      openInNewTab(t);
    } else {
      promptVerify(true, t);
    }
  };

  const handleStartTest = () => {
    if (!testVerified) {
      promptVerify(true, activeTest);
      return;
    }
    openInNewTab(activeTest);
  };

  const handleCopyLink = () => {
    if (!testVerified) {
      promptVerify(false);
      return;
    }
    copyTestLink(activeTest);
  };

  useEffect(() => {
    if (!openTestOnLoad || autoOpenHandled.current || loading || !bandTests.length || !registeredUid) return;
    autoOpenHandled.current = true;
    const first = bandTests[0];
    if (testVerified) {
      openInNewTab(first);
    } else {
      promptVerify(true, first);
    }
  }, [openTestOnLoad, loading, bandTests, testVerified, registeredUid]);

  const compactAfterOpen = openTestOnLoad && testOpenedDirect;

  const handleVerify = async ({ userUid, password }) => {
    if (!assessment?.id || !token) return;
    setVerifying(true);
    setVerifyError('');
    try {
      const data = await userApi.verifyTestAccess(token, assessment.id, { userUid, password });
      const verifiedUid = String(data.registeredUserUid || userUid || registeredUid).trim();
      setTestAccessVerified(verifiedUid);
      setTestVerified(true);
      setVerifyOpen(false);
      if (openTestAfterVerify) {
        openInNewTab(testToOpenAfterVerify || activeTest);
      }
      setTestToOpenAfterVerify(null);
      setOpenTestAfterVerify(false);
    } catch (err) {
      setVerifyError(err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  if (!unlockedBand) {
    return (
      <div className="modules-tests-section no-reveal">
        <motion.div className="modules-tests-intro" {...fadeUp}>
          <p className="text-sm dash-card-meta">
            Class bands are locked until you choose one at payment. If you already paid, select your band below to unlock your tests.
          </p>
          {onBandSaved && assessment?.id && (
            <div className="mt-4 p-4 rounded-xl border border-amber-200/60 bg-amber-50/50 dark:bg-amber-950/20">
              <SkillMappingBandPicker
                value=""
                onChange={handleLegacyBandSelect}
                disabled={savingBand}
                title="Select your class band to unlock tests"
                hint="This is set once per purchase and cannot be changed later."
              />
            </div>
          )}
        </motion.div>
        <div className="modules-test-band-tabs mt-4">
          {SKILL_MAPPING_BANDS.map((b) => (
            <div
              key={b.id}
              className="modules-test-band-tab modules-test-band-tab--locked opacity-60"
              aria-disabled="true"
            >
              <span className="font-bold text-sm flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {b.label}
              </span>
              <span className="text-[0.6875rem] dash-card-meta">Locked — select at payment</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-9 h-9 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError || !registeredUid) {
    return (
      <div className="p-5 rounded-xl border border-amber-200/60 bg-amber-50/80 dark:bg-amber-950/20 text-center">
        <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
        <p className="font-bold text-sm">{loadError || 'Dream Mantra ID not found'}</p>
        <p className="text-sm dash-card-meta mt-2 max-w-md mx-auto">
          Log out and log in with the account you registered. Contact support at 9680102276 if this continues.
        </p>
        <button type="button" className="btn-primary mt-4 !py-2 !px-4 text-sm" onClick={loadTests}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="modules-tests-section no-reveal">
      <VerifyTestAccessModal
        open={verifyOpen}
        onClose={() => {
          setVerifyOpen(false);
          setOpenTestAfterVerify(false);
          setVerifyError('');
        }}
        registeredUid={registeredUid}
        registeredEmail={registeredEmail}
        registeredName={registeredName}
        testTitle={activeTest?.title}
        onVerify={handleVerify}
        verifying={verifying}
        error={verifyError}
      />

      <div className="modules-tests-bg" aria-hidden="true">
        <span className="modules-tests-orb modules-tests-orb--1" />
        <span className="modules-tests-orb modules-tests-orb--2" />
        <span className="modules-tests-shimmer" />
      </div>

      <motion.div
        className="p-4 rounded-xl border border-emerald-200/60 bg-emerald-50/70 dark:bg-emerald-950/20 mb-3 flex flex-wrap items-start gap-3"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <UserCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
            Your registered account (used for every test)
          </p>
          <CopyableUserId uid={registeredUid} compact animate={false} />
          {(registeredName || registeredEmail) && (
            <p className="text-sm">
              {registeredName && <span className="font-semibold">{registeredName}</span>}
              {registeredName && registeredEmail && ' · '}
              {registeredEmail && (
                <span className="inline-flex items-center gap-1 dash-card-meta">
                  <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                  {registeredEmail}
                </span>
              )}
            </p>
          )}
        </div>
      </motion.div>

      <motion.div
        className="modules-tests-hero"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        <div className="modules-tests-hero__icon">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="modules-tests-hero__title">Skill Mapping Tests</h3>
          <p className="modules-tests-hero__sub">
            {testCount} assessment{testCount === 1 ? '' : 's'} for {activeBand.label}
          </p>
        </div>
        <motion.div
          className="modules-tests-progress-ring"
          key={bandId}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        >
          <span className="modules-tests-progress-ring__num">{testCount}</span>
          <span className="modules-tests-progress-ring__lbl">tests</span>
        </motion.div>
      </motion.div>

      <motion.div className="modules-tests-intro" {...fadeUp}>
        <p className="text-sm dash-card-meta">
          Tests are tied to your logged-in account — ID <strong>{registeredUid}</strong>
          {registeredName ? ` (${registeredName})` : ''}. Do not change the Dreamz ID field in the form.
        </p>
      </motion.div>

      <motion.p
        className="modules-test-step-label"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
      >
        <span className="modules-test-step-label__dot" />
        Step 1 — Your class band
      </motion.p>

      <motion.div
        className="modules-test-band-tabs"
        variants={stagger}
        initial="initial"
        animate="animate"
        key={`bands-${bandId}`}
      >
        {SKILL_MAPPING_BANDS.map((b) => {
          const locked = !isSkillMappingBandAllowed(b.id, unlockedBand);
          const isActive = b.id === bandId;
          return (
            <motion.button
              key={b.id}
              type="button"
              variants={bandTabMotion}
              disabled={locked}
              whileHover={locked ? undefined : { y: -3, transition: { duration: 0.2 } }}
              whileTap={locked ? undefined : { scale: 0.98 }}
              onClick={() => {
                if (locked) return;
                setBandId(b.id);
              }}
              className={`modules-test-band-tab ${isActive ? 'modules-test-band-tab--active' : ''} ${b.id === unlockedBand ? 'modules-test-band-tab--profile' : ''} ${locked ? 'modules-test-band-tab--locked' : ''}`}
              title={locked ? 'Not included in your purchase' : undefined}
            >
              {isActive && (
                <motion.span
                  layoutId="modules-band-glow"
                  className="modules-test-band-tab__glow"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="font-bold text-sm flex items-center gap-1.5 relative z-[1]">
                {locked && <Lock className="w-3.5 h-3.5 shrink-0 opacity-70" aria-hidden="true" />}
                {b.label}
              </span>
              <span className="text-[0.6875rem] dash-card-meta relative z-[1]">
                {locked ? 'Not available for your class' : b.subtitle}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      <motion.p
        className="modules-test-step-label mt-4"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.35 }}
      >
        <span className="modules-test-step-label__dot" />
        Step 2 — Take test ({activeBand.label})
      </motion.p>

      <motion.div
        className="modules-test-pills mb-3"
        variants={stagger}
        initial="initial"
        animate="animate"
        key={`pills-${bandId}-${registeredUid}`}
      >
        {bandTests.map((t, i) => {
          const isActive = t.id === testId;
          return (
            <motion.button
              key={t.id}
              type="button"
              variants={testPillMotion}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleTestSelect(t)}
              className={`modules-test-pill ${isActive ? 'modules-test-pill--active' : ''}`}
            >
              {isActive && (
                <motion.span
                  layoutId="modules-test-pill-bg"
                  className="modules-test-pill__bg"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="modules-test-pill__icon relative z-[1]" aria-hidden="true">
                {t.icon || '📋'}
              </span>
              <span className="relative z-[1] font-semibold text-sm">{t.shortTitle}</span>
              <span className="modules-test-duration relative z-[1]">
                <Clock className="w-3 h-3" /> {t.duration}
              </span>
              <span className="modules-test-pill__idx relative z-[1]">{i + 1}/{testCount}</span>
            </motion.button>
          );
        })}
      </motion.div>

      <AnimatePresence mode="wait">
        {compactAfterOpen ? (
          <motion.div
            key="test-opened-banner"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl border border-emerald-200/60 bg-emerald-50/80 dark:bg-emerald-950/25 text-sm"
          >
            <CheckCircle2 className="w-4 h-4 inline-block mr-1.5 text-emerald-600 align-[-2px]" />
            Test opened in a new tab. Select another test above to open a different form.
          </motion.div>
        ) : activeTest && (
          <motion.div
            key={`${registeredUid}-${bandId}-${testId}`}
            className="modules-test-panel modules-test-panel--animated"
            variants={panelMotion}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="modules-test-panel__head">
              <div className="flex items-start gap-3 min-w-0">
                <motion.span
                  className="modules-test-panel__emoji"
                  initial={{ rotate: -8, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                >
                  {activeTest.icon || '📋'}
                </motion.span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-base">{activeTest.title}</h4>
                    <span className="modules-test-panel__badge">
                      {activeTestIndex + 1} of {testCount}
                    </span>
                  </div>
                  <p className="text-sm dash-card-meta mt-0.5">{activeTest.desc}</p>
                </div>
              </div>
            </div>

            {activeTest.url ? (
              <motion.div
                className={`modules-test-launch ${!testVerified ? 'modules-test-launch--locked' : ''}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.35 }}
              >
                {testVerified && (
                  <div className="modules-test-verified-badge">
                    <ShieldCheck className="w-4 h-4" />
                    Verified — {registeredEmail || registeredName || registeredUid}
                  </div>
                )}

                <div className="modules-test-form-account-bar" aria-label="Registered account for this test">
                  <Mail className="w-4 h-4 shrink-0 opacity-70" aria-hidden="true" />
                  <span>
                    Registered email:{' '}
                    <strong>{registeredEmail || 'Not set — add email in profile'}</strong>
                  </span>
                </div>

                <div className="modules-test-launch__body">
                  {!testVerified ? (
                    <div className="modules-test-launch__locked">
                      <Lock className="w-10 h-10 text-amber-600 mx-auto mb-3" />
                      <p className="font-bold text-center">Verify your registered account first</p>
                      <p className="text-sm dash-card-meta text-center mt-2 max-w-sm mx-auto">
                        Enter your Dream Mantra ID and password — the test form will open automatically in a new tab.
                      </p>
                      <button
                        type="button"
                        className="btn-primary mt-4 mx-auto block !py-2.5 !px-6"
                        onClick={() => promptVerify(true, activeTest)}
                      >
                        <ShieldCheck className="w-4 h-4 inline-block mr-1.5 align-[-2px]" />
                        Login with registered ID
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="modules-test-launch__lead">
                        Your details are prefilled in the form. Only your registered account is used — no other email.
                      </p>

                      <dl className="modules-test-launch__fields">
                        <div>
                          <dt>Dreamz ID</dt>
                          <dd>{registeredUid}</dd>
                        </div>
                        {registeredName && (
                          <div>
                            <dt>Name</dt>
                            <dd>{registeredName}</dd>
                          </div>
                        )}
                        {identity?.userPhone && (
                          <div>
                            <dt>Phone</dt>
                            <dd>{identity.userPhone}</dd>
                          </div>
                        )}
                        {registeredEmail && (
                          <div>
                            <dt>Email</dt>
                            <dd>{registeredEmail}</dd>
                          </div>
                        )}
                      </dl>

                      <div className="modules-test-launch__actions">
                        <motion.button
                          type="button"
                          onClick={handleStartTest}
                          className="btn-primary inline-flex items-center gap-2 !py-3 !px-6"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Play className="w-4 h-4" />
                          Start {activeTest.shortTitle} test
                        </motion.button>
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="modules-test-launch__copy"
                        >
                          <Copy className="w-4 h-4" />
                          {copied ? 'Link copied' : 'Copy test link'}
                        </button>
                      </div>

                      <p className="modules-test-launch__hint text-xs dash-card-meta">
                        When the form opens, use <strong>{registeredEmail || 'your registered email'}</strong> only if Google asks you to sign in.
                      </p>
                    </>
                  )}
                </div>
              </motion.div>
            ) : (
              <p className="text-sm dash-card-meta p-4">Test form unavailable.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.p
        className="modules-tests-footer text-xs dash-card-meta mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}
      >
        <CheckCircle2 className="w-3.5 h-3.5 inline-block mr-1 text-emerald-600 align-[-2px]" />
        Submissions are linked to ID <strong>{registeredUid}</strong>
        {registeredEmail ? <> ({registeredEmail})</> : null}. Questions? WhatsApp or call{' '}
        <strong>9680102276</strong>.
      </motion.p>
    </div>
  );
}
