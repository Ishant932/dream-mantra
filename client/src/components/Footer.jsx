import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Mail, Instagram, Linkedin, Facebook, MapPin } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import Logo from './Logo';
import FooterLocations from './FooterLocations';
import { footerSocial } from '../data/siteLinks';
import { useWhatsAppAgentLink } from '../hooks/useWhatsAppAgentLink';
import { isMobilePerf } from '../utils/mobilePerf';

function WhatsAppIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function FooterColumn({ title, links, index = 0 }) {
  const lite = isMobilePerf();
  const FadeBox = lite ? 'div' : motion.div;
  const motionProps = lite ? {} : {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  };

  return (
    <FadeBox className="footer-col" {...motionProps}>
      <h4 className="footer-col__title">{title}</h4>
      <ul className="footer-col__list">
        {links.map(({ to, label }) => (
          <li key={to + label}>
            <Link to={to} className="footer-col__link">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </FadeBox>
  );
}

function FooterCounsellingOverview({ title, links = [], index = 0 }) {
  const lite = isMobilePerf();
  const FadeBox = lite ? 'div' : motion.div;
  const motionProps = lite ? {} : {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  };

  return (
    <FadeBox className="footer-col footer-col--counselling" {...motionProps}>
      <h4 className="footer-col__title">{title}</h4>
      <ul className="footer-col__list footer-col__list--cta">
        {links.map(({ to, label }) => (
          <li key={to + label}>
            <Link to={to} className="footer-col__link footer-col__link--cta">{label}</Link>
          </li>
        ))}
      </ul>
    </FadeBox>
  );
}

function FooterQuickSections({ title, sections = [], index = 0 }) {
  const lite = isMobilePerf();
  const FadeBox = lite ? 'div' : motion.div;
  const motionProps = lite ? {} : {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  };

  return (
    <FadeBox className="footer-col footer-col--quick" {...motionProps}>
      <h4 className="footer-col__title">{title}</h4>
      <div className="footer-col__split">
        {sections.map((section, i) => (
          <div
            key={section.title}
            className={`footer-col__group ${i === 0 ? 'footer-col__group--discover' : 'footer-col__group--connect'}`}
          >
            <p className="footer-col__subtitle">{section.title}</p>
            <ul className="footer-col__list">
              {section.links.map(({ to, label }) => (
                <li key={to + label}>
                  <Link to={to} className="footer-col__link">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </FadeBox>
  );
}

export default function Footer() {
  const { t, d } = useLang();
  const footer = d('footer');
  const waHref = useWhatsAppAgentLink();
  const lite = isMobilePerf();
  const FadeBox = lite ? 'div' : motion.div;
  const topMotion = lite ? {} : {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  };
  const locMotion = lite ? {} : {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.35, delay: 0.06 },
  };

  return (
    <footer className="footer-pro footer-pro--orange">
      {!lite && <div className="footer-pro__wave" aria-hidden="true" />}
      {!lite && <div className="footer-pro__ambient" aria-hidden="true" />}

      <div className="footer-pro__container">
        <FadeBox className="footer-pro__top" {...topMotion}>
          <div className="footer-pro__brand">
            <Logo size="sm" variant="dark" asLink={false} />
            <p className="footer-pro__tagline">{t('footer.tagline')}</p>

            <ul className="footer-pro__contact">
              <li>
                <a href="tel:9680102276" className="footer-pro__contact-link">
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  {t('footer.phone')}
                </a>
              </li>
              <li>
                <a href="mailto:info@dreammantra.in" className="footer-pro__contact-link">
                  <Mail className="w-4 h-4" aria-hidden="true" />
                  {t('footer.email')}
                </a>
              </li>
            </ul>
            <p className="footer-pro__hours">{t('footer.hours')}</p>

            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-pro__wa-cta"
            >
              <WhatsAppIcon className="w-5 h-5 shrink-0" />
              <span>Chat with Esh on WhatsApp</span>
            </a>

            <div className="footer-pro__social">
              <span className="footer-pro__social-label">{footer.followUs}</span>
              <div className="footer-pro__social-icons">
                {[
                  { href: waHref, icon: WhatsAppIcon, label: 'WhatsApp AI counsellor' },
                  { href: footerSocial.instagram, icon: Instagram, label: 'Instagram' },
                  { href: footerSocial.linkedin, icon: Linkedin, label: 'LinkedIn' },
                  { href: footerSocial.facebook, icon: Facebook, label: 'Facebook' },
                ].map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="footer-pro__social-btn"
                    aria-label={label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="footer-pro__columns">
            <FooterCounsellingOverview
              title={footer.counsellingOverview}
              links={footer.footerCounsellingOverview?.links}
              index={0}
            />
            <FooterColumn title={footer.agePathways} links={footer.footerAgePathways} index={1} />
            <FooterQuickSections title={footer.quickLinks} sections={footer.footerQuickSections} index={2} />
          </div>
        </FadeBox>

        <FadeBox className="footer-pro__locations-wrap" {...locMotion}>
          <h4 className="footer-pro__locations-heading">
            <MapPin className="w-4 h-4" aria-hidden="true" />
            {footer.locationsBlock?.title || 'Our Centres'}
          </h4>
          <FooterLocations />
        </FadeBox>

        <div className="footer-pro__bottom">
          <nav className="footer-pro__quick-nav" aria-label="Footer quick links">
            {footer.footerQuickLinks.map(({ to, label }, i) => (
              <span key={to} className="footer-pro__quick-item">
                {i > 0 && <span className="footer-pro__quick-sep" aria-hidden="true">·</span>}
                <Link to={to} className="footer-pro__quick-link">{label}</Link>
              </span>
            ))}
          </nav>
        </div>
      </div>

      <div className="footer-pro__copyright">
        <div className="footer-pro__container footer-pro__copyright-inner">
          © {new Date().getFullYear()} {footer.copyright}
        </div>
      </div>
    </footer>
  );
}
