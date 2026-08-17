import { lazy, Suspense, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import HomeHero from '../components/HomeHero';
import HomeTrustBar from '../components/HomeTrustBar';
import HomeSection from '../components/HomeSection';
import HomeModulesIntro from '../components/HomeModulesIntro';
import HomeWhoWeGuide from '../components/HomeWhoWeGuide';
import MarqueeStrip, { CollegePartnerPill } from '../components/MarqueeStrip';
import AdvisoryPersonCard from '../components/AdvisoryPersonCard';
import LazyMount from '../components/LazyMount';
import HomeBlogTeaser from '../components/HomeBlogTeaser';
import { COLLEGE_PARTNERS } from '../data/collegePartners';
import { partners as partnerTypes } from '../data/content';
import { useHomeContent } from '../i18n/useSiteContent';
import { useLang } from '../context/LanguageContext';
import { isMobilePerf, isPhoneViewport } from '../utils/mobilePerf';
import CmsPageSections from '../components/CmsPageSections';
import { usePageCatalog } from '../hooks/usePageCatalog';

const TestimonialMarquee = lazy(() => import('../components/TestimonialMarquee'));
const CertificationsShowcase = lazy(() => import('../components/CertificationsShowcase'));

const fade = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
};

const fadeLite = {
  initial: { opacity: 1, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-32px' },
  transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
};

function HomeDivider() {
  return (
    <motion.div
      className="home-section-divider"
      aria-hidden="true"
      initial={{ opacity: 0, scaleX: 0.35 }}
      whileInView={{ opacity: 0.9, scaleX: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}

function SectionPlaceholder() {
  return <div className="home-lazy-placeholder" aria-hidden="true" />;
}

function LazyBlock({ children, minHeight = 120, force = false }) {
  return (
    <LazyMount minHeight={minHeight} fallback={<SectionPlaceholder />} force={force}>
      <Suspense fallback={<SectionPlaceholder />}>{children}</Suspense>
    </LazyMount>
  );
}

export default function Home() {
  const { t } = useLang();
  const location = useLocation();
  const forceCertifications = location.hash === '#certifications';
  const {
    home,
    pillars,
    trainingSessions,
    seventhPillar,
    managementTeam,
  } = useHomeContent();
  const mobile = isMobilePerf();
  const phone = isPhoneViewport();
  const [pillarIdx, setPillarIdx] = useState(0);
  const [sessionIdx, setSessionIdx] = useState(0);
  const [showMoreSections, setShowMoreSections] = useState(!phone);
  const cms = usePageCatalog('home');

  const teamToShow = phone ? managementTeam.slice(0, 1) : managementTeam;
  const MotionBox = motion.div;
  const sectionFade = mobile ? fadeLite : fade;

  return (
    <>
      <HomeHero />
      <CmsPageSections cms={cms} className="!py-8" />
      <HomeDivider />
      <HomeTrustBar />
      <HomeDivider />

      <HomeSection variant="elevated" id="home-modules">
        <HomeModulesIntro />
      </HomeSection>

      <HomeDivider />

      <HomeSection variant="yellow">
        <HomeWhoWeGuide />
      </HomeSection>

      {phone && !showMoreSections && (
        <div className="mobile-home-more-wrap">
          <button
            type="button"
            className="mobile-home-more-btn"
            onClick={() => setShowMoreSections(true)}
          >
            {t('mobileNav.showMore')}
            <ChevronDown className="w-4 h-4" aria-hidden />
          </button>
        </div>
      )}

      {showMoreSections && (
        <>
          <HomeDivider />

          <HomeSection variant="elevated" id="pillars" className="scroll-mt-28">
            <div className="max-w-7xl mx-auto px-4 relative">
              <MotionBox {...sectionFade} className="text-center mb-5 sm:mb-10 md:mb-12">
                <h2 className="home-headline">
                  {home.pillars.title} <span className="gradient-text text-pop">{home.pillars.titleHighlight}</span>
                  {home.pillars.titleSuffix ? ` ${home.pillars.titleSuffix}` : ''}
                </h2>
                {home.pillars.subtitle ? (
                  <p className="text-sand-600 mt-2 sm:mt-3 max-w-2xl mx-auto text-sm sm:text-lg">
                    {home.pillars.subtitle}
                  </p>
                ) : null}
                <p className="home-pillars-hint" aria-hidden="true">Tap a topic · swipe for more</p>
              </MotionBox>
              <div className="home-pillars-layout">
                <div
                  className="home-pillars-nav home-pillars-nav--mobile-scroll"
                  role="tablist"
                  aria-label={home.pillars.titleHighlight || 'Counselling pillars'}
                >
                  {pillars.map((p, i) => (
                    <button
                      key={p.id}
                      type="button"
                      role="tab"
                      aria-selected={pillarIdx === i}
                      onClick={() => setPillarIdx(i)}
                      className={`home-pillars-tab${pillarIdx === i ? ' home-pillars-tab--active' : ''}`}
                    >
                      <span className="home-pillars-tab__num" aria-hidden>{i + 1}</span>
                      <span className="home-pillars-tab__icon" aria-hidden>{p.icon}</span>
                      <span className="home-pillars-tab__label">{p.title}</span>
                    </button>
                  ))}
                </div>
                <div className="home-pillars-dots" aria-hidden>
                  {pillars.map((p, i) => (
                    <button
                      key={`dot-${p.id}`}
                      type="button"
                      className={`home-pillars-dot${pillarIdx === i ? ' home-pillars-dot--active' : ''}`}
                      onClick={() => setPillarIdx(i)}
                      tabIndex={-1}
                    />
                  ))}
                </div>
                <div className="home-pillars-panel infigon-card glow-card" role="tabpanel">
                  <div className={`home-pillars-panel__bar bg-gradient-to-r ${pillars[pillarIdx].color}`} />
                  <div className="home-pillars-panel__head">
                    <span className="home-pillars-panel__icon" aria-hidden>{pillars[pillarIdx].icon}</span>
                    <div>
                      <span className="home-pillars-panel__kicker">
                        {home.pillars.pillarLabel} {pillars[pillarIdx].id}
                      </span>
                      <h3 className="home-pillars-panel__title">{pillars[pillarIdx].title}</h3>
                      <p className="home-pillars-panel__sub">{pillars[pillarIdx].subtitle}</p>
                    </div>
                  </div>
                  <p className="home-pillars-panel__desc">{pillars[pillarIdx].description}</p>
                  <ul className="home-pillars-panel__features">
                    {pillars[pillarIdx].features.map((f) => (
                      <li key={f}>
                        <span aria-hidden>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link to={pillars[pillarIdx].link} className="home-pillars-panel__cta">
                    {home.pillars.explore} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </HomeSection>

          <HomeDivider />

          <HomeSection variant="cream" className="scroll-mt-28">
            <div className="max-w-7xl mx-auto px-4 relative">
              <MotionBox {...sectionFade}>
                <div className="text-center mb-5 sm:mb-10 md:mb-12">
                  <h2 className="home-headline">
                    {home.pillars.trainingLabel}{' '}
                    <span className="gradient-text text-pop">{home.pillars.trainingLabelHighlight}</span>
                  </h2>
                  {home.pillars.trainingSubtitle ? (
                    <p className="text-sand-600 mt-2 sm:mt-3 max-w-2xl mx-auto text-sm sm:text-lg">
                      {home.pillars.trainingSubtitle}
                    </p>
                  ) : null}
                  <p className="home-pillars-hint" aria-hidden="true">Tap a session · swipe for more</p>
                </div>
                <div className="home-pillars-layout">
                  <div
                    className="home-pillars-nav home-pillars-nav--mobile-scroll"
                    role="tablist"
                    aria-label={home.pillars.trainingLabelHighlight || 'Training sessions'}
                  >
                    {trainingSessions.map((session, i) => (
                      <button
                        key={session.number}
                        type="button"
                        role="tab"
                        aria-selected={sessionIdx === i}
                        onClick={() => setSessionIdx(i)}
                        className={`home-pillars-tab${sessionIdx === i ? ' home-pillars-tab--active' : ''}`}
                      >
                        <span className="home-pillars-tab__num" aria-hidden>{session.number || i + 1}</span>
                        <span className="home-pillars-tab__icon" aria-hidden>{session.icon}</span>
                        <span className="home-pillars-tab__label">{session.title}</span>
                      </button>
                    ))}
                  </div>
                  <div className="home-pillars-dots" aria-hidden>
                    {trainingSessions.map((session, i) => (
                      <button
                        key={`sdot-${session.number}`}
                        type="button"
                        className={`home-pillars-dot${sessionIdx === i ? ' home-pillars-dot--active' : ''}`}
                        onClick={() => setSessionIdx(i)}
                        tabIndex={-1}
                      />
                    ))}
                  </div>
                  <div className="home-pillars-panel infigon-card glow-card" role="tabpanel">
                    <div className={`home-pillars-panel__bar bg-gradient-to-r ${trainingSessions[sessionIdx].color}`} />
                    <div className="home-pillars-panel__head">
                      <span className="home-pillars-panel__icon" aria-hidden>{trainingSessions[sessionIdx].icon}</span>
                      <div>
                        <span className="home-pillars-panel__kicker">
                          {home.pillars.sessionLabel} {trainingSessions[sessionIdx].number}
                        </span>
                        <h3 className="home-pillars-panel__title">{trainingSessions[sessionIdx].title}</h3>
                        <p className="home-pillars-panel__sub">{trainingSessions[sessionIdx].subtitle}</p>
                      </div>
                    </div>
                    <p className="home-pillars-panel__desc">{trainingSessions[sessionIdx].description}</p>
                    <ul className="home-pillars-panel__features">
                      {(trainingSessions[sessionIdx].features || []).map((f) => (
                        <li key={f}>
                          <span aria-hidden>✓</span> {f}
                        </li>
                      ))}
                    </ul>
                    <Link to={seventhPillar.link} className="home-pillars-panel__cta">
                      {home.pillars.explore} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </MotionBox>
            </div>
          </HomeSection>

          <HomeDivider />

          <HomeBlogTeaser />

          <HomeDivider />

          <HomeSection variant="elevated">
            <LazyBlock minHeight={180}>
              <TestimonialMarquee />
            </LazyBlock>
          </HomeSection>

          <HomeDivider />

          <HomeSection variant="yellow" className="home-partners-marquee">
            <h2 className="home-headline text-center mb-3 sm:mb-4 px-4">
              {home.partnersMarquee.title}{' '}
              <span className="gradient-text text-pop">{home.partnersMarquee.titleHighlight}</span>
            </h2>
            {!mobile && (
              <p className="text-center text-sm mb-8 px-4 max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
                {home.partnersMarquee.subtitle}
              </p>
            )}
            <MarqueeStrip speed="32s" gap="gap-5">
              {COLLEGE_PARTNERS.map((p) => (
                <CollegePartnerPill key={p.id} partner={p} />
              ))}
            </MarqueeStrip>
            {!mobile && (
              <MarqueeStrip speed="40s" direction="right" gap="gap-5" className="mt-4 home-marquee-second">
                {[...COLLEGE_PARTNERS].reverse().map((p) => (
                  <CollegePartnerPill key={`rev-${p.id}`} partner={p} />
                ))}
              </MarqueeStrip>
            )}
          </HomeSection>

          <HomeDivider />

          <HomeSection variant="elevated">
            <div className="max-w-5xl mx-auto px-4 relative">
              <MotionBox {...sectionFade} className="text-center mb-6 sm:mb-10">
                <h2 className="home-headline">
                  {home.managementTeam.title}{' '}
                  {home.managementTeam.titleHighlight ? (
                    <span className="gradient-text text-pop">{home.managementTeam.titleHighlight}</span>
                  ) : null}
                </h2>
                {!mobile && home.managementTeam.subtitle ? (
                  <p className="mt-3 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                    {home.managementTeam.subtitle}
                  </p>
                ) : null}
              </MotionBox>
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                {teamToShow.map((person, i) => (
                  <AdvisoryPersonCard key={person.name} person={person} index={i} compact />
                ))}
              </div>
              <p className="text-center mt-6 sm:mt-8">
                <Link to="/about" className="text-amber-600 font-semibold hover:underline inline-flex items-center gap-2 text-sm">
                  {home.managementTeam.readFullStory} <ArrowRight className="w-4 h-4" />
                </Link>
              </p>
            </div>
          </HomeSection>

          <HomeDivider />

          <HomeSection variant="yellow">
            <LazyBlock minHeight={160} force={forceCertifications}>
              <CertificationsShowcase />
            </LazyBlock>
          </HomeSection>

          <HomeDivider />

          <HomeSection variant="orange" className="home-section--partner-band">
            <div className="max-w-7xl mx-auto px-4 home-partner-section">
              <MotionBox {...sectionFade} className="text-center mb-5 sm:mb-6">
                <h2 className="home-headline home-headline--on-orange">
                  {home.partnerJoin.title} <span className="text-white/95">{home.partnerJoin.titleHighlight}</span>
                </h2>
                {!mobile && home.partnerJoin.subtitle ? (
                  <p className="mt-3 max-w-xl mx-auto text-base text-white/90">
                    {home.partnerJoin.subtitle}
                  </p>
                ) : null}
              </MotionBox>
              <div className="flex flex-wrap justify-center gap-2 mb-4 sm:mb-5">
                {partnerTypes.slice(0, phone ? 4 : partnerTypes.length).map((p) => (
                  <Link
                    key={p.slug}
                    to={`/partner/${p.slug}`}
                    className="home-partner-chip home-partner-chip--on-orange inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs sm:text-sm font-semibold transition"
                  >
                    <span>{p.icon}</span>
                    {p.title}
                  </Link>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/contact" className="btn-gold text-sm !py-2.5 !px-5">{home.partnerJoin.contactCta}</Link>
              </div>
            </div>
          </HomeSection>

          <HomeDivider />

          <HomeSection variant="elevated" className="scroll-mt-24">
            <div className="max-w-3xl mx-auto px-4">
              <MotionBox {...sectionFade} className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4">
                <Link to="/counselling" className="btn-primary inline-flex items-center gap-2 text-sm sm:text-base">
                  {t('hero.cta1')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/crp?tab=launchpad" className="btn-outline inline-flex items-center gap-2 text-sm sm:text-base">
                  {t('hero.cta2')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </MotionBox>
            </div>
          </HomeSection>
        </>
      )}
    </>
  );
}
