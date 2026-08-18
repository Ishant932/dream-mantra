import db, { flushDatabase, repo } from '../db.js';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { calcProfileCompletion, normalizeProfile, profileChecklist, defaultProfile } from '../lib/profile.js';
import {
  listSlots,
  createSlot,
  createBulkSlots,
  updateSlot,
  deleteSlot,
  deleteBulkSlots,
  getAvailableSlots,
  getSlotBookings,
  listConsultationsEnriched,
  updateConsultation,
} from '../lib/slots.js';
import { listAllReports, upsertReport, deleteReport } from '../lib/reports.js';
import { summarizeUserAssessments, isPendingUser } from '../lib/adminUsers.js';
import { getData, saveData } from '../lib/database.js';
import { handleListStaffUsers } from '../lib/listStaffUsers.js';
import { sendMessage } from '../lib/messages.js';

function generatePassword() {
  const raw = randomBytes(5).toString('base64url').replace(/[^a-zA-Z0-9]/g, '');
  return `${raw.slice(0, 4)}${Math.floor(10 + Math.random() * 89)}${raw.slice(4, 8)}`;
}

function numId(value) {
  if (value == null || value === '') return null;
  return typeof value === 'number' ? value : Number(value);
}

function istIso(date, time) {
  return new Date(`${date}T${time}:00+05:30`).toISOString();
}

function counsellorMap(data) {
  const map = {};
  for (const u of data.users || []) {
    if (u.role === 'counsellor') map[numId(u.id)] = u.name;
  }
  return map;
}

function studentUsers(data) {
  return (data.users || []).filter((u) => u.role === 'user');
}

function assignedStudentIds(data, counsellorId) {
  return new Set(
    studentUsers(data)
      .filter((u) => numId(u.assigned_counsellor_id) === numId(counsellorId))
      .map((u) => numId(u.id))
  );
}

