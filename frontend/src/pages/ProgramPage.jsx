import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import PageHero from '../components/PageHero';
import { programs as programImages } from '../data/content';
import { useLang } from '../context/LanguageContext';
import { useMemo } from 'react';

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

export default function ProgramPage() {
  const { slug } = useParams();
  const { t, d } = useLang();
  const programPage = d('pages.program');
  const programDetails = d('data.programDetails');

  const localizedPrograms = useMemo(
    () => d('programs').map((p, i) => ({ ...programImages[i], ...p })),
    [d],
  );

  const item = localizedPrograms.find((p) => p.slug === slug);
  const details = programDetails[slug];

  if (!item) {
    return (
      <div className="pt-32 text-center py-20">
        <h1 className="text-2xl font-bold">{programPage.notFound}</h1>
        <Link to="/" className="text-brand-600 mt-4 inline-block">{programPage.goHome}</Link>
      </div>
    );
  }

  const isParent = details?.audience === 'parent';
  const strugglePrefix = isParent ? programPage.struggleParentPrefix : programPage.struggleStudentPrefix;

  return (
    <>
      <PageHero
        title={item.title}
        subtitle={item.subtitle}
        image={item.image}
        cta={t('common.bookNow')}
      />

      <section className="program-pathway-page py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.p {...fade} className="max-w-3xl mx-auto text-center text-lg text-sand-600 dark:text-sand-400 leading-relaxed mb-16">
            {details?.desc}
          </motion.p>

          {details?.problems?.length > 0 && (
            <motion.div {...fade} className="mb-14">
              <div className="text-center mb-10">
                <span className="program-pathway-eyebrow">{programPage.problemsLabel}</span>
                <h2 className="home-headline text-2xl md:text-3xl mt-3">{programPage.challengesTitle}</h2>
              </div>
              <div className="program-problems-grid">
                {details.problems.map((problem, i) => (
                  <motion.div
                    key={problem.slice(0, 40)}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04, duration: 0.4 }}
                    whileHover={{ y: -4 }}
                    className="program-problem-card"
                  >
                    <p>{problem}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            {...fade}
            className="program-facing-same"
          >
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="program-facing-same__inner"
            >
              <AlertCircle className="w-8 h-8 text-orange-500 shrink-0" />
              <p>{programPage.facingSame}</p>
            </motion.div>
          </motion.div>

          {details?.struggleGoals?.length > 0 && (
            <motion.div {...fade} className="program-struggle-section mb-16">
              <h3 className="home-headline text-xl md:text-2xl text-center mb-8 program-struggle-section__heading">
                {strugglePrefix}…
              </h3>
              <ul className="program-struggle-list">
                {details.struggleGoals.map((goal, i) => (
                  <motion.li
                    key={goal.slice(0, 40)}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="program-struggle-item"
                  >
                    <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" />
                    <span>{goal}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          {details?.modules?.length > 0 && (
            <motion.div {...fade} className="program-modules-section">
              <div className="text-center mb-10">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-sm font-semibold mb-4">
                  <Sparkles className="w-4 h-4" /> {programPage.modulesBadge}
                </span>
                <h2 className="home-headline text-2xl md:text-3xl">{programPage.modulesTitle}</h2>
              </div>
              <div className="program-modules-grid">
                {details.modules.map((mod, i) => (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -6 }}
                    className={`program-module-card ${mod.optional ? 'program-module-card--optional' : ''}`}
                  >
                    {mod.optional && (
                      <span className="program-module-card__optional">{programPage.optionalBadge}</span>
                    )}
                    <span className="program-module-card__icon">{mod.icon}</span>
                    <h3 className="program-module-card__name">{mod.name}</h3>
                    <p className="program-module-card__tagline">{mod.tagline}</p>
                    <Link to={mod.link} className="program-module-card__link">
                      {programPage.exploreModule} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div {...fade} className="text-center mt-14 flex flex-wrap justify-center gap-4">
            <Link to="/contact" className="btn-primary px-8 py-3.5">{programPage.bookConsultation}</Link>
            <Link to="/counselling?tab=programs" className="btn-outline">{programPage.allPathways}</Link>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-[var(--bg-elevated)] border-t border-sand-100 dark:border-sand-800">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="font-display font-bold text-center mb-8">{programPage.otherPathways}</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {localizedPrograms.filter((p) => p.slug !== slug).slice(0, 3).map((p) => (
              <Link key={p.slug} to={`/programs/${p.slug}`} className="rounded-xl overflow-hidden shadow hover:shadow-lg transition group">
                <img src={p.image} alt={p.title} className="h-32 w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="p-3 bg-[var(--bg-elevated)]">
                  <p className="font-semibold text-sm group-hover:text-amber-700 transition-colors">{p.title}</p>
                  <p className="text-xs text-sand-500">{p.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
