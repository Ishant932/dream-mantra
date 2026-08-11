import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { cmsText, usePageCatalog } from '../hooks/usePageCatalog';
import { isMobilePerf } from '../utils/mobilePerf';
import PageNextStep from './PageNextStep';

const HERO_BG_IMAGE = '/images/owner-hero.png?v=as-is3';

const fadeLite = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
};

function Pathway({ points, cta, to, variant }) {
  return (
    <div className={`hero-pathway hero-pathway--${variant}`}>
      <Link to={to} className={`hero-pathway__btn hero-pathway__btn--${variant}`}>
        {cta}
        <ArrowRight className="w-4 h-4" aria-hidden />
      </Link>
      <p className="hero-pathway__points">{points}</p>
    </div>
  );
}

export default function HomeHero() {
  const { t, d } = useLang();
  const mobile = isMobilePerf();
  const cms = usePageCatalog('home');
  const counsellingPoints = (d('hero.counsellingPointers') || []).join(' · ');
  const trainingPoints = (d('hero.trainingPointers') || []).join(' · ');

  return (
    <section
      className={`no-reveal hero-section hero-section--photo-bg hero-section--photo-right hero-section--fit-content hero-section--refined relative overflow-hidden flex items-start${mobile ? ' hero-section--mobile hero-section--mobile-animated' : ''}`}
    >
      <motion.div
        className="hero-photo-bg"
        style={{ backgroundImage: `url(${HERO_BG_IMAGE})` }}
        aria-hidden
      />

      <div className="hero-photo-fx hero-photo-fx--mesh" aria-hidden />
      <div className="hero-photo-fx hero-photo-fx--scan" aria-hidden />
      <div className="hero-photo-fx hero-photo-fx--grain" aria-hidden />
      <div className="hero-photo-fx hero-photo-fx--vignette" aria-hidden />
      <div className="hero-photo-fx hero-photo-fx--glow hero-photo-fx--glow-a" aria-hidden />
      <div className="hero-photo-fx hero-photo-fx--glow hero-photo-fx--glow-b" aria-hidden />
      <div className="hero-photo-fx hero-photo-fx--light-leak" aria-hidden />
      <div className="hero-photo-fx hero-photo-fx--shimmer" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-4 pt-1 pb-5 sm:pt-2 sm:pb-8 lg:pt-4 lg:pb-10 w-full z-[2]">
        <div className="hero-section__content hero-section__content--refined max-w-3xl mx-auto lg:mx-0 text-center lg:text-left">
          <div className="hero-mobile-stage">
            <div
              className="hero-mobile-photo"
              style={{ backgroundImage: `url(${HERO_BG_IMAGE})` }}
              role="img"
              aria-label="Dream Mantra"
            />
            <motion.h1
              {...fadeLite}
              transition={{ ...fadeLite.transition, delay: 0.06 }}
              className="hero-h1 hero-title font-accent hero-mobile-stage__copy"
            >
              <span className="block hero-brand-name">{cmsText(cms, 'heroTitle', t('hero.titleLine1'))}</span>
              <span className="block hero-service-line mt-1.5">{cmsText(cms, 'heroSubtitle', t('hero.titleHighlight'))}</span>
            </motion.h1>
          </div>

          <motion.h1
            initial={mobile ? false : { opacity: 0, y: 24 }}
            animate={mobile ? undefined : { opacity: 1, y: 0 }}
            transition={mobile ? undefined : { duration: 0.6, delay: 0.08 }}
            className="hero-h1 hero-title font-accent mb-3 hero-desktop-title"
          >
            <span className="block hero-brand-name">{cmsText(cms, 'heroTitle', t('hero.titleLine1'))}</span>
            <span className="block hero-service-line mt-2">{cmsText(cms, 'heroSubtitle', t('hero.titleHighlight'))}</span>
          </motion.h1>

          <motion.p
            {...(mobile
              ? { ...fadeLite, transition: { ...fadeLite.transition, delay: 0.1 } }
              : {
                  initial: { opacity: 0, y: 12 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.5, delay: 0.14 },
                })}
            className="hero-lead"
          >
            {cmsText(cms, 'intro', t('hero.subtitle'))}
          </motion.p>

          <motion.div
            {...(mobile
              ? { ...fadeLite, transition: { ...fadeLite.transition, delay: 0.14 } }
              : {
                  initial: { opacity: 0, y: 16 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.5, delay: 0.2 },
                })}
            className="hero-pathways"
          >
            <Pathway
              points={counsellingPoints}
              cta={t('hero.cta1')}
              to="/counselling"
              variant="primary"
            />
            <Pathway
              points={trainingPoints}
              cta={t('hero.cta2')}
              to="/crp?tab=launchpad"
              variant="secondary"
            />
          </motion.div>
          <motion.div
            {...(mobile
              ? fadeLite
              : {
                  initial: { opacity: 0, y: 16 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.45, delay: 0.28 },
                })}
            className="mt-6 sm:mt-8 hero-next-step"
          >
            <PageNextStep className="hero-next-step__inner" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
