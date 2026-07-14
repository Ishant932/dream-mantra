import { motion } from 'framer-motion';
import PageHero from '../components/PageHero';
import { IMAGES } from '../data/content';
import { useLang } from '../context/LanguageContext';

function SectionBody({ section }) {
  if (section.paragraphs?.length || section.items?.length || section.subsections?.length) {
    return (
      <div className="space-y-4">
        {section.paragraphs?.map((p, i) => (
          <p key={`${section.title}-p-${i}`} className="text-sand-600 leading-relaxed">
            {p}
          </p>
        ))}
        {section.items?.length > 0 && (
          <ul className="list-disc pl-5 space-y-2 text-sand-600 leading-relaxed">
            {section.items.map((item, i) => (
              <li key={`${section.title}-item-${i}`}>{item}</li>
            ))}
          </ul>
        )}
        {section.subsections?.map((sub) => (
          <div key={sub.title} className="mt-4">
            <h3 className="font-display font-semibold text-base text-brand-700 mb-2">{sub.title}</h3>
            {sub.paragraphs?.map((p, i) => (
              <p key={`${sub.title}-p-${i}`} className="text-sand-600 leading-relaxed mb-2">
                {p}
              </p>
            ))}
            {sub.items?.length > 0 && (
              <ul className="list-disc pl-5 space-y-2 text-sand-600 leading-relaxed">
                {sub.items.map((item, i) => (
                  <li key={`${sub.title}-item-${i}`}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  }

  return <p className="text-sand-600 leading-relaxed">{section.content}</p>;
}

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
                transition={{ delay: Math.min(i * 0.03, 0.2) }}
                className="glass-card p-8"
              >
                <h2 className="font-display font-bold text-xl text-brand-700 mb-4">{section.title}</h2>
                <SectionBody section={section} />
              </motion.div>
            ))}
          </div>
          {page.operator && (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-10 text-center text-sand-700 font-semibold"
            >
              {page.operator}
            </motion.p>
          )}
          {(page.gstNumber || page.gstAddress) && (
            <div className="mt-4 text-center text-sm text-sand-600 space-y-1">
              {page.gstNumber && (
                <p>
                  <strong>GSTIN:</strong> {page.gstNumber}
                </p>
              )}
              {page.gstAddress && (
                <p>
                  <strong>GST Address:</strong> {page.gstAddress}
                </p>
              )}
            </div>
          )}
          <p className="text-sm text-sand-500 mt-6 text-center">
            {page.lastUpdated} {page.lastUpdatedDate || 'January 29, 2025'}
          </p>
        </div>
      </section>
    </>
  );
}
