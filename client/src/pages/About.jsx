import GuidanceCTA from '../components/GuidanceCTA';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Target, Zap, Heart, Sparkles, Microscope } from 'lucide-react';
import PageHero from '../components/PageHero';
import { IMAGES } from '../data/content';
import AdvisoryPersonCard from '../components/AdvisoryPersonCard';
import LeadershipGrid from '../components/LeadershipGrid';
import PersonPhoto from '../components/PersonPhoto';
import AboutCertifications from '../components/AboutCertifications';
import { useAboutContent } from '../i18n/useSiteContent';
import { useLang } from '../context/LanguageContext';
import { cmsText, usePageCatalog } from '../hooks/usePageCatalog';
import CmsFullPage from '../components/CmsFullPage';
import CmsPageSections from '../components/CmsPageSections';

const fade = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};

const valueIcons = [Target, Users, Zap, Heart];

export default function About() {
  const { about, missionVision, founder, managementTeam, leadership, homeLeadership } = useAboutContent();
  const { d } = useLang();
  const cms = usePageCatalog('about');
  const fg = d('freeGuidance') || {};
  const values = about.values.items.map((item, i) => ({
    ...item,
    icon: valueIcons[i],
  }));

  const missionVisionCards = [
    { title: about.missionVision.missionTitle, text: missionVision.mission, icon: '🎯' },
    { title: about.missionVision.visionTitle, text: missionVision.vision, icon: '🌟' },
    { title: about.missionVision.purposeTitle, text: missionVision.purpose, icon: '💡' },
  ];

  if (cms?.hasCustom && cms?.fullHtml?.trim()) {
    return <CmsFullPage cms={cms} fallbackImage={IMAGES.counselling} />;
  }

  return (
    <>
      <PageHero
        title={cmsText(cms, 'heroTitle', about.hero.title)}
        subtitle={cmsText(cms, 'heroSubtitle', about.hero.subtitle)}
        image={cmsText(cms, 'heroImage', IMAGES.counselling)}
        cta={fg.cta || about.cta?.button}
        ctaLink="/contact#guidance"
      />
      <CmsPageSections cms={cms} />

      {/* Story */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-14 items-center">
          <motion.div {...fade}>
            <span className="section-label">{about.story.label}</span>
            <h2 className="section-title mt-3 mb-6">{about.story.title}</h2>
            <p className="text-lg leading-relaxed mb-4" style={{ color: 'var(--text-body)' }}>
              {about.story.paragraph1Before}
              <strong>{founder.name}</strong>
              {about.story.paragraph1After}
            </p>
            <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              {about.story.paragraph2}
            </p>
            <p className="leading-relaxed mb-4 text-sm italic border-l-4 pl-4" style={{ color: 'var(--text-body)', borderColor: 'var(--gold)' }}>
              {missionVision.philosophy}
            </p>
            <Link to="/counselling?tab=dmit" className="btn-primary">{about.story.cta}</Link>
          </motion.div>
          <motion.img
            {...fade}
            transition={{ delay: 0.1 }}
            src={IMAGES.students}
            alt={about.story.imageAlt}
            className="rounded-3xl shadow-2xl ring-1 glow-card"
            style={{ ringColor: 'var(--gold-border)' }}
          />
        </div>
      </section>

      {/* Two Pillars */}
      <section className="py-20" style={{ background: 'var(--bg-muted)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <motion.div {...fade} className="text-center mb-14">
            <h2 className="section-title">
              {about.twoPillars.title}{' '}
              <span className="gradient-text">{about.twoPillars.titleHighlight}</span>
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg" style={{ color: 'var(--text-secondary)' }}>
              {about.twoPillars.subtitle}
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div {...fade} whileHover={{ y: -6 }} className="infigon-card p-8 lg:p-10 glow-card">
              <Microscope className="w-10 h-10 mb-4" style={{ color: 'var(--orange)' }} />
              <h3 className="font-display text-xl font-bold mb-3">{about.twoPillars.dmit.title}</h3>
              <p className="leading-relaxed" style={{ color: 'var(--text-body)' }}>
                {about.twoPillars.dmit.desc}
              </p>
            </motion.div>
            <motion.div {...fade} transition={{ delay: 0.1 }} whileHover={{ y: -6 }} className="infigon-card p-8 lg:p-10 glow-card">
              <Sparkles className="w-10 h-10 mb-4" style={{ color: 'var(--gold)' }} />
              <h3 className="font-display text-xl font-bold mb-3">{about.twoPillars.psychometric.title}</h3>
              <p className="leading-relaxed" style={{ color: 'var(--text-body)' }}>
                {about.twoPillars.psychometric.desc}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          {missionVisionCards.map((item, i) => (
            <motion.div key={item.title} {...fade} transition={{ delay: i * 0.08 }} className="infigon-card p-8 glow-card text-center">
              <span className="text-4xl">{item.icon}</span>
              <h3 className="font-display font-bold text-xl mt-4 mb-3">{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="py-20" style={{ background: 'var(--bg-elevated)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="section-title text-center mb-14">{about.values.title}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <motion.div key={value.title} {...fade} transition={{ delay: i * 0.08 }} whileHover={{ y: -6 }} className="infigon-card p-8 text-center glow-card">
                  <Icon className="w-11 h-11 mx-auto mb-4" style={{ color: 'var(--orange)' }} />
                  <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{value.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Management Team */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div {...fade} className="text-center mb-14">
            <span className="section-label">{about.managementTeam.label}</span>
            <h2 className="section-title mt-3">{about.managementTeam.title}</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg" style={{ color: 'var(--text-secondary)' }}>
              {about.managementTeam.subtitle}
            </p>
          </motion.div>
          <div className="grid lg:grid-cols-2 gap-8">
            {managementTeam.map((person, i) => (
              <AdvisoryPersonCard key={person.name} person={person} index={i} />
            ))}
          </div>
        </div>
      </section>

      <LeadershipGrid
        title={homeLeadership.directors?.title}
        subtitle={homeLeadership.directors?.subtitle}
        people={leadership.directors || []}
        columns={2}
        featured
      />

      <LeadershipGrid
        title={homeLeadership.executive?.title}
        subtitle={homeLeadership.executive?.subtitle}
        people={leadership.executive || []}
        layout="executive"
        featured
      />

      {/* Founder Note */}
      <section className="py-20" style={{ background: 'var(--bg-muted)' }}>
        <div className="max-w-3xl mx-auto px-4">
          <motion.blockquote {...fade} className="infigon-card p-10 md:p-14 text-center glow-card relative">
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: 'var(--gold-gradient)' }} />
            <PersonPhoto src={IMAGES.founder} name={founder.name} size="hero" className="mx-auto mb-6" variant="founder" />
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--gold)' }}>{about.founderNote.label}</p>
            <p className="text-lg italic leading-relaxed mb-6" style={{ color: 'var(--text-body)' }}>
              &ldquo;{founder.quote}&rdquo;
            </p>
            {founder.longNote && (
              <p className="text-sm leading-relaxed mb-8 text-left max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                {founder.longNote}
              </p>
            )}
            <p className="font-bold text-lg">{founder.name}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--orange)' }}>{founder.role}</p>
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {founder.certs.map((c) => (
                <span key={c} className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: 'var(--gold-border)', color: 'var(--text-secondary)' }}>{c}</span>
              ))}
            </div>
          </motion.blockquote>
        </div>
      </section>

      <AboutCertifications copy={about.certifications} />

      {/* Locations */}
      <section className="py-16 border-y" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="section-title text-center mb-10">{about.locations.title}</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {about.locations.names.map((loc, i) => (
              <motion.div key={loc} {...fade} transition={{ delay: i * 0.06 }} whileHover={{ scale: 1.03 }} className="infigon-card overflow-hidden glow-card">
                <div className="h-28 overflow-hidden img-zoom-wrap">
                  <img src={IMAGES.jaipurStreets[i] || IMAGES.jaipur} alt={loc} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-6">
                  <p className="font-bold text-lg">{loc}</p>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{about.locations.city}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-center mt-8" style={{ color: 'var(--text-secondary)' }}>
            📞 <a href="tel:9680102276" className="font-semibold" style={{ color: 'var(--orange)' }}>{founder.phone}</a>
            {' · '}
            📧 <a href={`mailto:${founder.email}`} className="font-semibold" style={{ color: 'var(--orange)' }}>{founder.email}</a>
            {' · '} {about.locations.hours}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <motion.div {...fade} className="max-w-4xl mx-auto rounded-3xl dm-spectrum-bg p-12 md:p-16 text-center shadow-2xl" style={{ color: 'var(--hero-text)' }}>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">{about.cta.title}</h2>
          <p className="text-lg opacity-90 mb-8">{about.cta.subtitle}</p>
          <GuidanceCTA className="btn-gold text-lg px-10">{about.cta.button}</GuidanceCTA>
        </motion.div>
      </section>
    </>
  );
}
