import { Router } from 'express';
import { authRequired, counsellorRequired } from '../middleware/auth.js';
import { listPaymentsForAdmin } from '../lib/paymentService.js';
import { getData } from '../lib/database.js';
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
  const assignedIds = assignedStudentIds(getData(), req.user.id);
  const payments = (result.payments || []).filter((p) => assignedIds.has(Number(p.user_id)));
  res.json({ ...result, payments, total: payments.length });
});

function assignedStudentIds(data, counsellorId) {
  const cid = typeof counsellorId === 'number' ? counsellorId : Number(counsellorId);
  return new Set(
    (data.users || [])
      .filter((u) => u.role === 'user' && Number(u.assigned_counsellor_id) === cid)
      .map((u) => Number(u.id))
  );
}

export default router;
