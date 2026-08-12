import express from 'express';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getUploadsDir } from './lib/paymentProof.js';
import { getMessageUploadsDir } from './lib/messageAttachments.js';
import { getBlogImagesDir, hydrateBlogImagesFromStore } from './lib/blogImages.js';
import { seedAdmin, seedCounsellors, initDatabase, flushDatabase, getDbStatus } from './db.js';
import { disconnectMongo, pingMongo } from './lib/mongo.js';
import { APP_VERSION } from './version.js';
import { seedSampleSlots, getAvailableSlots } from './lib/slots.js';
import { migrateLegacyPayments, handlePhonePeWebhook, handleRazorpayWebhook } from './lib/paymentService.js';
import { isGatewayEnabled, getGatewayPublicConfig } from './lib/paymentGateway.js';
import { validatePhonePeCallback } from './lib/phonepeClient.js';
import { isEmailConfigured } from './utils/mail.js';
import { loadCareersData } from './lib/careersData.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import counsellorRoutes from './routes/counsellor.js';
import userRoutes from './routes/user.js';
import chatbotRoutes from './routes/chatbot.js';
import careersRoutes from './routes/careers.js';
import paymentsRoutes from './routes/payments.js';
import contactRoutes from './routes/contact.js';
import blogRoutes from './routes/blog.js';
import whatsappRoutes from './routes/whatsapp.js';
import cronRoutes from './routes/cron.js';
import pagesRoutes from './routes/pages.js';
import { getWhatsAppPublicConfig } from './lib/whatsapp/events.js';
import { startWhatsAppScheduler } from './lib/whatsapp/scheduler.js';
import { getAllStudioLandings } from './lib/studioLandings.js';
import { isLandingPublished } from './lib/studioLandingMeta.js';
import { ensureLandingFilesOnDisk } from './lib/studioLandingStore.js';
import { seedStudioLandings } from './lib/studioLandingSeed.js';
import { listSkillMappingCombos, comboSummary } from './lib/skillMappingCombos.js';
import landingRoutes from './routes/landing.js';

dotenv.config();

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET must be set in production.');
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, '../client/dist');
const hasBuiltClient = fs.existsSync(path.join(clientDist, 'index.html'));

const app = express();
const PORT = process.env.PORT || 5001;
const isProd = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);
app.use(compression({ threshold: 1024 }));
app.disable('x-powered-by');

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      'http://localhost:5000',
      'http://127.0.0.1:5000',
      'http://localhost:5001',
      'http://127.0.0.1:5001',
      ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ];

app.use(cors({ origin: corsOrigins, credentials: true }));

/** Razorpay webhook — raw body required for signature verification */
app.post('/api/payments/webhook/razorpay', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    if (!isGatewayEnabled()) {
      return res.status(503).json({ message: 'Payment gateway is disabled. Manual admin confirmation only.' });
    }
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const rawBody = req.body?.toString?.() || '';
    const body = rawBody ? JSON.parse(rawBody) : {};
    const result = handleRazorpayWebhook(body, signature, secret, rawBody);
    res.json(result);
  } catch (e) {
    console.error('Razorpay webhook error', e);
    res.status(400).json({ message: e.message || 'Webhook failed' });
  }
});

/** Legacy PhonePe path — still accepts in-flight callbacks during migration */
app.post('/api/payments/webhook/phonepe', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const rawBody = req.body?.toString?.() || '';
    const authorization =
      req.headers.authorization ||
      req.headers.Authorization ||
      req.headers['x-verify'] ||
      '';
    const callbackResponse = validatePhonePeCallback(authorization, rawBody);
    const result = handlePhonePeWebhook(callbackResponse);
    res.json(result);
  } catch (e) {
    console.error('PhonePe webhook error', e);
    res.status(400).json({ message: e.message || 'Webhook failed' });
  }
});

const landingCheckoutBridge = path.join(__dirname, 'assets/landing-checkout.js');
if (fs.existsSync(landingCheckoutBridge)) {
  app.get('/studio/checkout-bridge.js', (_req, res) => {
    res.type('application/javascript');
    res.sendFile(landingCheckoutBridge, { maxAge: isProd ? '1h' : 0 });
  });
}

