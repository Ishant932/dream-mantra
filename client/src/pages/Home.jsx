import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Layers, ChevronDown } from 'lucide-react';
import HomeHero from '../components/HomeHero';
import HomeTrustBar from '../components/HomeTrustBar';
import HomeSection from '../components/HomeSection';
import HomeModulesIntro from '../components/HomeModulesIntro';
import HomeHowDreamzWorks from '../components/HomeHowDreamzWorks';
import HomeWhoWeGuide from '../components/HomeWhoWeGuide';
import HomeWhyCounselling from '../components/HomeWhyCounselling';
import MarqueeStrip, { MarqueePill } from '../components/MarqueeStrip';
import AdvisoryPersonCard from '../components/AdvisoryPersonCard';
import LazyMount from '../components/LazyMount';
import MobileHomeQuickNav from '../components/MobileHomeQuickNav';
import { partners } from '../data/infigonContent';
import { partners as partnerTypes } from '../data/content';
import { useHomeContent } from '../i18n/useSiteContent';
import { useLang } from '../context/LanguageContext';
import { isMobilePerf, isPhoneViewport } from '../utils/mobilePerf';

const AIFeatures = lazy(() => import('../components/AIFeatures'));
const WelcomeOfferBanner = lazy(() => import('../components/WelcomeOfferBanner'));
const TestimonialMarquee = lazy(() => import('../components/TestimonialMarquee'));
const CertificationsShowcase = lazy(() => import('../components/CertificationsShowcase'));

const fade = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
};

function HomeDivider() {
  if (isPhoneViewport()) return null;
  return <div className="home-section-divider" aria-hidden="true" />;
}

function SectionPlaceholder() {
  return <div className="home-lazy-placeholder" aria-hidden="true" />;
}

function LazyBlock({ children, minHeight = 120 }) {
  return (
    <LazyMount minHeight={minHeight} fallback={<SectionPlaceholder />}>
      <Suspense fallback={<SectionPlaceholder />}>{children}</Suspense>
    </LazyMount>
  );
}

