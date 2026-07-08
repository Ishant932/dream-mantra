import { Router } from 'express';
import { getBotReply } from '../lib/botReply.js';

const router = Router();

router.post('/message', async (req, res) => {
  const { message, lang = 'en', history = [] } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ message: 'Message required' });
  }

  const { reply, source, botName } = await getBotReply(message.trim(), { lang, history });
  res.json({ reply, source, botName });
});

export default router;
