import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  GraduationCap,
  Mail,
  Phone,
  School,
  Users,
} from 'lucide-react';
import { useMemo } from 'react';
import { useLang } from '../context/LanguageContext';
import { PARTNER_DISPLAY_ORDER } from '../data/siteLinks';
import { partners as partnerMeta } from '../data/content';
import { animations } from '../utils/animations';
import AgePathwaysWorkspace from './AgePathwaysWorkspace';

const { tabFadeUp, tabScaleIn } = animations;

const PARTNER_ICONS = [School, GraduationCap, Building2, Users, Building2, School];
const PARTNER_TONES = ['orange', 'purple', 'green', 'blue', 'yellow', 'orange'];

export function InstitutionsPathways() {
  const { d } = useLang();
  const tabsCopy = d('pages.counselling.tabs.programs');
  const institutionsCopy = tabsCopy.institutions || {};

  const partners = useMemo(() => {
    const localized = d('data.partners').map((p, i) => ({ ...partnerMeta[i], ...p }));
    return PARTNER_DISPLAY_ORDER.map((slug) => localized.find((p) => p.slug === slug)).filter(Boolean);
  }, [d]);

  return (
    <div className="why-saas why-saas--compact dm-saas dm-saas--institutions">
      <motion.header {...tabFadeUp} className="why-saas__hero">
        <span className="why-saas__label">
          <Building2 className="w-3.5 h-3.5" /> {institutionsCopy.badge}
        </span>
        <h2 className="why-saas__title">
          Partner With <span className="why-saas__title-accent">Dream Mantra</span>
        </h2>
        <p className="why-saas__lede">{institutionsCopy.desc}</p>
        {institutionsCopy.chooseCategory ? (
          <p className="why-saas__caption" style={{ textAlign: 'center', marginTop: '0.85rem' }}>
            {institutionsCopy.chooseCategory}
          </p>
        ) : null}
      </motion.header>

      <div className="why-saas__grid why-saas__grid--3 why-saas__section">
        {partners.map((p, i) => {
          const Icon = PARTNER_ICONS[i % PARTNER_ICONS.length];
          const tone = PARTNER_TONES[i % PARTNER_TONES.length];
          return (
            <motion.div
              key={p.slug}
              {...tabScaleIn}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={`/partner/${p.slug}`}
                className={`why-saas__card why-saas__card--link why-saas__card--${tone}`}
              >
                <div className="dm-saas__media">
                  <img src={p.image} alt="" loading="lazy" />
                </div>
                <span className={`why-saas__icon why-saas__icon--${tone}`} aria-hidden>
                  <Icon className="w-5 h-5" />
                </span>
                <h3 className="why-saas__card-title why-saas__card-title--sm">{p.title}</h3>
                <p className="why-saas__muted">{p.desc}</p>
                <span className="why-saas__text-link">
                  {institutionsCopy.explorePartnership} <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <motion.article {...tabFadeUp} className="why-saas__cta">
        <div className="why-saas__cta-copy">
          <p className="why-saas__eyebrow">Partnerships</p>
          <h3 className="why-saas__heading">{institutionsCopy.getInTouch}</h3>
          <p className="why-saas__muted">{institutionsCopy.getInTouchDesc}</p>
          <div className="why-saas__contact-row">
            <a href="tel:9680102276" className="why-saas__contact-link">
              <Phone className="w-4 h-4" /> 9680102276
            </a>
            <a href="mailto:info@dreammantra.in" className="why-saas__contact-link">
              <Mail className="w-4 h-4" /> info@dreammantra.in
            </a>
          </div>
          <p className="why-saas__caption">{institutionsCopy.hours}</p>
        </div>
        <Link to="/contact" className="why-saas__btn">
          {institutionsCopy.contactCta}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.article>
    </div>
  );
}

export default function AgePathwaysSection() {
  return <AgePathwaysWorkspace />;
}
