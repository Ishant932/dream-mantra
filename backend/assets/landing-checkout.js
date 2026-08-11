(function () {
  const TOKEN_KEY = 'dm_token';

  function appOrigin() {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return window.location.origin;
    }
    return 'https://dreammantra.in';
  }

  function apiBase() {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return `${window.location.origin}/api`;
    }
    return `${window.location.origin}/api`;
  }

  window.dmHandleLandingCheckout = async function (e, ctx) {
    e.preventDefault();
    const leadForm = ctx.leadForm;
    const formSuccess = ctx.formSuccess;
    const productSlug = document.body.dataset.dmProduct;
    const studioSlug = document.body.dataset.dmStudio;

    if (!productSlug) {
      alert('Program not configured for this page.');
      return;
    }

    const name = document.getElementById('lf-name').value.trim();
    const email = document.getElementById('lf-email').value.trim();
    const phone = document.getElementById('lf-phone').value.trim();
    const password = document.getElementById('lf-password').value;
    const phoneDigits = phone.replace(/\D/g, '');
    const mobile = phoneDigits.length === 12 && phoneDigits.startsWith('91')
      ? phoneDigits.slice(2)
      : phoneDigits.length === 11 && phoneDigits.startsWith('0')
        ? phoneDigits.slice(1)
        : phoneDigits;
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      alert('Please enter a valid 10-digit mobile number');
      document.getElementById('lf-phone').focus();
      return;
    }
    const confirmPassword = document.getElementById('lf-confirm-password').value;
    const passwordError = document.getElementById('password-error');
    const submitBtn = leadForm.querySelector('button[type="submit"]');

    if (password !== confirmPassword) {
      if (passwordError) passwordError.classList.remove('hidden');
      document.getElementById('lf-confirm-password').focus();
      return;
    }
    if (passwordError) passwordError.classList.add('hidden');

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Please wait…</span>';
    }

    try {
      const res = await fetch(`${apiBase()}/landing/signup-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: mobile,
          password,
          productSlug,
          studioSlug,
          source: `studio-${studioSlug || productSlug}`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Signup failed');

      localStorage.setItem(TOKEN_KEY, data.token);
      const payPath = data.paymentUrl || '/dashboard';
      window.location.href = `${appOrigin()}${payPath}`;
    } catch (err) {
      alert(err.message || 'Something went wrong. Please try again.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>JOIN NOW</span><i class="fa-solid fa-arrow-right"></i>';
      }
    }
  };
})();
