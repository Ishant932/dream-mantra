const TZ = 'Asia/Kolkata';

/** Date parts in IST — Y (last digit of year), MM, DD */
export function registrationDateParts(iso = new Date().toISOString()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .formatToParts(new Date(iso))
      .map((p) => [p.type, p.value])
  );
  const year = Number(parts.year);
  return {
    y: String(year % 10),
    mm: parts.month,
    dd: parts.day,
    dateKey: `${String(year % 10)}${parts.month}${parts.day}`,
  };
}

/** Legacy key for migration lookups */
export function registrationDateKey(iso = new Date().toISOString()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: TZ,
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    })
      .formatToParts(new Date(iso))
      .map((p) => [p.type, p.value])
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

/**
 * Public unique ID — YMMDDXXXX (odd sequence only)
 * e.g. 2026-05-21 1st registration → 605210001, 2nd → 605210003
 */
export function formatUserUid(createdAt, dailySequence) {
  const { y, mm, dd } = registrationDateParts(createdAt);
  const oddSeq = Math.max(1, dailySequence) * 2 - 1;
  return `${y}${mm}${dd}${String(oddSeq).padStart(4, '0')}`;
}

/** Next UID for a new registration on the given date */
export function nextUserUid(store, createdAt = new Date().toISOString()) {
  const { dateKey } = registrationDateParts(createdAt);
  const sameDay = (store.users || []).filter((u) => {
    if (!u.created_at) return false;
    return registrationDateParts(u.created_at).dateKey === dateKey;
  }).length;
  return formatUserUid(createdAt, sameDay + 1);
}

function normalizeUidInput(uid) {
  return String(uid || '').trim().replace(/^DM-/i, '');
}

export function findUserByUid(uid, store) {
  if (!uid || !store) return null;
  const normalized = normalizeUidInput(uid);
  return (store.users || []).find((u) => {
    const stored = normalizeUidInput(u.user_uid);
    return stored === normalized || u.user_uid === String(uid).trim();
  }) || null;
}

/** Assign canonical user_uid. Idempotent — re-runs assign odd-sequence IDs per day. */
export function ensureAllUserUids(store) {
  let changed = false;
  const users = [...(store.users || [])].sort(
    (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0) || a.id - b.id
  );
  const dayCounts = {};

  for (const user of users) {
    const { dateKey } = registrationDateParts(user.created_at || new Date().toISOString());
    dayCounts[dateKey] = (dayCounts[dateKey] || 0) + 1;
    const uid = formatUserUid(user.created_at, dayCounts[dateKey]);
    if (user.user_uid !== uid) {
      user.user_uid = uid;
      changed = true;
    }
  }

  return changed;
}

export function assignUserUid(user, store) {
  if (!user.created_at) user.created_at = new Date().toISOString();
  user.user_uid = nextUserUid(store, user.created_at);
  return user.user_uid;
}
