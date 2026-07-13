import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Brain, Award, Shield, Sparkles } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { isMobilePerf } from '../utils/mobilePerf';

const HERO_BG_IMAGE = '/images/owner-hero.png';
const badgeIcons = [Brain, Award, Shield];

const fadeLite = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
};

export default function HomeHero() {
  const { t, d } = useLang();
  const mobile = isMobilePerf();
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], [0, mobile ? 0 : 80]);
  const bgScale = useTransform(scrollY, [0, 600], [1, mobile ? 1 : 1.08]);
  const badges = d('hero.badges').map((label, i) => ({
    icon: badgeIcons[i] || Sparkles,
    label,
  }));

  const textMotion = mobile
    ? { ...fadeLite, transition: { ...fadeLite.transition, delay: 0.14 } }
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, delay: 0.16 },
      };

  return (
    <section
      className={`no-reveal hero-section hero-section--photo-bg hero-section--photo-right relative min-h-0 sm:min-h-[88vh] flex items-center overflow-hidden pt-4 sm:pt-10 pb-6 sm:pb-16${mobile ? ' hero-section--mobile hero-section--mobile-animated' : ''}`}
    >
      <motion.div
        className="hero-photo-bg"
        style={{
          backgroundImage: `url(${HERO_BG_IMAGE})`,
          y: bgY,
          scale: bgScale,
        }}
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

      <div className="relative max-w-7xl mx-auto px-4 py-4 sm:py-16 w-full z-[2]">
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

          <motion.p
            {...(mobile ? { ...fadeLite, transition: { ...fadeLite.transition, delay: 0.1 } } : {
              initial: { opacity: 0, x: -16 },
              animate: { opacity: 1, x: 0 },
              transition: { duration: 0.55, delay: 0.12 },
            })}
            className={`hero-quote text-sm sm:text-base md:text-lg italic font-semibold mb-3 sm:mb-4 max-w-xl leading-relaxed mx-auto lg:mx-0 ${mobile ? 'text-center lg:text-left' : ''}`}
            style={{ color: 'var(--text-secondary)' }}
          >
            {t('hero.quote')}
          </motion.p>

          <motion.p
            {...(mobile ? { ...fadeLite, transition: { ...fadeLite.transition, delay: 0.12 } } : {
              initial: { opacity: 0, x: -16 },
              animate: { opacity: 1, x: 0 },
              transition: { duration: 0.55, delay: 0.14 },
            })}
            className="hero-problem-hook mx-auto lg:mx-0"
          >
            {t('hero.problemHook')}
          </motion.p>

          <motion.p
            {...textMotion}
            className="hero-sub text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4 max-w-xl leading-relaxed mx-auto lg:mx-0"
            style={{ color: 'var(--text-secondary)' }}
          >
            {t('hero.subtitle')}
          </motion.p>

          <motion.p
            {...(mobile ? { ...fadeLite, transition: { ...fadeLite.transition, delay: 0.18 } } : {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.55, delay: 0.22 },
            })}
            className="hero-sub text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-xl leading-relaxed mx-auto lg:mx-0"
            style={{ color: 'var(--text-body)' }}
          >
            {t('hero.desc')}
          </motion.p>

          <motion.div
            {...(mobile ? { ...fadeLite, transition: { ...fadeLite.transition, delay: 0.2 } } : {
              initial: { opacity: 0, y: 20 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.55, delay: 0.26 },
            })}
            className="hero-btns flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start"
          >
            <Link to="/signup" className="btn-primary px-6 sm:px-8 py-3.5 sm:py-4 w-full sm:w-auto justify-center">
              {t('hero.cta1')} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/counselling?tab=book" className="btn-outline w-full sm:w-auto justify-center">{t('mobileNav.book')}</Link>
          </motion.div>

          <motion.div
            {...(mobile ? { ...fadeLite, transition: { ...fadeLite.transition, delay: 0.24 } } : {
              initial: { opacity: 0, y: 16 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.55, delay: 0.3 },
            })}
            className="hero-trust flex flex-wrap gap-2 sm:gap-3 mt-6 sm:mt-8 justify-center lg:justify-start"
          >
            {badges.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="card flex items-center gap-2 text-xs sm:text-sm font-semibold px-3 py-2 rounded-full shine-hover"
              >
                <span className="card-icon-wrap w-7 h-7 rounded-lg flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5" />
                </span>
                {label}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
