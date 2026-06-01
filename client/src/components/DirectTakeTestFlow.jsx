import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api';
import VerifyTestAccessModal from './VerifyTestAccessModal';
import { isTestAccessVerified, setTestAccessVerified } from '../utils/testAccessSession';
import {
  getSkillMappingTestsForBand,
  resolveSkillMappingBand,
  buildSkillMappingTestUrl,
} from '../data/moduleCatalog';

function buildFirstTestUrl(bandId, identity) {
  const tests = getSkillMappingTestsForBand(bandId);
  const first = tests[0];
  if (!first || !identity?.userUid) return null;
  return buildSkillMappingTestUrl(
    first.url,
    { userUid: identity.userUid, userName: identity.userName, phone: identity.userPhone },
    first.prefill || {},
    { embedded: false }
  );
}

/**
 * Opens Skill Mapping test in a new tab after ID verification — no page navigation.
 */
export default function DirectTakeTestFlow({
  assessment,
  userUid,
  userName,
  userPhone,
  userEmail,
  onClose,
  onError,
}) {
  const { token } = useAuth();
  const startedRef = useRef(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [identity, setIdentity] = useState(null);
  const [testUrl, setTestUrl] = useState(null);
  const [testTitle, setTestTitle] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!assessment?.id || !token || startedRef.current) return;
    startedRef.current = true;

    (async () => {
      try {
        const data = await userApi.getSkillTests(token, assessment.id);
        const nextIdentity = {
          userUid: String(data.registeredUserUid || userUid || '').trim(),
          userName: data.userName || userName || '',
          userPhone: data.phone || userPhone || '',
          userEmail: data.registeredEmail || userEmail || '',
        };
        const band = data.band || resolveSkillMappingBand(assessment);
        if (!nextIdentity.userUid) {
          onError?.('Dream Mantra ID not found. Log in with your registered account.');
          onClose?.();
          return;
        }
        if (!band) {
          onError?.('Select your class band first under Process & Take test.');
          onClose?.();
          return;
        }

        const tests = getSkillMappingTestsForBand(band);
        const url = buildFirstTestUrl(band, nextIdentity);
        if (!url) {
          onError?.('No test link available for your band.');
          onClose?.();
          return;
        }

        setIdentity(nextIdentity);
        setTestUrl(url);
        setTestTitle(tests[0]?.title || 'Skill Mapping test');

        if (isTestAccessVerified(nextIdentity.userUid)) {
          window.open(url, '_blank', 'noopener,noreferrer');
          onClose?.();
        } else {
          setVerifyOpen(true);
        }
      } catch (err) {
        onError?.(err.message || 'Could not load test');
        onClose?.();
      }
    })();
  }, [assessment, token, userUid, userName, userPhone, userEmail, onClose, onError]);

  const handleVerify = async ({ userUid: uid, password }) => {
    if (!assessment?.id || !token) return;
    setVerifying(true);
    setVerifyError('');
    try {
      const data = await userApi.verifyTestAccess(token, assessment.id, { userUid: uid, password });
      const verifiedUid = String(data.registeredUserUid || uid || identity?.userUid || '').trim();
      setTestAccessVerified(verifiedUid);
      setVerifyOpen(false);
      if (testUrl) window.open(testUrl, '_blank', 'noopener,noreferrer');
      onClose?.();
    } catch (err) {
      setVerifyError(err.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  if (!verifyOpen || !identity) return null;

  return (
    <VerifyTestAccessModal
      open={verifyOpen}
      onClose={() => {
        setVerifyOpen(false);
        onClose?.();
      }}
      registeredUid={identity.userUid}
      registeredEmail={identity.userEmail}
      registeredName={identity.userName}
      testTitle={testTitle}
      onVerify={handleVerify}
      verifying={verifying}
      error={verifyError}
    />
  );
}
