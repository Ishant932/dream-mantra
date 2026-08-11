/** Auto-mark past counselling / program sessions as completed. */

import { getData, saveData } from './database.js';

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

function isSessionPast(scheduledAt) {
  if (!scheduledAt) return false;
  const sessionDay = istDayStart(scheduledAt);
  const today = istDayStart(new Date().toISOString());
  return sessionDay < today;
}

export function syncAutoCompleteConsultationsForUser(userId) {
  const data = getData();
  let changed = false;
  for (const c of data.consultations || []) {
    if (Number(c.user_id) !== Number(userId)) continue;
    if (c.status === 'cancelled' || c.status === 'completed' || c.status === 'done') continue;
    if (c.scheduled_at && isSessionPast(c.scheduled_at)) {
      c.status = 'completed';
      changed = true;
    }
  }
  if (changed) saveData();
  return changed;
}

export function autoCompletePastConsultations(consultations = []) {
  let changed = false;
  for (const c of consultations) {
    if (!c || c.status === 'cancelled' || c.status === 'completed' || c.status === 'done') continue;
    if (c.scheduled_at && isSessionPast(c.scheduled_at)) {
      c.status = 'completed';
      changed = true;
    }
  }
  return changed;
}
