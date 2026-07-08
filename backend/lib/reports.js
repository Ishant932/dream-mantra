import { getData, saveData } from './database.js';
import { notifyUser } from './notifications.js';
import { onReportReady } from './whatsapp/events.js';
import { normalizeProfile } from './profile.js';

import { findUserByUid } from './userUid.js';

export function ensureReportsInitialized() {
  const data = getData();
  if (!data.user_reports) data.user_reports = [];
  if (!data.nextId.user_reports) data.nextId.user_reports = 1;
}

export function listAllReports() {
  ensureReportsInitialized();
  const data = getData();
  return (data.user_reports || [])
    .map((r) => enrichReport(r))
    .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
}

export function listReportsForUser(userId) {
  const uid = Number(userId);
  return listAllReports().filter((r) => Number(r.user_id) === uid);
}

function enrichReport(row) {
  const data = getData();
  const user = data.users.find((u) => Number(u.id) === Number(row.user_id));
  const assessment = row.assessment_id
    ? data.assessments.find((a) => Number(a.id) === Number(row.assessment_id))
    : null;
  return {
    ...row,
    id: Number(row.id),
    user_id: Number(row.user_id),
    user_name: user?.name,
    user_uid: user?.user_uid,
    user_email: user?.email,
    user_phone: user?.phone,
    product_title: row.product_title || assessment?.type,
    product_slug: row.product_slug || assessment?.product_slug,
    amount: assessment?.amount,
    paid_at: assessment?.paid_at,
  };
}

function syncAssessmentReportLink(assessmentId, reportLink) {
  if (assessmentId == null || reportLink === undefined) return;
  const data = getData();
  const assessment = data.assessments.find((a) => Number(a.id) === Number(assessmentId));
  if (assessment) assessment.report_link = reportLink || null;
}

export function upsertReport({ id, userId, userUid, assessmentId, productSlug, productTitle, reportLink, reportTitle, adminNotes, resendNotification }) {
  ensureReportsInitialized();
  const data = getData();
  const reportId = id != null && id !== '' ? Number(id) : null;

  if (reportId) {
    const row = data.user_reports.find((r) => Number(r.id) === reportId);
    if (!row) throw new Error('Report not found');

    const prevLink = row.report_link;
    const prevTitle = row.report_title;
    const prevNotes = row.admin_notes;

    if (reportLink !== undefined) row.report_link = String(reportLink).trim();
    if (reportTitle !== undefined) row.report_title = String(reportTitle).trim() || row.report_title;
    if (adminNotes !== undefined) row.admin_notes = adminNotes ? String(adminNotes).trim() : null;
    if (productTitle !== undefined) row.product_title = productTitle;
    row.updated_at = new Date().toISOString();

    if (reportLink !== undefined && row.assessment_id) {
      syncAssessmentReportLink(row.assessment_id, row.report_link);
    }

    saveData();
    const enriched = enrichReport(row);
    const contentChanged =
      (reportLink !== undefined && row.report_link !== prevLink)
      || (reportTitle !== undefined && row.report_title !== prevTitle)
      || (adminNotes !== undefined && row.admin_notes !== prevNotes);
    const shouldNotify = resendNotification || contentChanged;

    if (shouldNotify && row.report_link) {
      notifyUser(row.user_id, {
        type: 'report',
        title: resendNotification ? 'Report link resent' : (prevLink ? 'Your report was updated' : 'Your report is ready'),
        body: `${row.report_title || 'Assessment report'} is available in your dashboard.`,
        link: '/dashboard?tab=reports',
        meta: { reportId: row.id },
      });
      const reportUser = data.users.find((u) => Number(u.id) === Number(row.user_id));
      if (reportUser) onReportReady(reportUser, row);
    }

    return enriched;
  }

  let resolvedUserId = userId != null && userId !== '' ? Number(userId) : null;
  if (!resolvedUserId && userUid) {
    const byUid = findUserByUid(userUid, data);
    if (!byUid) throw new Error(`User not found for ID ${userUid}`);
    resolvedUserId = byUid.id;
  }

  const user = resolvedUserId ? data.users.find((u) => Number(u.id) === resolvedUserId) : null;
  if (!user) throw new Error('User not found');

  const assessment = assessmentId
    ? data.assessments.find((a) => Number(a.id) === Number(assessmentId))
    : null;

  const newId = data.nextId.user_reports++;
  const row = {
    id: newId,
    user_id: resolvedUserId,
    assessment_id: assessmentId ? Number(assessmentId) : null,
    product_slug: productSlug || assessment?.product_slug || null,
    product_title: productTitle || assessment?.type || 'Assessment Report',
    report_link: reportLink ? String(reportLink).trim() : '',
    report_title: reportTitle ? String(reportTitle).trim() : 'Your Report',
    admin_notes: adminNotes ? String(adminNotes).trim() : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  data.user_reports.push(row);

  if (assessment && row.report_link) {
    syncAssessmentReportLink(assessment.id, row.report_link);
  }

  saveData();

  if (row.report_link) {
    notifyUser(resolvedUserId, {
      type: 'report',
      title: 'Your report is ready',
      body: `${row.report_title || 'Assessment report'} is now available in your dashboard.`,
      link: '/dashboard?tab=reports',
      meta: { reportId: row.id },
    });
    onReportReady(user, row);
  }

  return enrichReport(row);
}

export function deleteReport(id) {
  ensureReportsInitialized();
  const data = getData();
  const reportId = Number(id);
  const idx = (data.user_reports || []).findIndex((r) => Number(r.id) === reportId);
  if (idx < 0) throw new Error('Report not found');

  const row = data.user_reports[idx];
  const userId = row.user_id;

  if (row.assessment_id) {
    syncAssessmentReportLink(row.assessment_id, null);
  }

  data.user_reports.splice(idx, 1);
  saveData();

  notifyUser(userId, {
    type: 'report',
    title: 'Report removed',
    body: `${row.report_title || 'An assessment report'} was removed from your dashboard. Contact support if this was unexpected.`,
    link: '/dashboard?tab=reports',
    meta: { reportId: row.id },
  });

  return { id: reportId, deleted: true };
}

export function getPaidAssessmentsWithUsers() {
  const data = getData();
  const users = data.users || [];
  return (data.assessments || [])
    .filter((a) => a && a.status === 'paid')
    .map((a) => {
      const user = users.find((u) => Number(u.id) === Number(a.user_id));
      const report = (data.user_reports || []).find((r) => Number(r.assessment_id) === Number(a.id));
      return {
        id: a.id,
        user_id: a.user_id,
        user_uid: user?.user_uid,
        user_name: user?.name,
        email: user?.email,
        phone: user?.phone,
        profile: normalizeProfile(user?.profile),
        type: a.type,
        product_slug: a.product_slug,
        amount: a.amount,
        paid_at: a.paid_at,
        payment_id: a.payment_id,
        report_link: report?.report_link || a.report_link || null,
        report_id: report?.id || null,
      };
    })
    .sort((a, b) => new Date(b.paid_at || 0) - new Date(a.paid_at || 0));
}
