import { useState, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, LogIn, UserPlus, Sparkles, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { publicApi } from '../api';
import SlotCalendar from './SlotCalendar';

export default function BookSessionSection({ title, hours, createAccountLabel, bookNowLabel }) {
  const { user, token } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pickedSlot, setPickedSlot] = useState(null);

  const loadSlots = useCallback(async () => {
    setLoading(true);
    try {
      const from = new Date();
      from.setDate(1);
      const to = new Date(from);
      to.setMonth(to.getMonth() + 2);
      const data = await publicApi.availableSlots({
        from: from.toISOString(),
        to: to.toISOString(),
      });
      setSlots(data.slots || []);
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  if (user && token) {
    return (
      <Navigate
        to={
          user.role === 'admin'
            ? '/admin?tab=bookings'
            : user.role === 'counsellor'
              ? '/counsellor?tab=bookings'
              : '/dashboard?tab=book'
        }
        replace
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="text-center infigon-card p-8 lg:p-10 glow-card">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Live availability · IST
        </span>
        <h2 className="text-2xl font-bold mb-3">{title}</h2>
        <p className="text-sand-600 mb-2 text-lg">{hours}</p>
        <p className="text-sm text-sand-500 max-w-xl mx-auto">
          Preview open slots below. To confirm a session, purchase a module with counselling
          (add-on at checkout or the Mind Mapping + Skill Mapping combo).
        </p>
      </div>

      <div className="infigon-card p-4 sm:p-6 glow-card border-amber-200/50">
        <div className="flex items-start gap-3 mb-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200/60">
          <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-sm text-sand-700 text-left">
            Booking is unlocked after payment confirmation on a counselling-enabled module.
            Create an account, choose your module, then book from your dashboard.
          </p>
        </div>
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-600" /> Available time slots
        </h3>
        <SlotCalendar
          mode="user"
          size="large"
          slots={slots}
          loading={loading}
          selectedSlotId={pickedSlot?.id}
          onSelectSlot={setPickedSlot}
          onMonthChange={loadSlots}
        />
      </div>

      {pickedSlot && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="infigon-card p-6 glow-card border-amber-200/60"
        >
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Preview slot</p>
          <p className="font-semibold mt-1">
            {new Date(pickedSlot.start_at).toLocaleString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Asia/Kolkata',
            })}
          </p>
          <p className="text-sm text-sand-600 mt-1">{pickedSlot.location || pickedSlot.mode}</p>
          <p className="text-sm text-sand-500 mt-3">
            Sign up and purchase a counselling module to reserve this time from your dashboard.
          </p>
        </motion.div>
      )}

      <div className="flex flex-wrap justify-center gap-4">
        <Link to="/signup" className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> {createAccountLabel}
        </Link>
        <Link to="/login" className="btn-outline flex items-center gap-2">
          <LogIn className="w-4 h-4" /> Login
        </Link>
        <Link to="/dashboard?tab=assess" className="btn-outline flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> View modules
        </Link>
        <Link to="/contact" className="btn-outline">{bookNowLabel}</Link>
      </div>
    </motion.div>
  );
}
