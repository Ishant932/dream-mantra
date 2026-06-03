import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function PageHero({ title, subtitle, image, cta, ctaLink = '/contact', className = '' }) {
  return (
    <section className={`page-hero relative ${className}`.trim()}>
      <div className="absolute top-1/4 right-[15%] w-72 h-72 rounded-full blur-3xl animate-blob opacity-30 multi-pulse pointer-events-none" style={{ background: 'rgba(255,107,74,0.25)' }} />
      <div className="absolute bottom-0 left-[10%] w-56 h-56 rounded-full blur-3xl animate-blob-slow opacity-25 animate-breathe pointer-events-none" style={{ background: 'rgba(201,168,76,0.2)' }} />
      <div className="absolute top-1/2 right-[8%] w-40 h-40 rounded-full border border-[var(--gold-border)] opacity-20 animate-orbit pointer-events-none" />

      {image && (
        <motion.div
          className="page-hero__photo-layer"
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.img
            src={image}
            alt=""
            className="page-hero__photo"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      )}

      <div className="page-hero__particles" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.span
            key={i}
            className="page-hero__particle"
            style={{ left: `${12 + i * 18}%`, top: `${20 + (i % 3) * 22}%` }}
            animate={{ y: [0, -14 - i * 3, 0], opacity: [0.25, 0.7, 0.25] }}
            transition={{ duration: 3.5 + i * 0.4, repeat: Infinity, delay: i * 0.35, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <span className="hero-tag inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-5 border backdrop-blur-sm"
            style={{ borderColor: 'var(--gold-border)', color: 'var(--hero-text)', background: 'rgba(1,50,32,0.35)' }}>
            <Sparkles className="w-4 h-4 text-[#E8C96A] animate-pulse" /> Dream Mantra
          </span>
          <h1 className="hero-h1 hero-title mb-5" style={{ color: 'var(--hero-text)' }}>{title}</h1>
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="hero-sub text-lg md:text-xl leading-relaxed opacity-90"
              style={{ color: 'var(--hero-text)' }}
            >
              {subtitle}
            </motion.p>
          )}
          {cta && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              whileHover={{ scale: 1.03 }}
            >
              <Link to={ctaLink} className="btn-gold mt-8 inline-flex hero-btns">
                {cta}
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
