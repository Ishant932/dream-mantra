import { Calendar, Lock, Sparkles, Video, MapPin, MessageCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { DashCard } from './DashboardUI';
import SlotCalendar from './SlotCalendar';
import UserBookingsPanel from './UserBookingsPanel';
import { COUNSELLING_TOPUP_PRICE } from '../data/moduleCatalog';

const ease = [0.22, 1, 0.36, 1];

export default function CounsellingBookingPanel({
  counsellingAccess,
  canBookCounselling = true,
  onBrowseModules,
  showTopUpOffer = false,
  onTopUpBook,
  slots,
  slotsLoading,
  selectedSlot,
  onSelectSlot,
  onMonthChange,
  displayUser,
  program,
  onProgramChange,
  notes,
  onNotesChange,
  onSubmit,
  programs,
  bookings,
  t,
}) {
  const topUpBanner = showTopUpOffer ? (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <DashCard className="!p-5 sm:!p-6 border-amber-200/60" glow={false} hover={false}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold text-sm dash-card-title">Need another counselling session?</h3>
              <p className="text-sm dash-card-meta mt-1">
                Your included session is complete. Purchase an additional counselling session — ₹{COUNSELLING_TOPUP_PRICE.toLocaleString('en-IN')} — then book your follow-up slot here.
              </p>
            </div>
          </div>
          <button type="button" onClick={onTopUpBook} className="btn-primary shrink-0 inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Buy top-up · ₹{COUNSELLING_TOPUP_PRICE.toLocaleString('en-IN')}
          </button>
        </div>
      </DashCard>
    </motion.div>
  ) : null;

  if (!counsellingAccess) {
    return (
      <div className="space-y-6 w-full max-w-none">
        {topUpBanner}
        {slots.length > 0 && (
          <DashCard className="!p-5 sm:!p-6" glow={false} hover={false}>
            <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-amber-600" />
              Available slots
            </h2>
            <p className="text-sm dash-card-meta mb-4">Purchase a counselling module to book one of these slots.</p>
            <SlotCalendar mode="user" size="large" slots={slots} loading={slotsLoading} onMonthChange={onMonthChange} />
          </DashCard>
        )}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }}>
          <DashCard className="!p-6 sm:!p-8" glow={false} hover={false}>
            <div className="text-center mt-2">
              <motion.div
                className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Lock className="w-8 h-8 text-amber-700" />
              </motion.div>
              <h2 className="text-xl font-bold mb-2">Book slots after purchase</h2>
              <p className="text-sm dash-card-meta mb-6 max-w-lg mx-auto">
                Counselling calendar unlocks only after you purchase a module with counselling —
                add the counselling add-on at checkout, or buy Brain + Skill Mapping (included).
              </p>
              <motion.button
                type="button"
                onClick={onBrowseModules}
                className="btn-primary inline-flex items-center gap-2"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles className="w-4 h-4" /> Browse modules with counselling
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <p className="text-xs dash-card-meta mt-4">
                Already paid? Wait for admin payment confirmation, then return here to pick your slot.
              </p>
            </div>
          </DashCard>
        </motion.div>
      </div>
    );
  }

  if (!canBookCounselling) {
    return (
      <div className="space-y-8">
        {topUpBanner}
        {!showTopUpOffer && (
          <DashCard className="!p-6 text-center border-amber-200/80" glow={false} hover={false}>
            <Lock className="w-10 h-10 text-amber-600 mx-auto mb-3 opacity-80" />
            <h4 className="font-bold text-lg mb-2">No counselling credits left</h4>
            <p className="text-sm dash-card-meta mb-4 max-w-lg mx-auto">
              You have used your included counselling session. Purchase an additional session from Modules to book again.
            </p>
            <button type="button" className="btn-primary" onClick={onTopUpBook}>Buy additional session</button>
          </DashCard>
        )}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <DashCard className="!p-5 sm:!p-6" glow={false} hover={false}>
            <h3 className="font-bold mb-4 flex items-center gap-2 dash-card-title">
              <Calendar className="w-5 h-5 text-amber-600" /> My booked sessions
            </h3>
            <UserBookingsPanel bookings={bookings} />
          </DashCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {topUpBanner}

      <div className="slot-booking-layout slot-booking-layout--large">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
          className="dash-card dash-card-glow slot-booking-cal !p-5 sm:!p-6"
        >
          <div className="slot-booking-cal-head">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              {t('dashboard.book')}
            </h2>
            <p className="text-sm dash-card-meta mt-1">Your counselling is active — pick a date and time.</p>
          </div>
          <SlotCalendar
            mode="user"
            size="large"
            slots={slots}
            loading={slotsLoading}
            selectedSlotId={selectedSlot?.id}
            onSelectSlot={onSelectSlot}
            onMonthChange={onMonthChange}
          />
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45, ease }}
          onSubmit={onSubmit}
          className="dash-card dash-card-glow slot-booking-form !p-5 sm:!p-6"
        >
          <h3 className="font-bold text-lg mb-4">Booking details</h3>
          <div className="mb-5 p-4 rounded-xl bg-sand-50 dark:bg-sand-800/50 border text-sm space-y-1">
            <p><span className="font-semibold opacity-70">Name:</span> {displayUser?.name}</p>
            <p><span className="font-semibold opacity-70">Email:</span> {displayUser?.email || '—'}</p>
            <p><span className="font-semibold opacity-70">Phone:</span> {displayUser?.phone || '—'}</p>
          </div>
          {selectedSlot && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60"
            >
              <p className="text-xs font-bold text-amber-700 uppercase">Selected slot</p>
              <p className="font-semibold mt-1">
                {new Date(selectedSlot.start_at).toLocaleString('en-IN', {
                  weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata',
                })}
              </p>
              <p className="text-sm dash-card-meta mt-1 flex items-center gap-1.5">
                {selectedSlot.mode === 'online' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                {selectedSlot.location || selectedSlot.mode}
              </p>
            </motion.div>
          )}
          <select className="input-field w-full mb-4" value={program} onChange={(e) => onProgramChange(e.target.value)}>
            {programs.map((p) => (
              <option key={p.slug} value={p.title}>{p.title}</option>
            ))}
          </select>
          <textarea className="input-field w-full mb-4" rows={3} value={notes} onChange={(e) => onNotesChange(e.target.value)} placeholder="Goals or questions for your counsellor…" />
          <motion.button
            type="submit"
            disabled={!selectedSlot}
            className="btn-primary w-full disabled:opacity-50"
            whileHover={selectedSlot ? { scale: 1.01 } : undefined}
            whileTap={selectedSlot ? { scale: 0.99 } : undefined}
          >
            {selectedSlot ? t('dashboard.bookBtn') : 'Select a time slot first'}
          </motion.button>
        </motion.form>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <DashCard className="!p-5 sm:!p-6" glow={false} hover={false}>
          <h3 className="font-bold mb-4 flex items-center gap-2 dash-card-title">
            <Calendar className="w-5 h-5 text-amber-600" /> My booked sessions
          </h3>
          <UserBookingsPanel bookings={bookings} />
        </DashCard>
      </motion.div>
    </div>
  );
}
