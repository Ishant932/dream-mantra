/**
 * Set email env vars on Render and redeploy.
 *
 * Usage (Resend — recommended):
 *   $env:RENDER_API_KEY = "rnd_..."
 *   $env:RESEND_API_KEY = "re_..."
 *   $env:RESEND_FROM = "Dream Mantra <onboarding@resend.dev>"
 *   node scripts/set-email-render.js
 *
 * Usage (Gmail SMTP):
 *   $env:SMTP_USER = "dreamz.roadmap@gmail.com"
 *   $env:SMTP_PASS = "your-app-password"
 *   node scripts/set-email-render.js
 */
const API = 'https://api.render.com/v1';
const SERVICE_NAME = 'dream-mantra';

const ENV_MAP = [
  ['RESEND_API_KEY', process.env.RESEND_API_KEY],
  ['RESEND_FROM', process.env.RESEND_FROM],
  ['EMAIL_FROM', process.env.EMAIL_FROM],
  ['SMTP_HOST', process.env.SMTP_HOST || (process.env.SMTP_PASS || process.env.SMTP_USER ? 'smtp.gmail.com' : undefined)],
  ['SMTP_PORT', process.env.SMTP_PORT || (process.env.SMTP_PASS || process.env.SMTP_USER ? '587' : undefined)],
  ['SMTP_USER', process.env.SMTP_USER || process.env.EMAIL_USER],
  ['SMTP_PASS', process.env.SMTP_PASS || process.env.EMAIL_PASS],
  ['EMAIL_USER', process.env.EMAIL_USER],
  ['EMAIL_PASS', process.env.EMAIL_PASS],
];

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

async function findService() {
  const res = await api('/services?limit=50');
  const list = Array.isArray(res) ? res : res?.data || [];
  const service = list.find(
    (s) => s.service?.name === SERVICE_NAME || s.service?.slug === SERVICE_NAME
  )?.service;
  if (!service?.id) throw new Error(`Service "${SERVICE_NAME}" not found.`);
  return service;
}

async function upsertEnvVar(serviceId, key, value) {
  if (!value?.trim()) return;
  await api(`/services/${serviceId}/env-vars/${encodeURIComponent(key)}`, {
    method: 'PUT',
    body: JSON.stringify({ value: value.trim() }),
  });
  console.log(`  ${key} ✓`);
}

async function main() {
  const hasResend = Boolean(process.env.RESEND_API_KEY?.trim());
  const hasSmtp = Boolean(
    (process.env.SMTP_USER || process.env.EMAIL_USER)?.trim() &&
      (process.env.SMTP_PASS || process.env.EMAIL_PASS)?.trim()
  );

  if (!hasResend && !hasSmtp) {
    console.error('\nSet RESEND_API_KEY or SMTP_USER + SMTP_PASS first.\n');
    console.error('Resend (free): https://resend.com/api-keys\n');
    process.exit(1);
  }

  console.log('\nLinking email to Render...\n');
  const service = await findService();
  console.log(`Service: ${service.name}\n`);

  for (const [key, value] of ENV_MAP) {
    await upsertEnvVar(service.id, key, value);
  }

  console.log('\nRedeploying...');
  await api(`/services/${service.id}/deploys`, {
    method: 'POST',
    body: JSON.stringify({ clearCache: 'clear' }),
  });

  console.log('\nDone. Test: https://dreammantra.in/forgot-password\n');
}

main().catch((err) => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