const landingPagesDir = path.join(__dirname, '../Landing Pages');
if (fs.existsSync(landingPagesDir)) {
  const sharedDir = path.join(landingPagesDir, 'shared');
  if (fs.existsSync(sharedDir)) {
    app.use('/studio/shared/', express.static(sharedDir, { maxAge: isProd ? '1h' : 0 }));
    app.get('/studio/shared-responsive.css', (_req, res) => {
      res.type('text/css');
      res.sendFile(path.join(sharedDir, 'responsive.css'), { maxAge: isProd ? '1h' : 0 });
    });
  }
  app.get('/studio/:slug', (req, res, next) => {
    const meta = getAllStudioLandings().find((l) => l.slug === req.params.slug);
    if (!meta) return next();
    if (req.path !== `/studio/${req.params.slug}`) return next();
    const exists = ensureLandingFilesOnDisk(meta);
    if (!isLandingPublished(req.params.slug, exists)) {
      return res.status(404).send('Landing page is offline');
    }
    res.redirect(301, `/studio/${req.params.slug}/`);
  });
  app.use('/studio/:slug', (req, res, next) => {
    const meta = getAllStudioLandings().find((l) => l.slug === req.params.slug);
    if (!meta) return next();
    const exists = ensureLandingFilesOnDisk(meta);
    const dir = path.join(landingPagesDir, meta.folder);
    if (!exists || !fs.existsSync(dir)) return next();
    if (!isLandingPublished(req.params.slug, true)) {
      return res.status(404).send('Landing page is offline');
    }
    express.static(dir, { index: 'index.html', maxAge: isProd ? '1h' : 0, redirect: false })(req, res, next);
  });
}

app.use(express.json({ limit: '12mb' }));

app.use('/api/uploads/payment-proofs', express.static(getUploadsDir(), { maxAge: isProd ? '7d' : 0 }));
app.use('/api/uploads/message-files', express.static(getMessageUploadsDir(), { maxAge: isProd ? '7d' : 0 }));
app.use('/api/uploads/blog-images', express.static(getBlogImagesDir(), { maxAge: isProd ? '30d' : 0 }));

async function buildHealthPayload() {
  const dbStatus = getDbStatus();
  let mongoPing = null;
  if (dbStatus.mongo.configured) {
    try {
      mongoPing = await pingMongo();
    } catch (e) {
      mongoPing = { ok: false, error: e?.message || 'MongoDB ping failed' };
    }
  }

  const launch = {
    jwtConfigured: Boolean(process.env.JWT_SECRET?.trim()),
    mongoConfigured: dbStatus.mongo.configured,
    mongoConnected: dbStatus.mode === 'mongodb' && dbStatus.mongo.ready === true,
    clientBuilt: hasBuiltClient,
    /** Production must use MongoDB — file mode loses data on redeploy */
    productionDatabaseOk: !isProd || dbStatus.mode === 'mongodb',
  };

  const issues = [];
  if (isProd && !launch.jwtConfigured) issues.push('JWT_SECRET missing');
  if (isProd && !launch.mongoConfigured) issues.push('MONGODB_URI missing');
  if (isProd && launch.mongoConfigured && !launch.mongoConnected) issues.push('MongoDB not connected');
  if (isProd && dbStatus.mode === 'file') issues.push('Using file database in production');

  const ok = issues.length === 0;

  return {
    ok,
    ready: ok,
    ts: Date.now(),
    version: process.env.RENDER_GIT_COMMIT?.slice(0, 7) || APP_VERSION,
    env: isProd ? 'production' : 'development',
    db: {
      ...dbStatus,
      mongo: { ...dbStatus.mongo, ping: mongoPing },
    },
    payments: getGatewayPublicConfig(),
    email: { configured: isEmailConfigured() },
    whatsapp: getWhatsAppPublicConfig(),
    launch,
    issues,
  };
}

app.get('/api/health', async (_, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const health = await buildHealthPayload();
    res.status(health.ok ? 200 : 503).json(health);
  } catch (e) {
    res.status(503).json({
      ok: false,
      ready: false,
      ts: Date.now(),
      version: process.env.RENDER_GIT_COMMIT?.slice(0, 7) || APP_VERSION,
      error: e?.message || 'Health check failed',
    });
  }
});

app.get('/api/warmup', (_, res) => {
  try {
    loadCareersData();
    getAvailableSlots({ from: new Date().toISOString() });
  } catch {
    /* warm paths best-effort */
  }
  res.set('Cache-Control', 'no-store');
  res.json({ ok: true, ready: true, ts: Date.now() });
});

