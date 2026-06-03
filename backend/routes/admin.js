import { Router } from 'express';
import db from '../db.js';
import { authRequired, adminRequired } from '../middleware/auth.js';
import { calcProfileCompletion, normalizeProfile, profileChecklist, defaultProfile } from '../lib/profile.js';
import {
  listSlots,
  createSlot,
  updateSlot,
  deleteSlot,
  getAvailableSlots,
  getSlotBookings,
  listConsultationsEnriched,
  updateConsultation,
} from '../lib/slots.js';
import { listAllReports, upsertReport, getPaidAssessmentsWithUsers } from '../lib/reports.js';
import { listPaymentsForAdmin, updatePaymentStatus, patchPaymentDetails } from '../lib/paymentService.js';
import { getSiteSettings, updateSiteSettings } from '../lib/siteSettings.js';
import { summarizeUserAssessments, isPendingUser } from '../lib/adminUsers.js';
import { getPlatformAnalytics } from '../lib/analytics.js';
import { getData, saveData } from '../lib/database.js';
import { listContactLeads, updateContactLead, countNewLeads } from '../lib/leads.js';

function istIso(date, time) {
  return new Date(`${date}T${time}:00+05:30`).toISOString();
}

const router = Router();
router.use(authRequired, adminRequired);

function sanitizeUser(user, { paidTests = 0, consultations = 0 } = {}) {
  if (!user) return null;
  return {
    id: user.id,
    user_uid: user.user_uid,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    created_at: user.created_at,
    twoFactorEnabled: !!user.twoFactorEnabled,
    profile: normalizeProfile(user.profile),
    profileCompletion: calcProfileCompletion(user, { paidTests, consultations }),
    profileChecklist: profileChecklist(user),
  };
}

function userActivity(userId) {
  const consultations = db.prepare('SELECT * FROM consultations WHERE user_id = ?').all(userId) || [];
  const assessments = db.prepare('SELECT * FROM assessments WHERE user_id = ?').all(userId) || [];
  const paidTests = assessments.filter((a) => a.status === 'paid').length;
  const assessmentSummary = summarizeUserAssessments(assessments);
  return {
    consultations: consultations.length,
    paidTests,
    consultationsList: consultations,
    assessmentsList: assessments,
    assessmentSummary,
  };
}

router.get('/stats', (req, res) => {
  const users = db.prepare('SELECT COUNT(*) as c FROM users WHERE role = ?').get('user').c;
  const consultations = db.prepare('SELECT COUNT(*) as c FROM consultations').get().c;
  const assessments = db.prepare('SELECT COUNT(*) as c FROM assessments').get().c;
  const pending = db.prepare("SELECT COUNT(*) as c FROM consultations WHERE status = 'pending'").get().c;
  const openSlots = getAvailableSlots({ from: new Date().toISOString() }).length;
  const paidCount = getPaidAssessmentsWithUsers().length;
  res.json({ users, consultations, assessments, pending, openSlots, paidCount });
});

router.get('/analytics', (req, res) => {
  res.json({ analytics: getPlatformAnalytics() });
});

router.get('/users', (req, res) => {
  const data = getData();
  const rows = (data.users || [])
    .filter((u) => u.role === 'user')
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  const users = rows.map((full) => {
    const activity = userActivity(full.id);
    const base = sanitizeUser(full, activity);
    return {
      ...base,
      stats: {
        consultations: activity.consultations,
        assessmentsBooked: activity.assessmentSummary.assessmentsBooked,
        paidTests: activity.assessmentSummary.paidTests,
        completedTests: activity.assessmentSummary.completedTests,
        pendingPayment: activity.assessmentSummary.pendingPayment,
        hasCompletedTest: activity.assessmentSummary.hasCompletedTest,
        isPending: isPendingUser(full, activity.assessmentSummary, activity.consultations),
      },
    };
  });
  res.json({ users, total: users.length });
});

router.get('/users/:id', (req, res) => {
  const user = getData().users.find((u) => u.id === Number(req.params.id));
  if (!user || user.role !== 'user') {
    return res.status(404).json({ message: 'User not found' });
  }
  const activity = userActivity(user.id);
  res.json({
    user: sanitizeUser(user, activity),
    stats: {
      consultations: activity.consultations,
      assessments: activity.assessmentsList.length,
      paidTests: activity.paidTests,
      assessmentsList: activity.assessmentsList,
    },
  });
});

router.patch('/users/:id', (req, res) => {
  const data = getData();
  const user = data.users.find((u) => u.id === Number(req.params.id) && u.role === 'user');
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { name, email, phone, profile: profilePatch } = req.body;
  if (name?.trim()) user.name = name.trim();
  if (email !== undefined) user.email = email?.trim() || null;
  if (phone !== undefined) user.phone = phone?.trim() || null;
  if (profilePatch && typeof profilePatch === 'object') {
    user.profile = normalizeProfile({ ...defaultProfile(), ...user.profile, ...profilePatch });
  }
  saveData();

  const activity = userActivity(user.id);
  res.json({ user: sanitizeUser(user, activity) });
});

router.get('/consultations', (req, res) => {
  res.json({ consultations: listConsultationsEnriched() });
});

router.patch('/consultations/:id', (req, res) => {
  const { status, notes, meeting_link, admin_notes, location, slot_title } = req.body;
  const consultation = updateConsultation(req.params.id, {
    status,
    notes,
    meeting_link,
    admin_notes,
    location,
    slot_title,
  });
  if (!consultation) return res.status(404).json({ message: 'Consultation not found' });
  res.json({ consultation: listConsultationsEnriched().find((c) => c.id === consultation.id) });
});

router.get('/slots', (req, res) => {
  const from = req.query.from;
  const to = req.query.to;
  res.json({ slots: listSlots({ from, to }) });
});

router.get('/slots/:id/bookings', (req, res) => {
  res.json({ bookings: getSlotBookings(req.params.id) });
});

router.post('/slots', (req, res) => {
  try {
    const { date, startTime, endTime, mode, location, title, meeting_link, capacity, counsellor } = req.body;
    let start_at = req.body.start_at;
    let end_at = req.body.end_at;
    if (date && startTime && endTime) {
      start_at = istIso(date, startTime);
      end_at = istIso(date, endTime);
    }
    const slot = createSlot({ start_at, end_at, mode, location, title, meeting_link, capacity, counsellor });
    res.status(201).json({ slot });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.patch('/slots/:id', (req, res) => {
  try {
    const { date, startTime, endTime } = req.body;
    const patch = { ...req.body };
    if (date && startTime) patch.start_at = istIso(date, startTime);
    if (date && endTime) patch.end_at = istIso(date, endTime);
    delete patch.date;
    delete patch.startTime;
    delete patch.endTime;
    const slot = updateSlot(req.params.id, patch);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    res.json({ slot });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.delete('/slots/:id', (req, res) => {
  try {
    const ok = deleteSlot(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Slot not found' });
    res.json({ message: 'Deleted' });
  } catch (e) {
    res.status(400).json({ message: e.message });
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

router.get('/reports', (req, res) => {
  res.json({ reports: listAllReports() });
});

router.post('/reports', (req, res) => {
  try {
    const report = upsertReport(req.body);
    res.status(201).json({ report });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.patch('/reports/:id', (req, res) => {
  try {
    const report = upsertReport({ id: Number(req.params.id), ...req.body });
    res.json({ report });
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

export default router;
