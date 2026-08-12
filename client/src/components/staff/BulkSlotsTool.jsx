import { useState, useEffect } from 'react';
import { CalendarPlus, Trash2, Loader2 } from 'lucide-react';

const WEEKDAYS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
];

const SESSION_OPTIONS = [
  ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ value: String(n), label: `Session ${n}` })),
  { value: '9', label: 'Mock Interview 1' },
  { value: '10', label: 'Mock Interview 2' },
];

function buildCreateForm(slotType) {
  return {
    startDate: '',
    endDate: '',
    daysOfWeek: [1, 2, 3, 4, 5, 6],
    startTime: '11:00',
    endTime: '12:00',
    mode: 'online',
    location: 'Online (Pan-India)',
    title: slotType === 'program_session' ? 'Career Readiness Session' : 'Career Counselling Session',
    meeting_link: '',
    capacity: '1',
    counsellor: 'Esha Lohiya',
    slot_type: slotType,
    session_number: slotType === 'program_session' ? '1' : '',
  };
}

export default function BulkSlotsTool({ api, token, onSuccess, onError, mode = 'both', slotType = 'counselling' }) {
  const [createForm, setCreateForm] = useState(() => buildCreateForm(slotType));
  const [deleteForm, setDeleteForm] = useState({ from: '', to: '', onlyEmpty: true });
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setCreateForm(buildCreateForm(slotType));
  }, [slotType]);

  const toggleDay = (day) => {
    setCreateForm((f) => {
      const set = new Set(f.daysOfWeek);
      if (set.has(day)) set.delete(day);
      else set.add(day);
      return { ...f, daysOfWeek: [...set].sort((a, b) => a - b) };
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        ...createForm,
        capacity: Math.max(1, Number(createForm.capacity) || 1),
        slot_type: slotType,
      };
      const sn = Number(payload.session_number);
      if (slotType === 'program_session') {
        if (!sn || sn < 1 || sn > 10) {
          onError?.('Choose a session number between 1 and 10.');
          return;
        }
        payload.session_number = sn;
        if (!payload.title || payload.title === 'Career Counselling Session') {
          payload.title = sn === 9 ? 'Mock Interview 1' : sn === 10 ? 'Mock Interview 2' : `Career Readiness Session ${sn}`;
        }
      } else {
        delete payload.session_number;
      }
      const result = await api.createBulkSlots(token, payload);
      const msg = `Created ${result.count} slot${result.count === 1 ? '' : 's'}${result.errors?.length ? ` (${result.errors.length} skipped)` : ''}.`;
      onSuccess?.(msg);
    } catch (err) {
      onError?.(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!deleteForm.from && !deleteForm.to) {
      onError?.('Select at least a from or to date.');
      return;
    }
    const label = `${deleteForm.from || '…'} to ${deleteForm.to || '…'}`;
    if (!window.confirm(`Delete bulk slots from ${label}?${deleteForm.onlyEmpty ? ' Only empty slots will be removed.' : ' Booked slots may be deleted if empty check is off.'}`)) {
      return;
    }
    setDeleting(true);
    try {
      const result = await api.deleteBulkSlots(token, deleteForm);
      const msg = `Deleted ${result.deleted} slot${result.deleted === 1 ? '' : 's'}${result.skippedBooked ? ` (${result.skippedBooked} booked slots kept)` : ''}.`;
      onSuccess?.(msg);
    } catch (err) {
      onError?.(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const showCreate = mode === 'create' || mode === 'both';
  const showDelete = mode === 'delete' || mode === 'both';
  const sessionNum = Number(createForm.session_number);

  return (
    <div className={mode === 'both' ? 'staff-booking-bulk-grid' : ''}>
      {showCreate && (
      <form onSubmit={handleCreate} className="staff-booking-bulk-card staff-booking-bulk-card--create">
        <h3 className="staff-booking-bulk-card__title">
          <CalendarPlus className="w-4 h-4 text-emerald-600" /> Create bulk slots
        </h3>
        <p className="text-xs opacity-70 mb-4">
          {slotType === 'program_session'
            ? 'Generate recurring program session slots (Sessions 1–8 or Mock Interviews 9–10) across a date range.'
            : 'Generate recurring counselling slots across a date range for selected weekdays.'}
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-bold uppercase opacity-60 block mb-1">From date</label>
            <input type="date" className="input-field w-full !py-2 !text-sm" required value={createForm.startDate} onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase opacity-60 block mb-1">To date</label>
            <input type="date" className="input-field w-full !py-2 !text-sm" required value={createForm.endDate} onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase opacity-60 block mb-1">Start time</label>
            <input type="time" className="input-field w-full !py-2 !text-sm" required value={createForm.startTime} onChange={(e) => setCreateForm({ ...createForm, startTime: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase opacity-60 block mb-1">End time</label>
            <input type="time" className="input-field w-full !py-2 !text-sm" required value={createForm.endTime} onChange={(e) => setCreateForm({ ...createForm, endTime: e.target.value })} />
          </div>
        </div>
        <div className="mb-3">
          <label className="text-xs font-bold uppercase opacity-60 block mb-1.5">Weekdays</label>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAYS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleDay(value)}
                className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border transition ${createForm.daysOfWeek.includes(value) ? 'bg-emerald-600 text-white border-emerald-600' : 'border-sand-300 dark:border-sand-600 opacity-70'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-bold uppercase opacity-60 block mb-1">Mode</label>
            <select className="input-field w-full !py-2 !text-sm" value={createForm.mode} onChange={(e) => setCreateForm({ ...createForm, mode: e.target.value })}>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase opacity-60 block mb-1">Capacity</label>
            <input type="number" min={1} className="input-field w-full !py-2 !text-sm" value={createForm.capacity} onChange={(e) => setCreateForm({ ...createForm, capacity: e.target.value })} />
          </div>
          {slotType === 'program_session' && (
            <div>
              <label className="text-xs font-bold uppercase opacity-60 block mb-1">Session number</label>
              <select
                className="input-field w-full !py-2 !text-sm"
                value={createForm.session_number}
                onChange={(e) => setCreateForm({ ...createForm, session_number: e.target.value })}
              >
                {SESSION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {(sessionNum === 9 || sessionNum === 10) && (
                <p className="text-[11px] text-amber-700 mt-1">Session {sessionNum} = Mock Interview {sessionNum === 9 ? '1' : '2'}</p>
              )}
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase opacity-60 block mb-1">Title</label>
            <input className="input-field w-full !py-2 !text-sm" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase opacity-60 block mb-1">Location</label>
            <input className="input-field w-full !py-2 !text-sm" value={createForm.location} onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase opacity-60 block mb-1">Counsellor</label>
            <input className="input-field w-full !py-2 !text-sm" value={createForm.counsellor} onChange={(e) => setCreateForm({ ...createForm, counsellor: e.target.value })} />
          </div>
        </div>
        <button type="submit" disabled={creating || !createForm.daysOfWeek.length} className="btn-primary !py-2 !px-4 text-sm w-full inline-flex items-center justify-center gap-2 disabled:opacity-50">
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarPlus className="w-4 h-4" />}
          {creating ? 'Creating…' : 'Create bulk slots'}
        </button>
      </form>
      )}

      {showDelete && (
      <form onSubmit={handleDelete} className="staff-booking-bulk-card staff-booking-bulk-card--delete">
        <h3 className="staff-booking-bulk-card__title">
          <Trash2 className="w-4 h-4 text-red-600" /> Delete bulk slots
        </h3>
        <p className="text-xs opacity-70 mb-4">Remove slots in a date range. By default only empty (unbooked) slots are deleted.</p>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-bold uppercase opacity-60 block mb-1">From date</label>
            <input type="date" className="input-field w-full !py-2 !text-sm" value={deleteForm.from} onChange={(e) => setDeleteForm({ ...deleteForm, from: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase opacity-60 block mb-1">To date</label>
            <input type="date" className="input-field w-full !py-2 !text-sm" value={deleteForm.to} onChange={(e) => setDeleteForm({ ...deleteForm, to: e.target.value })} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm mb-4 cursor-pointer">
          <input type="checkbox" checked={deleteForm.onlyEmpty} onChange={(e) => setDeleteForm({ ...deleteForm, onlyEmpty: e.target.checked })} className="rounded" />
          Only delete empty slots (no bookings)
        </label>
        <button type="submit" disabled={deleting} className="w-full text-sm font-bold px-4 py-2.5 rounded-xl border-2 border-red-400 text-red-700 bg-red-50 inline-flex items-center justify-center gap-2 disabled:opacity-50">
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          {deleting ? 'Deleting…' : 'Delete bulk slots'}
        </button>
      </form>
      )}
    </div>
  );
}
