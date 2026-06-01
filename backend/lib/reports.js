import { getData, saveData } from './database.js';
import { notifyUser } from './notifications.js';
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
  return listAllReports().filter((r) => r.user_id === Number(userId));
}

function enrichReport(row) {
  const data = getData();
  const user = data.users.find((u) => u.id === row.user_id);
  const assessment = row.assessment_id
    ? data.assessments.find((a) => a.id === row.assessment_id)
    : null;
  return {
    ...row,
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

export function upsertReport({ id, userId, userUid, assessmentId, productSlug, productTitle, reportLink, reportTitle, adminNotes, resendNotification }) {
  ensureReportsInitialized();
  const data = getData();
  let resolvedUserId = userId != null && userId !== '' ? Number(userId) : null;
  if (!resolvedUserId && userUid) {
    const byUid = findUserByUid(userUid, data);
    if (!byUid) throw new Error(`User not found for ID ${userUid}`);
    resolvedUserId = byUid.id;
  }
  const user = resolvedUserId ? data.users.find((u) => u.id === resolvedUserId) : null;
  if (!user) throw new Error('User not found');

  const assessment = assessmentId
    ? data.assessments.find((a) => a.id === Number(assessmentId))
    : null;

  if (id) {
    const row = data.user_reports.find((r) => r.id === Number(id));
    if (!row) throw new Error('Report not found');
    const prevLink = row.report_link;
    if (reportLink !== undefined) row.report_link = reportLink;
    if (reportTitle !== undefined) row.report_title = reportTitle;
    if (adminNotes !== undefined) row.admin_notes = adminNotes;
    if (productTitle !== undefined) row.product_title = productTitle;
    row.updated_at = new Date().toISOString();
    const linkedAssessment = assessment
      || (row.assessment_id ? data.assessments.find((a) => a.id === row.assessment_id) : null);
    if (linkedAssessment && reportLink !== undefined) {
      linkedAssessment.report_link = reportLink;
    }
    saveData();
    const enriched = enrichReport(row);
    const shouldNotify = resendNotification || (reportLink && reportLink !== prevLink);
    if (shouldNotify && row.report_link) {
      notifyUser(row.user_id, {
        type: 'report',
        title: resendNotification ? 'Report link resent' : (prevLink ? 'Your report was updated' : 'Your report is ready'),
        body: `${row.report_title || 'Assessment report'} is available in your dashboard.`,
        link: '/dashboard?tab=reports',
        meta: { reportId: row.id },
      });
    }
    return enriched;
  }

  const newId = data.nextId.user_reports++;
  const row = {
    id: newId,
    user_id: resolvedUserId,
    assessment_id: assessmentId ? Number(assessmentId) : null,
    product_slug: productSlug || assessment?.product_slug || null,
    product_title: productTitle || assessment?.type || 'Assessment Report',
    report_link: reportLink || '',
    report_title: reportTitle || 'Your Report',
    admin_notes: adminNotes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  data.user_reports.push(row);

  if (assessment && reportLink) {
    assessment.report_link = reportLink;
  }

  saveData();

  if (reportLink) {
    notifyUser(resolvedUserId, {
      type: 'report',
      title: 'Your report is ready',
      body: `${row.report_title || 'Assessment report'} is now available in your dashboard.`,
      link: '/dashboard?tab=reports',
      meta: { reportId: row.id },
    });
  }

  return enrichReport(row);
}

export function getPaidAssessmentsWithUsers() {
  const data = getData();
  return (data.assessments || [])
    .filter((a) => a.status === 'paid')
    .map((a) => {
      const user = data.users.find((u) => u.id === a.user_id);
      const report = (data.user_reports || []).find((r) => r.assessment_id === a.id);
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
