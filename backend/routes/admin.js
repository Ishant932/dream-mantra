import { Router } from 'express';
import db, { flushDatabase } from '../db.js';
import { authRequired, adminRequired } from '../middleware/auth.js';
import { getAvailableSlots } from '../lib/slots.js';
import { getPaidAssessmentsWithUsers } from '../lib/reports.js';
import { listPaymentsForAdmin, updatePaymentStatus, patchPaymentDetails } from '../lib/paymentService.js';
import {
  createSkillMappingCombo,
  listSkillMappingCombos,
  updateSkillMappingCombo,
  comboSummary,
} from '../lib/skillMappingCombos.js';
import {
  getSiteSettings,
  updateSiteSettings,
  upsertCommunityScheduleEntry,
  deleteCommunityScheduleEntry,
} from '../lib/siteSettings.js';
import { getPlatformAnalytics } from '../lib/analytics.js';
import { listContactLeads, updateContactLead, countNewLeads, deleteContactLead } from '../lib/leads.js';
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
import { handleListStaffUsers } from '../lib/listStaffUsers.js';
import {
  listThreadsForAdmin,
  getThreadByUserId,
  sendMessage,
  markThreadRead,
  countUnreadForAdmin,
} from '../lib/messages.js';
import {
  listBlogPosts,
  getBlogPostById,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from '../lib/blogs.js';
import {
  listAllResources,
  createUserResource,
  deleteUserResource,
} from '../lib/userResources.js';
import {
  listStudioLandingsForAdmin,
  readStudioLanding,
  writeStudioLanding,
  createStudioLanding,
  updateStudioLandingMeta,
  deleteStudioLanding,
} from '../lib/studioLandingEditor.js';
import { listPageCatalog, getPageCatalog, updatePageCatalog } from '../lib/pageCatalog.js';

const router = Router();
router.use(authRequired, adminRequired);

router.get('/users', handleListStaffUsers);

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

registerStaffRoutes(router, { includeStats: false, skipUsers: true });

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
    res.json({
      analytics: getPlatformAnalytics({
        period: req.query.period,
        from: req.query.from,
        to: req.query.to,
      }),
    });
  } catch (e) {
    console.error('GET /admin/analytics failed:', e);
    res.status(500).json({ message: e.message || 'Failed to load analytics' });
  }
});

