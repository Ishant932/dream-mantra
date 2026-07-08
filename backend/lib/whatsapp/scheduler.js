import { cronSecret, isWhatsAppEnabled } from './config.js';
import { processOutbox, runReminderScan } from './events.js';

const HOUR_MS = 60 * 60 * 1000;
const BOOT_DELAY_MS = 2 * 60 * 1000;

let running = false;

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

/** Hourly reminders while the web service is running (free-tier friendly). */
export function startWhatsAppScheduler() {
  if (process.env.WHATSAPP_INTERNAL_CRON === 'false') return;
  if (!isWhatsAppEnabled() || !cronSecret()) return;

  setTimeout(() => {
    tick();
    setInterval(tick, HOUR_MS);
  }, BOOT_DELAY_MS);

  console.log('  WhatsApp scheduler: hourly reminders + outbox (internal)');
}
