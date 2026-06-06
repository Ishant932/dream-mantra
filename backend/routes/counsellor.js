import { Router } from 'express';
import { authRequired, counsellorRequired } from '../middleware/auth.js';
import { listPaymentsForAdmin } from '../lib/paymentService.js';
import { registerStaffRoutes } from './staffHandlers.js';

const router = Router();
router.use(authRequired, counsellorRequired);
registerStaffRoutes(router);

router.get('/payments', (req, res) => {
  const result = listPaymentsForAdmin({
    status: 'all',
    limit: Math.min(Number(req.query.limit) || 200, 500),
    page: 1,
  });
  res.json(result);
});

export default router;
