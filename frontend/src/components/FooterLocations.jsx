import { ExternalLink, Globe, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLang } from '../context/LanguageContext';
import { JAIPUR_LOCATIONS } from '../data/siteLinks';

const locVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function FooterLocations() {
  const { d } = useLang();
  const copy = d('footer.locationsBlock') || {};

  return (
    <motion.div
      className="footer-pro__locations"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
    >
      {JAIPUR_LOCATIONS.map((loc, i) =>
        loc.online ? (
          <motion.div
            key={loc.name}
            custom={i}
            variants={locVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className="footer-pro__loc footer-pro__loc--online"
          >
            <Globe className="w-4 h-4 footer-pro__loc-icon" aria-hidden="true" />
            <div>
              <p className="footer-pro__loc-name">{loc.name}</p>
              <p className="footer-pro__loc-meta">{copy.onlineDesc}</p>
            </div>
          </motion.div>
        ) : (
          <motion.a
            key={loc.name}
            custom={i}
            variants={locVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={loc.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-pro__loc"
          >
            <MapPin className="w-4 h-4 footer-pro__loc-icon" aria-hidden="true" />
            <div>
              <p className="footer-pro__loc-name">{loc.name}</p>
              <p className="footer-pro__loc-meta footer-pro__loc-meta--link">
                {copy.openMaps || 'Open in Google Maps'}
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </p>
            </div>
          </motion.a>
        )
      )}
    </motion.div>
  );
}
