(function () {
  'use strict';

  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');

  // Sticky header shadow
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Mobile menu
  menuToggle?.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    nav?.classList.toggle('open');
  });

  nav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle?.classList.remove('active');
      nav?.classList.remove('open');
    });
  });

  // Smooth scroll for buttons
  document.querySelectorAll('[data-scroll]').forEach((el) => {
    el.addEventListener('click', () => {
      const target = document.querySelector(el.dataset.scroll);
      if (target) {
        const offset = 112;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // Animated stat counters
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString('en-IN');
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target.toLocaleString('en-IN');
    }

    requestAnimationFrame(update);
  }

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !statsAnimated) {
          statsAnimated = true;
          statNumbers.forEach(animateCounter);
        }
      });
    },
    { threshold: 0.3 }
  );

  const statsSection = document.querySelector('.stats');
  if (statsSection) statsObserver.observe(statsSection);

  // 7-step process tabs
  const processTabs = document.querySelectorAll('.process-tab');
  const processSteps = document.querySelectorAll('.process-step');

  processTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const step = tab.dataset.step;
      processTabs.forEach((t) => t.classList.remove('active'));
      processSteps.forEach((s) => s.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`.process-step[data-step="${step}"]`)?.classList.add('active');
    });
  });

  // Testimonial carousel
  const carousel = document.getElementById('testimonialCarousel');
  if (carousel) {
    const track = carousel.querySelector('.carousel-track');
    const cards = carousel.querySelectorAll('.testimonial-card');
    const prevBtn = carousel.querySelector('.prev');
    const nextBtn = carousel.querySelector('.next');
    let index = 0;

    function getVisibleCount() {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function updateCarousel() {
      const visible = getVisibleCount();
      const maxIndex = Math.max(0, cards.length - visible);
      index = Math.min(index, maxIndex);
      const cardWidth = cards[0].offsetWidth + 24;
      track.style.transform = `translateX(-${index * cardWidth}px)`;
    }

    prevBtn?.addEventListener('click', () => {
      index = Math.max(0, index - 1);
      updateCarousel();
    });

    nextBtn?.addEventListener('click', () => {
      const visible = getVisibleCount();
      const maxIndex = Math.max(0, cards.length - visible);
      index = Math.min(maxIndex, index + 1);
      updateCarousel();
    });

    window.addEventListener('resize', () => {
      index = 0;
      updateCarousel();
    });

    updateCarousel();
  }

  // FAQ: only one open at a time (optional polish)
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach((other) => {
          if (other !== item) other.open = false;
        });
      }
    });
  });
})();