export default function Home() {
  const { t } = useLang();
  const {
    home,
    pillars,
    seventhPillar,
    faqs,
    managementTeam,
  } = useHomeContent();
  const mobile = isMobilePerf();
  const phone = isPhoneViewport();
  const [pillarIdx, setPillarIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [faqExpanded, setFaqExpanded] = useState(false);
  const [showMoreSections, setShowMoreSections] = useState(!phone);

  const visibleFaqs = phone && !faqExpanded ? faqs.slice(0, 3) : faqs;
  const teamToShow = phone ? managementTeam.slice(0, 1) : managementTeam;
  const MotionBox = mobile ? 'div' : motion.div;

  return (
    <>
      <HomeHero />
      <HomeDivider />
      <HomeTrustBar />
      <MobileHomeQuickNav />
      <HomeDivider />

      <HomeSection variant="warm" className="home-section--after-trust" id="home-modules">
        <HomeModulesIntro />
      </HomeSection>

      <HomeDivider />

      <HomeSection variant="cream">
        <HomeHowDreamzWorks />
      </HomeSection>

      <HomeDivider />

      <HomeSection variant="elevated">
        <HomeWhyCounselling />
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

          <HomeSection variant="warm">
            <HomeWhoWeGuide />
          </HomeSection>

          <HomeDivider />

          <HomeSection variant="cream" id="pillars" className="scroll-mt-28">
            <div className="max-w-7xl mx-auto px-4 relative">
              <MotionBox {...(mobile ? {} : fade)} className="text-center mb-8 sm:mb-12">
                <h2 className="home-headline">
                  {home.pillars.title} <span className="gradient-text text-pop">{home.pillars.titleHighlight}</span> {home.pillars.titleSuffix}
                </h2>
                <p className="text-sand-600 mt-3 max-w-2xl mx-auto text-base sm:text-lg">
                  {home.pillars.subtitle}
                </p>
              </MotionBox>
              <div className="grid lg:grid-cols-[280px_1fr] gap-4 sm:gap-6">
                <div className="home-pillars-nav home-pillars-nav--mobile-scroll flex flex-row lg:flex-col gap-2 overflow-x-auto pb-1 lg:pb-0 lg:grid lg:grid-cols-1">
                  {pillars.map((p, i) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPillarIdx(i)}
                      className={`text-left px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 sm:gap-3 shrink-0 lg:shrink lg:w-full min-h-[2.75rem] ${
                        pillarIdx === i
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                          : 'bg-[var(--bg-elevated)] border border-amber-200/80 text-[var(--text-primary)]'
                      }`}
                    >
                      <span className="text-lg shrink-0">{p.icon}</span>
                      <span className="line-clamp-2 leading-snug whitespace-nowrap lg:whitespace-normal">{p.title}</span>
                    </button>
                  ))}
                </div>
                <div className="infigon-card p-5 sm:p-8 lg:p-10 glow-card bg-gradient-to-br from-[var(--bg-elevated)] to-amber-50/30 dark:from-[#434d22] dark:to-amber-900/10">
                  <div className={`h-1.5 -mt-5 sm:-mt-8 -mx-5 sm:-mx-8 lg:-mx-10 mb-4 sm:mb-6 rounded-t-2xl bg-gradient-to-r ${pillars[pillarIdx].color}`} />
                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <span className="text-3xl sm:text-4xl">{pillars[pillarIdx].icon}</span>
                    <div>
                      <span className="text-xs font-bold text-amber-600 uppercase">{home.pillars.pillarLabel} {pillars[pillarIdx].id}</span>
                      <h3 className="font-display text-xl sm:text-2xl font-bold">{pillars[pillarIdx].title}</h3>
                      <p className="text-sm text-amber-600 font-medium">{pillars[pillarIdx].subtitle}</p>
                    </div>
                  </div>
                  <p className="text-sand-600 mb-4 sm:mb-5 leading-relaxed text-sm sm:text-base">{pillars[pillarIdx].description}</p>
                  <ul className="grid sm:grid-cols-2 gap-2 mb-4 sm:mb-6">
                    {pillars[pillarIdx].features.map((f) => (
                      <li key={f} className="flex gap-2 text-sm text-sand-700">
                        <span className="text-amber-500 font-bold">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link to={pillars[pillarIdx].link} className="text-amber-600 font-semibold inline-flex items-center gap-2 text-sm">
                    {home.pillars.explore} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
              {phone ? (
                <p className="text-center mt-5">
                  <Link to="/pillars" className="btn-outline text-sm">{home.pillars.viewFullPage}</Link>
                </p>
              ) : (
                <>
                  <motion.div
                    {...fade}
                    whileHover={{ scale: 1.01 }}
                    className="mt-8 rounded-3xl overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-8 md:p-10 text-amber-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl shadow-orange-500/20"
                  >
                    <div>
                      <span className="inline-flex items-center gap-2 text-xs font-bold bg-[var(--bg-elevated)]/20 px-3 py-1 rounded-full mb-3">
                        <Layers className="w-4 h-4" /> {home.pillars.seventhPillarLabel}
                      </span>
                      <h3 className="font-display font-bold text-2xl">{seventhPillar.title}</h3>
                      <p className="text-amber-50 mt-2">{seventhPillar.tagline}</p>
                    </div>
                    <Link to={seventhPillar.link} className="btn-gold shrink-0">
                      {home.pillars.viewCrp} <ArrowRight className="w-5 h-5" />
                    </Link>
                  </motion.div>
                  <p className="text-center mt-6">
                    <Link to="/pillars" className="text-amber-600 font-semibold hover:underline inline-flex items-center gap-2">
                      {home.pillars.viewFullPage} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </p>
                </>
              )}
            </div>
          </HomeSection>

          <HomeDivider />

          <HomeSection variant="orange">
            <div className="max-w-7xl mx-auto px-4 home-partner-section">
              <MotionBox {...(mobile ? {} : fade)} className="text-center mb-6 sm:mb-8">
                <h2 className="home-headline home-headline--on-orange text-xl sm:text-3xl">
                  {home.partnerJoin.title} <span className="text-white/95">{home.partnerJoin.titleHighlight}</span>
                </h2>
                {!mobile && (
                  <p className="mt-3 max-w-xl mx-auto text-base text-white/90">
                    {home.partnerJoin.subtitle}
                  </p>
                )}
              </MotionBox>
              <div className="flex flex-wrap justify-center gap-2 mb-5 sm:mb-6">
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
                <Link to="/counsellors?tab=become" className="btn-gold text-sm !py-2.5 !px-5">{home.partnerJoin.becomeCounsellor}</Link>
                <Link to="/counsellors?tab=network" className="px-4 py-2.5 rounded-xl text-sm font-bold border-2 border-white/50 text-white">{home.partnerJoin.joinNetwork}</Link>
              </div>
            </div>
          </HomeSection>

          <HomeDivider />

          <LazyBlock minHeight={200}>
            <AIFeatures />
          </LazyBlock>

          <HomeDivider />

          <LazyBlock minHeight={100}>
            <WelcomeOfferBanner />
          </LazyBlock>

          <HomeDivider />

          <LazyBlock minHeight={180}>
            <TestimonialMarquee />
          </LazyBlock>

          <HomeDivider />

          <HomeSection variant="mesh" className="!py-8 sm:!py-14 border-y home-partners-marquee" style={{ borderColor: 'var(--border-subtle)' }}>
            <h2 className="text-center font-display text-xl sm:text-3xl font-bold mb-3 sm:mb-4 px-4">
              {home.partnersMarquee.title} <span className="gradient-text">{home.partnersMarquee.titleHighlight}</span>
            </h2>
            {!mobile && (
              <p className="text-center text-sm mb-8 px-4 max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
                {home.partnersMarquee.subtitle}
              </p>
            )}
            <MarqueeStrip speed="32s" gap="gap-5">
              {partners.map((p) => (
                <MarqueePill key={p}>{p}</MarqueePill>
              ))}
            </MarqueeStrip>
            {!mobile && (
              <MarqueeStrip speed="40s" direction="right" gap="gap-5" className="mt-4 home-marquee-second">
                {[...partners].reverse().map((p) => (
                  <MarqueePill key={`rev-${p}`}>{p}</MarqueePill>
                ))}
              </MarqueeStrip>
            )}
          </HomeSection>

          <HomeDivider />

          <HomeSection variant="warm">
            <div className="max-w-5xl mx-auto px-4 relative">
              <MotionBox {...(mobile ? {} : fade)} className="text-center mb-6 sm:mb-10">
                <h2 className="home-headline">{home.managementTeam.title}</h2>
                {!mobile && (
                  <p className="mt-3 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                    {home.managementTeam.subtitle}
                  </p>
                )}
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

          <LazyBlock minHeight={160}>
            <CertificationsShowcase />
          </LazyBlock>

          <HomeDivider />

          <HomeSection variant="base" id="home-faq" className="scroll-mt-24">
            <div className="max-w-3xl mx-auto px-4">
              <MotionBox {...(mobile ? {} : fade)} className="text-center mb-6 sm:mb-10">
                <h2 className="home-headline">{home.faq.title} <span className="gradient-text text-pop">{home.faq.titleHighlight}</span></h2>
                <p className="text-sand-600 mt-2 sm:mt-3 text-sm sm:text-base">{home.faq.subtitle}</p>
              </MotionBox>
              <div className="space-y-2 sm:space-y-3">
                {visibleFaqs.map((f, i) => (
                  <div
                    key={i}
                    className={`infigon-card overflow-hidden transition ${openFaq === i ? 'ring-2 ring-brand-300 shadow-lg' : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                      className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm sm:text-base"
                    >
                      {f.q}
                      <span className={`text-brand-600 text-xl transition-transform duration-300 shrink-0 ml-3 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                    </button>
                    {openFaq === i && (
                      <p className="px-4 pb-4 text-sand-600 leading-relaxed text-sm">{f.a}</p>
                    )}
                  </div>
                ))}
              </div>
              {phone && !faqExpanded && faqs.length > 3 && (
                <p className="text-center mt-4">
                  <button type="button" className="btn-outline text-sm" onClick={() => setFaqExpanded(true)}>
                    {t('mobileNav.moreFaqs')}
                  </button>
                </p>
              )}
              <p className="text-center mt-6 sm:mt-8">
                <Link to="/contact" className="btn-outline text-sm">{home.faq.contactUs}</Link>
              </p>
            </div>
          </HomeSection>
        </>
      )}
    </>
  );
}
