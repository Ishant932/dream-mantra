import { useState, useMemo } from 'react';
import { Calendar, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';
import { READINESS_SESSIONS, MOCK_INTERVIEW_SESSIONS, CORE_SESSION_COUNT, programSessionTitle } from '../../data/crReadinessContent';
import { allCoreProgramSessionsComplete } from '../../utils/counsellingStatus';
import { DashCard } from '../DashboardUI';

const CORE_NUMS = [...Array(CORE_SESSION_COUNT)].map((_, i) => i + 1);
const MOCK_NUMS = MOCK_INTERVIEW_SESSIONS.map((s) => s.number);

function formatWhen(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
  });
}

function durationLabel(start, end) {
  if (!start || !end) return '—';
  const mins = Math.round((new Date(end) - new Date(start)) / 60000);
  if (mins < 60) return `${mins} mins`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h} hour${h > 1 ? 's' : ''}`;
}

function slotOptions(slots, sessionNumber) {
  return slots
    .filter((s) => s.slot_type === 'program_session' && Number(s.session_number) === sessionNumber)
    .sort((a, b) => new Date(a.start_at) - new Date(b.start_at));
}

function BookedList({ booked }) {
  return (
    <div className="mt-3 space-y-2">
      {[...booked].sort((a, b) => Number(a.session_number) - Number(b.session_number)).map((b) => (
        <div key={b.id} className="text-sm p-3 rounded-lg bg-emerald-50/80 border border-emerald-200/50">
          <strong>{programSessionTitle(b.session_number)}</strong>
          {' '}— {formatWhen(b.scheduled_at)} · {durationLabel(b.scheduled_at, b.end_at)}
          {b.meeting_link && <> · <a href={b.meeting_link} target="_blank" rel="noreferrer" className="text-amber-700 underline">Join</a></>}
        </div>
      ))}
    </div>
  );
}

function SessionSelectRow({ sessionNum, title, slots, value, onChange, disabled, booked }) {
  const options = slotOptions(slots, sessionNum);
  const grouped = useMemo(() => {
    const map = new Map();
    for (const s of options) {
      const day = new Date(s.start_at).toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata',
      });
      if (!map.has(day)) map.set(day, []);
      map.get(day).push(s);
    }
    return map;
  }, [options]);

  if (booked) {
    return (
      <div className="session-form-row session-form-row--done">
        <label className="session-form-row__label">{title}</label>
        <p className="text-sm text-emerald-800 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Booked — {formatWhen(booked.scheduled_at)}</p>
      </div>
    );
  }
  return (
    <div className="session-form-row">
      <label className="session-form-row__label" htmlFor={`session-slot-${sessionNum}`}>{title}</label>
      <select
        id={`session-slot-${sessionNum}`}
        className="input-field w-full"
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        disabled={disabled}
      >
        <option value="">Select date & time…</option>
        {[...grouped.entries()].map(([day, daySlots]) => (
          <optgroup key={day} label={day}>
            {daySlots.map((s) => (
              <option key={s.id} value={s.id}>
                {formatWhen(s.start_at)} · {durationLabel(s.start_at, s.end_at)}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {!options.length && <p className="text-xs dash-card-meta mt-1">No slots available yet — check back soon.</p>}
    </div>
  );
}

export default function SessionBookingPanel({ slots = [], slotsLoading, bookings = [], onBookAll, displayUser }) {
  const [picks, setPicks] = useState({});
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);
  const [err, setErr] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const booked = useMemo(
    () => bookings.filter((b) => b.booking_type === 'program_session' && b.status !== 'cancelled'),
    [bookings],
  );
  const coreBooked = booked.filter((b) => {
    const n = Number(b.session_number);
    return n >= 1 && n <= CORE_SESSION_COUNT;
  });
  const mockBooked = booked.filter((b) => MOCK_NUMS.includes(Number(b.session_number)));
  const allCoreBooked = coreBooked.length >= CORE_SESSION_COUNT;
  const allMocksBooked = MOCK_NUMS.every((n) => mockBooked.some((b) => Number(b.session_number) === n));
  const coreSessionsComplete = allCoreProgramSessionsComplete(booked, CORE_SESSION_COUNT);

  const bookedByNum = useMemo(() => {
    const m = {};
    for (const b of booked) m[Number(b.session_number)] = b;
    return m;
  }, [booked]);

  const setPick = (num, slotId) => {
    setErr('');
    setPicks((prev) => {
      const next = { ...prev };
      if (slotId) next[num] = slotId;
      else delete next[num];
      return next;
    });
  };

  const getSlotTime = (num) => {
    const b = bookedByNum[num];
    if (b) return new Date(b.scheduled_at).getTime();
    const id = picks[num];
    if (!id) return null;
    const slot = slots.find((s) => s.id === Number(id));
    return slot ? new Date(slot.start_at).getTime() : null;
  };

  const validateCore = () => {
    for (const n of CORE_NUMS) {
      if (!bookedByNum[n] && !picks[n]) return `Please select date & time for Session ${n}`;
    }
    const dates = CORE_NUMS.map((n) => getSlotTime(n));
    for (let i = 1; i < dates.length; i += 1) {
      if (dates[i] <= dates[i - 1]) return `Session ${i + 1} must be on a later date/time than Session ${i}`;
    }
    return null;
  };

  const validateMocks = () => {
    const remaining = MOCK_NUMS.filter((n) => !bookedByNum[n]);
    for (const n of remaining) {
      if (!picks[n]) return `Please select date & time for ${programSessionTitle(n)}`;
    }
    const lastCore = coreBooked.reduce((max, b) => Math.max(max, new Date(b.scheduled_at).getTime()), 0);
    let prev = bookedByNum[9] ? new Date(bookedByNum[9].scheduled_at).getTime() : lastCore;
    for (const n of MOCK_NUMS) {
      const t = getSlotTime(n);
      if (t == null) continue;
      if (t <= prev) return `${programSessionTitle(n)} must be after your previous session`;
      prev = t;
    }
    return null;
  };

  const handleBookCore = async (e) => {
    e.preventDefault();
    const v = validateCore();
    if (v) { setErr(v); return; }
    const sessions = CORE_NUMS.filter((n) => picks[n]).map((n) => ({ session_number: n, slot_id: picks[n] }));
    setBooking(true);
    setErr('');
    try {
      await onBookAll?.({ sessions, notes });
      setPicks({});
      setNotes('');
      setSubmitted(true);
    } catch (ex) {
      setErr(ex.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const handleBookMocks = async (e) => {
    e.preventDefault();
    const v = validateMocks();
    if (v) { setErr(v); return; }
    const sessions = MOCK_NUMS.filter((n) => picks[n] && !bookedByNum[n]).map((n) => ({ session_number: n, slot_id: picks[n] }));
    setBooking(true);
    setErr('');
    try {
      await onBookAll?.({ sessions, notes });
      setPicks({});
      setNotes('');
      setSubmitted(true);
    } catch (ex) {
      setErr(ex.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (allCoreBooked && allMocksBooked) {
    return (
      <DashCard className="!p-5 border-emerald-200/60 !overflow-visible" glow={false} hover={false}>
        <p className="font-bold text-emerald-800 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> All sessions booked</p>
        <BookedList booked={booked} />
      </DashCard>
    );
  }

  if (allCoreBooked && submitted && !allMocksBooked) {
    return (
      <div className="space-y-4">
        <DashCard className="!p-5 border-emerald-200/60" glow={false} hover={false}>
          <p className="font-bold text-emerald-800">Your 8 sessions are confirmed and cannot be edited.</p>
          <BookedList booked={coreBooked} />
        </DashCard>
      </div>
    );
  }

  if (allCoreBooked) {
    return (
      <div className="space-y-4">
        <DashCard className="!p-5 border-emerald-200/60" glow={false} hover={false}>
          <p className="font-bold text-emerald-800 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> All 8 sessions booked</p>
          <BookedList booked={coreBooked} />
        </DashCard>

        <DashCard className={`!p-5 !overflow-visible${!coreSessionsComplete ? ' opacity-90' : ''}`} glow={false} hover={false}>
          <h4 className="font-bold flex items-center gap-2 mb-3">
            {coreSessionsComplete ? <Calendar className="w-5 h-5 text-amber-600" /> : <Lock className="w-5 h-5 text-amber-600" />}
            Mock interview scheduling
          </h4>
          {!coreSessionsComplete ? (
            <p className="text-sm dash-card-meta">Mock interviews unlock after all 8 sessions are completed. Sessions auto-complete the day after each scheduled date.</p>
          ) : (
            <form onSubmit={handleBookMocks} className="space-y-4 session-schedule-form">
              <p className="text-sm dash-card-meta">Pick date & time for each mock interview. Session 2 must be after Session 1.</p>
              {MOCK_INTERVIEW_SESSIONS.map((s) => (
                <SessionSelectRow
                  key={s.number}
                  sessionNum={s.number}
                  title={s.title}
                  slots={slots}
                  value={picks[s.number]}
                  onChange={(id) => setPick(s.number, id)}
                  disabled={slotsLoading || !!bookedByNum[s.number]}
                  booked={bookedByNum[s.number]}
                />
              ))}
              <textarea className="w-full rounded-xl border border-amber-200/60 p-3 text-sm min-h-[72px] bg-white"
                placeholder="Notes for mock interviews (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
              {err && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
              <button type="submit" className="btn-primary w-full sm:w-auto" disabled={booking || slotsLoading}>
                {booking ? 'Booking…' : 'Confirm mock interviews'}
              </button>
            </form>
          )}
        </DashCard>
        {displayUser?.user_uid && <p className="text-xs dash-card-meta">Dream Mantra ID: {displayUser.user_uid}</p>}
      </div>
    );
  }

  if (submitted && allCoreBooked) {
    return (
      <DashCard className="!p-5 border-emerald-200/60" glow={false} hover={false}>
        <p className="font-bold text-emerald-800">Schedule saved — your sessions cannot be edited.</p>
        <BookedList booked={coreBooked.length ? coreBooked : booked} />
      </DashCard>
    );
  }

  return (
    <div className="space-y-4">
      <DashCard className="!p-4 border-amber-300/60 bg-amber-50/90" glow={false} hover={false}>
        <p className="text-sm font-bold text-amber-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> Schedule all sessions at once
        </p>
        <ul className="text-sm dash-card-meta mt-2 space-y-1 list-disc pl-5">
          <li>Select <strong>date & time</strong> for Session 1, then Session 2, and so on up to Session 8.</li>
          <li>Each next session must be on a <strong>later date/time</strong> than the previous.</li>
          <li>Once submitted, your schedule <strong>cannot be edited</strong>.</li>
          <li>Mock interviews unlock after all 8 sessions are completed.</li>
        </ul>
      </DashCard>

      <form onSubmit={handleBookCore} className="session-schedule-form space-y-4">
        <DashCard className="!p-5 !overflow-visible" glow={false} hover={false}>
          <h4 className="font-bold flex items-center gap-2 mb-4"><Calendar className="w-5 h-5 text-amber-600" /> Your session schedule</h4>
          {READINESS_SESSIONS.map((s) => (
            <SessionSelectRow
              key={s.number}
              sessionNum={s.number}
              title={`Session ${s.number}`}
              slots={slots}
              value={picks[s.number]}
              onChange={(id) => setPick(s.number, id)}
              disabled={slotsLoading || !!bookedByNum[s.number]}
              booked={bookedByNum[s.number]}
            />
          ))}
        </DashCard>
        <textarea className="w-full rounded-xl border border-amber-200/60 p-3 text-sm min-h-[72px] bg-white"
          placeholder="Notes for your sessions (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        {err && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={booking || slotsLoading}>
          {booking ? 'Booking all sessions…' : 'Confirm all 8 sessions'}
        </button>
      </form>
      {displayUser?.user_uid && <p className="text-xs dash-card-meta">Dream Mantra ID: {displayUser.user_uid}</p>}
    </div>
  );
}
