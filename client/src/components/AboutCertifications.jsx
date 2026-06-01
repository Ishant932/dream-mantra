import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X, ZoomIn } from 'lucide-react';
import { useHomeContent } from '../i18n/useSiteContent';

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

export default function AboutCertifications({ copy }) {
  const { certifications } = useHomeContent();
  const [lightbox, setLightbox] = useState(null);

  return (
    <section className="py-20 lg:py-28" style={{ background: 'var(--bg-muted)' }} id="certifications">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div {...fade} className="text-center mb-12">
          <span className="section-label inline-flex items-center gap-2">
            <Award className="w-4 h-4" /> {copy.label}
          </span>
          <h2 className="section-title mt-3">
            {copy.title}{' '}
            <span className="gradient-text">{copy.titleHighlight}</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-theme-muted">{copy.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {certifications.map((cert, i) => (
            <motion.button
              key={cert.id}
              type="button"
              {...fade}
              transition={{ delay: i * 0.05, duration: 0.45 }}
              onClick={() => setLightbox(cert)}
              className="about-cert-card group text-left"
              aria-label={`${copy.viewFull}: ${cert.title}`}
            >
              <div className="about-cert-photo">
                <img
                  src={cert.image}
                  alt={cert.title}
                  className="about-cert-img"
                  loading="lazy"
                />
                <span className="about-cert-zoom" aria-hidden="true">
                  <ZoomIn className="w-4 h-4" />
                </span>
              </div>
              <div className="about-cert-caption">
                <p className="font-semibold text-sm text-theme-primary leading-snug line-clamp-2">{cert.title}</p>
                <p className="text-xs text-theme-muted mt-1 line-clamp-2">{cert.issuer}</p>
              </div>
            </motion.button>
          ))}
        </div>
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
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative max-w-3xl w-full cert-lightbox-panel"
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" onClick={() => setLightbox(null)} className="cert-lightbox-close" aria-label={copy.closeLightbox}>
                <X className="w-5 h-5" />
              </button>
              <div className="cert-photo-frame cert-photo-frame--lightbox">
                <img src={lightbox.image} alt={lightbox.title} className="cert-photo-img cert-photo-img--lightbox" />
              </div>
              <div className="mt-4 text-center">
                <h3 className="font-display text-xl font-bold text-theme-primary">{lightbox.title}</h3>
                <p className="text-sm text-theme-muted mt-1">{lightbox.issuer}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
