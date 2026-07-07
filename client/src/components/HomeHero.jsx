import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { isMobilePerf } from '../utils/mobilePerf';

const HERO_BG_IMAGE = '/images/owner-hero.png';

const fadeLite = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
};

export default function HomeHero() {
  const { t } = useLang();
  const mobile = isMobilePerf();

  const textMotion = mobile
    ? { ...fadeLite, transition: { ...fadeLite.transition, delay: 0.14 } }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, delay: 0.16 },
      };

  return (
    <section
      className={`no-reveal hero-section hero-section--photo-bg relative min-h-0 sm:min-h-[88vh] flex items-center overflow-hidden pt-4 sm:pt-10 pb-6 sm:pb-16${mobile ? ' hero-section--mobile hero-section--mobile-animated' : ''}`}
      style={{ '--hero-bg-image': `url(${HERO_BG_IMAGE})` }}
    >
      <div className="relative max-w-7xl mx-auto px-4 py-4 sm:py-16 w-full z-[1]">
        <div className="hero-section__content max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
          {mobile ? (
            <motion.span
              {...fadeLite}
              className="hero-tag inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-4 border section-alt mx-auto lg:mx-0"
              style={{ borderColor: 'var(--gold-border)', color: 'var(--text-primary)' }}
            >
              <span className="live-dot" aria-hidden />
              {t('hero.tag')}
            </motion.span>
          ) : (
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="hero-tag inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold mb-6 border section-alt shine-hover"
              style={{ borderColor: 'var(--gold-border)', color: 'var(--text-primary)' }}
            >
              <span className="live-dot" aria-hidden />
              {t('hero.tag')}
            </motion.span>
          )}

          {mobile ? (
            <motion.h1
              {...fadeLite}
              transition={{ ...fadeLite.transition, delay: 0.06 }}
              className="hero-h1 hero-title font-accent mb-3"
            >
              <span className="block hero-brand-name">{t('hero.titleLine1')}</span>
              <span className="block hero-service-line mt-1">{t('hero.titleHighlight')}</span>
            </motion.h1>
          ) : (
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="hero-h1 hero-title font-accent mb-4"
            >
              <span className="block hero-brand-name">{t('hero.titleLine1')}</span>
              <span className="block hero-service-line mt-2">{t('hero.titleHighlight')}</span>
            </motion.h1>
          )}

          {!mobile && (
            <>
              <motion.p
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.12 }}
                className="hero-quote text-base sm:text-lg italic font-semibold mb-4 max-w-xl leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('hero.quote')}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.14 }}
                className="hero-problem-hook"
              >
                {t('hero.problemHook')}
              </motion.p>
            </>
          )}

          <motion.p
            {...textMotion}
            className="hero-sub text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4 max-w-xl leading-relaxed mx-auto lg:mx-0"
            style={{ color: 'var(--text-secondary)' }}
          >
            {mobile ? t('hero.problemHook') : t('hero.subtitle')}
          </motion.p>

          {!mobile && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.22 }}
              className="hero-sub text-base sm:text-lg mb-8 max-w-xl leading-relaxed"
              style={{ color: 'var(--text-body)' }}
            >
              {t('hero.desc')}
            </motion.p>
          )}

          <motion.div
            {...(mobile ? { ...fadeLite, transition: { ...fadeLite.transition, delay: 0.2 } } : {})}
            className="hero-btns flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start"
          >
            <Link to="/signup" className="btn-primary px-6 sm:px-8 py-3.5 sm:py-4 w-full sm:w-auto justify-center">
              {t('hero.cta1')} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/counselling?tab=book" className="btn-outline w-full sm:w-auto justify-center">{t('mobileNav.book')}</Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
