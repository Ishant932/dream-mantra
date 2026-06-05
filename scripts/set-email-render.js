/**
 * Set email env vars on Render and redeploy.
 *
 * Usage (Resend — recommended):
 *   $env:RENDER_API_KEY = "rnd_..."
 *   $env:RESEND_API_KEY = "re_..."
 *   $env:RESEND_FROM = "Dream Mantra <onboarding@resend.dev>"
 *   node scripts/set-email-render.js
 *
 * Or Gmail SMTP:
 *   $env:SMTP_USER = "your@gmail.com"
 *   $env:SMTP_PASS = "app-password"
 *   node scripts/set-email-render.js
 */
const API = 'https://api.render.com/v1';
const SERVICE_ID = process.env.RENDER_SERVICE_ID || 'srv-d8en4919rddc73chhqh0';

async function api(path, options = {}) {
  const key = process.env.RENDER_API_KEY;
  if (!key) {
    console.error('\nMissing RENDER_API_KEY.\n');
    process.exit(1);
  }
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) throw new Error(`${res.status} ${path}: ${JSON.stringify(data)}`);
  return data;
}

async function upsertEnvVar(key, value) {
  return api(`/services/${SERVICE_ID}/env-vars/${encodeURIComponent(key)}`, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  });
}

async function triggerDeploy() {
  return api(`/services/${SERVICE_ID}/deploys`, {
    method: 'POST',
    body: JSON.stringify({ clearCache: 'clear' }),
  });
}

async function main() {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const smtpUser = process.env.SMTP_USER?.trim() || process.env.EMAIL_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim() || process.env.EMAIL_PASS?.trim();

  if (!resendKey && !(smtpUser && smtpPass)) {
    console.error('\nSet RESEND_API_KEY or SMTP_USER + SMTP_PASS first.\n');
    console.error('Resend (free): https://resend.com/api-keys\n');
    process.exit(1);
  }

  console.log('Configuring email on Render...\n');

  if (resendKey) {
    await upsertEnvVar('RESEND_API_KEY', resendKey);
    if (process.env.RESEND_FROM?.trim()) {
      await upsertEnvVar('RESEND_FROM', process.env.RESEND_FROM.trim());
    }
    console.log('RESEND_API_KEY saved.');
  } else {
    await upsertEnvVar('SMTP_USER', smtpUser);
    await upsertEnvVar('SMTP_PASS', smtpPass);
    if (process.env.SMTP_HOST?.trim()) await upsertEnvVar('SMTP_HOST', process.env.SMTP_HOST.trim());
    if (process.env.SMTP_PORT?.trim()) await upsertEnvVar('SMTP_PORT', process.env.SMTP_PORT.trim());
    if (process.env.EMAIL_FROM?.trim()) await upsertEnvVar('EMAIL_FROM', process.env.EMAIL_FROM.trim());
    console.log('SMTP credentials saved.');
  }

  console.log('Redeploying...');
  await triggerDeploy();
  console.log('\nDeploy started. OTP emails will work after build completes.\n');
}

main().catch((err) => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
