import { getData, saveData } from './database.js';
import { userHasCounsellingAccess } from './userAccess.js';
import { normalizeProfile } from './profile.js';

export function ensureSlotsInitialized() {
  const data = getData();
  if (!data.availability_slots) data.availability_slots = [];
  if (!data.nextId.availability_slots) data.nextId.availability_slots = 1;
}

export function buildUserSnapshot(user) {
  if (!user) return null;
  return {
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    profile: normalizeProfile(user.profile),
    captured_at: new Date().toISOString(),
  };
}

export function listSlots({ from, to } = {}) {
  ensureSlotsInitialized();
  let slots = getData().availability_slots || [];
  if (from) slots = slots.filter((s) => s.start_at >= from);
  if (to) slots = slots.filter((s) => s.start_at <= to);
  return slots.sort((a, b) => new Date(a.start_at) - new Date(b.start_at));
}

export function getAvailableSlots({ from, to, slot_type, session_number } = {}) {
  const nowIso = new Date().toISOString();
  const fromBound = from && from > nowIso ? from : nowIso;
  let slots = listSlots({ from: fromBound, to }).filter(
    (s) => s.status === 'open' && (s.booked_count || 0) < (s.capacity || 1) && s.start_at >= nowIso
  );
  if (slot_type) {
    slots = slots.filter((s) => (s.slot_type || 'counselling') === slot_type);
  }
  if (session_number != null && session_number !== '') {
    slots = slots.filter((s) => Number(s.session_number) === Number(session_number));
  }
  return slots;
}

export function getSlotBookings(slotId) {
  const data = getData();
  return (data.consultations || [])
    .filter((c) => c.slot_id === Number(slotId))
    .map((c) => {
      const u = data.users.find((x) => x.id === c.user_id);
      return {
        ...c,
        user_name: c.user_snapshot?.name || u?.name,
        email: c.user_snapshot?.email || u?.email,
        phone: c.user_snapshot?.phone || u?.phone,
        user_profile: c.user_snapshot?.profile || normalizeProfile(u?.profile),
      };
    });
}

export function createSlot({
  start_at,
  end_at,
  mode = 'online',
  location,
  title,
  meeting_link,
  capacity = 1,
  counsellor,
  slot_type = 'counselling',
  session_number = null,
}) {
  ensureSlotsInitialized();
  const data = getData();
  if (!start_at || !end_at) throw new Error('Start and end time required');
  if (new Date(end_at) <= new Date(start_at)) throw new Error('End time must be after start time');

  const id = data.nextId.availability_slots++;
  const row = {
    id,
    title: title || 'Career Counselling Session',
    start_at,
    end_at,
    mode: mode || 'online',
    location: location || (mode === 'offline' ? 'Jaipur' : 'Online'),
    meeting_link: meeting_link || null,
    capacity: Math.max(1, Number(capacity) || 1),
    booked_count: 0,
    status: 'open',
    counsellor: counsellor || 'Esha Lohiya',
    slot_type: slot_type || 'counselling',
    session_number: session_number != null && session_number !== '' ? Number(session_number) : null,
    created_at: new Date().toISOString(),
  };
  data.availability_slots.push(row);
  saveData();
  return row;
}

export function updateSlot(id, patch) {
  ensureSlotsInitialized();
  const slot = getData().availability_slots?.find((s) => s.id === Number(id));
  if (!slot) return null;

  const nextStart = patch.start_at !== undefined ? patch.start_at : slot.start_at;
  const nextEnd = patch.end_at !== undefined ? patch.end_at : slot.end_at;
  if (new Date(nextEnd) <= new Date(nextStart)) {
    throw new Error('End time must be after start time');
  }
  if (patch.capacity !== undefined) {
    const cap = Math.max(1, Number(patch.capacity) || 1);
    if (cap < (slot.booked_count || 0)) {
      throw new Error(`Capacity cannot be less than booked count (${slot.booked_count})`);
    }
  }

  const allowed = ['start_at', 'end_at', 'mode', 'location', 'title', 'meeting_link', 'capacity', 'status', 'counsellor', 'slot_type', 'session_number'];
  for (const key of allowed) {
    if (patch[key] !== undefined) {
      slot[key] = key === 'capacity' ? Math.max(1, Number(patch[key]) || 1) : patch[key];
    }
  }
  if (slot.booked_count >= slot.capacity) slot.status = 'full';
  else if (slot.status === 'full' && slot.booked_count < slot.capacity) slot.status = 'open';
  saveData();
  return slot;
}

