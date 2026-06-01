import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Expand, X } from 'lucide-react';
import { useHomeContent } from '../i18n/useSiteContent';
import MarqueeStrip from './MarqueeStrip';

const TAB_ORDER = ['all', 'international', 'government', 'nlp', 'iit', 'reliance', 'dmit'];
const TAB_ICONS = {
  all: '🏆',
  international: '🌍',
  government: '🇮🇳',
  nlp: '🧠',
  iit: '🎓',
  reliance: '✨',
  dmit: '🔬',
};

export default function CertificationsShowcase() {
  const { home, certifications } = useHomeContent();
  const certCopy = home.certifications;
  const [activeTab, setActiveTab] = useState('all');
  const [lightbox, setLightbox] = useState(null);

  const filtered = useMemo(() => {
    if (activeTab === 'all') return certifications;
    return certifications.filter((c) => c.category === activeTab);
  }, [activeTab, certifications]);

  const marqueeItems = filtered.length > 0 ? filtered : certifications;

  return (
    <section id="certifications" className="no-reveal py-20 lg:py-28 relative overflow-hidden scroll-mt-28 cert-showcase-section">
      <div className="absolute inset-0 cert-showcase-bg pointer-events-none" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 relative mb-12">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-label inline-flex items-center gap-2"
          >
            <Award className="w-4 h-4" /> {certCopy.label}
          </motion.span>
          <h2 className="section-title mt-3">
            {certCopy.title} <span className="gradient-text">{certCopy.titleHighlight}</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-theme-muted">
            {certCopy.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="flex gap-2 overflow-x-auto pb-3 mt-10 cert-tabs-scroll scrollbar-hide justify-start md:justify-center"
        >
          {TAB_ORDER.map((tab) => (
            <motion.button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`cert-tab shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === tab ? 'cert-tab-active' : 'cert-tab-idle'
              }`}
            >
              <span className="text-base" aria-hidden="true">{TAB_ICONS[tab]}</span>
              {certCopy.tabs[tab]}
            </motion.button>
          ))}
        </motion.div>
      </div>

      <div key={activeTab} className="relative cert-marquee-wrap">
        <MarqueeStrip speed="55s" gap="gap-6">
          {marqueeItems.map((cert, i) => (
            <CertMarqueeCard
              key={`${cert.id}-${i}`}
              cert={cert}
              onExpand={setLightbox}
              copy={certCopy}
            />
          ))}
        </MarqueeStrip>
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 cert-lightbox-backdrop"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="relative max-w-3xl w-full cert-lightbox-panel"
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" onClick={() => setLightbox(null)} className="cert-lightbox-close" aria-label={certCopy.closeLightbox}>
                <X className="w-5 h-5" />
              </button>
              <div className="cert-photo-frame cert-photo-frame--lightbox">
                <img src={lightbox.image} alt={lightbox.title} className="cert-photo-img cert-photo-img--lightbox" />
              </div>
              <div className="mt-4 text-center">
                <h3 className="font-display text-xl font-bold text-theme-primary">{lightbox.title}</h3>
                <p className="text-sm mt-1 text-theme-muted">{lightbox.issuer}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function CertMarqueeCard({ cert, onExpand, copy }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <article className="cert-card cert-marquee-card w-[min(280px,calc(100vw-2.5rem))] md:w-[300px] shrink-0 group relative overflow-hidden">
      <div className="cert-photo-frame">
        {imgFailed ? (
          <div className="cert-photo-fallback flex flex-col items-center justify-center h-full p-4 text-center">
            <Award className="w-10 h-10 text-amber-600 mb-2" />
            <p className="font-bold text-sm text-theme-primary leading-snug">{cert.title}</p>
            <p className="text-xs text-theme-muted mt-1">{cert.issuer}</p>
          </div>
        ) : (
          <img
            src={cert.image}
            alt={cert.title}
            className="cert-photo-img"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        )}
        <button
          type="button"
          onClick={() => onExpand(cert)}
          className="cert-expand-btn opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          aria-label={copy.viewFull}
        >
          <Expand className="w-4 h-4" />
          <span className="text-xs font-semibold">{copy.viewFull}</span>
        </button>
      </div>

      <div className="cert-card-footer p-4">
        <h3 className="font-bold text-sm leading-snug line-clamp-2 text-theme-primary">{cert.title}</h3>
        <p className="text-xs mt-1.5 line-clamp-2 text-theme-muted">{cert.issuer}</p>
      </div>
    </article>
  );
}
