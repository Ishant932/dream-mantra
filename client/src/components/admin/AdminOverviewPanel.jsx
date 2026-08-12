import { useState } from 'react';
import { Users, CreditCard, Clock, ArrowRight } from 'lucide-react';
import CopyableUserId from '../CopyableUserId';
import { DashCard } from '../DashboardUI';

const PREVIEW_LIMIT = 5;

const OVERVIEW_TABS = [
  { id: 'users', label: 'Registered Users', icon: Users, targetTab: 'users' },
  { id: 'payments', label: 'Recent Payments', icon: CreditCard, targetTab: 'payments' },
  { id: 'bookings', label: 'Recent Bookings', icon: Clock, targetTab: 'bookings' },
];

function ShowMoreButton({ total, expanded, onToggle }) {
  if (total <= PREVIEW_LIMIT) return null;
  return (
    <button type="button" className="dash-b2b-link-btn w-full mt-2 text-center" onClick={onToggle}>
      {expanded ? 'Show less' : `Show more (${total - PREVIEW_LIMIT} more)`}
    </button>
  );
}

export default function AdminOverviewPanel({
  users = [],
  payments = [],
  consultations = [],
  onViewProfile,
  onOpenTab,
}) {
  const [activeTab, setActiveTab] = useState('users');
  const [expanded, setExpanded] = useState({ users: false, payments: false, bookings: false });

  const confirmedPayments = payments.filter((p) => p.payment_status === 'confirmed');
  const tabMeta = OVERVIEW_TABS.find((t) => t.id === activeTab) || OVERVIEW_TABS[0];

  const visibleUsers = expanded.users ? users : users.slice(0, PREVIEW_LIMIT);
  const visiblePayments = expanded.payments ? confirmedPayments : confirmedPayments.slice(0, PREVIEW_LIMIT);
  const visibleBookings = expanded.bookings ? consultations : consultations.slice(0, PREVIEW_LIMIT);

  const openFullPage = () => onOpenTab?.(tabMeta.targetTab);

  return (
    <div className="dash-b2b-stack">
      <div className="dash-subtab-rail dash-subtab-rail--scroll dash-subtab-rail--center dash-subtab-rail--lg admin-overview-tabs">
        {OVERVIEW_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`dash-subtab-rail__chip admin-overview-tabs__chip${isActive ? ' is-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
              {tab.label}
            </button>
          );
        })}
      </div>

      <DashCard className="dash-b2b-widget dash-b2b-widget--wide" hover={false}>
        <div className="dash-b2b-widget__head">
          <button type="button" className="dash-b2b-widget__title dash-b2b-widget__title--link" onClick={openFullPage}>
            <tabMeta.icon className="w-4 h-4 text-blue-600" />
            {tabMeta.label}
            <ArrowRight className="w-4 h-4 opacity-60" aria-hidden />
          </button>
          <button type="button" className="dash-b2b-link-btn" onClick={openFullPage}>
            Open full page
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="dash-b2b-list">
            {visibleUsers.map((u) => (
              <div key={u.id} className="dash-b2b-list__row">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{u.name}</p>
                  {u.user_uid && <CopyableUserId uid={u.user_uid} compact animate={false} />}
                </div>
                <button type="button" onClick={() => onViewProfile(u.id)} className="dash-b2b-link-btn">View</button>
              </div>
            ))}
            {!users.length && <p className="text-sm text-[var(--text-secondary)]">No registered users yet.</p>}
            <ShowMoreButton total={users.length} expanded={expanded.users} onToggle={() => setExpanded((s) => ({ ...s, users: !s.users }))} />
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="dash-b2b-list">
            {visiblePayments.map((p) => (
              <div key={p.id} className="dash-b2b-list__row dash-b2b-list__row--stack">
                <p className="font-semibold text-sm">{p.user_name}</p>
                <p className="text-xs text-[var(--text-secondary)]">{p.product_title || p.type}</p>
                <p className="text-xs font-bold text-emerald-700">₹{p.amount?.toLocaleString('en-IN')}</p>
              </div>
            ))}
            {!confirmedPayments.length && <p className="text-sm text-[var(--text-secondary)]">No paid orders yet</p>}
            <ShowMoreButton total={confirmedPayments.length} expanded={expanded.payments} onToggle={() => setExpanded((s) => ({ ...s, payments: !s.payments }))} />
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="dash-b2b-list">
            {visibleBookings.map((c) => (
              <div key={c.id} className="dash-b2b-list__row dash-b2b-list__row--stack">
                <p className="font-semibold text-sm">{c.user_name} — {c.program}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {c.scheduled_at && new Date(c.scheduled_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })}
                </p>
              </div>
            ))}
            {!consultations.length && <p className="text-sm text-[var(--text-secondary)]">No bookings yet</p>}
            <ShowMoreButton total={consultations.length} expanded={expanded.bookings} onToggle={() => setExpanded((s) => ({ ...s, bookings: !s.bookings }))} />
          </div>
        )}
      </DashCard>
    </div>
  );
}
