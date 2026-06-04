import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Phone, Mail } from 'lucide-react';
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
  const details = d('data.partnerDetails')?.[slug] || {};

  if (!item) {
    return (
      <div className="pt-32 text-center py-20">
        <h1 className="text-2xl font-bold">{partnerPage.notFound}</h1>
        <Link to="/" className="text-brand-600 mt-4 inline-block">{partnerPage.goHome}</Link>
      </div>
    );
  }

  const sections = [
    { title: 'Why partner with us', items: details.benefits },
    { title: 'Ideal for', items: details.idealFor },
    { title: 'What we offer', items: details.offerings },
    { title: 'How it works', items: details.howItWorks },
  ].filter((s) => s.items?.length);

  return (
    <>
      <PageHero
        title={`${item.icon} ${item.title}`}
        subtitle={details.tagline || partnerPage.subtitle}
        image={item.image || IMAGES.counselling}
        cta={partnerPage.cta}
      />
      <section className="py-16 lg:py-20 max-w-4xl mx-auto px-4">
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-lg text-sand-600 dark:text-sand-300 leading-relaxed mb-10">
          {details.intro || item.desc}
        </motion.p>

        <div className="space-y-10">
          {sections.map((block, i) => (
            <motion.div
              key={block.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="infigon-card p-6 sm:p-8"
            >
              <h2 className="font-display text-xl font-bold mb-4">{block.title}</h2>
              <ul className="space-y-2">
                {block.items.map((line) => (
                  <li key={line} className="flex gap-2 text-sm sm:text-base text-sand-600 dark:text-sand-300">
                    <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/60 text-center"
        >
          <h3 className="font-display text-xl font-bold mb-2">Ready to partner?</h3>
          <p className="text-sm text-sand-600 dark:text-sand-400 mb-6">Mon–Sat, 11am–7pm · Jaipur & pan-India online</p>
          <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm font-semibold">
            <a href="tel:9680102276" className="inline-flex items-center gap-2 text-amber-800 dark:text-amber-200"><Phone className="w-4 h-4" /> 9680102276</a>
            <a href="mailto:info@dreammantra.in" className="inline-flex items-center gap-2 text-amber-800 dark:text-amber-200"><Mail className="w-4 h-4" /> info@dreammantra.in</a>
          </div>
          <Link to="/contact" className="btn-primary inline-flex items-center gap-2">{t('common.bookNow')} <ArrowRight className="w-4 h-4" /></Link>
        </motion.div>

        <div className="mt-16">
          <h3 className="font-bold text-center mb-6">Other partnership categories</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {localizedPartners.filter((p) => p.slug !== slug).map((p) => (
              <Link key={p.slug} to={`/partner/${p.slug}`} className="glass-card p-5 hover:shadow-lg transition text-center">
                <span className="text-3xl">{p.icon}</span>
                <p className="font-semibold mt-2 text-sm">{p.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
