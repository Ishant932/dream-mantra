import { Router } from 'express';
import { cronSecret } from '../lib/whatsapp/config.js';
import { processOutbox, runReminderScan } from '../lib/whatsapp/events.js';

const router = Router();

function cronAuth(req, res, next) {
  const secret = cronSecret();
  if (!secret) {
    return res.status(503).json({ message: 'CRON_SECRET not configured' });
  }
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : req.query.secret;
  if (token !== secret) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

router.post('/whatsapp', cronAuth, async (req, res) => {
  try {
    const reminders = runReminderScan();
    const outbox = await processOutbox({ limit: 100 });
    res.json({ ok: true, reminders, outbox, ts: Date.now() });
  } catch (err) {
    console.error('[cron] whatsapp failed:', err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;
