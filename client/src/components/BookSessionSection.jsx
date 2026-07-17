import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import FreeGuidanceForm from './FreeGuidanceForm';

export default function BookSessionSection({ title, hours }) {
  const { user, token } = useAuth();
  const { d } = useLang();
  const fg = d('freeGuidance') || {};

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
          <Sparkles className="w-3.5 h-3.5" /> {fg.badge || 'Free guidance call'}
        </span>
        <h2 className="text-2xl font-bold mb-3">{title || fg.cta}</h2>
        <p className="text-sand-600 mb-2 text-lg">{hours}</p>
        <p className="text-sm text-sand-500 max-w-xl mx-auto">{fg.bookIntro}</p>
      </div>

      <FreeGuidanceForm className="free-guidance-form--card" />

      <div className="flex flex-wrap justify-center gap-4">
        <Link to="/signup" className="page-next-step__auth flex items-center gap-2">
          <LogIn className="w-4 h-4" aria-hidden /> {fg.login || 'Sign in to know more'}
        </Link>
      </div>
    </motion.div>
  );
}
