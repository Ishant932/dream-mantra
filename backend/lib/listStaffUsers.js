import { calcProfileCompletion, normalizeProfile, profileChecklist, defaultProfile } from './profile.js';
import { summarizeUserAssessments, isPendingUser } from './adminUsers.js';
import { getData } from './database.js';

function numId(value) {
  if (value == null || value === '') return null;
  return typeof value === 'number' ? value : Number(value);
}

function counsellorMap(data) {
  const map = {};
  for (const u of data.users || []) {
    if (u?.role === 'counsellor') map[numId(u.id)] = u.name;
  }
  return map;
}

function studentRows(data, req) {
  let rows = (data.users || []).filter((u) => u && u.role === 'user');
  if (req?.user?.role === 'counsellor') {
    rows = rows.filter((u) => numId(u.assigned_counsellor_id) === numId(req.user.id));
  }
  return rows.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

function userActivity(data, userId) {
  const uid = numId(userId);
  const consultations = (data.consultations || []).filter((c) => numId(c.user_id) === uid);
  const assessments = (data.assessments || []).filter((a) => numId(a.user_id) === uid);
  const paidTests = assessments.filter((a) => a.status === 'paid').length;
  const assessmentSummary = summarizeUserAssessments(assessments);
  return { consultations: consultations.length, paidTests, assessmentSummary };
}

function buildRow(full, counsellors, activity) {
  const cid = numId(full.assigned_counsellor_id);
  const profile = normalizeProfile(full.profile);
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
    twoFactorEnabled: !!full.twoFactorEnabled,
    profile,
    profileCompletion: calcProfileCompletion(full, {
      paidTests: activity.paidTests,
      consultations: activity.consultations,
    }),
    profileChecklist: profileChecklist(full),
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

function minimalRow(full, counsellors) {
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

/** Safe GET /users handler — never throws 500 */
export function handleListStaffUsers(req, res) {
  try {
    const data = getData();
    const counsellors = counsellorMap(data);
    const rows = studentRows(data, req);
    const users = [];

    for (const full of rows) {
      try {
        const activity = userActivity(data, full.id);
        users.push(buildRow(full, counsellors, activity));
      } catch (err) {
        console.error(`listStaffUsers skip ${full?.id}:`, err.message);
        users.push(minimalRow(full, counsellors));
      }
    }

    res.json({ users, total: users.length });
  } catch (e) {
    console.error('listStaffUsers failed:', e);
    res.status(200).json({ users: [], total: 0, warning: e.message || 'Failed to load users' });
  }
}
