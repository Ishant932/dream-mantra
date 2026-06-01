import { motion } from 'framer-motion';
import { Sparkles, Instagram } from 'lucide-react';
import InstagramReelEmbed from './InstagramReelEmbed';
import { footerSocial } from '../data/siteLinks';

const fade = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};

export default function SuccessStoriesSection({ page, instagramReels = [] }) {
  if (!instagramReels.length) return null;

  return (
    <section className="success-stories-section py-4 mb-12">
      <motion.div {...fade} className="text-center mb-10">
        <motion.span
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-semibold mb-4"
        >
          <Sparkles className="w-4 h-4" /> {page.successStoriesBadge}
        </motion.span>
        <h2 className="section-title">
          {page.successStoriesTitle}{' '}
          <span className="gradient-text">{page.successStoriesHighlight}</span>
        </h2>
        <p className="text-theme-muted max-w-2xl mx-auto mt-3">{page.successStoriesSubtitle}</p>
      </motion.div>

      <motion.div {...fade} className="success-reels-showcase">
        <div className="success-reels-showcase__bg" aria-hidden="true">
          <motion.div
            className="success-reels-showcase__orb success-reels-showcase__orb--1"
            animate={{ x: [0, 24, 0], y: [0, -16, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="success-reels-showcase__orb success-reels-showcase__orb--2"
            animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
        </div>

        <div className="success-reels-showcase__header">
          <motion.h3
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="success-reels-showcase__title"
          >
            {page.reelsTitle || 'Watch on Instagram'}
          </motion.h3>
          <motion.a
            href={footerSocial.instagram}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="success-reels-showcase__follow"
          >
            <Instagram className="w-4 h-4" /> {page.followInstagram || 'Follow @dream.mantra'}
          </motion.a>
        </div>

        <div className="success-reels-grid">
          {instagramReels.map((reel, i) => (
            <InstagramReelEmbed key={reel.id || reel.shortcode} reel={reel} index={i} profileUrl={footerSocial.instagram} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
