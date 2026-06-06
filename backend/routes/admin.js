import { Router } from 'express';
import db, { flushDatabase } from '../db.js';
import { authRequired, adminRequired } from '../middleware/auth.js';
import { getAvailableSlots } from '../lib/slots.js';
import { getPaidAssessmentsWithUsers } from '../lib/reports.js';
import { listPaymentsForAdmin, updatePaymentStatus, patchPaymentDetails } from '../lib/paymentService.js';
import { getSiteSettings, updateSiteSettings } from '../lib/siteSettings.js';
import { getPlatformAnalytics } from '../lib/analytics.js';
import { listContactLeads, updateContactLead, countNewLeads } from '../lib/leads.js';
import {
  listModulesForAdmin,
  upsertModule,
  removeModule,
  listVouchers,
  upsertVoucher,
  removeVoucher,
} from '../lib/catalogStore.js';
import {
  listCounsellorStaff,
  createCounsellorStaff,
  updateCounsellorStaff,
  removeCounsellorStaff,
} from '../lib/counsellorStaff.js';
import { registerStaffRoutes } from './staffHandlers.js';

const router = Router();
router.use(authRequired, adminRequired);

router.get('/stats', (req, res) => {
  try {
    const users = db.prepare('SELECT COUNT(*) as c FROM users WHERE role = ?').get('user')?.c ?? 0;
    const consultations = db.prepare('SELECT COUNT(*) as c FROM consultations').get()?.c ?? 0;
    const assessments = db.prepare('SELECT COUNT(*) as c FROM assessments').get()?.c ?? 0;
    const pending = db.prepare("SELECT COUNT(*) as c FROM consultations WHERE status = 'pending'").get()?.c ?? 0;
    const openSlots = getAvailableSlots({ from: new Date().toISOString() }).length;
    const paidCount = getPaidAssessmentsWithUsers().length;
    res.json({ users, consultations, assessments, pending, openSlots, paidCount });
  } catch (e) {
    console.error('GET /admin/stats failed:', e);
    res.status(500).json({ message: e.message || 'Failed to load stats' });
  }
});

registerStaffRoutes(router, { includeStats: false });

router.get('/counsellors', (req, res) => {
  res.json({ counsellors: listCounsellorStaff() });
});

router.post('/counsellors', async (req, res) => {
  try {
    const counsellor = createCounsellorStaff(req.body);
    await flushDatabase();
    res.status(201).json({ counsellor, counsellors: listCounsellorStaff() });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.patch('/counsellors/:id', async (req, res) => {
  try {
    const counsellor = updateCounsellorStaff(req.params.id, req.body);
    await flushDatabase();
    res.json({ counsellor, counsellors: listCounsellorStaff() });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.delete('/counsellors/:id', async (req, res) => {
  try {
    const result = removeCounsellorStaff(req.params.id);
    await flushDatabase();
    res.json({ ...result, counsellors: listCounsellorStaff() });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/analytics', (req, res) => {
  try {
    res.json({ analytics: getPlatformAnalytics() });
  } catch (e) {
    console.error('GET /admin/analytics failed:', e);
    res.status(500).json({ message: e.message || 'Failed to load analytics' });
  }
});

router.get('/payments', (req, res) => {
  const { status, search, page, limit, sort, order } = req.query;
  const result = listPaymentsForAdmin({
    status: status || 'all',
    search: search || '',
    page: Number(page) || 1,
    limit: Math.min(Number(limit) || 20, 100),
    sort: sort || 'created_at',
    order: order || 'desc',
  });
  res.json(result);
});

router.patch('/payments/:id', (req, res) => {
  try {
    const { status, adminNote, amount, userNote, userId } = req.body;
    if (status) {
      const result = updatePaymentStatus(req.params.id, status, {
        adminId: req.user.id,
        adminNote: adminNote || null,
      });
      return res.json(result);
    }
    if (amount != null || adminNote !== undefined || userNote !== undefined || userId != null) {
      const result = patchPaymentDetails(req.params.id, { amount, adminNote, userNote, userId });
      return res.json(result);
    }
    return res.status(400).json({ message: 'Provide status or payment details to update' });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/settings', (req, res) => {
  res.json({ settings: getSiteSettings() });
});

router.patch('/settings', (req, res) => {
  try {
    const settings = updateSiteSettings(req.body);
    res.json({ settings });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/leads', (req, res) => {
  const status = req.query.status || 'all';
  res.json({ leads: listContactLeads({ status }), newCount: countNewLeads() });
});

router.patch('/leads/:id', (req, res) => {
  const lead = updateContactLead(req.params.id, req.body);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  res.json({ lead });
});

router.get('/modules', (req, res) => {
  res.json({ modules: listModulesForAdmin() });
});

router.post('/modules', (req, res) => {
  try {
    const module = upsertModule(req.body);
    res.json({ module, modules: listModulesForAdmin() });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.patch('/modules/:slug', (req, res) => {
  try {
    const module = upsertModule({ ...req.body, slug: req.params.slug });
    res.json({ module, modules: listModulesForAdmin() });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.delete('/modules/:slug', (req, res) => {
  removeModule(req.params.slug);
  res.json({ modules: listModulesForAdmin() });
});

router.get('/vouchers', (req, res) => {
  res.json({ vouchers: listVouchers() });
});

router.post('/vouchers', async (req, res) => {
  try {
    const voucher = upsertVoucher(req.body);
    await flushDatabase();
    res.json({ voucher, vouchers: listVouchers() });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.patch('/vouchers/:code', async (req, res) => {
  try {
    const voucher = upsertVoucher({ ...req.body, code: req.params.code });
    await flushDatabase();
    res.json({ voucher, vouchers: listVouchers() });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.delete('/vouchers/:code', async (req, res) => {
  try {
    removeVoucher(req.params.code);
    await flushDatabase();
    res.json({ vouchers: listVouchers() });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

export default router;
