import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import DashboardBackground from './DashboardBackground';
import CopyableUserId from './CopyableUserId';
import { containerVariants, itemVariants } from '../utils/animations';

export function DashboardShell({ variant = 'user', children, className = '' }) {
  return (
    <div className={`dash-root dash-b2b ${variant === 'admin' ? 'dash-root-admin' : 'dash-root-user'} ${className}`}>
      <div className="dash-content relative z-[1]">{children}</div>
    </div>
  );
}

export function DashboardLoading({ variant = 'user' }) {
  return (
    <div className={`dash-root ${variant === 'admin' ? 'dash-root-admin' : 'dash-root-user'} min-h-screen pt-28 flex flex-col items-center justify-center gap-4`}>
      <DashboardBackground variant={variant} />
      <motion.div
        className="dash-loader-ring relative z-[1]"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
      />
      <motion.p
        className="relative z-[1] text-sm font-semibold dash-loading-text"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        Loading {variant === 'admin' ? 'admin panel' : 'your dashboard'}…
      </motion.p>
    </div>
  );
}

export function DashboardHero({ user, title, subtitle, badge, cta, stats = [] }) {
  return (
    <section className="dash-hero relative pt-16 sm:pt-20 lg:pt-24 pb-6 sm:pb-8 overflow-hidden">
      <div className="dash-hero-glow" />
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-7xl mx-auto px-4"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <motion.div
            className="dash-avatar"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span>{user?.name?.[0]?.toUpperCase() || '?'}</span>
            <motion.span
              className="dash-avatar-ring"
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
          <div className="flex-1 text-amber-50">
            {badge && (
              <motion.span
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="dash-hero-badge"
              >
                {badge}
              </motion.span>
            )}
            <h1 className="dash-hero-title mt-2">
              {title}
            </h1>
            {user?.user_uid && (
              <CopyableUserId uid={user.user_uid} compact onDark className="mt-2" />
            )}
            {subtitle && <p className="text-amber-100/90 mt-2 text-lg">{subtitle}</p>}
          </div>
          {cta && (
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              {cta.href ? (
                <Link to={cta.href} className="btn-gold shrink-0 dash-hero-cta">{cta.label}</Link>
              ) : (
                <button type="button" onClick={cta.onClick} className="btn-gold shrink-0 dash-hero-cta">{cta.label}</button>
              )}
            </motion.div>
          )}
        </div>

        {stats.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-6 sm:mt-8"
          >
            {stats.map((s) => (
              <motion.div key={s.label} variants={itemVariants} className="dash-stat-card group">
                <motion.div
                  className="dash-stat-icon"
                  whileHover={{ rotate: 8, scale: 1.1 }}
                >
                  <s.icon className="w-6 h-6" />
                </motion.div>
                <p className="text-xl md:text-2xl font-bold dash-stat-value">{s.value}</p>
                <p className="text-sm dash-stat-label">{s.label}</p>
                <div className="dash-stat-shine" />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}

export function DashSection({ title, icon: Icon, children, className = '', action, staticLayout = false }) {
  const header = (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <h2 className="dash-section-title">
        {Icon && (
          <motion.span
            className="dash-section-icon"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon className="w-5 h-5" />
          </motion.span>
        )}
        {title}
      </h2>
      {action}
    </div>
  );

  if (staticLayout) {
    return (
      <section className={`mb-10 dash-section-static ${className}`}>
        {header}
        {children}
      </section>
    );
  }

  return (
    <motion.section
      className={`mb-10 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {header}
      {children}
    </motion.section>
  );
}

export function DashCard({
  children,
  className = '',
  accent = '',
  delay = 0,
  hover = true,
  glow = false,
  onClick,
  as: Tag = 'div',
  animate = false,
}) {
  const baseClass = `dash-card ${accent ? `dash-card-accent-${accent}` : ''} ${glow ? 'dash-card-glow' : ''} ${className}`;
  if (!animate) {
    return (
      <Tag className={baseClass} {...(onClick ? { onClick, role: 'button', tabIndex: 0 } : {})}>
        {children}
      </Tag>
    );
  }
  const MotionTag = Tag === 'div' ? motion.div : motion(Tag);
  const props = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    whileHover: hover ? { y: -6, scale: 1.01 } : undefined,
    className: baseClass,
    ...(onClick ? { onClick, role: 'button', tabIndex: 0 } : {}),
  };

  return <MotionTag {...props}>{children}</MotionTag>;
}

export function DashAlert({ type = 'success', children, onRetry }) {
  const isError = type === 'error';
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`dash-alert ${isError ? 'dash-alert-error' : 'dash-alert-success'}`}
    >
      {children}
      {onRetry && (
        <button type="button" onClick={onRetry} className="ml-auto text-sm underline shrink-0">
          Retry
        </button>
      )}
    </motion.div>
  );
}

export function AdminStatCard({ stat, index, hint }) {
  const tones = ['emerald', 'blue', 'violet', 'orange', 'cyan', 'rose'];
  const tone = tones[index % tones.length];

  return (
    <div className="dash-b2b-stat">
      <div className="dash-b2b-stat__top">
        <div className={`dash-b2b-stat__icon dash-b2b-stat__icon--${tone}`}>
          <stat.icon className="w-5 h-5" />
        </div>
        {hint && <span className="dash-b2b-stat__hint">{hint}</span>}
      </div>
      <p className="dash-b2b-stat__value">{stat.value}</p>
      <p className="dash-b2b-stat__label">{stat.label}</p>
    </div>
  );
}
