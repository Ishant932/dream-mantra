import { motion } from 'framer-motion';
import PageHero from '../components/PageHero';
import { IMAGES } from '../data/content';
import { useLang } from '../context/LanguageContext';

export default function Privacy() {
  const { d } = useLang();
  const page = d('pages.privacy');

  return (
    <>
      <PageHero title={page.title} subtitle={page.subtitle} image={IMAGES.counselling} />
      <section className="py-16 bg-[var(--bg-elevated)]">
        <div className="max-w-4xl mx-auto px-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sand-600 text-lg leading-relaxed mb-10"
          >
            {page.intro}
          </motion.p>
          <div className="space-y-8">
            {page.sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="glass-card p-8"
              >
                <h2 className="font-display font-bold text-xl text-brand-700 mb-4">{section.title}</h2>
                <p className="text-sand-600 leading-relaxed">{section.content}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-sm text-sand-500 mt-10 text-center">
            {page.lastUpdated} {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>
    </>
  );
}
