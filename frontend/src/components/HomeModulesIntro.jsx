import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

const cardVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function HomeModulesIntro() {
  const { d } = useLang();
  const copy = d('home.modulesIntro');

  return (
    <div className="home-modules-intro relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -right-24 w-72 h-72 rounded-full blur-3xl opacity-30 animate-blob" style={{ background: 'var(--orange-soft)' }} />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-20 animate-blob-slow" style={{ background: 'var(--gold-dim)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.65 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <h2 className="home-headline mb-4">
            {copy.title} <span className="gradient-text text-pop">{copy.titleHighlight}</span>
          </h2>
          <p className="text-lg text-secondary-theme leading-relaxed">{copy.subtitle}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {copy.modules.map((mod, i) => (
            <motion.div
              key={mod.slug}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              whileHover={{ y: -10, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="home-module-card group"
            >
              <div className="home-module-card__glow" aria-hidden />
              <motion.div
                className="home-module-card__icon"
                whileHover={{ rotate: [0, -8, 8, 0], scale: 1.12 }}
                transition={{ duration: 0.5 }}
              >
                {mod.icon}
              </motion.div>
              <h3 className="home-module-card__title">{mod.title}</h3>
              <p className="home-module-card__desc">{mod.desc}</p>
              <Link to={mod.link} className="home-module-card__link">
                {copy.learnMore} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
