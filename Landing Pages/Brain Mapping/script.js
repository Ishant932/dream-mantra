// Training & Placement - Landing Page Script

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. TYPING EFFECT (Crazy Auto-Type Animation) ---
  const typedTextElement = document.getElementById('typed-text');
  if (typedTextElement) {
    const words = ["Brain Potential", "Hidden Talent", "Natural Genius", "Learning Style"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
      const currentWord = words[wordIndex];

      if (isDeleting) {
        typedTextElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        typeSpeed = 50;
      } else {
        typedTextElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        typeSpeed = 120;
      }

      if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        typeSpeed = 2000;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex++;
        if (wordIndex >= words.length) {
          wordIndex = 0;
        }
        typeSpeed = 500;
      }

      setTimeout(type, typeSpeed);
    }

    setTimeout(type, 1000);
  }

  // --- 2. INTERSECTION OBSERVER (Scroll Reveals) ---
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // --- 2a. SCROLL PROGRESS BAR ---
  const scrollProgress = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    if (!scrollProgress) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = pct + '%';
  });

  // --- 2b. COUNT-UP STATS ANIMATION (supports decimals) ---
  const countUpElements = document.querySelectorAll('.count-up');
  const countObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.target) || 0;
        const suffix = el.dataset.suffix || '';
        const decimals = parseInt(el.dataset.decimal, 10) || 0;
        const duration = 1400;
        const start = performance.now();

        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = eased * target;
          el.textContent = (decimals > 0 ? value.toFixed(decimals) : Math.round(value)) + suffix;
          if (progress < 1) {
            requestAnimationFrame(tick);
          }
        }
        requestAnimationFrame(tick);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  countUpElements.forEach(el => countObserver.observe(el));

  // --- 2c. PASSWORD VISIBILITY TOGGLE ---
  document.querySelectorAll('.password-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetInput = document.getElementById(btn.dataset.target);
      const icon = btn.querySelector('i');
      if (!targetInput) return;
      const isHidden = targetInput.type === 'password';
      targetInput.type = isHidden ? 'text' : 'password';
      icon.classList.toggle('fa-eye', !isHidden);
      icon.classList.toggle('fa-eye-slash', isHidden);
    });
  });

  // --- 2d. CONFETTI BURST ---
  function fireConfetti(container) {
    if (!container) return;
    const colors = ['#f97316', '#f59e0b', '#fde047', '#34d399', '#60a5fa', '#f472b6'];
    const pieceCount = 40;
    container.innerHTML = '';
    for (let i = 0; i < pieceCount; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = (Math.random() * 0.4) + 's';
      piece.style.animationDuration = (1.2 + Math.random() * 0.8) + 's';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      container.appendChild(piece);
    }
    setTimeout(() => { container.innerHTML = ''; }, 2200);
  }

  // --- 2e. DUMMY URGENCY COUNTDOWN: sticky flip-clock bar + modal badge (10-11 min, loops) ---
  const countdownTextEl = document.getElementById('countdown-timer-2');
  const flipBoxes = {
    m1: document.getElementById('ft-m1'),
    m2: document.getElementById('ft-m2'),
    s1: document.getElementById('ft-s1'),
    s2: document.getElementById('ft-s2')
  };
  const hasFlipClock = Object.values(flipBoxes).every(Boolean);

  if (countdownTextEl || hasFlipClock) {
    let secondsLeft = 600 + Math.floor(Math.random() * 60); // 10:00 - 10:59

    function setDigit(box, value) {
      if (!box) return;
      if (box.textContent !== value) {
        box.textContent = value;
        box.classList.remove('flipping');
        void box.offsetWidth; // restart animation
        box.classList.add('flipping');
      }
    }

    function renderCountdown() {
      const mins = Math.floor(secondsLeft / 60);
      const secs = secondsLeft % 60;
      const mm = mins.toString().padStart(2, '0');
      const ss = secs.toString().padStart(2, '0');

      if (countdownTextEl) countdownTextEl.textContent = `${mins}:${ss}`;

      if (hasFlipClock) {
        setDigit(flipBoxes.m1, mm[0]);
        setDigit(flipBoxes.m2, mm[1]);
        setDigit(flipBoxes.s1, ss[0]);
        setDigit(flipBoxes.s2, ss[1]);
      }
    }

    renderCountdown();
    setInterval(() => {
      secondsLeft--;
      if (secondsLeft < 0) {
        secondsLeft = 600 + Math.floor(Math.random() * 60); // reset for a fresh 10-11 min window
      }
      renderCountdown();
    }, 1000);
  }

  // --- 2f. JOIN NOW MODAL ---
  const joinModalOverlay = document.getElementById('join-modal-overlay');
  const joinModalCloseBtn = document.getElementById('join-modal-close-btn');
  const joinModalOpenTriggers = document.querySelectorAll('.js-open-join-modal');

  function openJoinModal() {
    if (!joinModalOverlay) return;
    joinModalOverlay.classList.add('active');
    joinModalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeJoinModal() {
    if (!joinModalOverlay) return;
    joinModalOverlay.classList.remove('active');
    joinModalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  joinModalOpenTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openJoinModal();
    });
  });

  if (joinModalCloseBtn) {
    joinModalCloseBtn.addEventListener('click', closeJoinModal);
  }

  if (joinModalOverlay) {
    joinModalOverlay.addEventListener('click', (e) => {
      if (e.target === joinModalOverlay) closeJoinModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && joinModalOverlay && joinModalOverlay.classList.contains('active')) {
      closeJoinModal();
    }
  });

  // --- 3. ACCORDION FAQ ---
  // Handled natively by <details name="faq-accordion"> — the browser guarantees
  // only one can be open at a time, no JS needed.

  // --- 4. LEAD FORM SUBMISSION (Embedded Form) ---
  const leadForm = document.getElementById('lead-form');
  const formSuccess = document.getElementById('form-success');

  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      if (window.dmHandleLandingCheckout) {
        window.dmHandleLandingCheckout(e, { leadForm, formSuccess, fireConfetti });
        return;
      }

      e.preventDefault();

      const name = document.getElementById('lf-name').value.trim();
      const email = document.getElementById('lf-email').value.trim();
      const phone = document.getElementById('lf-phone').value.trim();
      const password = document.getElementById('lf-password').value;
      const confirmPassword = document.getElementById('lf-confirm-password').value;
      const passwordError = document.getElementById('password-error');

      // Passwords never leave the browser -- not sent via WhatsApp or anywhere else.
      if (password !== confirmPassword) {
        if (passwordError) passwordError.classList.remove('hidden');
        document.getElementById('lf-confirm-password').focus();
        return;
      }
      if (passwordError) passwordError.classList.add('hidden');

      leadForm.classList.add('hidden');
      if (formSuccess) {
        formSuccess.classList.remove('hidden');
        fireConfetti(document.getElementById('confetti-container'));
      }

      // WhatsApp link generation (no password included, for security)
      const whatsappMsg = encodeURIComponent(
        `Hi Esha Ma'am! I just booked Brain Mapping via the Landing Page.\n\n👤 Name: ${name}\n📧 Email: ${email}\n📱 Phone: ${phone}\n\nPlease confirm my fingerprint scan slot!`
      );

      const whatsappBtn = document.getElementById('success-whatsapp-btn');
      if (whatsappBtn) {
        whatsappBtn.href = `https://wa.me/919680102276?text=${whatsappMsg}`;
      }
    });
  }

  // Smooth scroll for anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

});
