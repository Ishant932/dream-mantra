/** Counselling session status helpers (IST calendar day). */

function istDayStart(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const y = parts.find((p) => p.type === 'year')?.value;
  const m = parts.find((p) => p.type === 'month')?.value;
  const day = parts.find((p) => p.type === 'day')?.value;
  return new Date(`${y}-${m}-${day}T00:00:00+05:30`);
}

export function isConsultationSessionPast(consultation) {
  if (!consultation?.scheduled_at) return false;
  const sessionDay = istDayStart(consultation.scheduled_at);
  const today = istDayStart(new Date().toISOString());
  return sessionDay < today;
}

export function isConsultationComplete(consultation) {
  if (!consultation) return false;
  if (consultation.status === 'completed' || consultation.status === 'done') return true;
  return isConsultationSessionPast(consultation);
}

export function getCounsellingBookings(consultations = []) {
  return consultations.filter(
    (c) => c.status !== 'cancelled' && (!c.booking_type || c.booking_type === 'counselling'),
  );
}

export function hasCounsellingBooking(consultations = []) {
  return getCounsellingBookings(consultations).length > 0;
}

export function hasInitialCounsellingComplete(consultations = []) {
  return getCounsellingBookings(consultations).some(isConsultationComplete);
}

export function hasUpcomingCounsellingSession(consultations = []) {
  return getCounsellingBookings(consultations).some(
    (c) => !isConsultationComplete(c) && c.scheduled_at,
  );
}

/** Prerequisites before first counselling booking opens. */
export function counsellingPrerequisitesMet(focus, progress = {}, profileComplete = false) {
  const p = progress || {};
  if (!profileComplete && !p.profileComplete) return false;
  if (focus === 'brain') return !!p.fingerprintDone;
  if (focus === 'skill') {
    const tests = p.skillTestProgress;
    if (tests && typeof tests === 'object') {
      const vals = Object.values(tests);
      if (vals.length && vals.every((t) => t?.status === 'completed')) return true;
    }
    return p.step === 'complete' || !!p.completedAt || !!p.testsDone;
  }
  if (focus === 'combo') {
    const tests = p.skillTestProgress;
    let testsDone = p.step === 'complete' || !!p.completedAt || !!p.testsDone;
    if (tests && typeof tests === 'object') {
      const vals = Object.values(tests);
      if (vals.length) testsDone = vals.every((t) => t?.status === 'completed');
    }
    return !!p.fingerprintDone && testsDone;
  }
  return true;
}

export function canAccessCounsellingBooking(focus, progress, profileComplete, consultations) {
  if (!counsellingPrerequisitesMet(focus, progress, profileComplete)) return false;
  if (hasInitialCounsellingComplete(consultations)) return true;
  return !hasUpcomingCounsellingSession(consultations) || !hasCounsellingBooking(consultations);
}

export function canBookAdditionalCounselling(consultations = []) {
  return hasInitialCounsellingComplete(consultations);
}

export function allCoreProgramSessionsComplete(bookings = [], coreCount = 8) {
  const core = bookings.filter((b) => {
    const n = Number(b.session_number);
    return n >= 1 && n <= coreCount;
  });
  if (core.length < coreCount) return false;
  return core.every(isConsultationComplete);
}
