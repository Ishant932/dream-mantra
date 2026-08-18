import { useState, useMemo } from 'react';
import { Calendar, CheckCircle2, Lock, Clock, Link2 } from 'lucide-react';
import { MOCK_INTERVIEW_SESSIONS, CORE_SESSION_COUNT, programSessionTitle, READINESS_SESSIONS } from '../../data/crReadinessContent';
import { allCoreProgramSessionsComplete } from '../../utils/counsellingStatus';
import { useLang } from '../../context/LanguageContext';
import { DashCard } from '../DashboardUI';

const CORE_NUMS = [...Array(CORE_SESSION_COUNT)].map((_, i) => i + 1);
const MOCK_NUMS = MOCK_INTERVIEW_SESSIONS.map((s) => s.number);

function formatWhen(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
  });
}

function durationLabel(start, end, t) {
  if (!start || !end) return '—';
  const mins = Math.round((new Date(end) - new Date(start)) / 60000);
  if (mins < 60) return `${mins} ${t('sessionBooking.minutes')}`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} ${t('sessionBooking.hours')} ${m} ${t('sessionBooking.minutes')}` : `${h} ${t('sessionBooking.hours')}`;
}

function slotOptions(slots, minStartMs = 0) {
  const seen = new Set();
  return slots
    .filter((s) => s.slot_type === 'program_session')
    .filter((s) => !minStartMs || new Date(s.start_at).getTime() > minStartMs)
    .sort((a, b) => new Date(a.start_at) - new Date(b.start_at))
    .filter((s) => {
      const key = `${s.start_at}|${s.end_at}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function BookedSessionCard({ booking, t }) {
  const num = Number(booking.session_number);
  return (
    <div className="booked-session-card">
      <div className="booked-session-card__head">
        <span className="booked-session-card__badge">{t('sessionBooking.sessionNo')} {num}</span>
        <span className="booked-session-card__status">{booking.status || 'confirmed'}</span>
      </div>
      <h4 className="booked-session-card__title">{programSessionTitle(num)}</h4>
      <div className="booked-session-card__meta">
        <p className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 shrink-0 opacity-70" />
          {formatWhen(booking.scheduled_at)}
        </p>
        <p className="text-sm opacity-80">{durationLabel(booking.scheduled_at, booking.end_at, t)}</p>
        {booking.slot_title && <p className="text-sm opacity-80">{booking.slot_title}</p>}
        {booking.meeting_link && (
          <p className="flex items-center gap-1.5">
            <Link2 className="w-4 h-4 shrink-0 opacity-70" />
            <a href={booking.meeting_link} target="_blank" rel="noreferrer" className="text-amber-700 underline font-semibold">
              {t('sessionBooking.join')}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

function BookedSessionsGrid({ booked, t }) {
  if (!booked.length) return null;
  return (
    <div className="booked-sessions-grid">
      {[...booked].sort((a, b) => Number(a.session_number) - Number(b.session_number)).map((b) => (
        <BookedSessionCard key={b.id} booking={b} t={t} />
      ))}
    </div>
  );
}

export default function SessionBookingPanel({ slots = [], slotsLoading, bookings = [], onBookAll, displayUser }) {
  const { t } = useLang();
  const [picks, setPicks] = useState({});
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);
  const [err, setErr] = useState('');

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

  const remainingCore = useMemo(
    () => CORE_NUMS.filter((n) => !bookedByNum[n]),
    [bookedByNum],
  );
  const remainingMocks = useMemo(
    () => MOCK_NUMS.filter((n) => !bookedByNum[n]),
    [bookedByNum],
  );

  const setPick = (num, slotId) => {
    setErr('');
    setPicks((prev) => {
      const next = { ...prev };
      if (slotId) next[num] = slotId;
      else delete next[num];
      return next;
    });
  };

  const validateSessionOrder = (nums) => {
    let prev = 0;
    for (const n of nums) {
      const bookedPrev = bookedByNum[n - 1];
      if (n > 1 && bookedByNum[n - 1]) {
        prev = new Date(bookedByNum[n - 1].scheduled_at).getTime();
      } else if (n > 1 && picks[n - 1]) {
        const slotPrev = slots.find((s) => s.id === Number(picks[n - 1]));
        if (slotPrev) prev = Math.max(prev, new Date(slotPrev.start_at).getTime());
      }
      const id = picks[n];
      if (!id) return t('sessionBooking.pickAll');
      const slot = slots.find((s) => s.id === Number(id));
      const tms = slot ? new Date(slot.start_at).getTime() : 0;
      if (tms <= prev) return `${programSessionTitle(n)} — ${t('sessionBooking.orderError')}`;
      prev = tms;
    }
    return null;
  };

  const handleBookCore = async (e) => {
    e.preventDefault();
    const orderErr = validateSessionOrder(remainingCore);
    if (orderErr) { setErr(orderErr); return; }
    const sessions = remainingCore.map((n) => ({ session_number: n, slot_id: picks[n] }));
    setBooking(true);
    setErr('');
    try {
      await onBookAll?.({ sessions, notes });
      setPicks({});
      setNotes('');
    } catch (ex) {
      setErr(ex.message || t('sessionBooking.failed'));
    } finally {
      setBooking(false);
    }
  };

  const handleBookMocks = async (e) => {
    e.preventDefault();
    const orderErr = validateSessionOrder(remainingMocks);
    if (orderErr) { setErr(orderErr); return; }
    const sessions = remainingMocks.map((n) => ({ session_number: n, slot_id: picks[n] }));
    setBooking(true);
    setErr('');
    try {
      await onBookAll?.({ sessions, notes });
      setPicks({});
      setNotes('');
    } catch (ex) {
      setErr(ex.message || t('sessionBooking.failed'));
    } finally {
      setBooking(false);
    }
  };

  const coreSessionMeta = (n) => READINESS_SESSIONS.find((s) => s.number === n);

  if (allCoreBooked && allMocksBooked) {
    return (
      <div className="space-y-4">
        <DashCard className="!p-5 border-emerald-200/60 !overflow-visible" glow={false} hover={false}>
          <p className="font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5" /> {t('sessionBooking.allBooked')}
          </p>
          <BookedSessionsGrid booked={booked} t={t} />
        </DashCard>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {booked.length > 0 && (
        <DashCard className="!p-5 border-emerald-200/60" glow={false} hover={false}>
          <p className="font-bold text-emerald-800 dark:text-emerald-200 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" /> {t('sessionBooking.yourBooked')}
          </p>
          <BookedSessionsGrid booked={booked} t={t} />
        </DashCard>
      )}

      {!allCoreBooked && remainingCore.length > 0 && (
        <form onSubmit={handleBookCore} className="session-schedule-form session-schedule-form--bulk space-y-4">
          <DashCard className="!p-5 !overflow-visible" glow={false} hover={false}>
            <h4 className="font-bold flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-amber-600" /> {t('sessionBooking.bookAllCore')}
            </h4>
            <p className="text-sm dash-card-meta mb-4">{t('sessionBooking.bookAllCoreHint')}</p>
            <div className="space-y-3">
              {remainingCore.map((n) => {
                const meta = coreSessionMeta(n);
                const minTime = n > 1
                  ? (bookedByNum[n - 1]?.scheduled_at
                    ? new Date(bookedByNum[n - 1].scheduled_at).getTime()
                    : picks[n - 1]
                      ? new Date(slots.find((s) => s.id === picks[n - 1])?.start_at || 0).getTime()
                      : 0)
                  : 0;
                const options = slotOptions(slots, minTime);
                return (
                  <div key={n} className="session-form-row session-form-row--readonly-select">
                    <label className="session-form-row__label" htmlFor={`session-slot-${n}`}>
                      <span className="session-form-row__num">{t('sessionBooking.sessionNo')} {n}</span>
                      {meta?.title || programSessionTitle(n)}
                    </label>
                    <select
                      id={`session-slot-${n}`}
                      className="input-field w-full"
                      value={picks[n] || ''}
                      onChange={(e) => setPick(n, e.target.value ? Number(e.target.value) : null)}
                      disabled={slotsLoading}
                      required
                    >
                      <option value="">{t('sessionBooking.selectSlot')}</option>
                      {options.map((s) => (
                        <option key={s.id} value={s.id}>
                          {formatWhen(s.start_at)} · {durationLabel(s.start_at, s.end_at, t)}
                        </option>
                      ))}
                    </select>
                    {!options.length && <p className="text-sm dash-card-meta mt-1">{t('sessionBooking.noSlots')}</p>}
                  </div>
                );
              })}
            </div>
          </DashCard>
          <textarea
            className="w-full rounded-xl border border-amber-200/60 p-3 text-sm min-h-[72px] bg-white dark:bg-[var(--input-bg)]"
            placeholder={t('sessionBooking.notesPlaceholder')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          {err && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
          <button type="submit" className="btn-primary w-full" disabled={booking || slotsLoading}>
            {booking ? t('sessionBooking.submitting') : t('sessionBooking.submitCore')}
          </button>
        </form>
      )}

      {allCoreBooked && !allMocksBooked && (
        <DashCard className={`!p-5 !overflow-visible${!coreSessionsComplete ? ' opacity-90' : ''}`} glow={false} hover={false}>
          <h4 className="font-bold flex items-center gap-2 mb-3">
            {coreSessionsComplete ? <Calendar className="w-5 h-5 text-amber-600" /> : <Lock className="w-5 h-5 text-amber-600" />}
            {t('sessionBooking.mockTitle')}
          </h4>
          {!coreSessionsComplete ? (
            <p className="text-sm dash-card-meta">{t('sessionBooking.mockLocked')}</p>
          ) : (
            <form onSubmit={handleBookMocks} className="space-y-4 session-schedule-form session-schedule-form--bulk">
              <p className="text-sm dash-card-meta">{t('sessionBooking.mockHint')}</p>
              {remainingMocks.map((n) => {
                const mockMeta = MOCK_INTERVIEW_SESSIONS.find((s) => s.number === n);
                const minTime = n === 9
                  ? coreBooked.reduce((max, b) => Math.max(max, new Date(b.scheduled_at).getTime()), 0)
                  : (bookedByNum[9]?.scheduled_at
                    ? new Date(bookedByNum[9].scheduled_at).getTime()
                    : picks[9]
                      ? new Date(slots.find((s) => s.id === picks[9])?.start_at || 0).getTime()
                      : 0);
                const options = slotOptions(slots, minTime);
                return (
                  <div key={n} className="session-form-row session-form-row--readonly-select">
                    <label className="session-form-row__label" htmlFor={`session-slot-${n}`}>
                      <span className="session-form-row__num">{t('sessionBooking.sessionNo')} {n}</span>
                      {mockMeta?.title || programSessionTitle(n)}
                    </label>
                    <select
                      id={`session-slot-${n}`}
                      className="input-field w-full"
                      value={picks[n] || ''}
                      onChange={(e) => setPick(n, e.target.value ? Number(e.target.value) : null)}
                      disabled={slotsLoading}
                      required
                    >
                      <option value="">{t('sessionBooking.selectSlot')}</option>
                      {options.map((s) => (
                        <option key={s.id} value={s.id}>
                          {formatWhen(s.start_at)} · {durationLabel(s.start_at, s.end_at, t)}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
              <textarea
                className="w-full rounded-xl border border-amber-200/60 p-3 text-sm min-h-[72px] bg-white dark:bg-[var(--input-bg)]"
                placeholder={t('sessionBooking.mockNotes')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              {err && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
              <button type="submit" className="btn-primary w-full" disabled={booking || slotsLoading}>
                {booking ? t('sessionBooking.submitting') : t('sessionBooking.submitMocks')}
              </button>
            </form>
          )}
        </DashCard>
      )}

      {displayUser?.user_uid && (
        <p className="text-sm dash-card-meta">{t('sessionBooking.dreamsId')}: {displayUser.user_uid}</p>
      )}
    </div>
  );
}
