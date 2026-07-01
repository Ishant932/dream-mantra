import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, MapPin, Link2, Phone, Mail, Save, UserCircle, Search, Filter, X,
} from 'lucide-react';
import { useLang } from '../../context/LanguageContext';
import SlotCalendar from '../SlotCalendar';
import AdminOpenSlotCard from '../AdminOpenSlotCard';
import ProfileSnapshot from './ProfileSnapshot';
import AdminPanelHeader from '../AdminPanelHeader';
import AdminSectionExport from '../AdminSectionExport';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function StaffBookingsPanel({ api, token, onViewProfile, onError, onNotice }) {
  const { t } = useLang();
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
      setSlots(data.slots || []);
    } catch (err) {
      onError?.(err.message);
    } finally {
      setSlotsLoading(false);
    }
  }, [api, token, onError]);

  const loadConsultations = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api.consultations(token);
      setConsultations(data.consultations || []);
    } catch (err) {
      onError?.(err.message);
    }
  }, [api, token, onError]);

  useEffect(() => {
    loadSlots();
    loadConsultations();
  }, [loadSlots, loadConsultations]);

  const openSlots = useMemo(
    () => slots.filter((s) => s.status === 'open' && (s.booked_count || 0) < (s.capacity || 1)),
    [slots]
  );

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
  ];

  return (
    <div className="space-y-4">
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
      <section className="staff-booking-block">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
          <Calendar className="w-5 h-5 text-amber-500" /> Consultation Slots — Live Calendar
        </h2>
        <p className="text-sm opacity-70 mb-2">
          Create slots below, or click any slot on the calendar to edit time, capacity, counsellor, and meeting link. Delete empty slots with the trash icon.
        </p>
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-6">
          {openSlots.length} open slots across all dates · {slots.length} total
        </p>
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

      <section className="staff-booking-block">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-lg font-bold">{t('admin.manageConsultations')}</h2>
            <p className="text-sm opacity-70">
              {filteredConsultations.length} of {consultations.length}
              {hasConsultationFilters && ' (filtered)'}
            </p>
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
              className="dash-admin-consult-card admin-booking-card"
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

      {openSlots.length > 0 && (
        <section className="staff-booking-block">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" /> All open slots ({openSlots.length})
          </h3>
          <p className="text-xs opacity-70 mb-4">
            Click the pencil icon on any card to edit date, time, capacity, counsellor, and meeting link.
          </p>
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
        </section>
      )}
    </div>
  );
}
