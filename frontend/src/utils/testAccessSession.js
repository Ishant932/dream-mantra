const KEY_PREFIX = 'dm_test_access_verified';
const DEFAULT_MINUTES = 30;

export function isTestAccessVerified(userUid) {
  if (!userUid) return false;
  try {
    const raw = sessionStorage.getItem(`${KEY_PREFIX}:${userUid}`);
    if (!raw) return false;
    const { expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) {
      sessionStorage.removeItem(`${KEY_PREFIX}:${userUid}`);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function setTestAccessVerified(userUid, minutes = DEFAULT_MINUTES) {
  if (!userUid) return;
  sessionStorage.setItem(
    `${KEY_PREFIX}:${userUid}`,
    JSON.stringify({ expiresAt: Date.now() + minutes * 60 * 1000 })
  );
}

export function clearAllTestAccessVerified() {
  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith(KEY_PREFIX)) sessionStorage.removeItem(key);
  });
}
