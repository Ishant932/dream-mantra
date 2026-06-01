import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useHomeContent } from '../i18n/useSiteContent';

const CARD_GRADIENTS = [
  'from-amber-400 to-orange-500',
  'from-orange-400 to-red-400',
  'from-yellow-400 to-amber-500',
  'from-amber-500 to-yellow-600',
  'from-orange-500 to-amber-600',
  'from-red-400 to-orange-500',
];

const fade = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};

export default function HomeWhoWeGuide() {
  const { d } = useLang();
  const { whoWeGuide } = useHomeContent();
  const copy = d('home.whoWeGuide');

  return (
    <div className="max-w-7xl mx-auto px-4">
      <motion.div {...fade} className="text-center mb-14">
        <h2 className="home-headline">
          {copy.title}{' '}
          <span className="gradient-text text-pop">{copy.titleHighlight}</span>
        </h2>
        <p className="text-lg mt-4 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          {copy.subtitle}
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {whoWeGuide.map((w, i) => (
          <motion.div
            key={w.title}
            {...fade}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -10 }}
            className="home-guide-card group"
          >
            <Link to={w.link} className="block h-full">
              <div className={`home-guide-card__bar bg-gradient-to-r ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]}`} />
              <div className="home-guide-card__body">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <span className="home-guide-card__icon">{w.icon}</span>
                  <span className="home-guide-card__num">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="home-guide-card__title">{w.title}</h3>
                <p className="home-guide-card__tag">{w.subtitle}</p>
                {w.desc && <p className="home-guide-card__desc">{w.desc}</p>}
                <span className="home-guide-card__cta">
                  {copy.viewProgram} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.p {...fade} className="text-center mt-12">
        <Link to="/counselling?tab=programs" className="btn-primary inline-flex items-center gap-2">
          {copy.seeAllPrograms} <ArrowRight className="w-5 h-5" />
        </Link>
      </motion.p>
    </div>
  );
}
