import { motion } from 'framer-motion';
import { useLang } from '../context/LanguageContext';

/** Fallback 3D-style figures if item.icon is missing */
const FIGURE_EMOJIS = ['⏱️', '🌐', '👥', '🗣️', '🏅', '✅', '🎓', '📞'];

export default function CRPAdditionalHighlights({ compact = false }) {
  const { d } = useLang();
  const crp = d('pages.crp');
  const crpAdditionalParameters = d('data.crpAdditionalParameters') || [];

  return (
    <section
      id="highlights"
      className={compact ? 'crp-highlights-studio scroll-mt-28' : 'scroll-mt-28 py-16 lg:py-20'}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className={compact ? 'crp-launchpad__section-head' : 'text-center mb-3'}>
          <h3 className={compact ? 'crp-launchpad__section-title' : 'section-title text-center mb-3'}>
            {crp.highlights.title}{' '}
            <span className={compact ? '' : 'gradient-text'}>{crp.highlights.titleHighlight}</span>
          </h3>
        </div>
        {crp.highlights.subtitle ? (
          <p className="text-center text-sand-600 mb-8 max-w-xl mx-auto text-sm">
            {crp.highlights.subtitle}
          </p>
        ) : null}

        {compact ? (
          <ul className="crp-highlights-cards">
            {crpAdditionalParameters.map((item, i) => (
              <motion.li
                key={item.label}
                className="crp-highlights-cards__item"
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 18 }}
                whileHover={{ y: -4 }}
              >
                <span className="crp-highlights-cards__icon" aria-hidden>
                  {item.icon || FIGURE_EMOJIS[i % FIGURE_EMOJIS.length]}
                </span>
                <strong className="crp-highlights-cards__label">{item.label}</strong>
                {item.desc ? <span className="crp-highlights-cards__desc">{item.desc}</span> : null}
              </motion.li>
            ))}
          </ul>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {crpAdditionalParameters.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
                className="crp-param-card crp-additional-card p-4"
              >
                <span className="text-xl mb-2 block" aria-hidden>
                  {item.icon}
                </span>
                <h4 className="font-bold text-sm leading-snug">{item.label}</h4>
                {item.desc ? (
                  <p className="text-xs text-sand-600 leading-relaxed mt-1">{item.desc}</p>
                ) : null}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}
