import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.92 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.03, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};

const detailVariants = {
  hidden: { opacity: 0, height: 0, marginBottom: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    marginBottom: 12,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginBottom: 0,
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function CRPParameters() {
  const { d } = useLang();
  const params = d('pages.crp.parameters');
  const crpParameters = d('data.crpParameters');
  const categories = useMemo(
    () => [...new Set(crpParameters.map((p) => p.category))],
    [crpParameters]
  );

  const [activeId, setActiveId] = useState(null);
  const [filter, setFilter] = useState(params.filterAll);

  const filtered =
    filter === params.filterAll ? crpParameters : crpParameters.filter((p) => p.category === filter);

  const active = activeId ? crpParameters.find((p) => p.id === activeId) : null;

  const toggleParam = (id) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="parameters" className="relative py-12 lg:py-20 scroll-mt-28 overflow-hidden border-t border-amber-200/60">
      <div className="crp-params-bg" aria-hidden="true">
        <motion.span
          className="crp-orb crp-orb-1"
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          className="crp-orb crp-orb-2"
          animate={{ x: [0, -24, 0], y: [0, 18, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          className="crp-orb crp-orb-3"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
        />
        {[...Array(6)].map((_, i) => (
          <motion.span
            key={i}
            className="crp-float-dot"
            style={{ left: `${12 + i * 14}%`, top: `${20 + (i % 3) * 22}%` }}
            animate={{ y: [0, -12, 0], opacity: [0.2, 0.55, 0.2] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <motion.span
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-100 text-amber-800 text-sm font-bold mb-5"
            animate={{ boxShadow: ['0 0 0 rgba(245,158,11,0)', '0 0 24px rgba(245,158,11,0.35)', '0 0 0 rgba(245,158,11,0)'] }}
            transition={{ duration: 2.8, repeat: Infinity }}
          >
            {params.badge}
          </motion.span>
          <h2 className="section-title mb-4">
            {params.title}{' '}
            <span className="gradient-text">{params.titleHighlight}</span>
          </h2>
          <p className="text-sand-600 text-lg leading-relaxed">
            {params.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 mb-4"
        >
          {[params.filterAll, ...categories].map((cat, i) => (
            <motion.button
              key={cat}
              type="button"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setFilter(cat);
                setActiveId(null);
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === cat
                  ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                  : 'bg-[var(--bg-elevated)] border border-amber-200/80 text-sand-600 hover:border-amber-400'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={active.id}
              variants={detailVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="crp-params-detail-compact overflow-hidden"
            >
              <motion.div
                initial={{ x: -8, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.06, duration: 0.28 }}
                className="flex items-start gap-3"
              >
                <motion.span
                  className="text-2xl shrink-0 crp-param-icon-pop"
                  animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.12, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {active.icon}
                </motion.span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-0.5">
                    {active.category} · {params.parameterOf} {String(active.id).padStart(2, '0')} {params.ofTwenty}
                  </p>
                  <p className="font-bold text-sm leading-snug text-[var(--text-primary)]">{active.label}</p>
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xs text-sand-600 leading-relaxed mt-1"
                  >
                    {active.desc}
                  </motion.p>
                  <motion.div
                    className="mt-2 h-0.5 rounded-full bg-amber-100 overflow-hidden max-w-xs"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(active.id / 20) * 100}%` }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </motion.div>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActiveId(null)}
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-amber-100 text-amber-700 hover:bg-amber-200 transition"
                  aria-label={params.closeLabel}
                >
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-12">
          {filtered.map((param, i) => {
            const isActive = activeId === param.id;
            return (
              <motion.button
                key={param.id}
                type="button"
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-30px' }}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleParam(param.id)}
                className={`crp-param-card text-left crp-param-card-animated ${isActive ? 'crp-param-card-active' : ''}`}
              >
                <motion.span
                  className="crp-param-shimmer"
                  animate={isActive ? { x: ['-100%', '200%'] } : {}}
                  transition={{ duration: 1.2, repeat: isActive ? Infinity : 0, repeatDelay: 0.8 }}
                />
                <motion.span
                  className="crp-param-num"
                  animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                >
                  {String(param.id).padStart(2, '0')}
                </motion.span>
                <motion.span
                  className="text-xl mb-1.5 block"
                  animate={isActive ? { y: [0, -3, 0] } : {}}
                  transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
                >
                  {param.icon}
                </motion.span>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-0.5">{param.category}</p>
                <h4 className="font-bold text-xs leading-snug">{param.label}</h4>
                {isActive && (
                  <motion.span
                    layoutId="crp-param-glow"
                    className="crp-param-glow"
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
