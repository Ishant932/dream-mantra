import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Mic,
  Rocket,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';

export const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-48px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.06 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 320, damping: 24 },
  },
};

export const statIcons = [Rocket, Clock, Users, Zap];

export const sessionIllustrations = {
  1: '/images/crp/session-1-brand.png?v=4',
  2: '/images/crp/session-2-digital.png?v=4',
  3: '/images/crp/session-3-resume.png?v=4',
  4: '/images/crp/session-4-interview.png?v=4',
  5: '/images/crp/session-5-network.png?v=4',
};

const sessionRoadmapIcons = {
  1: Sparkles,
  2: Briefcase,
  3: FileText,
  4: Mic,
  5: Building2,
};

export function SessionTopics({ session, sessionLabel, variant = 'default', index = 0 }) {
  if (variant === 'roadmap') {
    const illustration = sessionIllustrations[session.number];
    const Icon = sessionRoadmapIcons[session.number] || Sparkles;

    return (
      <motion.article
        className={`crp-roadmap-card crp-roadmap-card--${session.number}`}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-45px' }}
        transition={{ delay: index * 0.07, type: 'spring', stiffness: 240, damping: 22 }}
        whileHover={{ y: -4 }}
      >
        <div className="crp-roadmap-card__body">
          <div className="crp-roadmap-card__top">
            <motion.span
              className="crp-roadmap-card__figure"
              aria-hidden
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: index * 0.18 }}
            >
              <Icon strokeWidth={2.25} />
            </motion.span>
            <span className="crp-roadmap-card__step">Session {session.number}</span>
          </div>
          <h3 className="crp-roadmap-card__title">{session.title}</h3>
          <ul className="crp-roadmap-card__topics">
            {session.topics.map((topic, topicIndex) => (
              <motion.li
                key={topic}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 + topicIndex * 0.04 }}
              >
                <span aria-hidden />
                {topic}
              </motion.li>
            ))}
          </ul>
        </div>
        {illustration ? (
          <motion.div
            className="crp-roadmap-card__visual"
            initial={{ opacity: 0, scale: 0.94, x: 16 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 + index * 0.05, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <img src={illustration} alt="" loading="lazy" />
          </motion.div>
        ) : null}
      </motion.article>
    );
  }

  if (variant === 'sprint') {
    return (
      <motion.article
        className="crp-sprint-session"
        initial={{ opacity: 0, x: 20, scale: 0.98 }}
        whileInView={{ opacity: 1, x: 0, scale: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        whileHover={{ y: -3, boxShadow: '0 16px 36px rgba(1, 50, 32, 0.12)' }}
      >
        <motion.div
          className="crp-sprint-session__bar"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
        <header className="crp-sprint-session__head">
          <motion.span
            className="crp-sprint-session__num"
            initial={{ scale: 0.6, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 380, damping: 16 }}
          >
            {session.number}
          </motion.span>
          <div>
            <h3 className="crp-sprint-session__title">{session.icon} {session.title}</h3>
          </div>
        </header>
        <ul className="crp-sprint-session__topics">
          {session.topics.map((topic, j) => (
            <motion.li
              key={topic}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 + j * 0.06 }}
              whileHover={{ x: 3 }}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden />
              {topic}
            </motion.li>
          ))}
        </ul>
      </motion.article>
    );
  }

  return (
    <div className="infigon-card p-5 lg:p-6 glow-card relative overflow-hidden">
      <motion.div
        className="absolute top-0 left-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500"
        initial={{ width: 0 }}
        whileInView={{ width: '100%' }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl shrink-0" aria-hidden="true">{session.icon}</span>
        <div>
          <span className="text-sm font-bold text-amber-600">{sessionLabel} {session.number}</span>
          <h3 className="font-display text-lg md:text-xl font-bold mt-0.5">{session.title}</h3>
          <p className="text-xs text-sand-500 mt-1">{session.duration}</p>
        </div>
      </div>
      <ul className="grid sm:grid-cols-2 gap-2.5">
        {session.topics.map((topic, j) => (
          <motion.li
            key={topic}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: j * 0.07 }}
            className="flex gap-2 p-2.5 rounded-xl bg-amber-50/80 border border-amber-100 text-sm font-medium text-sand-800"
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
            className="crp-stat-card"
          >
            <s.icon className="w-6 h-6 text-amber-600 mx-auto mb-2" />
            <p className="font-bold text-lg">{s.label}</p>
            <p className="text-xs text-sand-500">{s.sub}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export function CRPCrossNav({ explore, current }) {
  if (current === 'explore') return null;

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-10">
      <Link
        to="/crp?tab=launchpad"
        className="px-5 py-2.5 rounded-full text-sm font-semibold border transition border-amber-200 text-amber-800 hover:bg-amber-50"
      >
        🚀 {explore.label}
      </Link>
    </div>
  );
}
