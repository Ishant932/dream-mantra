import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { paymentsApi } from '../api';
import { isMobilePerf } from '../utils/mobilePerf';

const cardVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const cardVariantsLite = {
  hidden: { opacity: 1, y: 0 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  }),
};

const HOME_CATALOG_SLUG = {
  dmit: 'dmit',
  psychometric: 'psychometric',
  crp: 'crp-test',
};

function formatPrice(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

export default function HomeModulesIntro() {
  const { d } = useLang();
  const copy = d('home.modulesIntro');
  const [catalog, setCatalog] = useState([]);
  const mobile = isMobilePerf();
  const variants = mobile ? cardVariantsLite : cardVariants;
  const headerMotion = mobile
    ? { initial: { opacity: 1, y: 0 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } }
    : { initial: { opacity: 0, y: 28 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' }, transition: { duration: 0.65 } };

  useEffect(() => {
    paymentsApi.products()
      .then((res) => {
        if (Array.isArray(res.products)) setCatalog(res.products);
      })
      .catch(() => {});
  }, []);

  const modules = useMemo(() => {
    const known = new Set((copy.modules || []).map((mod) => HOME_CATALOG_SLUG[mod.slug] || mod.slug));
    const base = (copy.modules || []).map((mod) => {
      const catalogSlug = HOME_CATALOG_SLUG[mod.slug] || mod.slug;
      const live = catalog.find((m) => m.slug === catalogSlug);
      return {
        ...mod,
        title: live?.title || mod.title,
        desc: live?.description || mod.desc,
        icon: live?.icon || mod.icon,
        price: live?.price,
      };
    });
    const extras = catalog
      .filter((m) => !known.has(m.slug) && !m.hidden && !m.followUpOnly)
      .map((m) => ({
        slug: m.slug,
        title: m.title,
        desc: m.description || '',
        icon: m.icon || '📋',
        price: m.price,
        link: '/marketplace',
      }));
    return [...base, ...extras];
  }, [copy.modules, catalog]);

  return (
    <div className="home-modules-intro relative overflow-hidden no-reveal">
      <div className="max-w-7xl mx-auto px-4 relative">
        <motion.div
          {...headerMotion}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <h2 className="home-headline mb-4">
            {copy.title} <span className="gradient-text text-pop">{copy.titleHighlight}</span>
          </h2>
          <p className="text-lg text-secondary-theme leading-relaxed">{copy.subtitle}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.slug}
              custom={i}
              variants={variants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              whileHover={mobile ? undefined : { y: -10, scale: 1.02 }}
              whileTap={mobile ? { scale: 0.98 } : { scale: 0.98 }}
              className="home-module-card group"
            >
              <div className="home-module-card__glow" aria-hidden />
              {mobile ? (
                <div className="home-module-card__icon">{mod.icon}</div>
              ) : (
                <motion.div
                  className="home-module-card__icon"
                  whileHover={{ rotate: [0, -8, 8, 0], scale: 1.12 }}
                  transition={{ duration: 0.5 }}
                >
                  {mod.icon}
                </motion.div>
              )}
              <h3 className="home-module-card__title">{mod.title}</h3>
              {mod.price != null && (
                <p className="text-sm font-bold text-amber-700 dark:text-amber-300 mb-1">{formatPrice(mod.price)}</p>
              )}
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
