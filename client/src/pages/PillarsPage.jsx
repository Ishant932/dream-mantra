import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Layers } from 'lucide-react';
import PageHero from '../components/PageHero';
import { pillars as pillarMeta, seventhPillar as seventhMeta } from '../data/pillars';
import { IMAGES } from '../data/content';
import { useLang } from '../context/LanguageContext';

const fade = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.55 },
};

export default function PillarsPage() {
  const { t, d } = useLang();
  const pillarsPage = d('pages.pillars');
  const localizedPillars = d('pillars').map((p, i) => ({ ...pillarMeta[i], ...p }));
  const seventhPillar = { ...seventhMeta, ...d('seventhPillar') };

  return (
    <>
      <PageHero
        title={pillarsPage.title}
        subtitle={pillarsPage.subtitle}
        image={IMAGES.science}
        cta={t('common.bookConsultation')}
      />

      <section className="py-16 max-w-7xl mx-auto px-4">
        <motion.p {...fade} className="text-center text-lg text-sand-600 max-w-3xl mx-auto mb-16">
          {pillarsPage.intro.split(pillarsPage.introCore)[0]}
          <strong>{pillarsPage.introCore}</strong>
          {pillarsPage.intro.split(pillarsPage.introCore)[1]?.split(pillarsPage.introCrp)[0]}
          <strong>{pillarsPage.introCrp}</strong>
          {pillarsPage.intro.split(pillarsPage.introCrp)[1]}
        </motion.p>

        <div className="grid md:grid-cols-2 gap-8">
          {localizedPillars.map((p, i) => (
            <motion.div
              key={p.id}
              {...fade}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6, scale: 1.01 }}
              className="group relative overflow-hidden rounded-3xl bg-[var(--bg-elevated)] border border-sand-200 shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500"
            >
              <div className={`h-2 bg-gradient-to-r ${p.color}`} />
              <div className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <motion.span
                    className="text-4xl"
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {p.icon}
                  </motion.span>
                  <div>
                    <span className="text-xs font-bold text-amber-600 uppercase">{pillarsPage.pillarLabel} {p.id}</span>
                    <h2 className="font-display text-2xl font-bold text-sand-900 group-hover:text-amber-700 transition">
                      {p.title}
                    </h2>
                    <p className="text-sm text-amber-600 font-medium">{p.subtitle}</p>
                  </div>
                </div>
                <p className="text-sand-600 mb-5 leading-relaxed">{p.description}</p>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-sand-700">
                      <span className="text-amber-500 font-bold">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link to={p.link} className="inline-flex items-center gap-1 text-amber-600 font-semibold group-hover:gap-2 transition-all">
                  {t('common.explore')} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          {...fade}
          className="mt-16 relative rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 animate-gradient bg-[length:200%_200%]" />
          <div className="relative p-10 md:p-14 text-amber-50 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)]/20 text-sm font-bold mb-4">
                <Layers className="w-4 h-4" /> {pillarsPage.seventhPillarLabel}
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">{seventhPillar.title}</h2>
              <p className="text-amber-100 text-lg mb-2">{seventhPillar.subtitle}</p>
              <p className="text-amber-50/90 mb-8">{seventhPillar.tagline}</p>
              <Link to={seventhPillar.link} className="btn-gold inline-flex">
                {pillarsPage.viewCrp} <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="grid grid-cols-2 gap-3"
            >
              {seventhPillar.crpHighlights.map((item) => (
                <div key={item} className="p-4 rounded-xl bg-[var(--bg-elevated)]/20 backdrop-blur text-center font-semibold">
                  {item}
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
