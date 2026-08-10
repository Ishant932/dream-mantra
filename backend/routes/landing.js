import { Router } from 'express';
import { rateLimit } from '../middleware/rateLimit.js';
import { landingSignupCheckout } from '../lib/landingCheckoutService.js';

const router = Router();

router.post(
  '/signup-checkout',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20, keyPrefix: 'landing-checkout' }),
  (req, res) => {
    try {
      const result = landingSignupCheckout(req.body || {});
      res.status(201).json(result);
    } catch (e) {
      res.status(400).json({ message: e.message || 'Could not complete signup' });
    }
  }
);

export default router;
