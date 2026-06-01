import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Rocket, Clock, Users, Zap } from 'lucide-react';

export const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export const statIcons = [Rocket, Clock, Users, Zap];

export function SessionTopics({ session, sessionLabel }) {
  return (
    <div className="infigon-card p-6 lg:p-8 glow-card relative overflow-hidden">
      <motion.div
        className="absolute top-0 left-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500"
        initial={{ width: 0 }}
        whileInView={{ width: '100%' }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl shrink-0" aria-hidden="true">{session.icon}</span>
        <div>
          <span className="text-sm font-bold text-amber-600">{sessionLabel} {session.number}</span>
          <h3 className="font-display text-xl md:text-2xl font-bold mt-1">{session.title}</h3>
          <p className="text-xs text-sand-500 mt-1">{session.duration}</p>
        </div>
      </div>
      <ul className="grid sm:grid-cols-2 gap-3">
        {session.topics.map((topic, j) => (
          <motion.li
            key={topic}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: j * 0.07 }}
            whileHover={{ x: 4, backgroundColor: 'rgba(251, 191, 36, 0.15)' }}
            className="flex gap-2 p-3 rounded-xl bg-amber-50/80 border border-amber-100 text-sm font-medium text-sand-800 transition-colors"
          >
            <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
            {topic}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export function CRPStatsStrip({ statItems }) {
  return (
    <section className="relative -mt-8 z-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
      >
        {statItems.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 280 }}
            whileHover={{ y: -4, scale: 1.03 }}
            className="crp-stat-card"
          >
            <motion.span
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <s.icon className="w-6 h-6 text-amber-600 mx-auto mb-2" />
            </motion.span>
            <p className="font-bold text-lg">{s.label}</p>
            <p className="text-xs text-sand-500">{s.sub}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export function CRPCrossNav({ explore, launch, current }) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-10">
      <Link
        to="/crp/explore"
        className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition ${
          current === 'explore'
            ? 'bg-amber-600 text-white border-amber-600 shadow-md'
            : 'border-amber-200 text-amber-800 hover:bg-amber-50'
        }`}
      >
        🚀 {explore.label}
      </Link>
      <Link
        to="/crp/launch"
        className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition ${
          current === 'launch'
            ? 'bg-amber-600 text-white border-amber-600 shadow-md'
            : 'border-amber-200 text-amber-800 hover:bg-amber-50'
        }`}
      >
        🤖 {launch.label}
      </Link>
    </div>
  );
}
