import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function PageHero({
  title,
  subtitle,
  image,
  cta,
  ctaLink = '/contact',
  className = '',
  showBrandTag = true,
}) {
  return (
    <section className={`page-hero relative ${className}`.trim()}>
      {image && (
        <div className="page-hero__photo-layer">
          <img src={image} alt="" className="page-hero__photo" loading="eager" />
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 pt-8 pb-4">
        <div className="max-w-3xl">
          {showBrandTag && (
            <span className="hero-tag inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-5 border backdrop-blur-sm"
              style={{ borderColor: 'var(--gold-border)', color: 'var(--hero-text)', background: 'rgba(1,50,32,0.35)' }}>
              <Sparkles className="w-4 h-4 text-[#E8C96A]" /> Dream Mantra
            </span>
          )}
          <h1 className="hero-h1 hero-title mb-5" style={{ color: 'var(--hero-text)' }}>{title}</h1>
          {subtitle && (
            <p className="hero-sub text-lg md:text-xl leading-relaxed opacity-90" style={{ color: 'var(--hero-text)' }}>
              {subtitle}
            </p>
          )}
          {cta && (
            <Link to={ctaLink} className="btn-gold mt-8 inline-flex hero-btns">
              {cta}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
