import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import SubTabs from '../components/SubTabs';
import { partners } from '../data/infigonContent';
import { IMAGES } from '../data/content';
import { useLang } from '../context/LanguageContext';

export default function StudyAbroadHub() {
  const { t, d } = useLang();
  const studyAbroadPage = d('pages.studyAbroad');
  const studyAbroadTabs = d('data.studyAbroadTabs');
  const countries = d('data.studyAbroadCountries');

  return (
    <>
      <PageHero
        title={studyAbroadPage.title}
        subtitle={studyAbroadPage.subtitle}
        image={IMAGES.college}
      />
      <section className="py-16 max-w-7xl mx-auto px-4 no-reveal">
        <SubTabs tabs={studyAbroadTabs} defaultTab="overview" id="study-abroad">
          {(tab) => (
            <>
              {tab === 'overview' && (
                <p className="text-lg text-sand-600 max-w-3xl">{studyAbroadPage.overview}</p>
              )}
              {tab === 'countries' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {countries.map((c) => (
                    <div key={c} className="infigon-card p-6 text-center font-bold hover:border-brand-400 transition">
                      {c}
                    </div>
                  ))}
                </div>
              )}
              {tab === 'universities' && (
                <p className="text-sand-600 mb-4">{studyAbroadPage.universities}</p>
              )}
              {tab === 'loans' && (
                <div className="flex flex-wrap gap-3">
                  {partners.map((p) => (
                    <span key={p} className="px-4 py-3 infigon-card font-semibold text-sand-700">
                      {p}
                    </span>
                  ))}
                </div>
              )}
              {tab === 'visa' && (
                <div className="infigon-card p-8">
                  <h3 className="font-bold text-xl mb-2">{studyAbroadPage.visa.title}</h3>
                  <p className="text-sand-600">{studyAbroadPage.visa.desc}</p>
                  <Link to="/contact" className="btn-primary mt-4 inline-flex">
                    {t('common.talkToExpert')}
                  </Link>
                </div>
              )}
            </>
          )}
        </SubTabs>
      </section>
    </>
  );
}
