/**
 * Finish Resend email for password-reset OTP:
 * 1. Optionally add DNS on GoDaddy (if GODADDY_API_KEY + GODADDY_API_SECRET set)
 * 2. Poll Resend until dreammantra.in is verified
 * 3. Set RESEND_FROM on Render and redeploy
 * 4. Smoke-test forgot-password API
 *
 * Usage:
 *   $env:RESEND_API_KEY = "re_..."
 *   $env:RENDER_API_KEY = "rnd_..."
 *   node scripts/complete-resend-email.js
 */
const { spawn } = require('node:child_process');
const path = require('node:path');

const DOMAIN = 'dreammantra.in';
const RESEND_FROM = 'Dream Mantra <noreply@dreammantra.in>';
const SERVICE_ID = process.env.RENDER_SERVICE_ID || 'srv-d8en4919rddc73chhqh0';
const TEST_EMAIL = process.env.TEST_EMAIL || 'ishantgoyal531@gmail.com';
const LIVE_URL = process.env.LIVE_URL || 'https://dreammantra.in';

function requireEnv(name) {
  const v = process.env[name]?.trim();
  if (!v) {
    console.error(`\nMissing ${name}\n`);
    process.exit(1);
  }
  return v;
}

async function resendApi(apiPath, options = {}) {
  const key = requireEnv('RESEND_API_KEY');
  const res = await fetch(`https://api.resend.com${apiPath}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  if (!res.ok) throw new Error(`Resend ${apiPath} (${res.status}): ${JSON.stringify(body)}`);
  return body;
}

async function getDomainDetail() {
  const list = await resendApi('/domains');
  const row = list.data?.find((d) => d.name === DOMAIN);
  if (!row) throw new Error(`Domain ${DOMAIN} not found on Resend`);
  return resendApi(`/domains/${row.id}`);
}

async function verifyDomain(id) {
  return resendApi(`/domains/${id}/verify`, { method: 'POST' });
}

async function renderApi(apiPath, options = {}) {
  const key = requireEnv('RENDER_API_KEY');
  const res = await fetch(`https://api.render.com/v1${apiPath}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  if (!res.ok) throw new Error(`Render ${apiPath} (${res.status}): ${JSON.stringify(body)}`);
  return body;
}

async function setRenderFrom() {
  await renderApi(`/services/${SERVICE_ID}/env-vars/RESEND_FROM`, {
    method: 'PUT',
    body: JSON.stringify({ value: RESEND_FROM }),
  });
  console.log('Render RESEND_FROM →', RESEND_FROM);
}

async function triggerDeploy() {
  await renderApi(`/services/${SERVICE_ID}/deploys`, {
    method: 'POST',
    body: JSON.stringify({ clearCache: 'clear' }),
  });
  console.log('Render deploy triggered');
}

async function waitForLive(maxMinutes = 15) {
  for (let i = 0; i < maxMinutes * 4; i++) {
    await new Promise((r) => setTimeout(r, 15000));
    const deploys = await renderApi(`/services/${SERVICE_ID}/deploys?limit=1`);
    const st = deploys[0]?.deploy?.status;
    process.stdout.write(`  deploy: ${st}\n`);
    if (st === 'live') return;
    if (st === 'build_failed' || st === 'update_failed') {
      throw new Error(`Deploy failed: ${st}`);
    }
  }
  console.warn('Deploy still in progress — continuing smoke test anyway');
}

async function smokeTest() {
  const res = await fetch(`${LIVE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL }),
  });
  const body = await res.json().catch(() => ({}));
  console.log(`\nSmoke test POST /api/auth/forgot-password (${TEST_EMAIL}):`);
  console.log(`  HTTP ${res.status}`, JSON.stringify(body));
  if (res.status === 503) {
    throw new Error('Forgot-password still failing — check Resend domain + RESEND_FROM');
  }
  if (res.status >= 400) {
    throw new Error(`Unexpected status ${res.status}`);
  }
  console.log('\nPassword-reset email delivery is working on production.\n');
}

function runDnsSetup() {
  return new Promise((resolve, reject) => {
    const script = path.join(__dirname, 'setup-resend-dns.js');
    const child = spawn(process.execPath, [script], {
      stdio: 'inherit',
      env: process.env,
    });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`setup-resend-dns exited ${code}`))));
  });
}

async function pollUntilVerified(domainId, maxMinutes = 30) {
  const deadline = Date.now() + maxMinutes * 60 * 1000;
  let attempt = 0;
  while (Date.now() < deadline) {
    attempt += 1;
    const detail = await resendApi(`/domains/${domainId}`);
    console.log(`[${attempt}] Resend ${DOMAIN} status: ${detail.status}`);
    if (detail.status === 'verified') return detail;
    if (attempt % 3 === 0) {
      try {
        await verifyDomain(domainId);
        console.log('  → verify requested');
      } catch (err) {
        console.log('  → verify:', err.message);
      }
    }
    await new Promise((r) => setTimeout(r, 30000));
  }
  throw new Error(
    `Domain still not verified after ${maxMinutes}m. Use Resend → Domains → dreammantra.in → Auto Configure. See RESEND_DNS.md`
  );
}

async function main() {
  console.log(`\nComplete Resend email setup for ${DOMAIN}\n`);

  const hasGodaddy = process.env.GODADDY_API_KEY?.trim() && process.env.GODADDY_API_SECRET?.trim();
  if (hasGodaddy) {
    console.log('Adding DNS via GoDaddy API…\n');
    await runDnsSetup();
  } else {
    console.log('No GoDaddy API keys — add DNS manually or use Resend dashboard:');
    console.log('  https://resend.com/domains → dreammantra.in → Auto Configure (GoDaddy)\n');
    console.log('Exact records: RESEND_DNS.md\n');
  }

  const detail = await getDomainDetail();
  if (detail.status !== 'verified') {
    console.log('Waiting for domain verification…\n');
    await pollUntilVerified(detail.id);
  } else {
    console.log('Domain already verified.\n');
  }

  requireEnv('RENDER_API_KEY');
  await setRenderFrom();
  await triggerDeploy();
  console.log('\nWaiting for Render deploy…\n');
  await waitForLive();
  await smokeTest();
}

main().catch((err) => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
