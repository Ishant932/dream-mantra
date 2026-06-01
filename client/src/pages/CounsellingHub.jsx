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



const { tabFadeUp, tabFadeLeft } = animations;



export default function CounsellingHub() {
  const { t, d } = useLang();
  const counsellingTabs = d('data.counsellingTabs');
  const processSteps = d('data.processSteps');
  const counsellingPage = d('pages.counselling');
  const tabs = counsellingPage.tabs;
  const [processIdx, setProcessIdx] = useState(0);



  return (

    <>

      <PageHero title={counsellingPage.title} subtitle={counsellingPage.subtitle} image={IMAGES.counselling} cta={counsellingPage.cta} />

      <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 no-reveal">

        <SubTabs tabs={counsellingTabs} defaultTab="overview" id="counselling">

          {(tab) => (

            <>

              {tab === 'overview' && (

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                  <motion.div {...tabFadeUp}>

                    <h2 className="section-title mb-6">{tabs.overview.title}</h2>

                    <p className="text-sand-600 text-lg mb-8 leading-relaxed">{tabs.overview.desc}</p>

                    <div className="flex flex-wrap gap-4">

                      <Link to="/contact" className="btn-primary">{tabs.overview.startJourney}</Link>

                      <Link to="/assessments/dmit" className="btn-outline">{tabs.overview.exploreDmit}</Link>

                    </div>

                  </motion.div>

                  <motion.img

                    {...tabFadeUp}

                    transition={{ delay: 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}

                    src={IMAGES.hero}

                    alt=""

                    className="rounded-3xl shadow-2xl ring-1 ring-[rgba(201,168,76,0.25)]"

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

                    <span className="text-6xl font-display font-bold text-[rgba(201,168,76,0.35)]">{String(processIdx + 1).padStart(2, '0')}</span>

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

