import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, MapPin, Link2, Phone, Mail, Save, UserCircle, Search, Filter, X,
  CalendarPlus, Trash2, Users, LayoutGrid, UserCog,
} from 'lucide-react';
import { useLang } from '../../context/LanguageContext';
import SlotCalendar from '../SlotCalendar';
import AdminOpenSlotCard from '../AdminOpenSlotCard';
import ProfileSnapshot from './ProfileSnapshot';
import AdminPanelHeader from '../AdminPanelHeader';
import AdminSectionExport from '../AdminSectionExport';
import BulkSlotsTool from './BulkSlotsTool';
import { isSlotBeforeToday } from '../../utils/slotForm';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const TAB_PANEL = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
};

function BookingSectionHead({ icon: Icon, iconTone, title, desc }) {
  return (
    <div className="staff-booking-section__head">
      <div className={`staff-booking-section__icon staff-booking-section__icon--${iconTone}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <h2 className="staff-booking-section__title">{title}</h2>
        {desc && <p className="staff-booking-section__desc">{desc}</p>}
      </div>
    </div>
  );
}

export default function StaffBookingsPanel({ api, token, onViewProfile, onError, onNotice, slotType = 'counselling' }) {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState('calendar');
  const [consultations, setConsultations] = useState([]);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [meetingLinks, setMeetingLinks] = useState({});
  const [consultationSearch, setConsultationSearch] = useState('');
  const [consultationDateFrom, setConsultationDateFrom] = useState('');
  const [consultationDateTo, setConsultationDateTo] = useState('');
  const [consultationStatusFilter, setConsultationStatusFilter] = useState('all');

  const loadSlots = useCallback(async () => {
    if (!token) return;
    setSlotsLoading(true);
    try {
      const data = await api.slots(token);
      const all = data.slots || [];
      setSlots(all.filter((s) => (s.slot_type || 'counselling') === slotType));
    } catch (err) {
      onError?.(err.message);
    } finally {
      setSlotsLoading(false);
    }
  }, [api, token, onError, slotType]);

  const loadConsultations = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.consultations(token);
      const all = data.consultations || [];
      setConsultations(all.filter((c) => {
        const type = c.booking_type || 'counselling';
        return type === slotType;
      }));
    } catch (err) {
      onError?.(err.message);
    }
  }, [api, token, onError, slotType]);

  useEffect(() => {
    loadSlots();
    loadConsultations();
  }, [loadSlots, loadConsultations]);

  const openSlots = useMemo(
    () => slots.filter((s) => (
      s.status === 'open'
      && (s.booked_count || 0) < (s.capacity || 1)
      && !isSlotBeforeToday(s)
    )),
    [slots]
  );

  const counsellorNames = useMemo(() => {
    const names = new Set();
    slots.forEach((s) => {
      const name = (s.counsellor || '').trim();
      if (name) names.add(name);
    });
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [slots]);

  const bookingTabs = useMemo(() => [
    { id: 'create-bulk', label: 'Create bulk slots', shortLabel: 'Create bulk', icon: CalendarPlus },
    { id: 'delete-bulk', label: 'Delete bulk slots', shortLabel: 'Delete bulk', icon: Trash2 },
    { id: 'calendar', label: 'Live calendar', shortLabel: 'Calendar', icon: Calendar },
    { id: 'open-slots', label: 'Open slots', shortLabel: 'Open slots', icon: Clock, count: openSlots.length },
    { id: 'consultations', label: 'Consultations', shortLabel: 'Consultations', icon: Users, count: consultations.length },
    { id: 'counsellors', label: 'All counsellors', shortLabel: 'Counsellors', icon: UserCog, count: counsellorNames.length },
  ], [openSlots.length, consultations.length, counsellorNames.length]);

  const filteredConsultations = useMemo(() => {
    const q = consultationSearch.trim().toLowerCase();
    return consultations.filter((c) => {
      if (consultationStatusFilter !== 'all' && c.status !== consultationStatusFilter) return false;
      if (consultationDateFrom || consultationDateTo) {
        if (!c.scheduled_at) return false;
        const day = new Date(c.scheduled_at).toISOString().slice(0, 10);
        if (consultationDateFrom && day < consultationDateFrom) return false;
        if (consultationDateTo && day > consultationDateTo) return false;
      }
      if (q) {
        const haystack = [
          c.user_name,
          c.email,
          c.phone,
          c.program,
          c.slot_title,
          c.user_uid,
          c.status,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [consultations, consultationSearch, consultationDateFrom, consultationDateTo, consultationStatusFilter]);

  const hasConsultationFilters = consultationSearch || consultationDateFrom || consultationDateTo
    || consultationStatusFilter !== 'all';

  const clearConsultationFilters = () => {
    setConsultationSearch('');
    setConsultationDateFrom('');
    setConsultationDateTo('');
    setConsultationStatusFilter('all');
  };

  const updateStatus = async (id, status) => {
    try {
      await api.updateConsultation(token, id, { status });
      await loadConsultations();
    } catch (err) {
      onError?.(err.message);
    }
  };

  const saveMeetingLink = async (id) => {
    try {
      await api.updateConsultation(token, id, { meeting_link: meetingLinks[id] || '' });
      await loadConsultations();
      onNotice?.('Meeting link saved.');
    } catch (err) {
      onError?.(err.message);
    }
  };

  const handleCreateSlot = async (form) => {
    try {
      await api.createSlot(token, form);
      await loadSlots();
      onNotice?.('Slot created successfully.');
    } catch (err) {
      onError?.(err.message);
      throw err;
    }
  };

  const handleUpdateSlot = async (id, form) => {
    try {
      await api.updateSlot(token, id, form);
      await loadSlots();
      onNotice?.('Slot updated successfully.');
    } catch (err) {
      onError?.(err.message);
      throw err;
    }
  };

  const handleDeleteSlot = async (id) => {
    try {
      await api.deleteSlot(token, id);
      await loadSlots();
      onNotice?.('Slot deleted.');
    } catch (err) {
      onError?.(err.message);
      throw err;
    }
  };

  const consultationExportColumns = [
    { label: 'Student', get: (c) => c.user_name },
    { label: 'Dreams ID', get: (c) => c.user_uid },
    { label: 'Email', get: (c) => c.email },
    { label: 'Phone', get: (c) => c.phone },
    { label: 'Program', get: (c) => c.program },
    { label: 'Status', get: (c) => c.status },
    { label: 'Scheduled', get: (c) => c.scheduled_at },
    { label: 'Slot', get: (c) => c.slot_title },
  ];

  const slotExportColumns = [
    { label: 'Title', get: (s) => s.title },
    { label: 'Date', get: (s) => s.date },
    { label: 'Time', get: (s) => s.time },
    { label: 'Status', get: (s) => s.status },
    { label: 'Capacity', get: (s) => s.capacity },
    { label: 'Booked', get: (s) => s.booked_count },
    { label: 'Counsellor', get: (s) => s.counsellor },
  ];

  const renderTabPanel = () => {
    switch (activeTab) {
      case 'create-bulk':
        return (
          <section className="dash-inner-card staff-booking-section">
            <BookingSectionHead
              icon={CalendarPlus}
              iconTone="bulk"
              title="Create bulk slots"
              desc={slotType === 'program_session'
                ? 'Generate recurring program session slots (Career Readiness) across a date range.'
                : 'Generate recurring counselling slots across a date range for selected weekdays.'}
            />
            <BulkSlotsTool
              mode="create"
              api={api}
              token={token}
              slotType={slotType}
              onSuccess={(msg) => { onNotice?.(msg); loadSlots(); }}
              onError={onError}
            />
          </section>
        );
      case 'delete-bulk':
        return (
          <section className="dash-inner-card staff-booking-section">
            <BookingSectionHead
              icon={Trash2}
              iconTone="bulk"
              title="Delete bulk slots"
              desc="Remove slots in a date range. By default only empty (unbooked) slots are deleted."
            />
            <BulkSlotsTool
              mode="delete"
              api={api}
              token={token}
              onSuccess={(msg) => { onNotice?.(msg); loadSlots(); }}
              onError={onError}
            />
          </section>
        );
      case 'calendar':
        return (
          <section className="dash-inner-card staff-booking-section">
            <BookingSectionHead
              icon={Calendar}
              iconTone="calendar"
              title="Live slots calendar"
              desc="Click any day or slot to create, edit capacity, counsellor, and meeting link. Delete empty slots with the trash icon."
            />
            <SlotCalendar
              mode="admin"
              size="large"
              slots={slots}
              loading={slotsLoading}
              onCreateSlot={handleCreateSlot}
              onUpdateSlot={handleUpdateSlot}
              onDeleteSlot={handleDeleteSlot}
            />
          </section>
        );
      case 'counsellors':
        return (
          <section className="dash-inner-card staff-booking-section">
            <BookingSectionHead
              icon={UserCog}
              iconTone="users"
              title="All counsellors"
              desc="Counsellors assigned across your booking slots."
            />
            {counsellorNames.length === 0 ? (
              <p className="text-sm opacity-70">No counsellors on slots yet. Add counsellor names when creating slots.</p>
            ) : (
              <div className="staff-booking-counsellor-chips">
                {counsellorNames.map((name) => (
                  <span key={name} className="staff-booking-counsellor-chip">
                    <UserCog className="w-3.5 h-3.5 opacity-70" />
                    {name}
                  </span>
                ))}
              </div>
            )}
          </section>
        );
      case 'consultations':
        return (
          <section className="dash-inner-card staff-booking-section">
            <div className="flex flex-wrap items-start justify-between gap-3 staff-booking-section__head">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="staff-booking-section__icon staff-booking-section__icon--users">
                  <Users className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="staff-booking-section__title">{t('admin.manageConsultations')}</h2>
                  <p className="staff-booking-section__desc">
                    {filteredConsultations.length} of {consultations.length} shown
                    {hasConsultationFilters ? ' (filtered)' : ''}
                  </p>
                </div>
              </div>
              <AdminSectionExport title="Slots" filename="booking-slots" rows={slots} columns={slotExportColumns} />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5 staff-booking-filters">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wide opacity-60 flex items-center gap-1 mb-1.5">
                  <Search className="w-3 h-3" /> Search
                </label>
                <input
                  type="search"
                  className="input-field w-full !py-2 !text-sm"
                  placeholder="Name, email, phone, program, slot…"
                  value={consultationSearch}
                  onChange={(e) => setConsultationSearch(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide opacity-60 mb-1.5 block">From date</label>
                <input
                  type="date"
                  className="input-field w-full !py-2 !text-sm"
                  value={consultationDateFrom}
                  onChange={(e) => setConsultationDateFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide opacity-60 mb-1.5 block">To date</label>
                <input
                  type="date"
                  className="input-field w-full !py-2 !text-sm"
                  value={consultationDateTo}
                  onChange={(e) => setConsultationDateTo(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wide opacity-60 flex items-center gap-1 mb-1.5">
                  <Filter className="w-3 h-3" /> Status
                </label>
                <select
                  className="input-field w-full !py-2 !text-sm"
                  value={consultationStatusFilter}
                  onChange={(e) => setConsultationStatusFilter(e.target.value)}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {hasConsultationFilters && (
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={clearConsultationFilters}
                    className="btn-outline !py-2 !px-3 text-sm w-full inline-flex items-center justify-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Clear filters
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4 max-h-[32rem] overflow-y-auto pr-1">
              {consultations.length === 0 ? (
                <p className="text-sm opacity-70">No consultations yet.</p>
              ) : filteredConsultations.length === 0 ? (
                <p className="text-sm opacity-70">No consultations match your filters.</p>
              ) : filteredConsultations.map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="dash-inner-card dash-admin-consult-card admin-booking-card"
                >
                  <div className="flex flex-wrap justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-base">{c.user_name} — {c.program}</p>
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mt-0.5">{c.slot_title || 'Counselling Session'}</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs opacity-80">
                        {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>}
                        {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                      </div>
                      {c.scheduled_at && (
                        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(c.scheduled_at).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Kolkata' })}
                          {c.end_at && ` – ${new Date(c.end_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}`}
                        </p>
                      )}
                      {c.location && (
                        <p className="text-xs mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{c.location} · {c.mode}</p>
                      )}
                      {c.notes && <p className="text-xs mt-2 p-2 rounded-lg bg-sand-100 dark:bg-sand-800/60 italic">&quot;{c.notes}&quot;</p>}
                      <ProfileSnapshot profile={c.user_profile || c.user_snapshot?.profile} />
                    </div>
                    {onViewProfile && (
                      <button
                        type="button"
                        onClick={() => onViewProfile(c.user_id)}
                        className="dash-admin-view-btn shrink-0 h-9 w-9 rounded-xl inline-flex items-center justify-center"
                        title="Full profile"
                      >
                        <UserCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-sand-200/60 dark:border-sand-700/40">
                    <label className="text-xs font-bold uppercase tracking-wide opacity-60 flex items-center gap-1 mb-1.5">
                      <Link2 className="w-3 h-3" /> Meeting link (share with user)
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      <input
                        type="url"
                        className="input-field flex-1 min-w-[12rem] !py-2 !text-sm"
                        placeholder="https://meet.google.com/..."
                        value={meetingLinks[c.id] ?? c.meeting_link ?? ''}
                        onChange={(e) => setMeetingLinks({ ...meetingLinks, [c.id]: e.target.value })}
                      />
                      <button type="button" onClick={() => saveMeetingLink(c.id)} className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1">
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 flex-wrap">
                    {['pending', 'confirmed', 'completed'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => updateStatus(c.id, st)}
                        className={`text-xs px-3 py-1.5 rounded-lg capitalize transition ${c.status === st ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-amber-50 shadow-md' : 'dash-admin-status-idle'}`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        );
      case 'open-slots':
        return (
          <section className="dash-inner-card staff-booking-section">
            <BookingSectionHead
              icon={Clock}
              iconTone="slots"
              title={`All open slots (${openSlots.length})`}
              desc="Available slots students can book. Use the pencil icon to edit date, time, capacity, counsellor, and meeting link."
            />
            {openSlots.length === 0 ? (
              <p className="text-sm opacity-70">No open slots right now. Use Create bulk slots or the Calendar tab to add slots.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[28rem] overflow-y-auto pr-1">
                {openSlots.map((s) => (
                  <AdminOpenSlotCard
                    key={s.id}
                    slot={s}
                    onUpdate={handleUpdateSlot}
                    onDelete={handleDeleteSlot}
                  />
                ))}
              </div>
            )}
          </section>
        );
      default:
        return (
          <section className="dash-inner-card staff-booking-section">
            <p className="text-sm opacity-70">Select a tab above to manage bookings.</p>
          </section>
        );
    }
  };

  return (
    <div className="staff-booking-page">
      <AdminPanelHeader
        title="Booking Management"
        subtitle={`${filteredConsultations.length} consultations · ${slots.length} slots`}
        exportProps={{
          title: 'Bookings',
          filename: 'bookings-consultations',
          rows: filteredConsultations,
          columns: consultationExportColumns,
        }}
      />

      <div className="staff-booking-stats">
        <button type="button" className="dash-inner-card staff-booking-stat staff-booking-stat--btn" onClick={() => setActiveTab('open-slots')}>
          <div className="staff-booking-stat__icon staff-booking-stat__icon--emerald">
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="staff-booking-stat__value">{openSlots.length}</p>
            <p className="staff-booking-stat__label">Open slots</p>
          </div>
        </button>
        <button type="button" className="dash-inner-card staff-booking-stat staff-booking-stat--btn" onClick={() => setActiveTab('calendar')}>
          <div className="staff-booking-stat__icon staff-booking-stat__icon--amber">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="staff-booking-stat__value">{slots.length}</p>
            <p className="staff-booking-stat__label">Total slots</p>
          </div>
        </button>
        <button type="button" className="dash-inner-card staff-booking-stat staff-booking-stat--btn" onClick={() => setActiveTab('consultations')}>
          <div className="staff-booking-stat__icon staff-booking-stat__icon--blue">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="staff-booking-stat__value">{consultations.length}</p>
            <p className="staff-booking-stat__label">Consultations</p>
          </div>
        </button>
        <button type="button" className="dash-inner-card staff-booking-stat staff-booking-stat--btn" onClick={() => setActiveTab('counsellors')}>
          <div className="staff-booking-stat__icon staff-booking-stat__icon--violet">
            <UserCog className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="staff-booking-stat__value">{counsellorNames.length}</p>
            <p className="staff-booking-stat__label">Counsellors</p>
          </div>
        </button>
      </div>

      <div className="staff-booking-tabs-wrap dash-inner-card">
        <div className="staff-booking-tabs" role="tablist" aria-label="Booking management sections">
          {bookingTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`staff-booking-tab${isActive ? ' staff-booking-tab--active' : ''}`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden />
                <span className="staff-booking-tab__label hidden sm:inline">{tab.label}</span>
                <span className="staff-booking-tab__label sm:hidden">{tab.shortLabel}</span>
                {tab.count != null && tab.count > 0 && (
                  <span className="staff-booking-tab__badge">{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} {...TAB_PANEL} className="staff-booking-tab-panel">
          {renderTabPanel()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
