import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import PageHero from '../components/PageHero';
import { partners as partnerMeta, IMAGES } from '../data/content';
import { useLang } from '../context/LanguageContext';

export default function PartnerPage() {
  const { slug } = useParams();
  const { t, d } = useLang();
  const partnerPage = d('pages.partner');

  const localizedPartners = useMemo(
    () => d('data.partners').map((p, i) => ({ ...partnerMeta[i], ...p })),
    [d],
  );

  const item = localizedPartners.find((p) => p.slug === slug);

  if (!item) {
    return (
      <div className="pt-32 text-center py-20">
        <h1 className="text-2xl font-bold">{partnerPage.notFound}</h1>
        <Link to="/" className="text-brand-600 mt-4 inline-block">{partnerPage.goHome}</Link>
      </div>
    );
  }

  return (
    <>
      <PageHero
        title={`${item.icon} ${partnerPage.partnerPrefix}: ${item.title}`}
        subtitle={partnerPage.subtitle}
        image={IMAGES.counselling}
        cta={partnerPage.cta}
      />
      <section className="py-20 max-w-3xl mx-auto px-4 text-center">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl text-sand-600 mb-10">
          {item.desc}
        </motion.p>
        <Link to="/contact" className="btn-primary">{t('common.bookNow')}</Link>
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {localizedPartners.filter((p) => p.slug !== slug).map((p) => (
            <Link key={p.slug} to={`/partner/${p.slug}`} className="glass-card p-6 hover:shadow-lg transition text-center">
              <span className="text-3xl">{p.icon}</span>
              <p className="font-semibold mt-2">{p.title}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
