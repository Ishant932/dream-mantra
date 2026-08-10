import { useState, useMemo } from 'react';
import { Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';
import { READINESS_SESSIONS } from '../../data/crReadinessContent';
import SlotCalendar from '../SlotCalendar';
import { DashCard } from '../DashboardUI';

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

export default function SessionBookingPanel({ slots = [], slotsLoading, bookings = [], onBookAll, onMonthChange, displayUser }) {
  const [picks, setPicks] = useState({});
  const [activeSession, setActiveSession] = useState(1);
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);
  const [err, setErr] = useState('');

  const booked = useMemo(
    () => bookings.filter((b) => b.booking_type === 'program_session' && b.status !== 'cancelled'),
    [bookings],
  );
  const allBooked = booked.length >= 8;

  const nextToPick = useMemo(() => {
    for (let n = 1; n <= 8; n += 1) {
      if (!picks[n] && !booked.some((b) => Number(b.session_number) === n)) return n;
    }
    return null;
  }, [picks, booked]);

  const sessionSlots = useMemo(
    () => slots.filter((s) => s.slot_type === 'program_session' && Number(s.session_number) === activeSession),
    [slots, activeSession],
  );

  const pickSlot = (slot) => {
    if (activeSession !== nextToPick) return;
    setErr('');
    setPicks((prev) => ({ ...prev, [activeSession]: slot }));
    if (activeSession < 8) setActiveSession(activeSession + 1);
  };

  const validatePicks = () => {
    const nums = [...Array(8)].map((_, i) => i + 1);
    for (const n of nums) {
      if (!picks[n] && !booked.some((b) => Number(b.session_number) === n)) {
        return `Please select a slot for Session ${n}`;
      }
    }
    const dates = nums.map((n) => {
      const b = booked.find((x) => Number(x.session_number) === n);
      if (b) return new Date(b.scheduled_at).getTime();
      return new Date(picks[n].start_at).getTime();
    });
    for (let i = 1; i < dates.length; i += 1) {
      if (dates[i] <= dates[i - 1]) return `Session ${i + 1} must be after Session ${i} in date & time`;
    }
    return null;
  };

  const handleBookAll = async (e) => {
    e.preventDefault();
    const v = validatePicks();
    if (v) { setErr(v); return; }
    const sessions = [...Array(8)].map((_, i) => i + 1)
      .filter((n) => picks[n])
      .map((n) => ({ session_number: n, slot_id: picks[n].id }));
    setBooking(true);
    setErr('');
    try {
      await onBookAll?.({ sessions, notes });
      setPicks({});
    } catch (ex) {
      setErr(ex.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (allBooked) {
    return (
      <div className="space-y-3">
        <DashCard className="!p-5 border-emerald-200/60 !overflow-visible" glow={false} hover={false}>
          <p className="font-bold text-emerald-800 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> All 8 sessions booked</p>
          <p className="text-sm dash-card-meta mt-2">Your schedule (earliest first):</p>
          <div className="mt-3 space-y-2">
            {[...booked].sort((a, b) => Number(a.session_number) - Number(b.session_number)).map((b) => (
              <div key={b.id} className="text-sm p-3 rounded-lg bg-emerald-50/80 border border-emerald-200/50">
                <strong>Session {b.session_number}</strong> — {formatWhen(b.scheduled_at)} · {durationLabel(b.scheduled_at, b.end_at)}
                {b.meeting_link && <> · <a href={b.meeting_link} target="_blank" rel="noreferrer" className="text-amber-700 underline">Join</a></>}
              </div>
            ))}
          </div>
        </DashCard>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DashCard className="!p-4 border-amber-300/60 bg-amber-50/90 !overflow-visible" glow={false} hover={false}>
        <p className="text-sm font-bold text-amber-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> Important — read before booking
        </p>
        <ul className="text-sm dash-card-meta mt-2 space-y-1 list-disc pl-5">
          <li>Book <strong>all 8 sessions in one go</strong> — you cannot book one today and others later.</li>
          <li>Pick <strong>Session 1 first</strong>, then Session 2, and so on up to Session 8.</li>
          <li>Each next session must be on a <strong>later date/time</strong> than the previous (Session 2 after Session 1, etc.).</li>
        </ul>
      </DashCard>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {READINESS_SESSIONS.map((s) => {
          const done = booked.some((b) => Number(b.session_number) === s.number);
          const picked = picks[s.number];
          const canOpen = s.number === nextToPick || picked || done;
          return (
            <button key={s.number} type="button" disabled={!canOpen && !done}
              onClick={() => canOpen && setActiveSession(s.number)}
              className={`text-left rounded-xl border p-3 transition ${activeSession === s.number ? 'border-amber-500 bg-amber-50/80' : 'border-amber-200/60'} ${!canOpen && !done ? 'opacity-45 cursor-not-allowed' : 'hover:border-amber-300'}`}>
              <p className="text-xs font-bold text-amber-700">Session {s.number}</p>
              <p className="font-semibold text-sm mt-0.5 line-clamp-2">{s.title}</p>
              {done && <span className="text-xs text-emerald-700 flex items-center gap-1 mt-1"><CheckCircle2 className="w-3 h-3" /> Booked</span>}
              {picked && !done && <span className="text-xs text-amber-800 mt-1 block">{formatWhen(picked.start_at)}</span>}
            </button>
          );
        })}
      </div>

      {nextToPick && (
        <form onSubmit={handleBookAll} className="space-y-4">
          <DashCard className="!p-5 !overflow-visible" glow={false} hover={false}>
            <h4 className="font-bold flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5 text-amber-600" /> Session {activeSession}: {READINESS_SESSIONS[activeSession - 1]?.title}
            </h4>
            <p className="text-sm dash-card-meta mb-3">
              {activeSession === nextToPick ? `Select a slot for Session ${activeSession}` : `Finish Session ${nextToPick} first`}
            </p>
            {activeSession === nextToPick && (
              <>
                <SlotCalendar mode="user" size="large" slots={sessionSlots} loading={slotsLoading}
                  selectedId={picks[activeSession]?.id} onSelect={pickSlot} onMonthChange={onMonthChange} />
                {picks[activeSession] && (
                  <div className="mt-4 p-4 rounded-xl bg-amber-50/80 border border-amber-200/60 text-sm">
                    <p><strong>When:</strong> {formatWhen(picks[activeSession].start_at)}</p>
                    <p><strong>Duration:</strong> {durationLabel(picks[activeSession].start_at, picks[activeSession].end_at)}</p>
                  </div>
                )}
              </>
            )}
          </DashCard>

          {Object.keys(picks).length === 8 && (
            <>
              <textarea className="w-full rounded-xl border border-amber-200/60 p-3 text-sm min-h-[72px] bg-white"
                placeholder="Notes for your sessions (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
              {err && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
              <button type="submit" className="btn-primary w-full sm:w-auto" disabled={booking}>
                {booking ? 'Booking all sessions…' : 'Book all 8 sessions now'}
              </button>
            </>
          )}
        </form>
      )}

      {displayUser?.user_uid && <p className="text-xs dash-card-meta">Dream Mantra ID: {displayUser.user_uid}</p>}
    </div>
  );
}
