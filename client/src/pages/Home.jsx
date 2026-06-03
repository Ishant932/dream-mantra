import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Layers } from 'lucide-react';
import HomeHero from '../components/HomeHero';
import HomeTrustBar from '../components/HomeTrustBar';
import HomeSection from '../components/HomeSection';
import HomeModulesIntro from '../components/HomeModulesIntro';
import HomeHowDreamzWorks from '../components/HomeHowDreamzWorks';
import HomeWhoWeGuide from '../components/HomeWhoWeGuide';
import HomeWhyCounselling from '../components/HomeWhyCounselling';
import WelcomeOfferBanner from '../components/WelcomeOfferBanner';
import AIFeatures from '../components/AIFeatures';
import TestimonialMarquee from '../components/TestimonialMarquee';
import CertificationsShowcase from '../components/CertificationsShowcase';
import MarqueeStrip, { MarqueePill } from '../components/MarqueeStrip';
import AdvisoryPersonCard from '../components/AdvisoryPersonCard';
import { partners } from '../data/infigonContent';
import { partners as partnerTypes } from '../data/content';
import { useHomeContent } from '../i18n/useSiteContent';

const fade = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
};

export default function Home() {
  const {
    home,
    pillars,
    seventhPillar,
    faqs,
    managementTeam,
  } = useHomeContent();
  const [pillarIdx, setPillarIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      {/* 1. Hero + 2. Numbers */}
      <HomeHero />

      <HomeTrustBar />

      <div className="home-section-divider" aria-hidden="true" />

      {/* Modules */}
      <HomeSection variant="warm" className="home-section--after-trust">
        <HomeModulesIntro />
      </HomeSection>

      <HomeSection variant="cream">
        <HomeHowDreamzWorks />
      </HomeSection>

      {/* Why career counselling — data, no images */}
      <HomeSection variant="elevated">
        <HomeWhyCounselling />
      </HomeSection>

      {/* Who we guide */}
      <HomeSection variant="warm">
        <HomeWhoWeGuide />
      </HomeSection>

      {/* 7 Pillars Framework */}
      <HomeSection variant="cream" id="pillars" className="scroll-mt-28">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-amber-300/20 rounded-full blur-3xl animate-blob" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <motion.div {...fade} className="text-center mb-12">
            <h2 className="home-headline">
              {home.pillars.title} <span className="gradient-text text-pop">{home.pillars.titleHighlight}</span> {home.pillars.titleSuffix}
            </h2>
            <p className="text-sand-600 mt-4 max-w-2xl mx-auto text-lg">
              {home.pillars.subtitle}
            </p>
          </motion.div>
          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            <div className="home-pillars-nav flex flex-col gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-1 lg:gap-2">
              {pillars.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onMouseEnter={() => setPillarIdx(i)}
                  onFocus={() => setPillarIdx(i)}
                  onClick={() => setPillarIdx(i)}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 w-full min-h-[3rem] ${
                    pillarIdx === i
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 scale-[1.02]'
                      : 'bg-[var(--bg-elevated)] border border-amber-200/80 text-[var(--text-primary)] hover:border-amber-400 hover:bg-amber-50/50 hover:shadow-md'
                  }`}
                >
                  <motion.span
                    animate={pillarIdx === i ? { rotate: [0, -8, 8, 0], scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.5 }}
                    className="text-xl shrink-0"
                  >
                    {p.icon}
                  </motion.span>
                  <span className="line-clamp-2 leading-snug">{p.title}</span>
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={pillarIdx}
                initial={{ opacity: 0, x: 24, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="infigon-card p-8 lg:p-10 glow-card bg-gradient-to-br from-[var(--bg-elevated)] to-amber-50/30 dark:from-[#434d22] dark:to-amber-900/10"
              >
                <div className={`h-1.5 -mt-8 -mx-8 lg:-mx-10 mb-6 rounded-t-2xl bg-gradient-to-r ${pillars[pillarIdx].color}`} />
                <div className="flex items-start gap-4 mb-4">
                  <motion.span
                    className="text-4xl"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    {pillars[pillarIdx].icon}
                  </motion.span>
                  <div>
                    <span className="text-xs font-bold text-amber-600 uppercase">{home.pillars.pillarLabel} {pillars[pillarIdx].id}</span>
                    <h3 className="font-display text-2xl font-bold">{pillars[pillarIdx].title}</h3>
                    <p className="text-sm text-amber-600 font-medium">{pillars[pillarIdx].subtitle}</p>
                  </div>
                </div>
                <p className="text-sand-600 mb-5 leading-relaxed">{pillars[pillarIdx].description}</p>
                <ul className="grid sm:grid-cols-2 gap-2 mb-6">
                  {pillars[pillarIdx].features.map((f, fi) => (
                    <motion.li
                      key={f}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: fi * 0.05 }}
                      className="flex gap-2 text-sm text-sand-700"
                    >
                      <span className="text-amber-500 font-bold">✓</span> {f}
                    </motion.li>
                  ))}
                </ul>
                <Link to={pillars[pillarIdx].link} className="text-amber-600 font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all">
                  {home.pillars.explore} <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
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
        </div>
      </HomeSection>

      {/* Partner & Join */}
      <HomeSection variant="orange">
        <div className="max-w-7xl mx-auto px-4 home-partner-section">
          <motion.div {...fade} className="text-center mb-8">
            <h2 className="home-headline home-headline--on-orange">
              {home.partnerJoin.title} <span className="text-white/95">{home.partnerJoin.titleHighlight}</span>
            </h2>
            <p className="mt-3 max-w-xl mx-auto text-base text-white/90">
              {home.partnerJoin.subtitle}
            </p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6">
            {partnerTypes.map((p, i) => (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -3, scale: 1.04 }}
              >
                <Link
                  to={`/partner/${p.slug}`}
                  className="home-partner-chip home-partner-chip--on-orange inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition"
                >
                  <span>{p.icon}</span>
                  {p.title}
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/counsellors?tab=become" className="btn-gold text-sm !py-2.5 !px-5">{home.partnerJoin.becomeCounsellor}</Link>
            <Link to="/counsellors?tab=network" className="px-5 py-2.5 rounded-xl text-sm font-bold border-2 border-white/50 text-white hover:bg-white/15 transition">{home.partnerJoin.joinNetwork}</Link>
          </div>
        </div>
      </HomeSection>

      {/* AI-Powered Career Discovery */}
      <AIFeatures />

      <WelcomeOfferBanner />

      <TestimonialMarquee />

      {/* Institutes marquee */}
      <HomeSection variant="mesh" className="!py-14 border-y" style={{ borderColor: 'var(--border-subtle)' }}>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center font-display text-2xl md:text-3xl font-bold mb-4 px-4"
        >
          {home.partnersMarquee.title} <span className="gradient-text">{home.partnersMarquee.titleHighlight}</span>
        </motion.h2>
        <p className="text-center text-sm mb-8 px-4 max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          {home.partnersMarquee.subtitle}
        </p>
        <MarqueeStrip speed="32s" gap="gap-5">
          {partners.map((p) => (
            <MarqueePill key={p}>{p}</MarqueePill>
          ))}
        </MarqueeStrip>
        <MarqueeStrip speed="40s" direction="right" gap="gap-5" className="mt-4">
          {[...partners].reverse().map((p) => (
            <MarqueePill key={`rev-${p}`}>{p}</MarqueePill>
          ))}
        </MarqueeStrip>
      </HomeSection>

      {/* Management Team */}
      <HomeSection variant="warm">
        <div className="max-w-5xl mx-auto px-4 relative">
          <motion.div {...fade} className="text-center mb-10">
            <h2 className="home-headline">{home.managementTeam.title}</h2>
            <p className="mt-3 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              {home.managementTeam.subtitle}
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {managementTeam.map((person, i) => (
              <AdvisoryPersonCard key={person.name} person={person} index={i} compact />
            ))}
          </div>
          <motion.p {...fade} className="text-center mt-8">
            <Link to="/about" className="text-amber-600 font-semibold hover:underline inline-flex items-center gap-2 text-sm">
              {home.managementTeam.readFullStory} <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.p>
        </div>
      </HomeSection>

      <CertificationsShowcase />

      {/* FAQ */}
      <HomeSection variant="base">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div {...fade} className="text-center mb-10">
            <h2 className="home-headline">{home.faq.title} <span className="gradient-text text-pop">{home.faq.titleHighlight}</span></h2>
            <p className="text-sand-600 mt-3">{home.faq.subtitle}</p>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <motion.div
                key={i}
                {...fade}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.01 }}
                className={`infigon-card overflow-hidden transition ${openFaq === i ? 'ring-2 ring-brand-300 shadow-lg' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-semibold hover:bg-brand-50/50 transition text-sm sm:text-base"
                >
                  {f.q}
                  <span className={`text-brand-600 text-xl transition-transform duration-300 shrink-0 ml-3 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-sand-600 leading-relaxed text-sm">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
          <motion.div {...fade} className="text-center mt-8">
            <Link to="/contact" className="btn-outline text-sm">{home.faq.contactUs}</Link>
          </motion.div>
        </div>
      </HomeSection>
    </>
  );
}
