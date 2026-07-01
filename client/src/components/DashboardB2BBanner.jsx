import { motion } from 'framer-motion';
import { Sparkles, Radio } from 'lucide-react';
import { isPhoneViewport } from '../utils/mobilePerf';

export default function DashboardB2BBanner({
  tag,
  title,
  subtitle,
  dateLabel,
  variant = 'admin',
  action,
}) {
  const phone = isPhoneViewport();
  const today = dateLabel || new Date().toLocaleDateString('en-IN', {
    weekday: phone ? 'short' : 'long',
    day: 'numeric',
    month: phone ? 'short' : 'long',
  });

  if (phone) {
    return (
      <div className={`dash-b2b-hero dash-b2b-hero--${variant} dash-b2b-hero--cockpit`}>
        <div className="dash-b2b-hero__orb dash-b2b-hero__orb--a" aria-hidden />
        <div className="dash-b2b-hero__orb dash-b2b-hero__orb--b" aria-hidden />
        <div className="dash-b2b-hero__cockpit-grid" aria-hidden />
        <div className="dash-b2b-hero__cockpit-row">
          <div className="dash-b2b-hero__cockpit-left">
            {tag && (
              <span className="dash-b2b-hero__tag dash-b2b-hero__tag--pulse">
                <Radio className="w-3 h-3 dash-b2b-hero__radio" aria-hidden />
                {tag}
              </span>
            )}
            <h1 className="dash-b2b-hero__title dash-b2b-hero__title--glitch" data-text={title}>
              {title}
            </h1>
            {subtitle && (
              <p className="dash-b2b-hero__subtitle dash-b2b-hero__subtitle--cockpit">{subtitle}</p>
            )}
          </div>
          <div className="dash-b2b-hero__cockpit-right">
            {action && !phone && action}
            <span className="dash-b2b-hero__date dash-b2b-hero__date--cockpit">{today}</span>
          </div>
        </div>
        <div className="dash-b2b-hero__cockpit-bar" aria-hidden>
          <span /><span /><span /><span /><span />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`dash-b2b-hero dash-b2b-hero--${variant}`}
    >
      <div className="dash-b2b-hero__shine" aria-hidden />
      {tag && (
        <motion.span
          className="dash-b2b-hero__tag"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {tag}
        </motion.span>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4 relative z-[1]">
        <motion.div
          className="min-w-0"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <h1 className="dash-b2b-hero__title">{title}</h1>
          {subtitle && <p className="dash-b2b-hero__subtitle">{subtitle}</p>}
        </motion.div>
        <motion.div
          className="flex flex-wrap items-center gap-2 shrink-0 relative z-[1]"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {action}
          <span className="dash-b2b-hero__date">{today}</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
