import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import PageHero from '../components/PageHero';
import SubTabs from '../components/SubTabs';
import { assessments, IMAGES } from '../data/content';
import { useLang } from '../context/LanguageContext';
import { assessmentPath } from '../utils/routes';

export default function AssessmentsHub() {
  const { t, d } = useLang();
  const assessmentsPage = d('pages.assessments');
  const assessmentTabs = d('data.assessmentTabs');
  const localizedAssessments = d('data.assessments').map((loc, i) => ({
    ...assessments[i],
    ...loc,
  }));

  return (
    <>
      <PageHero
        title={assessmentsPage.title}
        subtitle={assessmentsPage.subtitle}
        image={IMAGES.psychometric}
        cta={t('common.bookNow')}
      />
      <section className="py-16 max-w-7xl mx-auto px-4 no-reveal">
        <SubTabs tabs={assessmentTabs} defaultTab="dmit" id="assessments">
          {(active) => {
            const item = localizedAssessments.find((a) => a.slug === active);
            if (!item) return null;
            if (item.slug === 'why-dreams-mantra') {
              return (
                <motion.div
                  key="why-career-counselling"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-8 max-w-2xl mx-auto"
                >
                  <motion.span
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-5xl inline-block mb-4"
                  >
                    💜
                  </motion.span>
                  <h2 className="font-display text-2xl font-bold mb-3">{assessmentsPage.whyCareerCounselling.title}</h2>
                  <p className="text-sand-600 mb-6">{assessmentsPage.whyCareerCounselling.desc}</p>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                    <Link to="/assessments/why-dreams-mantra" className="btn-primary inline-flex">
                      {assessmentsPage.whyCareerCounselling.cta} <ArrowRight className="w-5 h-5" />
                    </Link>
                  </motion.div>
                </motion.div>
              );
            }
            return (
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid lg:grid-cols-2 gap-10 items-start"
              >
                <img src={item.image} alt="" className="rounded-2xl shadow-xl w-full object-cover aspect-video" />
                <div>
                  <span className="text-4xl">{item.icon}</span>
                  <h2 className="font-display text-3xl font-bold mt-4 mb-2">{item.title}</h2>
                  <p className="text-amber-600 font-medium mb-6">{item.subtitle}</p>
                  <ul className="space-y-3 mb-8">
                    {item.points.map((p) => (
                      <li key={p} className="flex gap-2 text-sand-700 dark:text-sand-300">
                        <span className="text-amber-500 font-bold">✓</span> {p}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-4">
                    <Link to={assessmentPath(item.slug)} className="btn-primary">
                      {t('common.fullDetails')} <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link to="/contact" className="btn-outline">{t('common.bookNow')}</Link>
                  </div>
                </div>
              </motion.div>
            );
          }}
        </SubTabs>
      </section>
    </>
  );
}
