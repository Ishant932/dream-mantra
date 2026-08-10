import { useState } from 'react';
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
  const [view, setView] = useState('overview');
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
    { label: 'Users', value: summary.totalUsers, icon: Users },
    { label: 'Revenue', value: formatInr(summary.totalRevenue), icon: IndianRupee },
    { label: 'Paid orders', value: summary.assessmentsPaid, icon: UserCheck },
    { label: 'Conversion', value: `${conversion.registrationToPayment}%`, icon: Percent },
    { label: 'New (7d)', value: marketing?.newUsersThisWeek ?? summary.newUsersThisWeek, icon: BarChart3 },
    { label: 'Pending reviews', value: summary.pendingPaymentReviews ?? summary.pendingPayments, icon: Clock },
  ];

  const analyticsTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'trends', label: 'Trends' },
    { id: 'audience', label: 'Audience' },
    { id: 'revenue', label: 'Revenue' },
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
        subtitle="Users, conversion, revenue & marketing insights."
        exportProps={{ title: 'Analytics', filename: 'analytics', rows: exportRows, columns: exportColumns }}
      />

      <div className="flex flex-wrap gap-2 mb-3">
        {analyticsTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`dash-subtab-rail__chip${view === tab.id ? ' is-active' : ''}`}
            onClick={() => setView(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
        {statCards.map((s, i) => (
          <AdminStatCard key={s.label} stat={s} index={i} />
        ))}
      </div>

      {view === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-3">
          <DashCard className="!p-4 sm:!p-5 admin-analytics-card--compact" glow>
            <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-amber-500" /> Conversion Funnel
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Registered → Booked', value: conversion.registrationToBooking },
                { label: 'Registered → Paid', value: conversion.registrationToPayment },
                { label: 'Booked → Paid', value: conversion.bookingToPayment },
                { label: 'Paid → Completed', value: conversion.paymentToCompletion },
              ].map((row, i) => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs mb-1 gap-2">
                    <span className="font-medium">{row.label}</span>
                    <span className="font-bold text-emerald-700 shrink-0">{row.value}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-sand-100 dark:bg-sand-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(row.value, 100)}%` }}
                      transition={{ duration: 0.6, delay: i * 0.06 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] opacity-60 mt-3">{conversion.usersWithCompletedTest} users completed a test flow.</p>
          </DashCard>
          {recentConfirmedPayments?.length > 0 && (
            <DashCard className="!p-4 sm:!p-5 admin-analytics-card--compact" glow>
              <h3 className="font-bold mb-3 text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" /> Recent payments
              </h3>
              <div className="space-y-2">
                {recentConfirmedPayments.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex justify-between gap-2 text-xs border-b border-sand-100 dark:border-sand-800 pb-2">
                    <span className="font-semibold truncate">{p.user_name}</span>
                    <span className="font-bold text-emerald-700">{formatInr(p.amount)}</span>
                  </div>
                ))}
              </div>
            </DashCard>
          )}
        </div>
      )}

      {view === 'trends' && (
        <div className="grid lg:grid-cols-2 gap-3">
          <DashCard className="!p-4 admin-analytics-card--compact" glow>
            <h3 className="font-bold mb-3 text-sm">Registration Trend</h3>
            <AdminLineChart data={signupsTrend} valueKey="count" height={100} />
          </DashCard>
          <DashCard className="!p-4 admin-analytics-card--compact" glow>
            <h3 className="font-bold mb-3 text-sm">Revenue Trend</h3>
            <AdminLineChart data={revenueTrend} valueKey="amount" height={100} formatValue={formatInr} />
          </DashCard>
        </div>
      )}

      {view === 'revenue' && (
        <div className="grid lg:grid-cols-2 gap-3">
          <DashCard className="!p-4 admin-analytics-card--compact" glow>
            <h3 className="font-bold mb-3 text-sm flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-amber-500" /> Revenue by Product
            </h3>
            <AdminBarChart data={revenueBreakdown.length ? revenueBreakdown.map((r) => ({ label: r.product, count: r.amount })) : [{ label: 'No revenue', count: 0 }]} height={120} formatValue={formatInr} />
          </DashCard>
          {modulePurchases?.length > 0 && (
            <DashCard className="!p-4 admin-analytics-card--compact" glow>
              <h3 className="font-bold mb-3 text-sm">Module purchases</h3>
              <div className="space-y-2 text-xs">
                {modulePurchases.filter((m) => m.count > 0).map((mod) => (
                  <div key={mod.slug} className="flex justify-between gap-2 py-1 border-b border-sand-100 dark:border-sand-800">
                    <span>{mod.title}</span>
                    <span className="font-bold">{mod.count}</span>
                  </div>
                ))}
              </div>
            </DashCard>
          )}
        </div>
      )}

      {view === 'audience' && (
        <div className="grid lg:grid-cols-2 gap-3">
          <DashCard className="!p-4 admin-analytics-card--compact" glow>
            <h3 className="font-bold mb-3 text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-500" /> Career interests
            </h3>
            <AdminBarChart data={interestChartData} height={120} />
          </DashCard>
          <DashCard className="!p-4 admin-analytics-card--compact" glow>
            <h3 className="font-bold mb-3 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" /> Class / Level
            </h3>
            <AdminDonutChart data={classChartData.filter((d) => d.count > 0)} />
          </DashCard>
        </div>
      )}

    </motion.div>
  );
}
