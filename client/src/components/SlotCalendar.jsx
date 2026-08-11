import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Video, Plus, Trash2,
  Sparkles, Link2, Save, Pencil,
} from 'lucide-react';
import { istDateKeyFromIso, istTodayKey, isSlotBeforeToday, slotToForm } from '../utils/slotForm';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function localDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  });
}

function monthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(start.getDate() - start.getDay());
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push(d);
  }
  return cells;
}

const gridVariants = {
  enter: { opacity: 0, x: 20, scale: 0.98 },
  center: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -20, scale: 0.98 },
};

export default function SlotCalendar({
  mode = 'user',
  size = 'large',
  slots = [],
  selectedSlotId,
  onSelectSlot,
  onMonthChange,
  onCreateSlot,
  onUpdateSlot,
  onDeleteSlot,
  loading = false,
}) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(localDateKey(today));
  const [adminEditId, setAdminEditId] = useState(null);
  const [form, setForm] = useState({
    date: localDateKey(today),
    startTime: '11:00',
    endTime: '12:00',
    mode: 'online',
    location: 'Online (Pan-India)',
    title: 'Career Counselling Session',
    meeting_link: '',
    capacity: 1,
    counsellor: 'Esha Lohiya',
  });
  const [editForm, setEditForm] = useState(null);

  const cells = useMemo(() => monthMatrix(viewYear, viewMonth), [viewYear, viewMonth]);
  const monthKey = `${viewYear}-${viewMonth}`;

  const slotsByDay = useMemo(() => {
    const map = {};
    for (const s of slots) {
      const key = istDateKeyFromIso(s.start_at);
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    return map;
  }, [slots]);

  const todayKey = istTodayKey();
  const visibleDaySlots = useMemo(() => {
    const list = slotsByDay[selectedDay] || [];
    if (mode === 'user') {
      return list.filter((s) => !isSlotBeforeToday(s) && s.status === 'open' && (s.booked_count || 0) < (s.capacity || 1));
    }
    return list.filter((s) => !(s.status === 'open' && isSlotBeforeToday(s) && (s.booked_count || 0) < (s.capacity || 1)));
  }, [slotsByDay, selectedDay, mode]);
  const daySlots = visibleDaySlots;
  const openSlotsCount = slots.filter((s) => (
    s.status === 'open'
    && (s.booked_count || 0) < (s.capacity || 1)
    && !isSlotBeforeToday(s)
  )).length;

  useEffect(() => {
    setForm((prev) => ({ ...prev, date: selectedDay }));
  }, [selectedDay]);

  useEffect(() => {
    if (mode !== 'admin' || !adminEditId) {
      setEditForm(null);
      return;
    }
    const slot = slots.find((s) => s.id === adminEditId);
    if (slot) setEditForm(slotToForm(slot));
    else {
      setAdminEditId(null);
      setEditForm(null);
    }
  }, [adminEditId, slots, mode]);

  const changeMonth = (delta) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
    onMonthChange?.(y, m);
  };

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
  const selectedLabel = new Date(selectedDay).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  const handleSelect = (slot) => {
    if (mode === 'admin') {
      setAdminEditId(slot.id);
    }
    onSelectSlot?.(slot);
  };

  return (
    <div className={`slot-calendar slot-calendar--modern slot-calendar--${size}`}>
      <div className="slot-cal-glow-orb slot-cal-glow-orb-a" aria-hidden="true" />
      <div className="slot-cal-glow-orb slot-cal-glow-orb-b" aria-hidden="true" />

      <div className="slot-cal-body">
        <div className="slot-cal-pane slot-cal-pane--calendar">
          <div className="slot-calendar-header">
            <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }} onClick={() => changeMonth(-1)} className="slot-cal-nav" aria-label="Previous month">
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <div className="slot-cal-header-center">
              <AnimatePresence mode="wait">
                <motion.p key={monthKey} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="slot-cal-month">{monthLabel}</motion.p>
              </AnimatePresence>
              <span className="slot-cal-live"><Sparkles className="w-3 h-3" /> Live · IST</span>
            </div>
            <motion.button type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }} onClick={() => changeMonth(1)} className="slot-cal-nav" aria-label="Next month">
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={monthKey} variants={gridVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.28 }} className="slot-cal-grid-wrap">
              <div className="slot-cal-grid">
                {WEEKDAYS.map((w) => (
                  <div key={w} className="slot-cal-weekday">{w}</div>
                ))}
                {cells.map((d) => {
                  const key = localDateKey(d);
                  const inMonth = d.getMonth() === viewMonth;
                  const isToday = key === localDateKey(today);
                  const isSelected = key === selectedDay;
                  const openCount = (slotsByDay[key] || []).filter((s) => (
                    s.status === 'open'
                    && (s.booked_count || 0) < (s.capacity || 1)
                    && key >= todayKey
                  )).length;
                  const hasSlots = (slotsByDay[key]?.length || 0) > 0;
                  return (
                    <motion.button
                      key={key}
                      type="button"
                      whileHover={inMonth ? { scale: 1.08, y: -2 } : undefined}
                      whileTap={inMonth ? { scale: 0.94 } : undefined}
                      onClick={() => inMonth && setSelectedDay(key)}
                      disabled={!inMonth}
                      className={`slot-cal-day ${inMonth ? '' : 'slot-cal-day-muted'} ${isSelected ? 'slot-cal-day-selected' : ''} ${isToday ? 'slot-cal-day-today' : ''} ${openCount > 0 ? 'slot-cal-day-has-open' : ''}`}
                    >
                      {isSelected && <motion.span layoutId="slot-cal-selected-ring" className="slot-cal-selected-ring" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
                      <span className="slot-cal-day-num">{d.getDate()}</span>
                      {hasSlots && <span className={`slot-cal-dot ${openCount > 0 ? 'slot-cal-dot-open' : 'slot-cal-dot-full'}`} />}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          <p className="slot-cal-mini-stat">
            <Calendar className="w-3.5 h-3.5" />
            {openSlotsCount} open slots this month
          </p>
        </div>

        <div className="slot-cal-pane slot-cal-pane--slots">
          <div className="slot-cal-slots-head">
            <h4 className="slot-cal-slots-title"><Clock className="w-4 h-4" />{selectedLabel}</h4>
            <span className="slot-cal-slots-count">{daySlots.length} slots</span>
          </div>

          {loading ? (
            <div className="slot-cal-skeleton-grid">
              {[1, 2, 3, 4].map((n) => (
                <motion.div key={n} className="slot-cal-skeleton" animate={{ opacity: [0.4, 0.85, 0.4] }} transition={{ duration: 1.4, repeat: Infinity, delay: n * 0.12 }} />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {daySlots.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="slot-cal-empty">
                  <Calendar className="w-10 h-10 opacity-30 mb-2" />
                  <p>{mode === 'admin' ? 'No slots — add one below' : 'No open slots. Pick another day.'}</p>
                </motion.div>
              ) : (
                <motion.div key={selectedDay} className="slot-cal-chips" layout>
                  {daySlots.map((slot, i) => {
                    const isOpen = slot.status === 'open' && (slot.booked_count || 0) < (slot.capacity || 1);
                    const active = selectedSlotId === slot.id || adminEditId === slot.id;
                    return (
                      <motion.div key={slot.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className={`slot-cal-chip-wrap ${mode === 'admin' ? 'slot-cal-chip-wrap--admin' : ''}`}>
                        <motion.button
                          type="button"
                          disabled={mode === 'user' && !isOpen}
                          onClick={() => handleSelect(slot)}
                          whileHover={isOpen || mode === 'admin' ? { scale: 1.02, y: -2 } : undefined}
                          className={`slot-cal-chip ${active ? 'slot-cal-chip--active' : ''} ${!isOpen && mode === 'user' ? 'slot-cal-chip--disabled' : ''}`}
                        >
                          {active && <motion.span layoutId="slot-cal-chip-glow" className="slot-cal-chip-glow" />}
                          {slot.title && <span className="slot-cal-chip-title">{slot.title}</span>}
                          <span className="slot-cal-chip-times">
                            <span className="slot-cal-chip-time">{formatTime(slot.start_at)}</span>
                            <span className="slot-cal-chip-sep">–</span>
                            <span className="slot-cal-chip-time">{formatTime(slot.end_at)}</span>
                          </span>
                          <span className="slot-cal-chip-location">
                            {slot.mode === 'online' ? <Video className="w-3 h-3 shrink-0" /> : <MapPin className="w-3 h-3 shrink-0" />}
                            <span className="truncate">{slot.location || (slot.mode === 'online' ? 'Online' : 'In-person')}</span>
                          </span>
                          <span className="slot-cal-chip-meta">
                            {mode === 'admin' && <Pencil className="w-3 h-3 inline mr-1 opacity-60" aria-hidden="true" />}
                            {isOpen ? 'Open' : 'Full'}{(slot.booked_count || 0) > 0 && ` · ${slot.booked_count} booked`}
                          </span>
                        </motion.button>
                        {mode === 'admin' && onDeleteSlot && (slot.booked_count || 0) === 0 && (
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.08 }}
                            onClick={async () => {
                              try {
                                await onDeleteSlot(slot.id);
                                if (adminEditId === slot.id) {
                                  setAdminEditId(null);
                                  setEditForm(null);
                                }
                              } catch { /* parent shows error */ }
                            }}
                            className="slot-cal-chip-delete"
                            aria-label="Delete slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </motion.button>
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>

      {mode === 'admin' && onCreateSlot && (
        <div className="slot-cal-admin-forms">
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await onCreateSlot(form);
              } catch { /* parent shows error */ }
            }}
            className="slot-cal-form"
          >
            <p className="slot-cal-form-title"><Plus className="w-4 h-4" /> Create new slot</p>
            <div className="slot-cal-form-grid">
              <input type="text" className="input-field slot-cal-input slot-cal-input--wide" placeholder="Session title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <input type="date" className="input-field slot-cal-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              <input type="time" className="input-field slot-cal-input" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
              <input type="time" className="input-field slot-cal-input" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
              <select className="input-field slot-cal-input" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value, location: e.target.value === 'online' ? 'Online (Pan-India)' : 'Raja Park, Jaipur' })}>
                <option value="online">Online</option>
                <option value="offline">Offline (Jaipur)</option>
              </select>
              <input type="text" className="input-field slot-cal-input slot-cal-input--wide" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <input type="url" className="input-field slot-cal-input slot-cal-input--wide" placeholder="Meeting link (Zoom / Google Meet)" value={form.meeting_link} onChange={(e) => setForm({ ...form, meeting_link: e.target.value })} />
              <input type="number" min={1} className="input-field slot-cal-input" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
              <input type="text" className="input-field slot-cal-input slot-cal-input--wide" placeholder="Counsellor name" value={form.counsellor} onChange={(e) => setForm({ ...form, counsellor: e.target.value })} />
            </div>
            <motion.button type="submit" whileHover={{ scale: 1.02 }} className="btn-primary slot-cal-submit">Create slot</motion.button>
          </motion.form>

          {adminEditId && editForm && onUpdateSlot && (
            <motion.form
              key={adminEditId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await onUpdateSlot(adminEditId, editForm);
                  setAdminEditId(null);
                  setEditForm(null);
                } catch { /* parent shows error */ }
              }}
              className="slot-cal-form slot-cal-form--edit"
            >
              <p className="slot-cal-form-title"><Pencil className="w-4 h-4" /> Edit slot #{adminEditId}</p>
              <div className="slot-cal-form-grid">
                <input type="text" className="input-field slot-cal-input slot-cal-input--wide" placeholder="Session title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                <input type="date" className="input-field slot-cal-input" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} />
                <input type="time" className="input-field slot-cal-input" value={editForm.startTime} onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })} />
                <input type="time" className="input-field slot-cal-input" value={editForm.endTime} onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })} />
                <select className="input-field slot-cal-input" value={editForm.mode} onChange={(e) => setEditForm({ ...editForm, mode: e.target.value })}>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
                <input type="text" className="input-field slot-cal-input slot-cal-input--wide" placeholder="Location" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
                <input type="url" className="input-field slot-cal-input slot-cal-input--wide" placeholder="Meeting link" value={editForm.meeting_link} onChange={(e) => setEditForm({ ...editForm, meeting_link: e.target.value })} />
                <input type="number" min={1} className="input-field slot-cal-input" value={editForm.capacity} onChange={(e) => setEditForm({ ...editForm, capacity: Number(e.target.value) })} />
                <input type="text" className="input-field slot-cal-input slot-cal-input--wide" placeholder="Counsellor name" value={editForm.counsellor} onChange={(e) => setEditForm({ ...editForm, counsellor: e.target.value })} />
              </div>
              <div className="flex gap-2 flex-wrap">
                <motion.button type="submit" whileHover={{ scale: 1.02 }} className="btn-primary slot-cal-submit flex items-center gap-2"><Save className="w-4 h-4" /> Save changes</motion.button>
                <motion.button type="button" whileHover={{ scale: 1.02 }} onClick={() => { setAdminEditId(null); setEditForm(null); }} className="btn-outline slot-cal-submit">Cancel</motion.button>
                {editForm.meeting_link && (
                  <a href={editForm.meeting_link} target="_blank" rel="noopener noreferrer" className="btn-outline slot-cal-submit flex items-center gap-2"><Link2 className="w-4 h-4" /> Preview link</a>
                )}
              </div>
            </motion.form>
          )}
        </div>
      )}
    </div>
  );
}
