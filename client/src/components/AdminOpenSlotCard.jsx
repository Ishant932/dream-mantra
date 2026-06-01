import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Pencil, Save, Trash2, X, Video } from 'lucide-react';
import { slotToForm } from '../utils/slotForm';

export default function AdminOpenSlotCard({ slot, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => slotToForm(slot));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) setForm(slotToForm(slot));
  }, [slot, editing]);

  const when = new Date(slot.start_at).toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdate(slot.id, form);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this slot?')) return;
    await onDelete(slot.id);
  };

  return (
    <motion.div
      layout
      className={`admin-open-slot-card text-sm ${editing ? 'admin-open-slot-card--editing' : ''}`}
    >
      {!editing ? (
        <>
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold leading-snug">{slot.title || 'Counselling Session'}</p>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="admin-open-slot-edit-btn shrink-0"
              aria-label="Edit slot"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs mt-1.5 text-amber-800 dark:text-amber-300 flex items-center gap-1">
            <Clock className="w-3 h-3 shrink-0" /> {when}
          </p>
          <p className="text-xs mt-1 flex items-center gap-1 opacity-80">
            {slot.mode === 'online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
            {slot.location || slot.mode}
          </p>
          <p className="text-xs mt-1 opacity-70">
            Capacity {slot.booked_count || 0}/{slot.capacity || 1}
            {slot.counsellor && ` · ${slot.counsellor}`}
          </p>
        </>
      ) : (
        <AnimatePresence mode="wait">
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSave}
            className="space-y-2"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wide text-amber-700">Edit slot #{slot.id}</span>
              <button type="button" onClick={() => setEditing(false)} className="p-1 rounded-lg hover:bg-black/5" aria-label="Cancel">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input type="text" className="input-field !py-1.5 !text-xs w-full" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <input type="date" className="input-field !py-1.5 !text-xs" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              <select className="input-field !py-1.5 !text-xs" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
              <input type="time" className="input-field !py-1.5 !text-xs" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
              <input type="time" className="input-field !py-1.5 !text-xs" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
            </div>
            <input type="text" className="input-field !py-1.5 !text-xs w-full" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <input type="url" className="input-field !py-1.5 !text-xs w-full" placeholder="Meeting link" value={form.meeting_link} onChange={(e) => setForm({ ...form, meeting_link: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" min={1} className="input-field !py-1.5 !text-xs" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
              <input type="text" className="input-field !py-1.5 !text-xs" placeholder="Counsellor" value={form.counsellor} onChange={(e) => setForm({ ...form, counsellor: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving} className="btn-primary !py-1.5 !px-3 !text-xs flex items-center gap-1 flex-1 justify-center">
                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
              </button>
              {(slot.booked_count || 0) === 0 && (
                <button type="button" onClick={handleDelete} className="btn-outline !py-1.5 !px-2 !text-xs text-red-600 border-red-200">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </motion.form>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
