import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLang } from '../context/LanguageContext';
import { useHomeContent } from '../i18n/useSiteContent';
import MarqueeStrip from './MarqueeStrip';
import PersonPhoto from './PersonPhoto';

export default function TestimonialMarquee() {
  const { t } = useLang();
  const { testimonials } = useHomeContent();

  return (
    <section className="no-reveal py-16 lg:py-20 overflow-hidden relative testimonial-section">
      <div className="absolute inset-0 opacity-70 testimonial-section-bg" />
      <div className="absolute top-1/2 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: 'var(--gold-dim)' }} />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: 'var(--gold-dim)' }} />

      <div className="relative">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-2xl md:text-3xl font-bold text-center mb-10 px-4"
        >
          {t('home.testimonialsTitle')} <span className="gradient-text">{t('home.testimonialsHighlight')}</span>
        </motion.h2>

        <MarqueeStrip speed="45s" gap="gap-6">
          {testimonials.map((item, i) => (
            <article
              key={`${item.name}-${i}`}
              className="testimonial-card testimonial-marquee-card w-[min(300px,calc(100vw-2.5rem))] md:w-[360px] shrink-0 p-5 sm:p-6 rounded-2xl relative overflow-hidden shine-hover"
            >
              <div className="testimonial-card-accent" aria-hidden="true" />
              <div className="flex items-center gap-3 mb-4">
                <PersonPhoto src={item.image} name={item.name} size="md" animate={false} />
                <div className="min-w-0">
                  <p className="font-bold truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                  <p className="text-xs font-semibold truncate testimonial-role">{item.role}</p>
                </div>
              </div>
              <Quote className="w-6 h-6 mb-2 testimonial-quote-icon" />
              <div className="flex gap-0.5 mb-3">
                {[...Array(item.stars || 5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-[#FFD060] text-[#FFD060]" />
                ))}
              </div>
              <p className="text-sm leading-relaxed italic" style={{ color: 'var(--text-body)' }}>
                &ldquo;{item.text}&rdquo;
              </p>
            </article>
          ))}
        </MarqueeStrip>
      </div>
    </section>
  );
}