export function deleteSlot(id) {
  ensureSlotsInitialized();
  const data = getData();
  const idx = data.availability_slots.findIndex((s) => s.id === Number(id));
  if (idx < 0) return false;
  const slot = data.availability_slots[idx];
  if (slot.booked_count > 0) throw new Error('Cannot delete a slot that has bookings');
  data.availability_slots.splice(idx, 1);
  saveData();
  return true;
}

function nextIstDate(dateStr) {
  const d = new Date(`${dateStr}T12:00:00+05:30`);
  d.setTime(d.getTime() + 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(d);
}

function istDayOfWeek(dateStr) {
  return new Date(`${dateStr}T12:00:00+05:30`).getUTCDay();
}

export function createBulkSlots({
  startDate,
  endDate,
  daysOfWeek = [1, 2, 3, 4, 5, 6],
  startTime,
  endTime,
  mode = 'online',
  location,
  title,
  meeting_link,
  capacity = 1,
  counsellor,
  slot_type = 'counselling',
  session_number = null,
}) {
  if (!startDate || !endDate || !startTime || !endTime) {
    throw new Error('Start date, end date, start time and end time are required');
  }
  if (endDate < startDate) throw new Error('End date must be on or after start date');

  const daySet = new Set((daysOfWeek || []).map(Number));
  const created = [];
  const errors = [];
  let cur = startDate;

  while (cur <= endDate) {
    if (daySet.has(istDayOfWeek(cur))) {
      try {
        const start_at = new Date(`${cur}T${startTime}:00+05:30`).toISOString();
        const end_at = new Date(`${cur}T${endTime}:00+05:30`).toISOString();
        created.push(createSlot({
          start_at,
          end_at,
          mode,
          location,
          title,
          meeting_link,
          capacity,
          counsellor,
          slot_type,
          session_number,
        }));
      } catch (e) {
        errors.push({ date: cur, message: e.message });
      }
    }
    if (cur === endDate) break;
    cur = nextIstDate(cur);
  }

  return { created, errors, count: created.length };
}

export function deleteBulkSlots({ from, to, onlyEmpty = true } = {}) {
  ensureSlotsInitialized();
  const data = getData();
  const fromTs = from ? new Date(`${from}T00:00:00+05:30`).toISOString() : null;
  const toTs = to ? new Date(`${to}T23:59:59+05:30`).toISOString() : null;

  const ids = [];
  let skippedBooked = 0;

  for (const slot of data.availability_slots || []) {
    if (fromTs && slot.start_at < fromTs) continue;
    if (toTs && slot.start_at > toTs) continue;
    if (onlyEmpty && (slot.booked_count || 0) > 0) {
      skippedBooked += 1;
      continue;
    }
    ids.push(slot.id);
  }

  let deleted = 0;
  const errors = [];
  for (const id of ids) {
    try {
      if (deleteSlot(id)) deleted += 1;
    } catch (e) {
      errors.push({ id, message: e.message });
    }
  }

  return { deleted, skippedBooked, errors };
}

export function bookConsultationWithSlot(userId, { program, notes, slot_id }, userRecord = null) {
  if (!userHasCounsellingAccess(userId)) {
    throw new Error('Counselling sessions unlock when you purchase a module with counselling.');
  }
  ensureSlotsInitialized();
  const data = getData();
  const slot = data.availability_slots.find((s) => s.id === Number(slot_id));
  if (!slot || slot.status !== 'open') throw new Error('This time slot is no longer available');
  if ((slot.booked_count || 0) >= (slot.capacity || 1)) throw new Error('This time slot is full');

  const user = userRecord || data.users.find((u) => u.id === Number(userId));
  const snapshot = buildUserSnapshot(user);

  slot.booked_count = (slot.booked_count || 0) + 1;
  if (slot.booked_count >= slot.capacity) slot.status = 'full';

  const id = data.nextId.consultations++;
  const row = {
    id,
    user_id: userId,
    program: program || 'General',
    notes: notes || null,
    slot_id: slot.id,
    slot_title: slot.title || 'Career Counselling Session',
    scheduled_at: slot.start_at,
    end_at: slot.end_at,
    mode: slot.mode,
    location: slot.location,
    meeting_link: slot.meeting_link || null,
    counsellor: slot.counsellor || 'Esha Lohiya',
    user_snapshot: snapshot,
    booking_type: 'counselling',
    session_number: null,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  data.consultations.push(row);
  saveData();
  return { consultation: row, slot };
}

export function bookProgramSessionsBatch(userId, sessions = [], notes = '', userRecord = null) {
  if (!Array.isArray(sessions) || !sessions.length) throw new Error('Select slots for all sessions');
  const sorted = [...sessions].sort((a, b) => Number(a.session_number) - Number(b.session_number));
  for (let i = 0; i < sorted.length; i += 1) {
    if (Number(sorted[i].session_number) !== i + 1) {
      throw new Error('Book sessions in order from Session 1 through Session 8');
    }
  }
  if (sorted.length !== 8) throw new Error('You must book all 8 sessions together');

  ensureSlotsInitialized();
  const data = getData();
  const existing = (data.consultations || []).filter(
    (c) => c.user_id === Number(userId) && c.booking_type === 'program_session' && c.status !== 'cancelled',
  );
  if (existing.some((c) => Number(c.session_number) >= 1 && Number(c.session_number) <= 8)) {
    throw new Error('Sessions already booked. Contact support to reschedule.');
  }

  const times = sorted.map((s) => {
    const slot = data.availability_slots.find((x) => x.id === Number(s.slot_id));
    if (!slot) throw new Error(`Slot not found for Session ${s.session_number}`);
    return new Date(slot.start_at).getTime();
  });
  for (let i = 1; i < times.length; i += 1) {
    if (times[i] <= times[i - 1]) {
      throw new Error(`Session ${i + 1} must be scheduled after Session ${i}`);
    }
  }

  const results = [];
  for (const s of sorted) {
    results.push(bookProgramSessionWithSlot(userId, { slot_id: s.slot_id, session_number: s.session_number, notes }, userRecord));
  }
  return results;
}

export function bookMockInterviewSessions(userId, sessions = [], notes = '', userRecord = null) {
  if (!Array.isArray(sessions) || !sessions.length) throw new Error('Select mock interview slots');
  const sorted = [...sessions].sort((a, b) => Number(a.session_number) - Number(b.session_number));
  for (const s of sorted) {
    const n = Number(s.session_number);
    if (n !== 9 && n !== 10) throw new Error('Mock interviews are Mock Interview 1 (session 9) and Mock Interview 2 (session 10)');
  }

  ensureSlotsInitialized();
  const data = getData();
  const existing = (data.consultations || []).filter(
    (c) => c.user_id === Number(userId) && c.booking_type === 'program_session' && c.status !== 'cancelled',
  );
  const core = existing.filter((c) => {
    const n = Number(c.session_number);
    return n >= 1 && n <= 8;
  });
  if (core.length < 8) {
    throw new Error('Book all 8 career readiness sessions before mock interviews');
  }

  const already = new Set(existing.map((c) => Number(c.session_number)));
  for (const s of sorted) {
    if (already.has(Number(s.session_number))) {
      throw new Error(`${Number(s.session_number) === 9 ? 'Mock Interview 1' : 'Mock Interview 2'} is already booked`);
    }
  }
  if (sorted.some((s) => Number(s.session_number) === 10) && !already.has(9) && !sorted.some((s) => Number(s.session_number) === 9)) {
    throw new Error('Book Mock Interview 1 before Mock Interview 2');
  }

  const lastCore = core.reduce((max, c) => Math.max(max, new Date(c.scheduled_at).getTime()), 0);
  const mock9Existing = existing.find((c) => Number(c.session_number) === 9);
  let prev = mock9Existing ? new Date(mock9Existing.scheduled_at).getTime() : lastCore;

  const results = [];
  for (const s of sorted) {
    const slot = data.availability_slots.find((x) => x.id === Number(s.slot_id));
    if (!slot) throw new Error(`Slot not found for ${Number(s.session_number) === 9 ? 'Mock Interview 1' : 'Mock Interview 2'}`);
    const t = new Date(slot.start_at).getTime();
    if (t <= prev) {
      throw new Error(`${Number(s.session_number) === 9 ? 'Mock Interview 1' : 'Mock Interview 2'} must be after your previous session`);
    }
    results.push(bookProgramSessionWithSlot(userId, { slot_id: s.slot_id, session_number: s.session_number, notes }, userRecord));
    prev = t;
  }
  return results;
}

export function bookProgramSessionWithSlot(userId, { slot_id, session_number, notes }, userRecord = null) {
  ensureSlotsInitialized();
  const data = getData();
  const slot = data.availability_slots.find((s) => s.id === Number(slot_id));
  if (!slot || slot.status !== 'open') throw new Error('This time slot is no longer available');
  if ((slot.slot_type || 'counselling') !== 'program_session') {
    throw new Error('This slot is not available for program sessions');
  }
  if (session_number != null && slot.session_number != null && Number(slot.session_number) !== Number(session_number)) {
    throw new Error('This slot is for a different session number');
  }
  if ((slot.booked_count || 0) >= (slot.capacity || 1)) throw new Error('This time slot is full');

  const existing = (data.consultations || []).find(
    (c) => c.user_id === Number(userId)
      && c.booking_type === 'program_session'
      && Number(c.session_number) === Number(session_number)
      && c.status !== 'cancelled',
  );
  if (existing) throw new Error(`You have already booked Session ${session_number}`);

  const user = userRecord || data.users.find((u) => u.id === Number(userId));
  const snapshot = buildUserSnapshot(user);

  slot.booked_count = (slot.booked_count || 0) + 1;
  if (slot.booked_count >= slot.capacity) slot.status = 'full';

  const id = data.nextId.consultations++;
  const row = {
    id,
    user_id: userId,
    program: 'Personalised Career Readiness Program',
    notes: notes || null,
    slot_id: slot.id,
    slot_title: slot.title || `Session ${session_number}`,
    scheduled_at: slot.start_at,
    end_at: slot.end_at,
    mode: slot.mode,
    location: slot.location,
    meeting_link: slot.meeting_link || null,
    counsellor: slot.counsellor || 'Esha Lohiya',
    user_snapshot: snapshot,
    booking_type: 'program_session',
    session_number: Number(session_number),
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  data.consultations.push(row);
  saveData();
  return { consultation: row, slot };
}

export function cancelConsultationByUser(userId, consultationId) {
  ensureSlotsInitialized();
  const data = getData();
  const c = data.consultations.find(
    (x) => x.id === Number(consultationId) && x.user_id === Number(userId)
  );
  if (!c) return { ok: false, error: 'Booking not found' };
  if (c.status === 'completed') return { ok: false, error: 'Completed sessions cannot be cancelled' };

  if (c.slot_id) {
    const slot = data.availability_slots.find((s) => s.id === Number(c.slot_id));
    if (slot && (slot.booked_count || 0) > 0) {
      slot.booked_count = Math.max(0, (slot.booked_count || 0) - 1);
      if (slot.status === 'full' && slot.booked_count < (slot.capacity || 1)) slot.status = 'open';
    }
  }

  c.status = 'cancelled';
  c.cancelled_at = new Date().toISOString();
  c.cancelled_by = 'user';
  saveData();
  return { ok: true, consultation: c };
}

export function seedSampleSlots() {
  ensureSlotsInitialized();
  const data = getData();
  if (data.availability_slots.length > 0) return;

  const shouldSeed =
    process.env.SEED_SAMPLE_SLOTS === 'true'
    || (process.env.NODE_ENV !== 'production' && process.env.SEED_SAMPLE_SLOTS !== 'false');
  if (!shouldSeed) return;

  const now = new Date();
  for (let d = 1; d <= 21; d++) {
    const day = new Date(now);
    day.setDate(day.getDate() + d);
    const dow = day.getDay();
    if (dow === 0) continue;

    for (const hour of [11, 15, 17]) {
      const start = new Date(day);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(start);
      end.setHours(hour + 1, 0, 0, 0);
      createSlot({
        start_at: start.toISOString(),
        end_at: end.toISOString(),
        mode: d % 2 ? 'online' : 'offline',
        location: d % 2 ? 'Online (Pan-India)' : 'Raja Park, Jaipur',
        title: d % 2 ? 'Online Career Counselling' : 'In-Person Counselling — Jaipur',
      });
    }
  }
}

export function formatSlotTime(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  });
}

export function updateConsultation(id, patch) {
  const data = getData();
  const c = data.consultations.find((x) => x.id === Number(id));
  if (!c) return null;
  const allowed = ['status', 'notes', 'meeting_link', 'admin_notes', 'slot_title', 'location'];
  for (const key of allowed) {
    if (patch[key] !== undefined) c[key] = patch[key];
  }
  saveData();
  return c;
}

export function enrichConsultation(c) {
  if (!c) return null;
  const data = getData();
  const u = data.users.find((x) => x.id === c.user_id);
  return {
    ...c,
    user_name: c.user_snapshot?.name || u?.name,
    user_uid: u?.user_uid,
    email: c.user_snapshot?.email || u?.email,
    phone: c.user_snapshot?.phone || u?.phone,
    user_profile: c.user_snapshot?.profile || normalizeProfile(u?.profile),
  };
}

export function listConsultationsEnriched() {
  const data = getData();
  return (data.consultations || [])
    .map(enrichConsultation)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}