router.get('/payments', (req, res) => {
  try {
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
  } catch (e) {
    console.error('GET /admin/payments failed:', e);
    res.status(500).json({ message: e.message || 'Failed to load payments', payments: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  }
});

router.patch('/payments/:id', (req, res) => {
  try {
    const { status, adminNote, amount, userNote, userId } = req.body;
    if (status) {
      const result = updatePaymentStatus(req.params.id, status, {
        adminId: req.user.id,
        adminNote: adminNote || null,
        userNote: userNote || null,
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

router.get('/resources', (req, res) => {
  res.json({ resources: listAllResources() });
});

router.post('/resources', async (req, res) => {
  try {
    const resource = createUserResource({ ...req.body, adminId: req.user.id });
    await flushDatabase();
    res.status(201).json({ resource, resources: listAllResources() });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.delete('/resources/:id', async (req, res) => {
  deleteUserResource(req.params.id);
  await flushDatabase();
  res.json({ resources: listAllResources() });
});

router.get('/settings', (req, res) => {
  try {
    res.json({ settings: getSiteSettings() });
  } catch (e) {
    console.error('GET /admin/settings failed:', e);
    res.status(500).json({ message: e.message || 'Failed to load settings', settings: {} });
  }
});

router.patch('/settings', (req, res) => {
  try {
    const settings = updateSiteSettings(req.body);
    res.json({ settings });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/skill-mapping-combos', (req, res) => {
  try {
    const combos = listSkillMappingCombos().map((c) => ({
      ...c,
      summary: comboSummary(c),
    }));
    res.json({ combos });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post('/skill-mapping-combos', (req, res) => {
  try {
    const combo = createSkillMappingCombo(req.body);
    res.status(201).json({ combo: { ...combo, summary: comboSummary(combo) } });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.patch('/skill-mapping-combos/:id', (req, res) => {
  try {
    const combo = updateSkillMappingCombo(req.params.id, req.body);
    if (!combo) return res.status(404).json({ message: 'Combo not found' });
    res.json({ combo: { ...combo, summary: comboSummary(combo) } });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.post('/community-schedule', (req, res) => {
  try {
    const entry = upsertCommunityScheduleEntry(req.body);
    res.json({ entry, settings: getSiteSettings() });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.delete('/community-schedule/:id', (req, res) => {
  try {
    const ok = deleteCommunityScheduleEntry(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Entry not found' });
    res.json({ ok: true, settings: getSiteSettings() });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/leads', (req, res) => {
  const status = req.query.status || 'all';
  const program = req.query.program || 'all';
  const search = req.query.search || '';
  res.json({
    leads: listContactLeads({ status, program, search }),
    newCount: countNewLeads(),
  });
});

router.patch('/leads/:id', (req, res) => {
  const lead = updateContactLead(req.params.id, req.body);
  if (!lead) return res.status(404).json({ message: 'Lead not found' });
  res.json({ lead });
});

router.delete('/leads/:id', (req, res) => {
  const ok = deleteContactLead(req.params.id);
  if (!ok) return res.status(404).json({ message: 'Lead not found' });
  res.json({ ok: true });
});

router.get('/modules', (req, res) => {
  try {
    res.json({ modules: listModulesForAdmin().filter(Boolean) });
  } catch (e) {
    console.error('GET /admin/modules failed:', e);
    res.status(500).json({ message: e.message || 'Failed to load modules', modules: [] });
  }
});

router.post('/modules', async (req, res) => {
  try {
    const module = upsertModule(req.body);
    await flushDatabase();
    res.json({ module, modules: listModulesForAdmin().filter(Boolean) });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.patch('/modules/:slug', async (req, res) => {
  try {
    const module = upsertModule({ ...req.body, slug: req.params.slug });
    await flushDatabase();
    res.json({ module, modules: listModulesForAdmin().filter(Boolean) });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.delete('/modules/:slug', async (req, res) => {
  try {
    removeModule(req.params.slug);
    await flushDatabase();
    res.json({ modules: listModulesForAdmin().filter(Boolean) });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
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

router.get('/messages/threads', (req, res) => {
  res.json({
    threads: listThreadsForAdmin(),
    unread: countUnreadForAdmin(),
  });
});

router.get('/messages/user/:userId', (req, res) => {
  const data = getThreadByUserId(req.params.userId);
  if (data.thread) markThreadRead({ threadId: data.thread.id, role: 'admin' });
  res.json(data);
});

router.post('/messages/user/:userId', async (req, res) => {
  try {
    const { body, attachments } = req.body || {};
    const result = sendMessage({
      userId: req.params.userId,
      senderRole: 'admin',
      senderId: req.user.id,
      body,
      attachments: Array.isArray(attachments) ? attachments : [],
    });
    await flushDatabase();
    res.json(result);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/blogs', (req, res) => {
  try {
    const status = req.query.status || 'all';
    const posts = listBlogPosts({ status });
    res.json({ posts });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Failed to load blogs' });
  }
});

router.get('/blogs/:id', (req, res) => {
  const post = getBlogPostById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Blog post not found' });
  res.json({ post });
});

router.post('/blogs', async (req, res) => {
  try {
    const post = createBlogPost(req.body);
    await flushDatabase();
    res.status(201).json({ post });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.patch('/blogs/:id', async (req, res) => {
  try {
    const post = updateBlogPost(req.params.id, req.body);
    if (!post) return res.status(404).json({ message: 'Blog post not found' });
    await flushDatabase();
    res.json({ post });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.delete('/blogs/:id', async (req, res) => {
  try {
    const ok = deleteBlogPost(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Blog post not found' });
    await flushDatabase();
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/studio-landings', (_req, res) => {
  try {
    res.json({ landings: listStudioLandingsForAdmin() });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Failed to list landing pages' });
  }
});

router.get('/studio-landings/:slug', (req, res) => {
  try {
    res.json(readStudioLanding(req.params.slug));
  } catch (e) {
    res.status(404).json({ message: e.message || 'Landing page not found' });
  }
});

router.put('/studio-landings/:slug', (req, res) => {
  try {
    const landing = writeStudioLanding(req.params.slug, req.body?.files || {});
    res.json({ landing });
  } catch (e) {
    res.status(400).json({ message: e.message || 'Failed to save landing page' });
  }
});

router.post('/studio-landings', (req, res) => {
  try {
    const landing = createStudioLanding(req.body || {});
    res.status(201).json({ landing, landings: listStudioLandingsForAdmin() });
  } catch (e) {
    res.status(400).json({ message: e.message || 'Failed to create landing page' });
  }
});

router.patch('/studio-landings/:slug/meta', (req, res) => {
  try {
    const meta = updateStudioLandingMeta(req.params.slug, req.body || {});
    res.json({ meta, landings: listStudioLandingsForAdmin() });
  } catch (e) {
    res.status(400).json({ message: e.message || 'Failed to update landing meta' });
  }
});

router.delete('/studio-landings/:slug', (req, res) => {
  try {
    const result = deleteStudioLanding(req.params.slug);
    res.json({ ...result, landings: listStudioLandingsForAdmin() });
  } catch (e) {
    res.status(400).json({ message: e.message || 'Failed to delete landing page' });
  }
});

router.get('/page-catalog', (_req, res) => {
  res.json({ pages: listPageCatalog() });
});

router.get('/page-catalog/:slug', (req, res) => {
  const page = getPageCatalog(req.params.slug);
  if (!page) return res.status(404).json({ message: 'Page not found' });
  res.json({ page });
});

router.put('/page-catalog/:slug', (req, res) => {
  try {
    const page = updatePageCatalog(req.params.slug, req.body || {});
    res.json({ page });
  } catch (e) {
    res.status(400).json({ message: e.message || 'Failed to save page' });
  }
});

export default router;
