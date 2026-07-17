import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import PageHero from '../components/PageHero';
import { assessments } from '../data/content';
import { useLang } from '../context/LanguageContext';
import { assessmentPath, counsellingAssessmentPath } from '../utils/routes';

export default function AssessmentPage() {
  const { slug } = useParams();
  const { t, lang } = useLang();
  const item = assessments.find((a) => a.slug === slug);

  const hubPath = counsellingAssessmentPath(slug);
  if (hubPath) {
    return <Navigate to={hubPath} replace />;
  }

  if (!item) {
    return (
      <div className="pt-32 text-center py-20">
        <h1 className="text-2xl font-bold">Assessment not found</h1>
        <Link to="/counselling" className="text-brand-600 mt-4 inline-block">View counselling</Link>
      </div>
    );
  }

  return (
    <>
      <PageHero
        title={`${item.icon} ${lang === 'hi' ? item.titleHi : item.title}`}
        subtitle={item.subtitle}
        image={item.image}
        cta={t('common.bookNow')}
      />
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.img
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            src={item.image}
            alt={item.title}
            className="rounded-2xl shadow-xl w-full object-cover aspect-video"
          />
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="font-display text-2xl font-bold mb-6">What you get</h2>
            <ul className="space-y-4">
              {item.points.map((p) => (
                <li key={p} className="flex gap-3 text-sand-700">
                  <CheckCircle className="w-6 h-6 text-brand-600 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/contact" className="btn-primary">{t('common.bookNow')}</Link>
              <Link to="/signup" className="btn-outline">Sign up for dashboard access</Link>
            </div>
          </motion.div>
        </div>
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {assessments.filter((a) => a.slug !== slug).map((a) => (
            <Link key={a.slug} to={assessmentPath(a.slug)} className="glass-card p-4 hover:shadow-lg transition group">
              <span className="text-2xl">{a.icon}</span>
              <h3 className="font-semibold mt-2 group-hover:text-brand-600">{a.title}</h3>
              <ArrowRight className="w-4 h-4 text-brand-500 mt-2 opacity-0 group-hover:opacity-100 transition" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
