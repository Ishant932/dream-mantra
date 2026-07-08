import { Router } from 'express';
import express from 'express';
import { getWhatsAppProvider, verifyToken } from '../lib/whatsapp/config.js';
import { handleInboundMessage } from '../lib/whatsapp/events.js';
import { parseInboundWebhook, verifyWebhookGet } from '../lib/whatsapp/providers/index.js';

const router = Router();

/** Meta webhook verification (ignored for Twilio) */
router.get('/', (req, res) => {
  const provider = getWhatsAppProvider();
  if (provider === 'twilio') {
    return res.status(200).json({ ok: true, provider: 'twilio' });
  }

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken()) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

/** Inbound messages — Meta JSON or Twilio form-urlencoded */
router.post('/', express.urlencoded({ extended: false }), async (req, res) => {
  res.sendStatus(200);

  try {
    const provider = getWhatsAppProvider();
    const messages = parseInboundWebhook(req.body, provider);

    for (const msg of messages) {
      await handleInboundMessage({
        from: msg.from,
        text: msg.text,
        messageId: msg.messageId,
      });
    }
  } catch (err) {
    console.error('[whatsapp] webhook error:', err.message);
  }
});

export default router;
