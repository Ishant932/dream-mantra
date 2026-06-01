import { motion } from 'framer-motion';
import PageHero from '../components/PageHero';
import { IMAGES } from '../data/content';
import { useLang } from '../context/LanguageContext';

export default function Terms() {
  const { d } = useLang();
  const page = d('pages.terms');

  return (
    <>
      <PageHero 
        title={page.title} 
        subtitle={page.subtitle} 
        image={IMAGES.counselling}
      />
      
      <section className="py-16 bg-[var(--bg-elevated)]">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-amber max-w-none mb-12"
          >
            <p className="text-sand-600 text-lg leading-relaxed mb-8">
              {page.intro}
            </p>
          </motion.div>

          <div className="space-y-8">
            {page.sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-8 hover:shadow-lg transition-shadow"
              >
                <h2 className="font-display font-bold text-xl text-brand-700 mb-4">{section.title}</h2>
                <p className="text-sand-600 leading-relaxed">{section.content}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200"
          >
            <h3 className="font-display font-bold text-lg text-amber-900 mb-4">{page.disclaimer.title}</h3>
            <p className="text-amber-900 leading-relaxed mb-3">
              {page.disclaimer.p1}
            </p>
            <p className="text-amber-900 leading-relaxed">
              {page.disclaimer.p2}
            </p>
          </motion.div>

        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-[var(--bg-elevated)] to-brand-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="section-title mb-6">{page.contactTitle}</h2>
          <p className="text-sand-600 text-lg mb-8">
            {page.contactDesc}
          </p>
          <div className="space-y-4">
            <p className="text-sand-700">
              <strong>{page.emailLabel}</strong> info@dreammantra.in
            </p>
            <p className="text-sand-700">
              <strong>{page.phoneLabel}</strong> 9680102276
            </p>
            <p className="text-sand-700">
              <strong>{page.hoursLabel}</strong> {page.hoursValue}
            </p>
            <p className="text-sand-700">
              <strong>{page.locationLabel}</strong> {page.locationValue}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