function studentsForRequest(req, data) {
  let rows = studentUsers(data);
  if (req.user?.role === 'counsellor') {
    rows = rows.filter((u) => numId(u.assigned_counsellor_id) === numId(req.user.id));
  }
  return rows.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

function canAccessStudent(req, user) {
  if (!user || user.role !== 'user') return false;
  if (req.user?.role === 'admin') return true;
  if (req.user?.role === 'counsellor') {
    return numId(user.assigned_counsellor_id) === numId(req.user.id);
  }
  return false;
}

function sanitizeUser(user, { paidTests = 0, consultations = 0, counsellors = {} } = {}) {
  if (!user) return null;
  const cid = numId(user.assigned_counsellor_id);
  return {
    id: user.id,
    user_uid: user.user_uid,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    created_at: user.created_at,
    assigned_counsellor_id: cid,
    assigned_counsellor_name: cid ? counsellors[cid] || null : null,
    twoFactorEnabled: !!user.twoFactorEnabled,
    account_status: user.account_status || 'active',
    suspended_until: user.suspended_until || null,
    profile: normalizeProfile(user.profile),
    profileCompletion: calcProfileCompletion(user, { paidTests, consultations }),
    profileChecklist: profileChecklist(user),
  };
}

function userActivity(userId) {
  const data = getData();
  const uid = numId(userId);
  const consultations = (data.consultations || []).filter((c) => numId(c.user_id) === uid);
  const assessments = (data.assessments || []).filter((a) => numId(a.user_id) === uid);
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

function buildUserRow(full, counsellors) {
  const activity = userActivity(full.id);
  const base = sanitizeUser(full, { ...activity, counsellors });
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
}

function fallbackUserRow(full, counsellors) {
  const cid = numId(full?.assigned_counsellor_id);
  return {
    id: full.id,
    user_uid: full.user_uid,
    name: full.name || 'Unknown',
    email: full.email,
    phone: full.phone,
    role: full.role,
    created_at: full.created_at,
    assigned_counsellor_id: cid,
    assigned_counsellor_name: cid ? counsellors[cid] || null : null,
    profile: normalizeProfile(full.profile),
    profileCompletion: 0,
    profileChecklist: [],
    stats: {
      consultations: 0,
      assessmentsBooked: 0,
      paidTests: 0,
      completedTests: 0,
      pendingPayment: false,
      hasCompletedTest: false,
      isPending: true,
    },
  };
}

function filterConsultationsForRequest(req, consultations) {
  if (req.user?.role !== 'counsellor') return consultations;
  const ids = assignedStudentIds(getData(), req.user.id);
  return consultations.filter((c) => ids.has(numId(c.user_id)));
}

function filterReportsForRequest(req, reports) {
  if (req.user?.role !== 'counsellor') return reports;
  const ids = assignedStudentIds(getData(), req.user.id);
  return reports.filter((r) => ids.has(numId(r.user_id)));
}

export function registerStaffRoutes(router, { includeStats = true, skipUsers = false } = {}) {
  if (includeStats) {
    router.get('/stats', (req, res) => {
      try {
        const data = getData();
        const isCounsellor = req.user?.role === 'counsellor';
        const assignedIds = isCounsellor ? assignedStudentIds(data, req.user.id) : null;

        const users = isCounsellor
          ? assignedIds.size
          : studentUsers(data).length;

        const consultations = (data.consultations || []).filter((c) =>
          !isCounsellor || assignedIds.has(numId(c.user_id))
        );
        const assessments = (data.assessments || []).filter((a) =>
          !isCounsellor || assignedIds.has(numId(a.user_id))
        );

        res.json({
          users,
          consultations: consultations.length,
          assessments: assessments.length,
          pending: consultations.filter((c) => c.status === 'pending').length,
          openSlots: getAvailableSlots({ from: new Date().toISOString() }).length,
        });
      } catch (e) {
        console.error('GET /stats failed:', e);
        res.status(500).json({ message: e.message || 'Failed to load stats' });
      }
    });
  }

  if (!skipUsers) {
    router.get('/users', handleListStaffUsers);
  }

  router.get('/users/:id', (req, res) => {
    try {
      const data = getData();
      const counsellors = counsellorMap(data);
      const user = data.users.find((u) => numId(u.id) === numId(req.params.id));
      if (!canAccessStudent(req, user)) {
        return res.status(404).json({ message: 'User not found' });
      }
      const activity = userActivity(user.id);
      res.json({
        user: sanitizeUser(user, { ...activity, counsellors }),
        stats: {
          consultations: activity.consultations,
          assessments: activity.assessmentsList.length,
          paidTests: activity.paidTests,
          assessmentsList: activity.assessmentsList,
        },
      });
    } catch (e) {
      console.error('GET /users/:id failed:', e);
      res.status(500).json({ message: e.message || 'Failed to load user' });
    }
  });

  router.patch('/users/:id', async (req, res) => {
    try {
      const data = getData();
      const counsellors = counsellorMap(data);
      const user = data.users.find((u) => numId(u.id) === numId(req.params.id) && u.role === 'user');
      if (!canAccessStudent(req, user)) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { name, email, phone, profile: profilePatch, assignedCounsellorId, accountStatus, suspendedUntil } = req.body;
      if (name?.trim()) user.name = name.trim();
      if (email !== undefined) user.email = email?.trim() || null;
      if (phone !== undefined) user.phone = phone?.trim() || null;
      if (profilePatch && typeof profilePatch === 'object') {
        user.profile = normalizeProfile({ ...defaultProfile(), ...user.profile, ...profilePatch });
      }

      if (assignedCounsellorId !== undefined) {
        if (req.user?.role !== 'admin') {
          return res.status(403).json({ message: 'Only admin can assign counsellors' });
        }
        if (assignedCounsellorId == null || assignedCounsellorId === '' || assignedCounsellorId === 0) {
          user.assigned_counsellor_id = null;
        } else {
          const counsellor = data.users.find(
            (u) => u.role === 'counsellor' && numId(u.id) === numId(assignedCounsellorId)
          );
          if (!counsellor) return res.status(400).json({ message: 'Counsellor not found' });
          user.assigned_counsellor_id = counsellor.id;
        }
      }

      if (req.user?.role === 'admin') {
        if (accountStatus !== undefined) {
          user.account_status = accountStatus === 'suspended' ? 'suspended' : 'active';
        }
        if (suspendedUntil !== undefined) {
          user.suspended_until = suspendedUntil || null;
          if (!user.suspended_until && user.account_status === 'suspended') {
            user.account_status = 'active';
          }
        }
      }

      saveData();
      await flushDatabase();

      const activity = userActivity(user.id);
      res.json({ user: sanitizeUser(user, { ...activity, counsellors }) });
    } catch (e) {
      console.error('PATCH /users/:id failed:', e);
      res.status(500).json({ message: e.message || 'Failed to update user' });
    }
  });

  router.delete('/users/:id', async (req, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Only admin can delete users' });
      }
      const data = getData();
      const user = data.users.find((u) => numId(u.id) === numId(req.params.id) && u.role === 'user');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const ok = repo.deleteUser(user.id);
      if (!ok) return res.status(404).json({ message: 'User not found' });
      await flushDatabase();
      res.json({ success: true, message: 'User deleted' });
    } catch (e) {
      console.error('DELETE /users/:id failed:', e);
      res.status(500).json({ message: e.message || 'Failed to delete user' });
    }
  });

  router.post('/users/:id/reset-password', async (req, res) => {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Only admin can reset passwords' });
      }
      const data = getData();
      const user = data.users.find((u) => numId(u.id) === numId(req.params.id) && u.role === 'user');
      if (!user) return res.status(404).json({ message: 'User not found' });

      const plain = String(req.body?.password || '').trim();
      if (plain.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

      user.password = bcrypt.hashSync(plain, 10);
      saveData();
      await flushDatabase();

      let messageSent = false;
      if (req.body?.sendMessage) {
        try {
          sendMessage({
            userId: user.id,
            senderRole: 'admin',
            senderId: req.user.id,
            body: `Your Dream Mantra login password was reset by our team.\n\nEmail: ${user.email || '—'}\nPhone: ${user.phone || '—'}\nNew password: ${plain}\n\nSign in at dreammantra.in/login and change your password after logging in.`,
          });
          messageSent = true;
        } catch (msgErr) {
          console.warn('Password reset message failed:', msgErr.message);
        }
      }

      const counsellors = counsellorMap(data);
      const activity = userActivity(user.id);
      res.json({
        password: plain,
        messageSent,
        user: sanitizeUser(user, { ...activity, counsellors }),
      });
    } catch (e) {
      console.error('POST /users/:id/reset-password failed:', e);
      res.status(500).json({ message: e.message || 'Failed to reset password' });
    }
  });

  router.get('/consultations', (req, res) => {
    try {
      const consultations = filterConsultationsForRequest(req, listConsultationsEnriched());
      res.json({ consultations });
    } catch (e) {
      console.error('GET /consultations failed:', e);
      res.status(500).json({ message: e.message || 'Failed to load consultations' });
    }
  });

  router.patch('/consultations/:id', async (req, res) => {
    const { status, notes, meeting_link, admin_notes, location, slot_title } = req.body;
    const existing = listConsultationsEnriched().find((c) => numId(c.id) === numId(req.params.id));
    if (!existing || !filterConsultationsForRequest(req, [existing]).length) {
      return res.status(404).json({ message: 'Consultation not found' });
    }
    const consultation = updateConsultation(req.params.id, {
      status,
      notes,
      meeting_link,
      admin_notes,
      location,
      slot_title,
    });
    if (!consultation) return res.status(404).json({ message: 'Consultation not found' });
    await flushDatabase();
    res.json({ consultation: listConsultationsEnriched().find((c) => c.id === consultation.id) });
  });

  router.get('/slots', (req, res) => {
    const from = req.query.from;
    const to = req.query.to;
    res.json({ slots: listSlots({ from, to }) });
  });

  router.post('/slots/bulk', async (req, res) => {
    try {
      const {
        startDate,
        endDate,
        daysOfWeek,
        startTime,
        endTime,
        mode,
        location,
        title,
        meeting_link,
        capacity,
        counsellor,
        slot_type,
        session_number,
      } = req.body;
      const result = createBulkSlots({
        startDate,
        endDate,
        daysOfWeek,
        startTime,
        endTime,
        mode,
        location,
        title,
        meeting_link,
        capacity,
        counsellor,
        slot_type,
        session_number,
      });
      await flushDatabase();
      res.status(201).json(result);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  });

  router.delete('/slots/bulk', async (req, res) => {
    try {
      const { from, to, onlyEmpty } = req.body;
      const result = deleteBulkSlots({ from, to, onlyEmpty: onlyEmpty !== false });
      await flushDatabase();
      res.json(result);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  });

  router.get('/slots/:id/bookings', (req, res) => {
    let bookings = getSlotBookings(req.params.id);
    if (req.user?.role === 'counsellor') {
      const ids = assignedStudentIds(getData(), req.user.id);
      bookings = bookings.filter((b) => ids.has(numId(b.user_id)));
    }
    res.json({ bookings });
  });

  router.post('/slots', async (req, res) => {
    try {
      const { date, startTime, endTime, mode, location, title, meeting_link, capacity, counsellor, slot_type, session_number } = req.body;
      let start_at = req.body.start_at;
      let end_at = req.body.end_at;
      if (date && startTime && endTime) {
        start_at = istIso(date, startTime);
        end_at = istIso(date, endTime);
      }
      const slot = createSlot({
        start_at,
        end_at,
        mode,
        location,
        title,
        meeting_link,
        capacity,
        counsellor,
        slot_type,
        session_number: slot_type === 'program_session' ? null : session_number,
      });
      await flushDatabase();
      res.status(201).json({ slot });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  });

  router.patch('/slots/:id', async (req, res) => {
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
      await flushDatabase();
      res.json({ slot });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  });

  router.delete('/slots/:id', async (req, res) => {
    try {
      const ok = deleteSlot(req.params.id);
      if (!ok) return res.status(404).json({ message: 'Slot not found' });
      await flushDatabase();
      res.json({ message: 'Deleted' });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  });

  router.get('/reports', (req, res) => {
    try {
      const reports = filterReportsForRequest(req, listAllReports());
      res.json({ reports });
    } catch (e) {
      console.error('GET /reports failed:', e);
      res.status(500).json({ message: e.message || 'Failed to load reports' });
    }
  });

  router.post('/reports', async (req, res) => {
    try {
      if (req.user?.role === 'counsellor') {
        const data = getData();
        const user = findReportTargetUser(data, req.body);
        if (!user || !canAccessStudent(req, user)) {
          return res.status(403).json({ message: 'You can only publish reports for your assigned students' });
        }
      }
      const report = upsertReport({
        userUid: req.body.userUid,
        userId: req.body.userId,
        assessmentId: req.body.assessmentId,
        productSlug: req.body.productSlug,
        productTitle: req.body.productTitle,
        reportLink: req.body.reportLink,
        reportTitle: req.body.reportTitle,
        adminNotes: req.body.adminNotes,
        reportScope: req.body.reportScope,
      });
      await flushDatabase();
      res.status(201).json({ report });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  });

  router.patch('/reports/:id', async (req, res) => {
    try {
      const existing = listAllReports().find((r) => numId(r.id) === numId(req.params.id));
      if (!existing || !filterReportsForRequest(req, [existing]).length) {
        return res.status(404).json({ message: 'Report not found' });
      }
      const report = upsertReport({ id: Number(req.params.id), ...req.body });
      await flushDatabase();
      res.json({ report });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  });

  router.delete('/reports/:id', async (req, res) => {
    try {
      const existing = listAllReports().find((r) => numId(r.id) === numId(req.params.id));
      if (!existing || !filterReportsForRequest(req, [existing]).length) {
        return res.status(404).json({ message: 'Report not found' });
      }
      const result = deleteReport(Number(req.params.id));
      await flushDatabase();
      res.json({ ...result, reports: filterReportsForRequest(req, listAllReports()) });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  });
}

function findReportTargetUser(data, body) {
  if (body.userId) {
    return data.users.find((u) => numId(u.id) === numId(body.userId));
  }
  if (body.userUid) {
    return data.users.find((u) => u.user_uid === body.userUid);
  }
  return null;
}
