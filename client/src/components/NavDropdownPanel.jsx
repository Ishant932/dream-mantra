import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowUpRight, Zap } from 'lucide-react';
import { parseNavTarget, handleHashNavClick } from '../utils/scrollHash';
import { isMobilePerf } from '../utils/mobilePerf';

const VARIANT_META = {
  counselling: { label: 'For Counselling', accent: '#013220', glow: 'rgba(1,50,32,0.15)' },
  crp: { label: 'Training and placement', accent: '#FF6B4A', glow: 'rgba(255,107,74,0.2)' },
  explore: { label: 'Explore Dream Mantra', accent: '#C9A84C', glow: 'rgba(201,168,76,0.2)' },
  default: { label: 'Dream Mantra', accent: '#C9A84C', glow: 'rgba(201,168,76,0.15)' },
};

const particles = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  left: `${8 + (i * 7) % 88}%`,
  top: `${6 + (i * 9) % 82}%`,
  size: i % 4 === 0 ? 5 : i % 3 === 0 ? 4 : 3,
  delay: i * 0.28,
}));

function PanelShell({ lite, variant, className, children }) {
  const meta = VARIANT_META[variant] || VARIANT_META.default;
  const panelClass = `nav-mega-panel nav-mega-panel-${variant} ${lite ? 'nav-mega-panel--lite' : ''} ${className}`.trim();

  if (lite) {
    return (
      <div className={panelClass}>
        <div className="nav-mega-header nav-mega-header--lite">
          <span className="nav-mega-header-icon">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <p className="nav-mega-header-title">{meta.label}</p>
            <p className="nav-mega-header-sub">
              <Zap className="inline w-3 h-3 mr-1 text-[var(--orange)]" />
              Tap any option below
            </p>
          </div>
        </div>
        <div className="relative z-[2] nav-mega-body">{children}</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.94, rotateX: -8 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
      className={panelClass}
      style={{ perspective: 1200 }}
    >
      <div className="nav-mega-border-glow" aria-hidden />
      <div className="nav-mega-hex" aria-hidden />
      <div className="nav-mega-mesh" aria-hidden />
      <motion.div
        className="nav-mega-sweep"
        animate={{ x: ['-130%', '230%'] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
        aria-hidden
      />
      <motion.div
        className="nav-mega-sweep nav-mega-sweep-2"
        animate={{ x: ['230%', '-130%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
        aria-hidden
      />
      <motion.div
        className="nav-mega-rays"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        aria-hidden
      />
      {[1, 2, 3, 4].map((n) => (
        <motion.div
          key={n}
          className={`nav-mega-orb nav-mega-orb-${n}`}
          animate={{
            scale: [1, 1.2, 0.95, 1],
            opacity: [0.3, 0.55, 0.35, 0.3],
            x: [0, n % 2 === 0 ? 12 : -10, 0],
          }}
          transition={{ duration: 5 + n, repeat: Infinity, ease: 'easeInOut', delay: n * 0.6 }}
          aria-hidden
        />
      ))}
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="nav-mega-particle"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
          animate={{ opacity: [0.15, 0.85, 0.15], y: [0, -14, 0], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 3 + (p.id % 3), repeat: Infinity, delay: p.delay }}
          aria-hidden
        />
      ))}
      <div className="nav-mega-grid" aria-hidden />

      <div className="nav-mega-header">
        <motion.div
          className="nav-mega-header-shine"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
        />
        <motion.span
          className="nav-mega-header-icon"
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Sparkles className="w-4 h-4" />
        </motion.span>
        <div>
          <p className="nav-mega-header-title">{meta.label}</p>
          <p className="nav-mega-header-sub">
            <Zap className="inline w-3 h-3 mr-1 text-[var(--orange)]" />
            AI-powered · Tap any option
          </p>
        </div>
      </div>

      <div className="relative z-[2] nav-mega-body">{children}</div>
    </motion.div>
  );
}

export function NavDropdownPanel({ variant = 'default', children, className = '' }) {
  const lite = isMobilePerf();
  return (
    <PanelShell lite={lite} variant={variant} className={className}>
      {children}
    </PanelShell>
  );
}

export function NavDropdownColumns({ children, className = '' }) {
  const lite = isMobilePerf();
  return (
    <div className={`nav-mega-columns ${className}`}>
      {!lite && <div className="nav-mega-bridge" aria-hidden />}
      {children}
    </div>
  );
}

export function NavDropdownColumn({ title, children, index = 0 }) {
  const lite = isMobilePerf();
  const fromLeft = index % 2 === 0;

  if (lite) {
    return (
      <div className={`nav-mega-col ${index > 0 ? 'nav-mega-col-divided' : ''}`}>
        <div className="nav-mega-col-title-wrap">
          <span className="nav-mega-dot" />
          <span className="nav-mega-col-title">{title}</span>
        </div>
        <div className="nav-mega-col-links">{children}</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: fromLeft ? -28 : 28, y: 16 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay: 0.08 + index * 0.12, type: 'spring', stiffness: 320, damping: 26 }}
      className={`nav-mega-col ${index > 0 ? 'nav-mega-col-divided' : ''}`}
    >
      {index > 0 && (
        <motion.div
          className="nav-mega-partition"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.15 + index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
      <motion.div
        className="nav-mega-col-title-wrap"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 + index * 0.1 }}
      >
        <motion.span
          className="nav-mega-dot"
          animate={{ scale: [1, 1.5, 1], boxShadow: ['0 0 0 0 rgba(201,168,76,0.4)', '0 0 0 6px rgba(201,168,76,0)', '0 0 0 0 rgba(201,168,76,0)'] }}
          transition={{ duration: 2, repeat: Infinity, delay: index * 0.4 }}
        />
        <span className="nav-mega-col-title">{title}</span>
        <motion.span
          className="nav-mega-col-line"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
        />
      </motion.div>
      <div className="nav-mega-col-links">{children}</div>
    </motion.div>
  );
}

export function NavDropdownLinkGroup({ icon, label, desc, links, index = 0 }) {
  const lite = isMobilePerf();
  const Wrapper = lite ? 'div' : motion.div;
  const wrapperProps = lite
    ? { className: 'nav-mega-group' }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { delay: 0.1 + index * 0.08, type: 'spring', stiffness: 380, damping: 26 },
        className: 'nav-mega-group',
      };

  return (
    <Wrapper {...wrapperProps}>
      <div className="nav-mega-group-header">
        <span className="nav-mega-link-icon-box nav-mega-group-icon-box">
          <span className="nav-mega-link-icon">{icon}</span>
        </span>
        <div className="min-w-0 flex-1">
          <span className="nav-mega-group-label">{label}</span>
          {desc && <span className="nav-mega-group-desc">{desc}</span>}
        </div>
      </div>
      <div className={`nav-mega-group-links ${links.length === 1 ? 'nav-mega-group-links-single' : ''}`}>
        {links.map((l, i) => (
          <NavDropdownLink
            key={l.to + l.label}
            to={l.to}
            label={l.label}
            desc={l.desc}
            icon={l.icon}
            index={index + i}
            compact={links.length > 1}
          />
        ))}
      </div>
    </Wrapper>
  );
}

export function NavDropdownLink({ to, label, desc, icon, index = 0, onClick, compact = false }) {
  const location = useLocation();
  const lite = isMobilePerf();
  const target = parseNavTarget(to);

  const handleClick = (e) => {
    const handled = handleHashNavClick(e, to, location.pathname, onClick);
    if (!handled) onClick?.(e);
  };

  const linkContent = (
    <Link to={target} onClick={handleClick} className={`nav-mega-link group ${compact ? 'nav-mega-link-compact' : ''}`}>
      {!lite && <span className="nav-mega-link-accent" aria-hidden />}
      {!lite && <span className="nav-mega-link-ring" aria-hidden />}
      {!lite && (
        <motion.span
          className="nav-mega-link-shine"
          animate={{ x: ['-150%', '250%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 3 + index * 0.2 }}
          aria-hidden
        />
      )}
      <span className="flex items-center gap-3 relative z-[1]">
        {icon && (
          <span className="nav-mega-link-icon-box">
            <span className="nav-mega-link-icon">{icon}</span>
          </span>
        )}
        <span className="flex-1 min-w-0">
          <span className="nav-mega-link-label">{label}</span>
          {desc && <span className="nav-mega-link-desc">{desc}</span>}
        </span>
        <span className="nav-mega-link-arrow">
          <ArrowUpRight className="w-4 h-4" />
        </span>
      </span>
    </Link>
  );

  if (lite) {
    return <div className="nav-mega-link-wrap">{linkContent}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.94 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.05, type: 'spring', stiffness: 420, damping: 24 }}
      whileHover={{ y: compact ? -2 : -4, scale: 1.01 }}
    >
      {linkContent}
    </motion.div>
  );
}
