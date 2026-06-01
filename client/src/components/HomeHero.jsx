import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, Award, Shield, Sparkles } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { IMAGES } from '../data/content';

const badgeIcons = [Brain, Award, Shield];

export default function HomeHero() {
  const { t, d } = useLang();
  const badges = d('hero.badges').map((label, i) => ({
    icon: badgeIcons[i] || Sparkles,
    label,
  }));

  return (
    <>
      <section className="relative min-h-0 sm:min-h-[88vh] flex items-center overflow-hidden pt-6 sm:pt-10 pb-10 sm:pb-16">
        <div className="absolute top-20 -right-16 sm:right-0 w-[min(480px,85vw)] h-[min(480px,85vw)] rounded-full blur-[100px] animate-blob opacity-40 multi-pulse pointer-events-none" style={{ background: 'var(--orb-2)' }} />
        <div className="absolute bottom-10 -left-16 sm:left-0 w-[min(380px,75vw)] h-[min(380px,75vw)] rounded-full blur-[90px] animate-blob-slow opacity-30 animate-breathe pointer-events-none" style={{ background: 'var(--orb-1)' }} />
        <div className="absolute top-1/2 left-1/2 w-[min(600px,95vw)] h-[min(600px,95vw)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--gold-border)] opacity-[0.07] animate-orbit pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 py-8 sm:py-16 w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
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

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.08 }}
                className="hero-h1 hero-title font-accent mb-4"
              >
                <span className="block hero-brand-name">{t('hero.titleLine1')}</span>
                <span className="block hero-service-line mt-2">{t('hero.titleHighlight')}</span>
              </motion.h1>

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

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.16 }}
                className="hero-sub text-base sm:text-lg md:text-xl font-semibold mb-4 max-w-xl leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                {t('hero.subtitle')}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.22 }}
                className="hero-sub text-base sm:text-lg mb-8 max-w-xl leading-relaxed"
                style={{ color: 'var(--text-body)' }}
              >
                {t('hero.desc')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.28 }}
                className="hero-btns flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4"
              >
                <motion.div whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                  <Link to="/signup" className="btn-primary px-6 sm:px-8 py-3.5 sm:py-4 w-full sm:w-auto justify-center">
                    {t('hero.cta1')} <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                  <Link to="/assessments" className="btn-outline w-full sm:w-auto justify-center">{t('hero.cta2')}</Link>
                </motion.div>
              </motion.div>

              <div className="hero-trust flex flex-wrap gap-3 sm:gap-4 mt-10">
                {badges.map(({ icon: Icon, label }, i) => (
                  <motion.span
                    key={label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1, type: 'spring', stiffness: 300 }}
                    whileHover={{ y: -6, scale: 1.04 }}
                    className="card flex items-center gap-3 text-sm font-semibold px-4 py-2.5 rounded-full"
                  >
                    <span className="card-icon-wrap w-8 h-8 rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </span>
                    {label}
                  </motion.span>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96, x: 24 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="hero-visual relative multi-float"
            >
              <motion.div
                className="absolute -inset-4 rounded-3xl blur-2xl animate-glow-pulse opacity-50 multi-glow"
                style={{ background: 'var(--gold-gradient)' }}
              />
              <img
                src={IMAGES.hero}
                alt="Career counselling"
                className="relative rounded-3xl shadow-2xl w-full aspect-[4/3] object-cover float-1 border img-zoom-wrap"
                style={{ borderColor: 'var(--gold-border)' }}
              />
              <motion.div
                className="hero-float-card absolute -bottom-4 -left-4 card p-5 float-2 max-w-[220px] glow-card hidden sm:block"
                whileHover={{ scale: 1.05, rotate: 2 }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="flex items-center gap-3 relative z-10">
                  <div className="card-icon-wrap w-12 h-12 rounded-xl flex items-center justify-center text-xl">🧬</div>
                  <div>
                    <p className="text-sm font-bold gradient-text leading-tight">Mind Mapping</p>
                    <p className="text-xs font-semibold card-meta">Inborn talent science</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                className="hero-float-card absolute -top-3 -right-3 card px-4 py-2 float-3 badge-new text-xs font-bold hidden sm:block hero-badge-gold"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {t('hero.aiPowered')}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
