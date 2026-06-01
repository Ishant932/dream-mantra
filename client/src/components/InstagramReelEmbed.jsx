import { motion } from 'framer-motion';
import { Instagram, Volume2 } from 'lucide-react';
export default function InstagramReelEmbed({ reel, index = 0, profileUrl = 'https://www.instagram.com/dream.mantra/' }) {
  const embedSrc = `https://www.instagram.com/reel/${reel.shortcode}/embed/`;
  const reelUrl = `https://www.instagram.com/reel/${reel.shortcode}/`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 32, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className="instagram-reel-card group"
    >
      <motion.div
        className="instagram-reel-card__glow"
        animate={{ opacity: [0.35, 0.65, 0.35], scale: [1, 1.04, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: index * 0.4 }}
        aria-hidden="true"
      />
      <motion.div
        className="instagram-reel-card__ring"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        aria-hidden="true"
      />

      <div className="instagram-reel-card__header">
        <span className="instagram-reel-card__badge">
          <Instagram className="w-3.5 h-3.5" /> Reel
        </span>
        <span className="instagram-reel-card__audio-hint">
          <Volume2 className="w-3.5 h-3.5" /> Tap to play with sound
        </span>
      </div>

      <div className="instagram-reel-card__frame">
        <iframe
          src={embedSrc}
          title={reel.title}
          className="instagram-reel-card__iframe"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>

      <div className="instagram-reel-card__body">
        <h3 className="instagram-reel-card__title">{reel.title}</h3>
        {reel.caption && (
          <p className="instagram-reel-card__caption">{reel.caption}</p>
        )}
        <a
          href={reelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="instagram-reel-card__link"
        >
          Watch on Instagram <Instagram className="w-3.5 h-3.5" />
        </a>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="instagram-reel-card__profile"
        >
          @dream.mantra
        </a>
      </div>
    </motion.article>
  );
}
