(function guidanceModalInit() {
  const CTA_LABEL = 'Book a Free Guidance Call';

  function apiBase() {
    if (window.DM_API_BASE) return String(window.DM_API_BASE).replace(/\/$/, '');
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:5001/api';
    return '/api';
  }

  function openModal() {
    const overlay = document.getElementById('guidance-modal-overlay');
    if (!overlay) return;
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const overlay = document.getElementById('guidance-modal-overlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.js-open-guidance-modal, .js-open-join-modal').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    });

    const closeBtn = document.getElementById('guidance-modal-close-btn');
    const overlay = document.getElementById('guidance-modal-overlay');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay?.classList.contains('active')) closeModal();
    });

    const form = document.getElementById('guidance-form');
    const msg = document.getElementById('guidance-form-msg');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const name = document.getElementById('gf-name')?.value?.trim() || '';
      const email = document.getElementById('gf-email')?.value?.trim() || '';
      const phone = document.getElementById('gf-phone')?.value?.trim() || '';
      const message = document.getElementById('gf-message')?.value?.trim() || '';
      const studio = document.body.dataset.dmStudio || 'guidance-landing';
      const body = message.length >= 5
        ? message
        : `${CTA_LABEL} request from ${studio} landing page.`;

      if (msg) {
        msg.className = 'guidance-form-msg';
        msg.textContent = '';
        msg.hidden = true;
      }
      if (submitBtn) submitBtn.disabled = true;

      try {
        const res = await fetch(`${apiBase()}/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            phone,
            message: `[${studio}] ${body}`,
            source: `guidance_landing_${studio}`,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not send your request.');
        if (msg) {
          msg.hidden = false;
          msg.className = 'guidance-form-msg guidance-form-msg--ok';
          msg.textContent = data.message || 'Thank you! We will call you soon for your free guidance conversation.';
        }
        form.reset();
      } catch (err) {
        if (msg) {
          msg.hidden = false;
          msg.className = 'guidance-form-msg guidance-form-msg--err';
          msg.textContent = err.message || 'Could not send. Please call 9680102276.';
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  });
})();
