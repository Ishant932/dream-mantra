import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import SubTabs from '../components/SubTabs';
import { useLang } from '../context/LanguageContext';
import { IMAGES } from '../data/content';
import { motion } from 'framer-motion';
import { useState } from 'react';
import BookSessionSection from '../components/BookSessionSection';
import AgePathwaysSection from '../components/AgePathwaysSection';
import { animations } from '../utils/animations';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const { tabFadeUp, tabFadeLeft } = animations;

function CounsellingTypeCard({ type, delay = 0 }) {
  return (
    <motion.div
      {...tabFadeUp}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="counselling-type-card infigon-card glow-card p-7 lg:p-8 h-full"
    >
      <span className="text-3xl mb-4 block" aria-hidden>{type.icon}</span>
      <h3 className="text-xl font-bold mb-3 text-[#013220] dark:text-emerald-50">{type.title}</h3>
      <p className="text-sand-600 dark:text-sand-300 text-base leading-relaxed mb-5">{type.desc}</p>
      <ul className="space-y-2.5">
        {(type.points || []).map((point) => (
          <li key={point} className="flex gap-2.5 text-sm text-sand-700 dark:text-sand-200 leading-relaxed">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function MappingShowcase({ block, image, variant }) {
  return (
    <motion.div
      {...tabFadeUp}
      transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`mapping-showcase mapping-showcase--${variant}`}
    >
      <div className="mapping-showcase__grid">
        <div className="mapping-showcase__visual">
          <div className="mapping-showcase__glow" aria-hidden />
          <img src={image} alt="" className="mapping-showcase__img" loading="lazy" />
        </div>
        <div className="mapping-showcase__body">
          <span className="mapping-showcase__badge">{block.badge}</span>
          <h3 className="mapping-showcase__title">{block.title}</h3>
          <p className="mapping-showcase__desc">{block.desc}</p>
          <ul className="mapping-showcase__points">
            {(block.points || []).map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <Link to={block.link} className="btn-primary inline-flex items-center gap-2 mt-6">
            {block.cta} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function CounsellingHub() {
  const { t, d } = useLang();
  const counsellingTabs = d('data.counsellingTabs');
  const processSteps = d('data.processSteps');
  const counsellingPage = d('pages.counselling');
  const tabs = counsellingPage.tabs;
  const overview = tabs.overview;
  const [processIdx, setProcessIdx] = useState(0);

  return (
    <>
      <PageHero
        title={counsellingPage.title}
        subtitle={counsellingPage.subtitle}
        image={IMAGES.counselling}
        cta={counsellingPage.cta}
        ctaLink="/counselling?tab=book"
      />

      <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 no-reveal">
        <SubTabs tabs={counsellingTabs} defaultTab="overview" id="counselling">
          {(tab) => (
            <>
              {tab === 'overview' && (
                <div className="space-y-14 lg:space-y-16">
                  <div>
                    <motion.h2 {...tabFadeUp} className="section-title mb-4">
                      {overview.sectionTitle}
                    </motion.h2>
                    <motion.p
                      {...tabFadeUp}
                      transition={{ delay: 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="text-sand-600 text-lg max-w-3xl leading-relaxed mb-8 lg:mb-10"
                    >
                      {overview.sectionDesc}
                    </motion.p>
                    <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                      {(overview.types || []).map((type, i) => (
                        <CounsellingTypeCard key={type.id} type={type} delay={i * 0.08} />
                      ))}
                    </div>
                  </div>

                  <MappingShowcase
                    block={overview.mindMapping}
                    image={IMAGES.dmit}
                    variant="mind"
                  />

                  <MappingShowcase
                    block={overview.skillMapping}
                    image={IMAGES.psychometric}
                    variant="skill"
                  />
                </div>
              )}

              {tab === 'dmit' && (
                <div className="grid md:grid-cols-2 gap-10 lg:gap-14 items-center">
                  <motion.img {...tabFadeUp} src={IMAGES.dmit} className="rounded-3xl shadow-xl" alt="Mind Mapping" />
                  <motion.div {...tabFadeUp} transition={{ delay: 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                    <h2 className="text-2xl font-bold mb-5">{tabs.dmit.title}</h2>
                    <p className="text-sand-600 mb-6 text-lg leading-relaxed">{tabs.dmit.desc}</p>
                    <Link to="/assessments/dmit" className="btn-primary">{t('common.knowMore')}</Link>
                  </motion.div>
                </div>
              )}

              {tab === 'psychometric' && (
                <div className="grid md:grid-cols-2 gap-10 lg:gap-14 items-center">
                  <motion.img {...tabFadeUp} src={IMAGES.psychometric} className="rounded-3xl shadow-xl" alt="" />
                  <motion.div {...tabFadeUp} transition={{ delay: 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                    <h2 className="text-2xl font-bold mb-5">{tabs.psychometric.title}</h2>
                    <p className="text-sand-600 mb-6 text-lg leading-relaxed">{tabs.psychometric.desc}</p>
                    <Link to="/assessments/psychometric" className="btn-primary">{tabs.psychometric.takeAssessment}</Link>
                  </motion.div>
                </div>
              )}

              {tab === 'process' && (
                <div className="grid lg:grid-cols-[300px_1fr] gap-10 lg:gap-14">
                  <div className="space-y-2">
                    {processSteps.map((s, i) => (
                      <motion.button
                        key={i}
                        {...tabFadeLeft}
                        transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        whileHover={{ x: 4 }}
                        onClick={() => setProcessIdx(i)}
                        className={`w-full text-left px-5 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                          processIdx === i
                            ? 'bg-[#013220] text-[#FAFAF7] shadow-lg shadow-[rgba(1,50,32,0.25)]'
                            : 'hover:bg-[rgba(201,168,76,0.12)] text-sand-700 border border-sand-200'
                        }`}
                      >
                        {i + 1}. {s.title}
                      </motion.button>
                    ))}
                  </div>
                  <motion.div
                    key={processIdx}
                    initial={{ opacity: 0, x: 24, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                    className="infigon-card p-10 lg:p-12 glow-card"
                  >
                    <span className="text-6xl font-display font-bold text-[rgba(201,168,76,0.35)]">
                      {String(processIdx + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-2xl font-bold mt-3 mb-5">{processSteps[processIdx].title}</h3>
                    <p className="text-body-theme text-lg leading-relaxed">{processSteps[processIdx].desc}</p>
                    <Link to="/contact" className="btn-primary mt-8 inline-flex">{tabs.process.bookSession}</Link>
                  </motion.div>
                </div>
              )}

              {tab === 'programs' && <AgePathwaysSection />}

              {tab === 'book' && (
                <BookSessionSection
                  title={tabs.book.title}
                  hours={tabs.book.hours}
                  createAccountLabel={tabs.book.createAccount}
                  bookNowLabel={t('common.bookNow')}
                />
              )}
            </>
          )}
        </SubTabs>
      </section>
    </>
  );
}
