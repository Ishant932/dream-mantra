import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const REVEAL_CLASSES = [
  'reveal', 'reveal-title', 'reveal-left', 'reveal-right', 'reveal-scale',
  'reveal-card', 'reveal-blur', 'reveal-pop', 'reveal-label', 'reveal-stagger',
  'reveal-rise', 'reveal-glow', 'reveal-flip',
];

const REVEAL_SELECTORS = REVEAL_CLASSES.map((c) => `.${c}:not(.visible)`).join(', ');

function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
}

function shouldSkip(el) {
  if (!el) return true;
  if (el.classList.contains('no-reveal')) return true;
  if (el.classList.contains('page-hero')) return true;
  if (el.classList.contains('home-section')) return true;
  if (el.classList.contains('stats-banner')) return true;
  if (el.classList.contains('testimonial-section')) return true;
  if (el.classList.contains('cert-showcase-section')) return true;
  if (el.classList.contains('marquee-strip-root')) return true;
  if (el.closest('.no-reveal, .subtab-root, .page-hero, .dash-root, .home-section, .marquee-strip-root, .testimonial-section, .cert-showcase-section')) return true;
  if (el.querySelector('.subtab-root')) return true;
  return false;
}

function tagClass(el, cls) {
  if (el.classList.contains(cls)) return;
  el.classList.add(cls);
  if (isInViewport(el)) el.classList.add('visible');
}

function tagRevealElements() {
  document.querySelectorAll('main section').forEach((el) => {
    if (el.classList.contains('reveal') || shouldSkip(el)) return;
    tagClass(el, 'reveal');
  });

  document.querySelectorAll('main .section-title, main .home-headline').forEach((el) => {
    if (el.classList.contains('reveal-title') || shouldSkip(el)) return;
    tagClass(el, 'reveal-title');
  });

  document.querySelectorAll('main .section-label, main .program-pathway-eyebrow').forEach((el) => {
    if (el.classList.contains('reveal-label') || shouldSkip(el)) return;
    tagClass(el, 'reveal-label');
  });

  document.querySelectorAll(
    'main .infigon-card, main .card, main .faq-item, main .dash-card, main .home-guide-card, main .home-module-card, main .instagram-reel-card'
  ).forEach((el) => {
    if (el.classList.contains('reveal-card') || shouldSkip(el)) return;
    if (el.closest('.subtab-panel, .marquee-track, .hero-trust, .home-trust-strip')) return;
    tagClass(el, 'reveal-card');
  });

  document.querySelectorAll(
    'main section .grid, main section [class*="grid-cols"], main .success-reels-grid'
  ).forEach((el) => {
    if (el.classList.contains('reveal-stagger') || shouldSkip(el)) return;
    if (el.children.length < 2) return;
    if (el.closest('.subtab-panel, .marquee-track, .hero-trust, .dash-quick-action, .home-trust-strip')) return;
    tagClass(el, 'reveal-stagger');
  });

  document.querySelectorAll('main section h3, main .program-struggle-section__heading').forEach((el) => {
    if (el.classList.contains('reveal-pop') || shouldSkip(el)) return;
    tagClass(el, 'reveal-pop');
  });

  document.querySelectorAll('main .btn-outline, main .btn-gold, main .btn-primary').forEach((el) => {
    if (el.classList.contains('reveal-rise') || shouldSkip(el)) return;
    if (el.closest('.subtab-panel, .dash-root, .no-reveal, .site-header')) return;
    tagClass(el, 'reveal-rise');
  });

  document.querySelectorAll('main section > .max-w-7xl > p:first-of-type, main section > p.lead').forEach((el) => {
    if (el.classList.contains('reveal-blur') || shouldSkip(el)) return;
    if (document.documentElement.classList.contains('is-mobile-perf')) return;
    tagClass(el, 'reveal-blur');
  });

  document.querySelectorAll('main .glass-card:not(.card):not(.infigon-card)').forEach((el) => {
    if (el.classList.contains('reveal-glow') || shouldSkip(el)) return;
    if (el.closest('.subtab-panel, .dash-root')) return;
    tagClass(el, 'reveal-glow');
  });

  document.querySelectorAll('main .program-facing-same, main .success-reels-showcase').forEach((el) => {
    if (el.classList.contains('reveal-scale') || shouldSkip(el)) return;
    tagClass(el, 'reveal-scale');
  });

  document.querySelectorAll('main .reveal-alt').forEach((el, i) => {
    if (shouldSkip(el)) return;
    el.classList.add(i % 2 === 0 ? 'reveal-left' : 'reveal-right');
    el.classList.remove('reveal-alt');
    if (isInViewport(el)) el.classList.add('visible');
  });
}

export default function ScrollRevealInit() {
  const location = useLocation();
  const observerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const observe = () => {
      observerRef.current?.disconnect();
      const els = document.querySelectorAll(REVEAL_SELECTORS);
      if (!els.length) return;

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.06, rootMargin: '0px 0px -24px 0px' }
      );

      els.forEach((el) => {
        if (isInViewport(el)) el.classList.add('visible');
        else io.observe(el);
      });

      observerRef.current = io;
    };

    const run = () => {
      if (cancelled) return;
      tagRevealElements();
      observe();
    };

    run();
    const t1 = setTimeout(run, 120);

    const fallback = setTimeout(() => {
      REVEAL_CLASSES.forEach((cls) => {
        document.querySelectorAll(`.${cls}:not(.visible)`).forEach((el) => el.classList.add('visible'));
      });
    }, 1800);

    return () => {
      cancelled = true;
      observerRef.current?.disconnect();
      clearTimeout(t1);
      clearTimeout(fallback);
    };
  }, [location.pathname, location.search]);

  return null;
}
