import { Router } from 'express';
import { createContactLead } from '../lib/leads.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

router.post('/', rateLimit({ windowMs: 15 * 60 * 1000, max: 8, keyPrefix: 'contact' }), (req, res) => {
  const { name, email, phone, message } = req.body || {};
  const trimmedName = String(name || '').trim();
  const trimmedEmail = String(email || '').trim();
  const trimmedMessage = String(message || '').trim();

  if (!trimmedName || trimmedName.length < 2) {
    return res.status(400).json({ message: 'Please enter your name' });
  }
  if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }
  if (!trimmedMessage || trimmedMessage.length < 5) {
    return res.status(400).json({ message: 'Please enter a message (at least 5 characters)' });
  }

  const lead = createContactLead({
    name: trimmedName,
    email: trimmedEmail,
    phone: phone ? String(phone).trim() : null,
    message: trimmedMessage.slice(0, 2000),
    source: req.body?.source || 'contact_page',
  });

  res.status(201).json({
    ok: true,
    message: 'Thank you! We received your message and will get back to you soon.',
    leadId: lead.id,
  });
});

export default router;
