import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import SubTabs from '../components/SubTabs';
import PersonPhoto from '../components/PersonPhoto';
import TrendPhoto from '../components/TrendPhoto';
import { counsellors } from '../data/infigonContent';
import { IMAGES } from '../data/content';
import { useLang } from '../context/LanguageContext';

export default function CounsellorsHub() {
  const { t, d } = useLang();
  const counsellorsPage = d('pages.counsellors');
  const counsellorsTabs = d('data.counsellorsTabs');

  return (
    <>
      <PageHero
        title={counsellorsPage.title}
        subtitle={counsellorsPage.subtitle}
        image={IMAGES.counselling}
      />
      <section className="py-16 max-w-7xl mx-auto px-4 no-reveal">
        <SubTabs tabs={counsellorsTabs} defaultTab="network" id="counsellors">
          {(tab) => (
            <>
              {tab === 'network' && (
                <div className="flex gap-6 overflow-x-auto pb-4 snap-x scrollbar-hide">
                  {counsellors.map((c) => (
                    <div key={c.name} className="snap-start shrink-0 w-56 infigon-card p-6 text-center glow-card">
                      <PersonPhoto src={c.image} name={c.name} size="md" className="mx-auto mb-3" animate={false} />
                      <h3 className="font-bold">{c.name}</h3>
                      <p className="text-brand-600 text-sm">{c.city}</p>
                      <p className="text-sand-500 text-xs mt-1">{c.role}</p>
                    </div>
                  ))}
                </div>
              )}
              {tab === 'become' && (
                <div className="grid lg:grid-cols-2 gap-10 items-center">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">{counsellorsPage.become.title}</h2>
                    <p className="text-sand-600 mb-6">{counsellorsPage.become.desc}</p>
                    <Link to="/partner/teachers" className="btn-primary">{t('common.applyNow')}</Link>
                  </div>
                  <TrendPhoto src={IMAGES.workshop} alt={counsellorsPage.become.imageAlt} rounded="rounded-2xl" overlay />
                </div>
              )}
              {tab === 'certification' && (
                <div className="grid lg:grid-cols-[1fr_320px] gap-10 items-start">
                  <ul className="grid md:grid-cols-2 gap-4">
                    {counsellorsPage.certification.items.map((c) => (
                      <li key={c} className="infigon-card p-4 font-medium">✓ {c}</li>
                    ))}
                  </ul>
                  <TrendPhoto src={IMAGES.science} alt={counsellorsPage.certification.imageAlt} aspect="aspect-square" rounded="rounded-2xl" />
                </div>
              )}
              {tab === 'join' && (
                <div className="grid lg:grid-cols-2 gap-10 items-center">
                  <TrendPhoto src={IMAGES.team} alt={counsellorsPage.join.imageAlt} rounded="rounded-2xl" overlay />
                  <div className="infigon-card p-8 text-center glow-card">
                    <p className="text-lg mb-6">{counsellorsPage.join.desc}</p>
                    <Link to="/contact" className="btn-primary">{t('common.contactPartnershipTeam')}</Link>
                  </div>
                </div>
              )}
            </>
          )}
        </SubTabs>
      </section>
    </>
  );
}
