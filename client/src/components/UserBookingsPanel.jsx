import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Link2, Video, Sparkles } from 'lucide-react';

const STATUS_STYLE = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  completed: 'bg-sand-100 text-sand-700 border-sand-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

function formatWhen(iso, endIso) {
  if (!iso) return '';
  const start = new Date(iso).toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  });
  if (!endIso) return start;
  const end = new Date(endIso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  });
  return `${start} – ${end}`;
}

export default function UserBookingsPanel({ bookings = [], compact = false, onBookMore }) {
  if (!bookings.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8 px-4 rounded-xl border border-dashed border-sand-200 dark:border-sand-700"
      >
        <Calendar className="w-10 h-10 text-sand-300 mx-auto mb-3" />
        <p className="font-medium dash-card-title">No sessions booked yet</p>
        <p className="text-sm dash-card-meta mt-1">Pick a slot from the calendar to schedule counselling.</p>
        {onBookMore && (
          <button type="button" onClick={onBookMore} className="btn-primary mt-4 !py-2 !px-5 text-sm">
            Book a session
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <ul className={`space-y-3 ${compact ? '' : 'space-y-4'}`}>
      <AnimatePresence initial={false}>
        {bookings.map((b, i) => (
          <motion.li
            key={b.id}
            layout
            initial={{ opacity: 0, x: -16, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 320, damping: 28 }}
            className="user-booking-card group"
          >
            <div className="flex gap-3">
              <motion.span
                className="user-booking-card__icon"
                whileHover={{ rotate: 8, scale: 1.05 }}
              >
                {b.mode === 'online' ? <Video className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
              </motion.span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold dash-card-title">{b.slot_title || b.program || 'Counselling Session'}</p>
                    <p className="text-xs text-amber-600 font-semibold mt-0.5">{b.program}</p>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLE[b.status] || STATUS_STYLE.pending}`}>
                    {b.status}
                  </span>
                </div>
                {b.scheduled_at && (
                  <p className="text-sm dash-card-meta flex items-center gap-1.5 mt-2">
                    <Clock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    {formatWhen(b.scheduled_at, b.end_at)}
                  </p>
                )}
                {b.location && (
                  <p className="text-sm dash-card-meta flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    {b.location}
                    {b.mode && ` · ${b.mode}`}
                  </p>
                )}
                {b.counsellor && !compact && (
                  <p className="text-xs dash-card-meta mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Counsellor: {b.counsellor}
                  </p>
                )}
                {b.meeting_link && b.status === 'confirmed' && (
                  <motion.a
                    href={b.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 mt-2"
                    whileHover={{ x: 4 }}
                  >
                    <Link2 className="w-3.5 h-3.5" /> Join meeting
                  </motion.a>
                )}
                {b.notes && !compact && (
                  <p className="text-xs italic dash-card-meta mt-2 p-2 rounded-lg bg-sand-50 dark:bg-sand-800/50">"{b.notes}"</p>
                )}
              </div>
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
