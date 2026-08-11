import { motion } from 'framer-motion';
import PageHero from '../components/PageHero';
import { IMAGES } from '../data/content';
import { useLang } from '../context/LanguageContext';
import { cmsText, usePageCatalog } from '../hooks/usePageCatalog';
import CmsFullPage from '../components/CmsFullPage';

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
          </div>
        ))}
      </div>
    );
  }
  return <p className="text-sand-600 leading-relaxed">{section.content}</p>;
}

const CMS_SLUGS = {
  'pages.terms': 'terms',
  'pages.policies': 'policies',
  'pages.privacy': 'privacy',
  'pages.refund': 'refund',
  'pages.dmit': 'brain-mapping',
  'pages.psychometric': 'skill-mapping',
  'pages.dmitPsychometric': 'combo',
};

export default function Terms({ pageKey = 'pages.terms', titleOverride, cmsSlug }) {
  const { d } = useLang();
  const page = d(pageKey) || d('pages.terms') || {};
  const cms = usePageCatalog(cmsSlug || CMS_SLUGS[pageKey]);
  const heroTitle = cmsText(cms, 'heroTitle', titleOverride || page.title || 'Policies');
  const heroSubtitle = cmsText(cms, 'heroSubtitle', page.subtitle);
  const heroImage = cmsText(cms, 'heroImage', IMAGES.counselling);
  const intro = cmsText(cms, 'intro', page.intro || '');
  const sections = cms?.hasCustom && cms?.sections?.length
    ? cms.sections.map((s) => ({ title: s.title, content: s.content, image: s.image }))
    : (page.sections || []);
  const disclaimer = page.disclaimer || { title: 'Disclaimer', p1: '', p2: '' };

  if (cms?.hasCustom && cms?.fullHtml?.trim()) {
    return <CmsFullPage cms={{ ...cms, heroTitle, heroSubtitle, heroImage }} />;
  }

  return (
    <>
      <PageHero
        title={heroTitle}
        subtitle={heroSubtitle}
        image={heroImage}
      />

      <section className="py-16 bg-[var(--bg-elevated)]">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-amber max-w-none mb-12"
          >
            <p className="text-sand-600 text-lg leading-relaxed mb-8">
              {intro}
            </p>
          </motion.div>

          <div className="space-y-8">
            {sections.map((section, i) => (
              <motion.div
                key={section.title || i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.03, 0.2) }}
                className="glass-card p-8 hover:shadow-lg transition-shadow"
              >
                <h2 className="font-display font-bold text-xl text-brand-700 mb-4">{section.title}</h2>
                {section.image && (
                  <img src={section.image} alt="" className="rounded-xl mb-4 max-h-56 w-full object-cover" />
                )}
                <SectionBody section={section} />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200"
          >
            <h3 className="font-display font-bold text-lg text-amber-900 mb-4">{disclaimer.title}</h3>
            <p className="text-amber-900 leading-relaxed mb-3">
              {disclaimer.p1}
            </p>
            <p className="text-amber-900 leading-relaxed">
              {disclaimer.p2}
            </p>
          </motion.div>

          {page.operator && (
            <p className="mt-10 text-center text-sand-700 font-semibold">{page.operator}</p>
          )}
          {(page.gstNumber || page.gstAddress) && (
            <div className="mt-4 text-center text-sm text-sand-600 space-y-1">
              {page.gstNumber && (
                <p>
                  <strong>{page.gstLabel || 'GSTIN:'}</strong> {page.gstNumber}
                </p>
              )}
              {page.gstAddress && (
                <p>
                  <strong>{page.locationLabel || 'GST Address:'}</strong> {page.gstAddress}
                </p>
              )}
            </div>
          )}
          <p className="text-sm text-sand-500 mt-4 text-center">
            {page.lastUpdated} {page.lastUpdatedDate || 'January 29, 2025'}
          </p>
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
            {page.gstNumber && (
              <p className="text-sand-700">
                <strong>{page.gstLabel || 'GSTIN:'}</strong> {page.gstNumber}
              </p>
            )}
            <p className="text-sand-700">
              <strong>{page.locationLabel}</strong> {page.locationValue}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
