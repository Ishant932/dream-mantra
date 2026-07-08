import { cronSecret, isWhatsAppEnabled } from './config.js';
import { processOutbox, runReminderScan } from './events.js';

const HOUR_MS = 60 * 60 * 1000;
const OUTBOX_MS = 2 * 60 * 1000;
const BOOT_DELAY_MS = 30 * 1000;

let running = false;
let flushing = false;

async function flushOutbox() {
  if (flushing) return;
  flushing = true;
  try {
    const outbox = await processOutbox({ limit: 100 });
    if (outbox.processed) console.log('[whatsapp-scheduler] outbox', JSON.stringify(outbox));
  } catch (err) {
    console.error('[whatsapp-scheduler] outbox failed:', err.message);
  } finally {
    flushing = false;
  }
}

async function tick() {
  if (running) return;
  running = true;
  try {
    const reminders = runReminderScan();
    const outbox = await processOutbox({ limit: 100 });
    console.log('[whatsapp-scheduler] ok', JSON.stringify({ reminders, outbox }));
  } catch (err) {
    console.error('[whatsapp-scheduler] failed:', err.message);
  } finally {
    running = false;
  }
}

/** Fast outbox flush + hourly reminder scan while the web service is running. */
export function startWhatsAppScheduler() {
  if (process.env.WHATSAPP_INTERNAL_CRON === 'false') return;
  if (!isWhatsAppEnabled() || !cronSecret()) return;

  setTimeout(() => {
    flushOutbox();
    tick();
    setInterval(flushOutbox, OUTBOX_MS);
    setInterval(tick, HOUR_MS);
  }, BOOT_DELAY_MS);

  console.log('  WhatsApp scheduler: outbox every 2m + reminders hourly');
}
