import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getUploadsDir } from './lib/paymentProof.js';
import { seedAdmin } from './db.js';
import { seedSampleSlots, getAvailableSlots } from './lib/slots.js';
import { migrateLegacyPayments } from './lib/paymentService.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/user.js';
import chatbotRoutes from './routes/chatbot.js';
import careersRoutes from './routes/careers.js';
import paymentsRoutes from './routes/payments.js';
import contactRoutes from './routes/contact.js';

dotenv.config();

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET must be set in production.');
  process.exit(1);
}

seedAdmin();
seedSampleSlots();
migrateLegacyPayments();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distCandidates = [
  path.join(__dirname, '../client/dist'),
  path.join(__dirname, '../frontend/dist'),
];
const clientDist = distCandidates.find((p) => fs.existsSync(path.join(p, 'index.html'))) || distCandidates[1];
const hasBuiltClient = fs.existsSync(path.join(clientDist, 'index.html'));

const app = express();
const PORT = process.env.PORT || 5000;

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5000',
      'http://127.0.0.1:5000',
    ];

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json({ limit: '12mb' }));

app.use('/api/uploads/payment-proofs', express.static(getUploadsDir()));

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.get('/api/slots/available', (req, res) => {
  const from = req.query.from || new Date().toISOString();
  const to = req.query.to;
  res.json({ slots: getAvailableSlots({ from, to }) });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/contact', contactRoutes);

// Production: serve React app from one URL (website + API on same port)
if (hasBuiltClient) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  Dream Mantra is running!');
  if (hasBuiltClient) {
    console.log(`  Open in browser: http://localhost:${PORT}`);
  } else {
    console.log(`  API: http://localhost:${PORT}`);
    console.log('  Build the site first: npm run build');
    console.log('  Or use dev mode: npm run dev  →  http://localhost:5173');
  }
  console.log('');
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  Port ${PORT} is already in use. Stop the other process or set PORT in .env\n`);
  } else {
    console.error('\n  Server failed to start:', err.message, '\n');
  }
  process.exit(1);
});
