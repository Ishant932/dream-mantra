/**
 * Optional: register hourly WhatsApp cron on cron-job.org (alternative to GitHub Actions).
 *
 * Usage:
 *   $env:CRON_JOB_ORG_API_KEY = "..."   # cron-job.org → Settings → API key
 *   $env:CRON_SECRET = "dm-wa-cron-..."
 *   node scripts/setup-cron-job-whatsapp.js
 */
const ENDPOINT = 'https://api.cron-job.org';
const JOB_TITLE = 'Dream Mantra WhatsApp hourly';
const TARGET_URL = 'https://dreammantra.in/api/cron/whatsapp';

async function api(path, options = {}) {
  const key = process.env.CRON_JOB_ORG_API_KEY?.trim();
  if (!key) throw new Error('Missing CRON_JOB_ORG_API_KEY');
  const res = await fetch(`${ENDPOINT}${path}`, {
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
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) throw new Error(`${res.status} ${path}: ${JSON.stringify(data)}`);
  return data;
}

function buildJob(secret) {
  return {
    job: {
      title: JOB_TITLE,
      url: TARGET_URL,
      enabled: true,
      saveResponses: true,
      requestMethod: 1,
      requestTimeout: 120,
      extendedData: {
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
      },
      schedule: {
        timezone: 'Asia/Kolkata',
        expiresAt: 0,
        hours: [-1],
        mdays: [-1],
        minutes: [0],
        months: [-1],
        wdays: [-1],
      },
    },
  };
}

async function main() {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) throw new Error('Missing CRON_SECRET');

  const existing = await api('/jobs');
  const jobs = existing.jobs || [];
  const found = jobs.find((j) => j.title === JOB_TITLE || j.url === TARGET_URL);

  if (found?.jobId) {
    console.log(`Updating existing job ${found.jobId}...`);
    await api(`/jobs/${found.jobId}`, {
      method: 'PATCH',
      body: JSON.stringify(buildJob(secret)),
    });
    console.log('Updated cron-job.org WhatsApp hourly job.');
    return;
  }

  console.log('Creating cron-job.org WhatsApp hourly job...');
  const created = await api('/jobs', {
    method: 'PUT',
    body: JSON.stringify(buildJob(secret)),
  });
  console.log('Created:', JSON.stringify(created));
}

main().catch((err) => {
  console.error('\nFailed:', err.message);
  process.exit(1);
});
