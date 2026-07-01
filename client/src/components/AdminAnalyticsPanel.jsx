import { motion } from 'framer-motion';
import {
  Users, FlaskConical, TrendingUp, Target, IndianRupee, BarChart3,
  Calendar, FileText, Clock, CreditCard, UserCheck, PieChart, RefreshCw,
  Megaphone, Share2, MessageCircle, Percent,
} from 'lucide-react';
import { AdminStatCard, DashCard } from './DashboardUI';
import { AdminBarChart, AdminLineChart, AdminDonutChart } from './admin/AdminCharts';
import AdminPanelHeader from './AdminPanelHeader';

function formatInr(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

function MetricBar({ label, count, total, color = 'from-amber-500 to-orange-500' }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5 gap-3">
        <span className="font-medium truncate">{label}</span>
        <span className="font-bold text-amber-700 dark:text-amber-400 shrink-0">{count} · {pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-sand-100 dark:bg-sand-800 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full bg-gradient-to-r ${color} rounded-full`}
        />
      </div>
    </div>
  );
}

export default function AdminAnalyticsPanel({ analytics, loading, error, onRetry }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
        <p className="text-sm opacity-70">Loading platform analytics…</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <DashCard className="!p-8 text-center">
        <BarChart3 className="w-12 h-12 text-amber-500 mx-auto mb-3 opacity-60" />
        <p className="font-bold mb-1">Analytics unavailable</p>
        <p className="text-sm opacity-70 mb-4">{error || 'Could not load analytics data. Restart the backend server and try again.'}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn-primary inline-flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        )}
      </DashCard>
    );
  }

  const { summary, conversion, careerInterests, classDistribution, streamDistribution, revenueBreakdown, productOrders, signupsTrend, revenueTrend, consultationStatuses, recentConfirmedPayments, modulePurchases, marketing } = analytics;

  const statCards = [
    { label: 'Total Registered Users', value: summary.totalUsers, icon: Users },
    { label: 'Assessments Completed', value: summary.assessmentsCompleted, icon: FlaskConical },
    { label: 'Conversion Rate (Reg → Paid)', value: `${conversion.registrationToPayment}%`, icon: Percent },
    { label: 'Test Completion Rate', value: `${conversion.paymentToCompletion}%`, icon: TrendingUp },
    { label: 'Total Revenue', value: formatInr(summary.totalRevenue), icon: IndianRupee },
    { label: 'Revenue This Month', value: formatInr(summary.revenueThisMonth), icon: CreditCard },
    { label: 'Confirmed Payments', value: summary.paymentsConfirmed ?? summary.assessmentsPaid, icon: UserCheck },
    { label: 'New Users (7 days)', value: marketing?.newUsersThisWeek ?? summary.newUsersThisWeek, icon: BarChart3 },
    { label: 'New Users (30 days)', value: summary.newUsersThisMonth, icon: Users },
    { label: 'Paid Orders', value: summary.assessmentsPaid, icon: UserCheck },
    { label: 'Pending Reviews', value: summary.pendingPaymentReviews ?? summary.pendingPayments, icon: Clock },
    { label: 'WhatsApp Registered', value: marketing?.whatsappRegistered ?? 0, icon: MessageCircle },
    { label: 'Profile Completion', value: `${marketing?.profileCompletionRate ?? summary.avgProfileCompletion}%`, icon: PieChart },
  ];

  const topInterestTotal = careerInterests.reduce((s, i) => s + i.count, 0) || 1;
  const classTotal = classDistribution.reduce((s, i) => s + i.count, 0) || 1;
  const classChartData = classDistribution.length
    ? classDistribution
    : [{ label: 'No class data', count: 0 }];
  const interestChartData = careerInterests.length
    ? careerInterests.slice(0, 8)
    : [{ label: 'No career goals yet', count: 0 }];

  const exportRows = [
    ...statCards.map((s) => ({ metric: s.label, value: String(s.value) })),
    ...careerInterests.map((i) => ({ metric: `Career: ${i.label}`, value: String(i.count) })),
    ...(recentConfirmedPayments || []).map((p) => ({
      metric: 'Payment',
      value: `${p.user_name || '—'} · ₹${p.amount} · ${p.product_title || ''}`,
    })),
  ];
  const exportColumns = [
    { label: 'Metric', key: 'metric' },
    { label: 'Value', key: 'value' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <AdminPanelHeader
        title="Platform Analytics"
        subtitle="Users, assessments, conversion, revenue, confirmed payments & marketing insights."
        exportProps={{ title: 'Analytics', filename: 'analytics', rows: exportRows, columns: exportColumns }}
      />

      {modulePurchases?.length > 0 && (
        <DashCard className="!p-5 sm:!p-6" glow>
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-amber-500" /> Module Purchases — Users &amp; Data
          </h3>
          <p className="text-sm opacity-70 mb-5">Paid module purchases grouped by product with student details.</p>
          <div className="space-y-6">
            {modulePurchases.map((mod) => (
              <div key={mod.slug} className="rounded-2xl border border-sand-200/70 dark:border-sand-700/50 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-sand-50 dark:bg-sand-800/40">
                  <div>
                    <p className="font-bold">{mod.title}</p>
                    <p className="text-xs opacity-60 font-mono">{mod.slug}</p>
                  </div>
                  <span className="text-sm font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                    {mod.count} purchase{mod.count !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm admin-data-table min-w-[640px]">
                    <thead>
                      <tr className="border-b border-sand-200 dark:border-sand-700 text-left">
                        <th className="py-2 px-3 text-xs uppercase opacity-60">Dreams ID</th>
                        <th className="py-2 px-3 text-xs uppercase opacity-60">Student</th>
                        <th className="py-2 px-3 text-xs uppercase opacity-60">Contact</th>
                        <th className="py-2 px-3 text-xs uppercase opacity-60">Amount</th>
                        <th className="py-2 px-3 text-xs uppercase opacity-60">Paid on</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mod.users.map((u) => (
                        <tr key={`${mod.slug}-${u.id}-${u.assessment_id}`} className="border-b border-sand-100 dark:border-sand-800/60">
                          <td className="py-2.5 px-3 font-mono text-xs">{u.user_uid || '—'}</td>
                          <td className="py-2.5 px-3 font-semibold">{u.name}</td>
                          <td className="py-2.5 px-3 text-xs opacity-80">
                            {u.email && <p>{u.email}</p>}
                            {u.phone && <p>{u.phone}</p>}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-emerald-700 dark:text-emerald-400">{formatInr(u.amount)}</td>
                          <td className="py-2.5 px-3 text-xs opacity-70 whitespace-nowrap">
                            {u.paid_at && new Date(u.paid_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </DashCard>
      )}

      {recentConfirmedPayments?.length > 0 && (
        <DashCard className="!p-5 sm:!p-6" glow>
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-600" /> Recently Confirmed Payments
          </h3>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm admin-data-table min-w-[640px]">
              <thead>
                <tr className="border-b border-sand-200 dark:border-sand-700 text-left">
                  <th className="py-2 px-2 text-xs uppercase opacity-60">User</th>
                  <th className="py-2 px-2 text-xs uppercase opacity-60">Module</th>
                  <th className="py-2 px-2 text-xs uppercase opacity-60">Amount</th>
                  <th className="py-2 px-2 text-xs uppercase opacity-60">Confirmed</th>
                  <th className="py-2 px-2 text-xs uppercase opacity-60">Source</th>
                </tr>
              </thead>
              <tbody>
                {recentConfirmedPayments.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-sand-100 dark:border-sand-800/60"
                  >
                    <td className="py-2.5 px-2">
                      <p className="font-semibold">{p.user_name}</p>
                      <p className="text-xs opacity-60 font-mono">{p.user_uid}</p>
                    </td>
                    <td className="py-2.5 px-2">{p.product_title}</td>
                    <td className="py-2.5 px-2 font-bold text-emerald-700 dark:text-emerald-400">{formatInr(p.amount)}</td>
                    <td className="py-2.5 px-2 text-xs opacity-70 whitespace-nowrap">
                      {p.paid_at && new Date(p.paid_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-2.5 px-2 text-xs capitalize opacity-70">{p.confirmation_source?.replace('_', ' ') || '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashCard>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
        {statCards.map((s, i) => (
          <AdminStatCard key={s.label} stat={s} index={i} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <DashCard className="!p-5 sm:!p-6" glow>
          <h3 className="font-bold mb-4">Registration Trend</h3>
          <AdminLineChart data={signupsTrend} valueKey="count" />
        </DashCard>
        <DashCard className="!p-5 sm:!p-6" glow delay={0.05}>
          <h3 className="font-bold mb-4">Revenue Trend</h3>
          <AdminLineChart data={revenueTrend} valueKey="amount" formatValue={formatInr} />
        </DashCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <DashCard className="!p-5 sm:!p-6" glow>
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" /> Conversion Funnel
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Registered → Booked a module', value: conversion.registrationToBooking },
              { label: 'Registered → Completed payment', value: conversion.registrationToPayment },
              { label: 'Booked → Paid', value: conversion.bookingToPayment },
              { label: 'Paid → Test completed', value: conversion.paymentToCompletion },
            ].map((row, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="flex justify-between text-sm mb-1.5 gap-3">
                  <span className="font-medium">{row.label}</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 shrink-0">{row.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-sand-100 dark:bg-sand-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${row.value}%` }}
                    transition={{ duration: 0.7, delay: i * 0.08 }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-xs opacity-60 mt-4">{conversion.usersWithCompletedTest} users completed at least one assessment flow.</p>
        </DashCard>

        <DashCard className="!p-5 sm:!p-6" glow delay={0.05}>
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-amber-500" /> Revenue by Product
          </h3>
          {revenueBreakdown.length === 0 ? (
            <AdminBarChart data={[{ label: 'No revenue', count: 0 }]} />
          ) : (
            <AdminBarChart
              data={revenueBreakdown.map((r) => ({ label: r.product, count: r.amount }))}
              formatValue={formatInr}
            />
          )}
        </DashCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <DashCard className="!p-5 sm:!p-6" glow>
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-500" /> Top Career Interests
          </h3>
          <AdminBarChart data={interestChartData} />
          {careerInterests.length > 0 && (
            <div className="mt-4 space-y-2">
              {careerInterests.slice(0, 6).map((item) => (
                <MetricBar key={item.label} label={item.label} count={item.count} total={topInterestTotal} />
              ))}
            </div>
          )}
        </DashCard>

        <DashCard className="!p-5 sm:!p-6" glow delay={0.05}>
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500" /> Users by Class / Level
          </h3>
          <AdminDonutChart data={classChartData.filter((d) => d.count > 0)} />
          {classDistribution.length > 0 && (
            <div className="mt-4 space-y-2">
              {classDistribution.map((item) => (
                <MetricBar key={item.label} label={item.label} count={item.count} total={classTotal} color="from-violet-500 to-purple-500" />
              ))}
            </div>
          )}
        </DashCard>
      </div>

      {/* Marketing & acquisition */}
      <div>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-amber-500" /> Marketing & Acquisition
        </h3>
        <div className="grid lg:grid-cols-2 gap-4">
          <DashCard className="!p-5 sm:!p-6" glow>
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-amber-500" /> How Users Found Us
            </h4>
            {marketing?.howHeard?.length > 0 ? (
              <>
                <AdminBarChart data={marketing.howHeard.slice(0, 8)} />
                <div className="mt-4 space-y-2">
                  {marketing.howHeard.map((item) => (
                    <MetricBar
                      key={item.label}
                      label={item.label}
                      count={item.count}
                      total={marketing.howHeard.reduce((s, i) => s + i.count, 0) || 1}
                      color="from-blue-500 to-indigo-500"
                    />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm opacity-60">Acquisition data appears as users complete their profile.</p>
            )}
          </DashCard>

          <DashCard className="!p-5 sm:!p-6" glow delay={0.05}>
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" /> Counselling Preference
            </h4>
            {marketing?.preferredMode?.length > 0 ? (
              <>
                <AdminDonutChart data={marketing.preferredMode.filter((d) => d.count > 0)} />
                <div className="mt-4 space-y-2">
                  {marketing.preferredMode.map((item) => (
                    <MetricBar
                      key={item.label}
                      label={item.label}
                      count={item.count}
                      total={marketing.preferredMode.reduce((s, i) => s + i.count, 0) || 1}
                      color="from-teal-500 to-emerald-500"
                    />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm opacity-60">Mode preferences appear as users fill profiles.</p>
            )}
          </DashCard>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <DashCard className="!p-5 sm:!p-6" glow>
          <h3 className="font-bold mb-4">Most Purchased Modules</h3>
          <AdminDonutChart data={productOrders.length ? productOrders : [{ label: 'No orders', count: 0 }]} />
        </DashCard>
        <DashCard className="!p-5 sm:!p-6" glow delay={0.05}>
          <h3 className="font-bold mb-4">Consultation Status</h3>
          {consultationStatuses.length === 0 ? (
            <p className="text-sm opacity-60">No consultations yet.</p>
          ) : (
            <AdminBarChart data={consultationStatuses.map((c) => ({ label: c.label, count: c.count }))} />
          )}
        </DashCard>
        <DashCard className="!p-5 sm:!p-6" glow delay={0.1}>
          <h3 className="font-bold mb-4">Top Streams</h3>
          {streamDistribution?.length > 0 ? (
            <div className="space-y-3">
              {streamDistribution.slice(0, 8).map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex justify-between p-3 rounded-xl bg-sand-50 dark:bg-sand-800/50 text-sm"
                >
                  <span>{item.label}</span>
                  <span className="font-bold">{item.count}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm opacity-60">Stream data appears as users fill profiles.</p>
          )}
        </DashCard>
      </div>
    </motion.div>
  );
}
