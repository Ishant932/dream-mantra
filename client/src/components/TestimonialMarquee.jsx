import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLang } from '../context/LanguageContext';
import { useHomeContent } from '../i18n/useSiteContent';
import MarqueeStrip from './MarqueeStrip';

function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
}

export default function TestimonialMarquee() {
  const { t } = useLang();
  const { testimonials } = useHomeContent();
  const lite = typeof document !== 'undefined' && document.documentElement.classList.contains('is-mobile-perf');

  return (
    <div className="no-reveal overflow-hidden relative testimonial-section">
      <div className="relative max-w-7xl mx-auto px-4 mb-8 sm:mb-10">
        {lite ? (
          <h2 className="home-headline text-center">
            {t('home.testimonialsTitle')}{' '}
            <span className="gradient-text text-pop">{t('home.testimonialsHighlight')}</span>
          </h2>
        ) : (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="home-headline text-center"
          >
            {t('home.testimonialsTitle')}{' '}
            <span className="gradient-text text-pop">{t('home.testimonialsHighlight')}</span>
          </motion.h2>
        )}
      </div>

      <div className="relative">
        <MarqueeStrip speed="50s" gap="gap-4 sm:gap-5">
          {testimonials.map((item, i) => (
            <article
              key={`${item.name}-${i}`}
              className="testimonial-card testimonial-marquee-card w-[min(280px,calc(100vw-2.75rem))] sm:w-[300px] md:w-[320px] shrink-0 relative"
            >
              <div className="testimonial-card-accent" aria-hidden />
              <div className="testimonial-card__body">
                <div className="flex items-center gap-3 mb-3">
                  <span className="testimonial-card__avatar" aria-hidden>
                    {initials(item.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="testimonial-card__name">{item.name}</p>
                    <p className="testimonial-card__role">{item.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Quote className="w-4 h-4 testimonial-quote-icon shrink-0" aria-hidden />
                  <div className="flex gap-0.5">
                    {[...Array(item.stars || 5)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-[var(--orange)] text-[var(--orange)]" />
                    ))}
                  </div>
                </div>

                <p className="testimonial-card__text">
                  &ldquo;{item.text}&rdquo;
                </p>
              </div>
            </article>
          ))}
        </MarqueeStrip>
      </div>
    </div>
  );
}
