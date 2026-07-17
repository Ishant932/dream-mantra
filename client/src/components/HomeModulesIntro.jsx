import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { paymentsApi } from '../api';
import { isMobilePerf } from '../utils/mobilePerf';

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

const cardVariantsLite = {
  hidden: { opacity: 1, y: 0 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  }),
};

const HOME_CATALOG_SLUG = {
  dmit: 'dmit',
  psychometric: 'psychometric',
  'dmit-psychometric': 'dmit-psychometric',
  crp: 'crp-test',
};

function enrichModules(modules, catalog) {
  return (modules || []).map((mod) => {
    const catalogSlug = HOME_CATALOG_SLUG[mod.slug] || mod.slug;
    const live = catalog.find((m) => m.slug === catalogSlug);
    return {
      ...mod,
      title: mod.title || live?.title,
      desc: mod.desc || live?.description || '',
      icon: live?.icon || mod.icon,
    };
  });
}

function ModuleCard({ mod, i, variants, mobile, learnMore }) {
  return (
    <motion.div
      custom={i}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      whileHover={mobile ? undefined : { y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="home-module-card home-module-card--compact group"
    >
      <div className="home-module-card__glow" aria-hidden />
      <div className="home-module-card__top">
        {mobile ? (
          <div className="home-module-card__icon">{mod.icon}</div>
        ) : (
          <motion.div
            className="home-module-card__icon"
            whileHover={{ rotate: [0, -8, 8, 0], scale: 1.08 }}
            transition={{ duration: 0.45 }}
          >
            {mod.icon}
          </motion.div>
        )}
        <div className="home-module-card__meta">
          <h3 className="home-module-card__title">{mod.title}</h3>
        </div>
      </div>
      <p className="home-module-card__desc">{mod.desc}</p>
      <Link to={mod.link} className="home-module-card__link">
        {learnMore} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </Link>
    </motion.div>
  );
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

  const { primaryGroups, extraGroups } = useMemo(() => {
    const configured = (copy.groups || []).map((group) => ({
      ...group,
      modules: enrichModules(group.modules, catalog),
    }));

    if (!configured.length) {
      return {
        primaryGroups: [
          {
            id: 'all',
            label: '',
            subtitle: '',
            modules: enrichModules(copy.modules, catalog),
          },
        ],
        extraGroups: [],
      };
    }

    const known = new Set(
      configured.flatMap((g) => g.modules.map((mod) => HOME_CATALOG_SLUG[mod.slug] || mod.slug))
    );
    const extras = catalog
      .filter((m) => !known.has(m.slug) && !m.hidden && !m.followUpOnly)
      .map((m) => ({
        slug: m.slug,
        title: m.title,
        desc: m.description || '',
        icon: m.icon || '📋',
        link: '/marketplace',
      }));

    const primary = configured.filter((g) => g.id === 'counselling' || g.id === 'training');
    const rest = configured.filter((g) => g.id !== 'counselling' && g.id !== 'training');
    if (extras.length) {
      rest.push({
        id: 'more',
        label: copy.moreLabel || 'More modules',
        subtitle: '',
        modules: extras,
      });
    }

    return {
      primaryGroups: primary.length ? primary : configured,
      extraGroups: rest,
    };
  }, [copy.groups, copy.modules, copy.moreLabel, catalog]);

  return (
    <div className="home-modules-intro relative overflow-hidden no-reveal">
      <div className="max-w-7xl mx-auto px-4 relative">
        <motion.div
          {...headerMotion}
          className="text-center max-w-3xl mx-auto mb-6 sm:mb-10 md:mb-12"
        >
          <h2 className="home-headline mb-2.5 sm:mb-4">
            {copy.title} <span className="gradient-text text-pop">{copy.titleHighlight}</span>
          </h2>
          {copy.subtitle ? (
            <p className="text-sm sm:text-lg text-secondary-theme leading-relaxed">{copy.subtitle}</p>
          ) : null}
        </motion.div>

        <div className="home-modules-split">
          {primaryGroups.map((group) => (
            <section key={group.id} className={`home-modules-group home-modules-group--${group.id}`}>
              {(group.label || group.subtitle) && (
                <div className="home-modules-group__header">
                  {group.label && (
                    <h3 className="home-modules-group__label">{group.label}</h3>
                  )}
                  {group.subtitle && (
                    <p className="home-modules-group__subtitle">{group.subtitle}</p>
                  )}
                </div>
              )}
              <div className="home-modules-group__cards">
                {group.modules.map((mod, i) => (
                  <ModuleCard
                    key={mod.slug}
                    mod={mod}
                    i={i}
                    variants={variants}
                    mobile={mobile}
                    learnMore={copy.learnMore}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {extraGroups.length > 0 && (
          <div className="home-modules-groups mt-10 space-y-10">
            {extraGroups.map((group) => (
              <section key={group.id} className="home-modules-group">
                {(group.label || group.subtitle) && (
                  <div className="home-modules-group__header mb-5 text-center md:text-left">
                    {group.label && (
                      <h3 className="home-modules-group__label">{group.label}</h3>
                    )}
                    {group.subtitle && (
                      <p className="home-modules-group__subtitle">{group.subtitle}</p>
                    )}
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.modules.map((mod, i) => (
                    <ModuleCard
                      key={mod.slug}
                      mod={mod}
                      i={i}
                      variants={variants}
                      mobile={mobile}
                      learnMore={copy.learnMore}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
