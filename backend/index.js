import express from 'express';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getUploadsDir } from './lib/paymentProof.js';
import { getMessageUploadsDir } from './lib/messageAttachments.js';
import { seedAdmin, seedCounsellors, initDatabase, flushDatabase, getDbStatus } from './db.js';
import { disconnectMongo } from './lib/mongo.js';
import { APP_VERSION } from './version.js';
import { seedSampleSlots, getAvailableSlots } from './lib/slots.js';
import { migrateLegacyPayments, handleRazorpayWebhook } from './lib/paymentService.js';
import { isGatewayEnabled, getGatewayPublicConfig } from './lib/paymentGateway.js';
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

dotenv.config();

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET must be set in production.');
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, '../client/dist');
const hasBuiltClient = fs.existsSync(path.join(clientDist, 'index.html'));

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);
app.use(compression({ threshold: 1024 }));
app.disable('x-powered-by');

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5000',
      'http://127.0.0.1:5000',
      ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ];

app.use(cors({ origin: corsOrigins, credentials: true }));

/** Razorpay webhook must use raw body for signature verification */
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
    console.error('Webhook error', e);
    res.status(400).json({ message: e.message || 'Webhook failed' });
  }
});

app.use(express.json({ limit: '12mb' }));

app.use('/api/uploads/payment-proofs', express.static(getUploadsDir(), { maxAge: isProd ? '7d' : 0 }));
app.use('/api/uploads/message-files', express.static(getMessageUploadsDir(), { maxAge: isProd ? '7d' : 0 }));

app.get('/api/health', (_, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({
    ok: true,
    ts: Date.now(),
    version: process.env.RENDER_GIT_COMMIT?.slice(0, 7) || APP_VERSION,
    db: getDbStatus(),
    payments: getGatewayPublicConfig(),
    email: { configured: isEmailConfigured() },
  });
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
app.use('/api/blog', blogRoutes);

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
          migrateLegacyPayments();
          const pay = getGatewayPublicConfig();
          console.log(`  Payments: ${pay.mode}${pay.gatewayEnabled ? ' (Razorpay live)' : ' (manual UPI + admin verify)'}`);
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