app.get('/api/skill-mapping-combos', (req, res) => {
  res.set('Cache-Control', 'public, max-age=120');
  const combos = listSkillMappingCombos({ activeOnly: true }).map((c) => ({
    id: c.id,
    name: c.name,
    instruments: c.instruments,
    summary: comboSummary(c),
    instrumentCount: c.instruments?.length || 0,
  }));
  res.json({ combos });
});

app.get('/api/slots/available', (req, res) => {
  const from = req.query.from || new Date().toISOString();
  const to = req.query.to;
  res.set('Cache-Control', 'public, max-age=60');
  res.json({ slots: getAvailableSlots({ from, to }) });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/counsellor', counsellorRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/landing', landingRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/webhooks/whatsapp', whatsappRoutes);
app.use('/api/cron', cronRoutes);

/** Legacy junk URLs (old store listings indexed by Google) → homepage */
const LEGACY_HOME_REDIRECTS = [
  /^\/items(?:\/|$)/i,
  /^\/item(?:\/|$)/i,
  /^\/product(?:\/|$)/i,
  /^\/products(?:\/|$)/i,
  /^\/shop(?:\/|$)/i,
  /^\/store(?:\/|$)/i,
];

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();

  const pathOnly = (req.path || '/').replace(/\/{2,}/g, '/');
  const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';

  if (LEGACY_HOME_REDIRECTS.some((re) => re.test(pathOnly))) {
    return res.redirect(301, `/${qs}`);
  }

  if (pathOnly !== req.path) {
    return res.redirect(301, `${pathOnly}${qs}`);
  }

  return next();
});

/** Unmatched API routes return JSON 404 (not SPA index.html) */
app.use('/api', (req, res) => {
  res.status(404).json({ ok: false, message: 'API route not found', path: req.path });
});

if (hasBuiltClient) {
  app.use(
    express.static(clientDist, {
      index: false,
      setHeaders(res, filePath) {
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-cache');
          return;
        }
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          return;
        }
        if (filePath.endsWith('.json')) {
          res.setHeader('Cache-Control', 'public, max-age=3600');
        }
      },
    })
  );
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  if (req.path?.startsWith('/api')) {
    return res.status(500).json({
      ok: false,
      message: 'Internal Server Error',
      error: isProd ? undefined : (err?.message || String(err)),
    });
  }
  res.status(500).send('Internal Server Error');
});

async function startServer() {
  try {
    const dbInfo = await initDatabase();
    seedAdmin();
    seedCounsellors();

    app.listen(PORT, '0.0.0.0', () => {
      console.log('');
      console.log('  Dream Mantra is running!');
      console.log(`  Database: ${dbInfo.mode}`);
      if (hasBuiltClient && isProd) {
        console.log(`  Open in browser: http://localhost:${PORT}`);
      } else if (hasBuiltClient) {
        console.log(`  API: http://localhost:${PORT}`);
        console.log('  Dev UI (latest code): http://localhost:5173/login');
        console.log('  Tip: use port 5173 in dev — port 5000 may serve an older built UI');
      } else {
        console.log(`  API: http://localhost:${PORT}`);
        console.log('  Build the site first: npm run build');
        console.log('  Or use dev mode: npm run dev  →  http://localhost:5173/login');
      }
      console.log('');

      setImmediate(() => {
        try {
          loadCareersData();
          seedSampleSlots();
          listSkillMappingCombos();
          migrateLegacyPayments();
          const seeded = seedStudioLandings();
          if (seeded.restored || seeded.hydrated) {
            console.log(`  Studio landings: ${seeded.customCount} custom, ${seeded.hydrated} hydrated${seeded.restored ? ' (restored missing)' : ''}`);
          }
          const blogImages = hydrateBlogImagesFromStore();
          if (blogImages) console.log(`  Blog images hydrated: ${blogImages}`);
          const pay = getGatewayPublicConfig();
          console.log(`  Payments: ${pay.mode}${pay.gatewayEnabled ? ' (Razorpay live)' : ' (manual UPI + admin verify)'}`);
          startWhatsAppScheduler();
        } catch (err) {
          console.error('Background startup task failed:', err.message);
        }
      });
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n  Port ${PORT} is already in use. Stop the other process or set PORT in .env\n`);
      } else {
        console.error('\n  Server failed to start:', err.message, '\n');
      }
      process.exit(1);
    });
  } catch (err) {
    console.error('\n  Database startup failed:', err.message, '\n');
    process.exit(1);
  }
}

async function shutdown() {
  try {
    await flushDatabase();
    await disconnectMongo();
  } catch (err) {
    console.error('Shutdown error:', err.message);
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();
