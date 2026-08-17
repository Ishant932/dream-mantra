/**
 * DigitalOcean App Platform spec (JSON) — mirrors .do/app.yaml
 * Used by scripts/deploy-digitalocean.js for API deploys.
 */
export const APP_NAME = 'dream-mantra';
export const GITHUB_REPO = 'DreamsMantra/dream-mantra';

/** Non-secret defaults; secrets are merged at deploy time from Render or env. */
export function buildAppSpec(secretEnvs = []) {
  const baseEnvs = [
    { key: 'NODE_ENV', scope: 'RUN_AND_BUILD_TIME', value: 'production', type: 'GENERAL' },
    { key: 'JWT_EXPIRES_IN', scope: 'RUN_TIME', value: '7d', type: 'GENERAL' },
    { key: 'ADMIN_EMAIL', scope: 'RUN_TIME', value: 'admin@dreamsmantra.com', type: 'GENERAL' },
    { key: 'ADMIN_PHONE', scope: 'RUN_TIME', value: '9680102276', type: 'GENERAL' },
    { key: 'ADMIN2_EMAIL', scope: 'RUN_TIME', value: 'admin2@dreamsmantra.com', type: 'GENERAL' },
    { key: 'ADMIN2_PHONE', scope: 'RUN_TIME', value: '9999999998', type: 'GENERAL' },
    { key: 'ADMIN2_NAME', scope: 'RUN_TIME', value: 'Dream Mantra Admin 2', type: 'GENERAL' },
    { key: 'ADMIN_REQUIRE_2FA', scope: 'RUN_TIME', value: 'true', type: 'GENERAL' },
    { key: 'APP_PUBLIC_URL', scope: 'RUN_TIME', value: 'https://dreammantra.in', type: 'GENERAL' },
    { key: 'SEED_SAMPLE_SLOTS', scope: 'RUN_TIME', value: 'true', type: 'GENERAL' },
    { key: 'WHATSAPP_ENABLED', scope: 'RUN_TIME', value: 'false', type: 'GENERAL' },
    { key: 'WHATSAPP_PROVIDER', scope: 'RUN_TIME', value: 'twilio', type: 'GENERAL' },
    { key: 'TWILIO_WHATSAPP_SANDBOX', scope: 'RUN_TIME', value: 'true', type: 'GENERAL' },
    { key: 'WHATSAPP_SITE_URL', scope: 'RUN_TIME', value: 'https://dreammantra.in', type: 'GENERAL' },
  ];

  const secretKeys = new Set(secretEnvs.map((e) => e.key));
  const merged = [
    ...baseEnvs.filter((e) => !secretKeys.has(e.key)),
    ...secretEnvs.map((e) => ({
      key: e.key,
      scope: e.scope || 'RUN_TIME',
      value: e.value,
      type: 'SECRET',
    })),
  ];

  const whatsappCron = `node -e "const s=process.env.CRON_SECRET;if(!s){console.error('CRON_SECRET missing');process.exit(1)}fetch('https://dreammantra.in/api/cron/whatsapp',{method:'POST',headers:{Authorization:'Bearer '+s}}).then(r=>r.text()).then(console.log).catch(e=>{console.error(e);process.exit(1)})"`;

  return {
    name: APP_NAME,
    region: 'sgp',
    services: [
      {
        name: 'web',
        environment_slug: 'node-js',
        github: {
          repo: GITHUB_REPO,
          branch: 'main',
          deploy_on_push: true,
        },
        build_command: 'bash scripts/digitalocean-build.sh',
        run_command: 'node backend/index.js',
        http_port: 8080,
        instance_count: 1,
        instance_size_slug: 'basic-xxs',
        health_check: {
          http_path: '/api/health',
          initial_delay_seconds: 30,
          period_seconds: 30,
          timeout_seconds: 10,
          success_threshold: 1,
          failure_threshold: 3,
        },
        envs: merged,
      },
    ],
    jobs: [
      {
        name: 'whatsapp-cron',
        kind: 'SCHEDULED',
        environment_slug: 'node-js',
        github: {
          repo: GITHUB_REPO,
          branch: 'main',
          deploy_on_push: true,
        },
        instance_count: 1,
        instance_size_slug: 'basic-xxs',
        run_command: whatsappCron,
        schedule: {
          cron: '0 * * * *',
          time_zone: 'Asia/Kolkata',
        },
        envs: merged.filter((e) => e.key === 'CRON_SECRET' || e.key === 'NODE_ENV'),
      },
    ],
    domains: [
      { domain: 'dreammantra.in', type: 'PRIMARY' },
      { domain: 'www.dreammantra.in', type: 'ALIAS' },
    ],
  };
}

/** Keys to copy from Render (secrets + payment/DB). */
export const RENDER_SECRET_KEYS = [
  'JWT_SECRET',
  'ADMIN_PASSWORD',
  'ADMIN2_PASSWORD',
  'ADMIN_RESET_2FA',
  'GEMINI_API_KEY',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
  'PAYMENT_GATEWAY_ENABLED',
  'MONGODB_URI',
  'RESEND_API_KEY',
  'RESEND_FROM',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'EMAIL_FROM',
  'EMAIL_USER',
  'EMAIL_PASS',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_WHATSAPP_FROM',
  'TWILIO_WHATSAPP_SANDBOX_CODE',
  'WHATSAPP_TOKEN',
  'WHATSAPP_PHONE_NUMBER_ID',
  'WHATSAPP_VERIFY_TOKEN',
  'CRON_SECRET',
];
