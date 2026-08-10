import { getData } from './database.js';
import { getActiveModuleCatalog } from './catalogStore.js';
import { calcProfileCompletion, normalizeProfile } from './profile.js';
import { isAssessmentComplete, summarizeUserAssessments } from './adminUsers.js';
import { getAvailableSlots } from './slots.js';
import { isAssessmentFullyPaid, isPaymentConfirmed, normalizePaymentRow } from './paymentService.js';
function monthKey(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function countByField(items, getKey) {
  const map = {};
  for (const item of items) {
    const key = getKey(item);
    if (!key) continue;
    map[key] = (map[key] || 0) + 1;
  }
  return Object.entries(map)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function pct(num, den) {
  if (!den) return 0;
  return Math.min(100, Math.round((num / den) * 1000) / 10);
}

function numId(value) {
  if (value == null || value === '') return null;
  return typeof value === 'number' ? value : Number(value);
}

function buildModulePurchases(users, assessments, allPayments) {
  const paidAssessments = assessments.filter(isAssessmentFullyPaid);
  const byProduct = {};

  for (const a of paidAssessments) {
    const slug = a.product_slug || (a.type || 'unknown').toLowerCase().replace(/\s+/g, '-');
    const title = a.type || a.product_slug || 'Unknown Module';
    if (!byProduct[slug]) {
      byProduct[slug] = { slug, title, count: 0, users: [] };
    }
    const user = users.find((u) => numId(u.id) === numId(a.user_id));
    const pay = allPayments.find((p) => numId(p.assessment_id) === numId(a.id) && isPaymentConfirmed(p));
    byProduct[slug].count += 1;
    byProduct[slug].users.push({
      id: user?.id,
      user_uid: user?.user_uid,
      name: user?.name || 'Unknown',
      email: user?.email,
      phone: user?.phone,
      amount: pay?.amount ?? a.amount,
      paid_at: pay?.paid_at || pay?.confirmed_at || a.paid_at || a.created_at,
      assessment_id: a.id,
      status: a.status,
    });
  }

  for (const mod of getActiveModuleCatalog()) {
    if (mod.followUpOnly) continue;
    if (!byProduct[mod.slug]) {
      byProduct[mod.slug] = { slug: mod.slug, title: mod.title, count: 0, users: [] };
    }
  }

  return Object.values(byProduct)
    .map((m) => ({
      ...m,
      users: m.users.sort((a, b) => new Date(b.paid_at || 0) - new Date(a.paid_at || 0)),
    }))
    .sort((a, b) => b.count - a.count);
}

export function getPlatformAnalytics() {
  const data = getData();
  const users = (data.users || []).filter((u) => u.role === 'user');
  const assessments = data.assessments || [];
  const consultations = data.consultations || [];
  const reports = data.user_reports || [];
  const allPayments = (data.payments || []).map((p) => normalizePaymentRow({ ...p }));

  const paidAssessments = assessments.filter(isAssessmentFullyPaid);
  const confirmedPayments = allPayments.filter(isPaymentConfirmed);
  const completedAssessments = paidAssessments.filter(isAssessmentComplete);
  const pendingPayments = assessments.filter((a) => a.status === 'pending_payment');
  const pendingPaymentReviews = allPayments.filter((p) => p.payment_status === 'pending' && p.submitted_at);
  const usersWithBooking = new Set(
    assessments.map((a) => numId(a.user_id)).filter((id) => id != null)
  );
  const usersWithPayment = new Set(
    paidAssessments.map((a) => numId(a.user_id)).filter((id) => id != null)
  );
  const usersWithCompletedTest = new Set(
    completedAssessments.map((a) => numId(a.user_id)).filter((id) => id != null)
  );

  const totalRevenue = confirmedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    || paidAssessments.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
  const revenueByProduct = countByField(paidAssessments, (a) => a.type || a.product_slug || 'Unknown');
  const revenueByProductAmount = {};
  for (const a of paidAssessments) {
    const key = a.type || a.product_slug || 'Unknown';
    const pay = allPayments.find((p) => p.assessment_id === a.id && isPaymentConfirmed(p));
    const amt = pay?.amount ?? a.amount;
    revenueByProductAmount[key] = (revenueByProductAmount[key] || 0) + (Number(amt) || 0);
  }
  const revenueBreakdown = Object.entries(revenueByProductAmount)
    .map(([product, amount]) => ({ product, amount, orders: revenueByProduct.find((r) => r.label === product)?.count || 0 }))
    .sort((a, b) => b.amount - a.amount);

  const careerInterests = countByField(users, (u) => normalizeProfile(u.profile).careerGoal);
  const classDistribution = countByField(users, (u) => normalizeProfile(u.profile).classLevel);
  const streamDistribution = countByField(users, (u) => normalizeProfile(u.profile).stream);
  const howHeardDistribution = countByField(users, (u) => normalizeProfile(u.profile).howHeard);
  const preferredModeDistribution = countByField(users, (u) => normalizeProfile(u.profile).preferredMode);
  const profilesComplete = users.filter((u) => normalizeProfile(u.profile).setupComplete).length;
  const whatsappRegistered = users.filter((u) => normalizeProfile(u.profile).whatsappNumber).length;

  const registrationsByMonth = {};
  for (const u of users) {
    const key = monthKey(u.created_at);
    if (key) registrationsByMonth[key] = (registrationsByMonth[key] || 0) + 1;
  }
  const signupsTrend = Object.entries(registrationsByMonth)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12);

  const revenueByMonth = {};
  for (const p of confirmedPayments) {
    const key = monthKey(p.paid_at || p.confirmed_at || p.created_at);
    if (key) revenueByMonth[key] = (revenueByMonth[key] || 0) + (Number(p.amount) || 0);
  }
  if (!confirmedPayments.length) {
    for (const a of paidAssessments) {
      const key = monthKey(a.paid_at || a.created_at);
      if (key) revenueByMonth[key] = (revenueByMonth[key] || 0) + (Number(a.amount) || 0);
    }
  }
  const revenueTrend = Object.entries(revenueByMonth)
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12);

  let profileCompletionSum = 0;
  let pendingUsers = 0;
  for (const u of users) {
    const userAssessments = assessments.filter((a) => numId(a.user_id) === numId(u.id));
    const summary = summarizeUserAssessments(userAssessments);
    const userConsultations = consultations.filter((c) => numId(c.user_id) === numId(u.id)).length;
    const completion = calcProfileCompletion(u, {
      paidTests: summary.paidTests,
      consultations: userConsultations,
    });
    profileCompletionSum += completion;
    const profile = normalizeProfile(u.profile);
    if (summary.pendingPayment || (!profile.setupComplete && completion < 80)) {
      pendingUsers += 1;
    }
  }

  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
  const newUsersThisWeek = users.filter((u) => new Date(u.created_at).getTime() >= weekAgo).length;
  const newUsersThisMonth = users.filter((u) => new Date(u.created_at).getTime() >= monthAgo).length;
  const revenueThisMonth = confirmedPayments
    .filter((p) => new Date(p.paid_at || p.confirmed_at || p.created_at).getTime() >= monthAgo)
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const recentConfirmedPayments = confirmedPayments
    .slice()
    .sort((a, b) => new Date(b.paid_at || b.confirmed_at || 0) - new Date(a.paid_at || a.confirmed_at || 0))
    .slice(0, 8)
    .map((p) => {
      const user = users.find((u) => numId(u.id) === numId(p.user_id));
      const assessment = assessments.find((a) => numId(a.id) === numId(p.assessment_id));
      return {
        id: p.id,
        order_id: p.order_id,
        amount: p.amount,
        user_name: user?.name,
        user_uid: user?.user_uid,
        product_title: assessment?.type || assessment?.product_slug || 'Module',
        paid_at: p.paid_at || p.confirmed_at,
        confirmation_source: p.confirmation_source,
      };
    });

  const consultationStatuses = countByField(consultations, (c) => c.status || 'unknown');
  const openSlots = getAvailableSlots({ from: new Date().toISOString() }).length;
  const modulePurchases = buildModulePurchases(users, assessments, allPayments);

  return {
    summary: {
      totalUsers: users.length,
      newUsersThisWeek,
      newUsersThisMonth,
      assessmentsBooked: assessments.length,
      assessmentsPaid: paidAssessments.length,
      paymentsConfirmed: confirmedPayments.length,
      pendingPaymentReviews: pendingPaymentReviews.length,
      assessmentsCompleted: completedAssessments.length,
      pendingPayments: pendingPayments.length,
      pendingUsers,
      totalConsultations: consultations.length,
      completedConsultations: consultations.filter((c) => c.status === 'completed').length,
      reportsPublished: reports.filter((r) => r.report_link).length,
      openSlots,
      totalRevenue,
      revenueThisMonth,
      avgProfileCompletion: users.length ? Math.round(profileCompletionSum / users.length) : 0,
    },
    conversion: {
      registrationToBooking: pct(usersWithBooking.size, users.length),
      registrationToPayment: pct(usersWithPayment.size, users.length),
      bookingToPayment: pct(paidAssessments.length, assessments.length),
      paymentToCompletion: pct(completedAssessments.length, paidAssessments.length),
      usersWithCompletedTest: usersWithCompletedTest.size,
    },
    careerInterests: careerInterests.slice(0, 12),
    classDistribution,
    streamDistribution,
    revenueBreakdown,
    productOrders: revenueByProduct.slice(0, 8),
    signupsTrend,
    revenueTrend,
    consultationStatuses,
    recentConfirmedPayments,
    modulePurchases,
    marketing: {
      howHeard: howHeardDistribution.slice(0, 10),
      preferredMode: preferredModeDistribution,
      profileCompletionRate: pct(profilesComplete, users.length),
      whatsappRegistered,
      newUsersThisWeek,
      assessmentsCompletionRate: pct(completedAssessments.length, paidAssessments.length),
    },
  };
}
