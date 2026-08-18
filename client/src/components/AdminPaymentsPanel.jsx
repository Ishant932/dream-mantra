import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2, Clock, XCircle, RotateCcw, Search, ChevronLeft, ChevronRight,
  Image as ImageIcon, Pencil, Check, X, Download,
} from 'lucide-react';
import { adminApi } from '../api';
import { DashCard } from './DashboardUI';
import CopyableUserId from './CopyableUserId';
import AdminSectionExport from './AdminSectionExport';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

const STATUS_CHANGE_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

function StatusBadge({ status }) {
  const map = {
    confirmed: { cls: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2, label: 'Confirmed' },
    pending: { cls: 'bg-amber-100 text-amber-800', icon: Clock, label: 'Pending' },
    failed: { cls: 'bg-red-100 text-red-800', icon: XCircle, label: 'Failed' },
    refunded: { cls: 'bg-sand-200 text-sand-700', icon: RotateCcw, label: 'Refunded' },
  };
  const s = map[status] || map.pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${s.cls}`}>
      <Icon className="w-3 h-3" /> {s.label}
    </span>
  );
}

function PaymentStatusSelect({ value, disabled, onChange }) {
  return (
    <label className="admin-pay-status">
      <span className="admin-pay-status__label">Payment status</span>
      <select
        className={`admin-pay-status__select admin-pay-status__select--${value || 'pending'}`}
        value={value || 'pending'}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        title="Set Pending, Confirmed, Failed or Refunded"
      >
        {STATUS_CHANGE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function ConfirmationBadge({ payment }) {
  const label = payment.confirmation_status || '—';
  const cls =
    payment.payment_status === 'confirmed'
      ? 'text-emerald-700 bg-emerald-50'
      : payment.submitted_at || payment.payment_proof_url
        ? 'text-violet-700 bg-violet-50'
        : 'text-amber-700 bg-amber-50';
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-md ${cls}`}>
      {label}
    </span>
  );
}

export default function AdminPaymentsPanel({ token, users = [], onNotice, onError, onViewUser }) {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [actionId, setActionId] = useState(null);
  const [userComments, setUserComments] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ amount: '', adminNote: '', userNote: '' });
  const [reassignId, setReassignId] = useState(null);
  const [reassignUserId, setReassignUserId] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [failModal, setFailModal] = useState(null);
  const [failNote, setFailNote] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await adminApi.payments(token, {
        status: statusFilter,
        search,
        page,
        limit: 20,
        sort,
        order,
      });
      setPayments(data.payments || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
    } catch (e) {
      onError?.(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, search, page, sort, order, onError]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const handleStatus = async (paymentId, status, userNote = '') => {
    setActionId(paymentId);
    try {
      await adminApi.updatePayment(token, paymentId, {
        status,
        userNote: userNote || userComments[paymentId] || undefined,
      });
      onNotice?.(`Payment marked as ${status}`);
      setFailModal(null);
      setFailNote('');
      await load();
    } catch (e) {
      onError?.(e.message);
    } finally {
      setActionId(null);
    }
  };

  const openFailModal = (payment) => {
    setFailModal(payment);
    setFailNote(userComments[payment.id] || '');
  };

  const confirmFail = () => {
    if (!failNote.trim()) {
      onError?.('Please enter a reason for the user');
      return;
    }
    handleStatus(failModal.id, 'failed', failNote.trim());
  };

  const exportColumns = [
    { label: 'Order ID', get: (p) => p.order_id },
    { label: 'User', get: (p) => p.user_name },
    { label: 'Dreams ID', get: (p) => p.user_uid },
    { label: 'Email', get: (p) => p.email },
    { label: 'Phone', get: (p) => p.phone },
    { label: 'Amount', get: (p) => p.amount },
    { label: 'Ref ID', get: (p) => p.payment_reference_id },
    { label: 'Status', get: (p) => p.payment_status },
    { label: 'Created', get: (p) => p.created_at },
  ];

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditForm({
      amount: String(p.amount ?? ''),
      adminNote: '',
      userNote: p.user_note || userComments[p.id] || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ amount: '', adminNote: '', userNote: '' });
  };

  const changeStatus = (payment, nextStatus) => {
    if (!nextStatus || nextStatus === payment.payment_status) return;
    if (nextStatus === 'failed') {
      openFailModal(payment);
      return;
    }
    handleStatus(payment.id, nextStatus, userComments[payment.id] || '');
  };

  const saveEdit = async (paymentId) => {
    setActionId(paymentId);
    try {
      await adminApi.updatePayment(token, paymentId, {
        amount: editForm.amount ? Number(editForm.amount) : undefined,
        userNote: editForm.userNote,
      });
      onNotice?.('Payment details updated');
      cancelEdit();
      await load();
    } catch (e) {
      onError?.(e.message);
    } finally {
      setActionId(null);
    }
  };

  const saveReassign = async (paymentId) => {
    if (!reassignUserId) return;
    setActionId(paymentId);
    try {
      await adminApi.updatePayment(token, paymentId, { userId: Number(reassignUserId) });
      onNotice?.('Payment reassigned to selected user');
      setReassignId(null);
      setReassignUserId('');
      await load();
    } catch (e) {
      onError?.(e.message);
    } finally {
      setActionId(null);
    }
  };

  const fetchAllForExport = useCallback(async () => {
    const data = await adminApi.payments(token, {
      status: statusFilter,
      search,
      page: 1,
      limit: 10000,
      sort,
      order,
    });
    return data.payments || [];
  }, [token, statusFilter, search, sort, order]);

  const openUserPage = (userId) => {
    if (!userId) return;
    if (onViewUser) onViewUser(userId);
  };

  const pendingCount = useMemo(
    () => payments.filter((p) => p.payment_status === 'pending').length,
    [payments],
  );

  return (
    <DashCard className="!p-4 sm:!p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold mb-1">Payment Verification</h2>
          <p className="text-sm opacity-70">
            Review pending orders, proof screenshots, and reference IDs.
            {pendingCount != null && pendingCount > 0 && (
              <span className="ml-2 font-bold text-amber-700">{pendingCount} pending</span>
            )}
          </p>
        </div>
        <AdminSectionExport
          title="Payments"
          filename="payments"
          rows={payments}
          columns={exportColumns}
          onFetchRows={fetchAllForExport}
        />
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
          <input
            type="search"
            placeholder="Search order ID, name, email, phone…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field w-full !pl-9 !py-2 text-sm"
          />
        </div>
        <select
          className="input-field !py-2 text-sm w-auto"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm opacity-60 py-8 text-center">Loading payments…</p>
      ) : payments.length === 0 ? (
        <p className="text-sm opacity-60 py-8 text-center">No payments match your filters.</p>
      ) : (
        <>
        <div className="md:hidden space-y-3">
          {payments.map((p) => (
            <div key={p.id} className="rounded-xl border border-sand-200 dark:border-sand-700 p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-mono text-xs font-bold break-all">{p.order_id}</p>
                  <p className="font-semibold mt-1">
                    <button
                      type="button"
                      onClick={() => openUserPage(p.user_id)}
                      className="text-left font-semibold text-amber-800 hover:underline"
                    >
                      {p.user_name}
                    </button>
                  </p>
                  <CopyableUserId uid={p.user_uid} compact />
                </div>
                <StatusBadge status={p.payment_status} />
              </div>
              <div className="text-xs space-y-1">
                <p><span className="opacity-60">Amount:</span> <strong className="text-amber-700">₹{p.amount?.toLocaleString('en-IN')}</strong></p>
                {p.payment_reference_id && (
                  <p className="font-mono break-all"><span className="opacity-60">Ref ID:</span> {p.payment_reference_id}</p>
                )}
                <p className="opacity-70">{p.phone} · {p.email}</p>
              </div>
              {p.payment_proof_url && (
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setPreviewUrl(p.payment_proof_url)} className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-brand-50 text-brand-700 inline-flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" /> View proof
                  </button>
                  <a href={p.payment_proof_url} download={p.payment_proof_name || 'payment-proof'} className="text-xs font-bold px-2.5 py-1.5 rounded-lg border inline-flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                  {p.payment_proof_url.startsWith('data:image') || /\.(png|jpe?g|webp|gif)$/i.test(p.payment_proof_url) ? (
                    <img src={p.payment_proof_url} alt="Proof" className="w-full max-h-48 object-contain rounded-lg border mt-1" />
                  ) : null}
                </div>
              )}
              <textarea
                placeholder="Add a comment for the user…"
                value={userComments[p.id] ?? p.user_note ?? ''}
                onChange={(e) => setUserComments((prev) => ({ ...prev, [p.id]: e.target.value }))}
                rows={2}
                className="input-field !py-1.5 !text-xs w-full resize-none"
              />
              <div className="admin-pay-status-row">
                <PaymentStatusSelect
                  value={p.payment_status}
                  disabled={actionId === p.id}
                  onChange={(next) => changeStatus(p, next)}
                />
                {p.payment_status !== 'confirmed' && (
                  <button type="button" disabled={actionId === p.id} onClick={() => handleStatus(p.id, 'confirmed')} className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white">Confirm</button>
                )}
                {p.payment_status === 'pending' && (
                  <button type="button" disabled={actionId === p.id} onClick={() => openFailModal(p)} className="text-xs font-bold px-2 py-1.5 rounded-lg bg-red-100 text-red-700">Reject</button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="hidden md:block overflow-x-auto -mx-1">
          <table className="w-full text-sm admin-data-table min-w-[1100px]">
            <thead>
              <tr className="border-b border-sand-200 dark:border-sand-700 text-left">
                <th className="py-3 px-2 font-semibold text-xs uppercase tracking-wide opacity-60">Order ID</th>
                <th className="py-3 px-2 font-semibold text-xs uppercase tracking-wide opacity-60">User</th>
                <th className="py-3 px-2 font-semibold text-xs uppercase tracking-wide opacity-60">Phone / Email</th>
                <th className="py-3 px-2 font-semibold text-xs uppercase tracking-wide opacity-60">Amount</th>
                <th className="py-3 px-2 font-semibold text-xs uppercase tracking-wide opacity-60">Ref ID</th>
                <th className="py-3 px-2 font-semibold text-xs uppercase tracking-wide opacity-60">Proof</th>
                <th className="py-3 px-2 font-semibold text-xs uppercase tracking-wide opacity-60">Method</th>
                <th className="py-3 px-2 font-semibold text-xs uppercase tracking-wide opacity-60">Payment Status</th>
                <th className="py-3 px-2 font-semibold text-xs uppercase tracking-wide opacity-60">Confirmation</th>
                <th className="py-3 px-2 font-semibold text-xs uppercase tracking-wide opacity-60">Created</th>
                <th className="py-3 px-2 font-semibold text-xs uppercase tracking-wide opacity-60 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-sand-100 dark:border-sand-800/60 hover:bg-amber-50/40 dark:hover:bg-sand-800/30 align-top">
                  <td className="py-3 px-2">
                    <p className="font-mono text-xs font-semibold break-all max-w-[140px]" title={p.order_id}>{p.order_id}</p>
                    <p className="text-xs opacity-60 mt-0.5">{p.product_title || '—'}</p>
                  </td>
                  <td className="py-3 px-2">
                    <button
                      type="button"
                      onClick={() => openUserPage(p.user_id)}
                      className="font-semibold text-left text-amber-800 hover:underline"
                    >
                      {p.user_name}
                    </button>
                    <CopyableUserId uid={p.user_uid} compact />
                    <button
                      type="button"
                      onClick={() => openUserPage(p.user_id)}
                      className="text-xs font-semibold text-amber-700 hover:underline mt-1 inline-flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" /> View full profile
                    </button>
                  </td>
                  <td className="py-3 px-2 text-xs">
                    <p>{p.phone || '—'}</p>
                    <p className="opacity-70 break-all">{p.email || '—'}</p>
                  </td>
                  <td className="py-3 px-2 font-semibold text-amber-700 whitespace-nowrap">
                    {editingId === p.id ? (
                      <input
                        type="number"
                        min="0"
                        className="input-field !py-1.5 !text-xs w-24"
                        value={editForm.amount}
                        onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                        disabled={p.payment_status === 'confirmed'}
                      />
                    ) : (
                      <>₹{p.amount?.toLocaleString('en-IN')}</>
                    )}
                  </td>
                  <td className="py-3 px-2 font-mono text-xs break-all max-w-[120px]">
                    {p.payment_reference_id || '—'}
                  </td>
                  <td className="py-3 px-2">
                    {p.payment_proof_url ? (
                      <div className="space-y-1">
                        <button type="button" onClick={() => setPreviewUrl(p.payment_proof_url)} className="text-xs font-semibold text-brand-600 inline-flex items-center gap-1 hover:underline">
                          <ImageIcon className="w-3.5 h-3.5" /> View
                        </button>
                        <a href={p.payment_proof_url} download={p.payment_proof_name || 'payment-proof'} className="text-xs font-semibold text-amber-700 block hover:underline">
                          <Download className="w-3 h-3 inline" /> Download
                        </a>
                      </div>
                    ) : '—'}
                  </td>
                  <td className="py-3 px-2">
                    <span className="text-xs font-semibold capitalize">
                      {p.payment_method || p.provider || 'manual'}
                    </span>
                  </td>
                  <td className="py-3 px-2"><StatusBadge status={p.payment_status} /></td>
                  <td className="py-3 px-2">
                    <ConfirmationBadge payment={p} />
                    {p.confirmation_source === 'admin_manual' && p.confirmed_by_admin_name && (
                      <p className="text-xs opacity-60 mt-0.5">By {p.confirmed_by_admin_name}</p>
                    )}
                  </td>
                  <td className="py-3 px-2 text-xs opacity-70 whitespace-nowrap">
                    {p.created_at && new Date(p.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-3 px-2 text-right min-w-[200px]">
                    {editingId === p.id ? (
                      <div className="space-y-2 text-left">
                        <textarea
                          placeholder="Comment for the user…"
                          value={editForm.userNote}
                          onChange={(e) => setEditForm({ ...editForm, userNote: e.target.value })}
                          rows={2}
                          className="input-field !py-1.5 !text-xs w-full resize-none"
                        />
                        <div className="flex flex-wrap gap-1 justify-end">
                          <button
                            type="button"
                            disabled={actionId === p.id}
                            onClick={() => saveEdit(p.id)}
                            className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" /> Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="text-xs font-bold px-2 py-1.5 rounded-lg bg-sand-200 text-sand-700 inline-flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                    <textarea
                      placeholder="Add a comment for the user (sent if you reject)…"
                      value={userComments[p.id] ?? p.user_note ?? ''}
                      onChange={(e) => setUserComments((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      rows={2}
                      className="input-field !py-1.5 !text-xs mb-2 w-full resize-none"
                    />
                    <div className="admin-pay-status-row admin-pay-status-row--end">
                      <PaymentStatusSelect
                        value={p.payment_status}
                        disabled={actionId === p.id}
                        onChange={(next) => changeStatus(p, next)}
                      />
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        className="text-xs font-bold px-2 py-1 rounded-lg border border-amber-300 text-amber-800 hover:bg-amber-50 inline-flex items-center gap-1"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      {p.payment_status !== 'confirmed' && (
                        <button
                          type="button"
                          disabled={actionId === p.id}
                          onClick={() => handleStatus(p.id, 'confirmed')}
                          className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Confirm Payment
                        </button>
                      )}
                      {p.payment_status === 'pending' && (
                        <button
                          type="button"
                          disabled={actionId === p.id}
                          onClick={() => openFailModal(p)}
                          className="text-xs font-bold px-2 py-1 rounded-lg bg-red-100 text-red-700"
                        >
                          Reject
                        </button>
                      )}
                      {p.payment_status === 'confirmed' && (
                        <button
                          type="button"
                          onClick={() => { setReassignId(p.id); setReassignUserId(String(p.user_id || '')); }}
                          className="text-xs font-bold px-2 py-1 rounded-lg border border-violet-300 text-violet-800 hover:bg-violet-50 inline-flex items-center gap-1"
                        >
                          <Pencil className="w-3 h-3" /> Edit user
                        </button>
                      )}
                      {reassignId === p.id && (
                        <div className="mt-2 space-y-2 text-left">
                          <select
                            className="input-field !py-1.5 !text-xs w-full"
                            value={reassignUserId}
                            onChange={(e) => setReassignUserId(e.target.value)}
                          >
                            <option value="">Select correct user…</option>
                            {users.filter((u) => u.role !== 'admin').map((u) => (
                              <option key={u.id} value={u.id}>{u.user_uid} — {u.name}</option>
                            ))}
                          </select>
                          <div className="flex gap-1 justify-end">
                            <button type="button" disabled={actionId === p.id || !reassignUserId} onClick={() => saveReassign(p.id)} className="text-xs font-bold px-2 py-1 rounded-lg bg-violet-600 text-white">Save user</button>
                            <button type="button" onClick={() => { setReassignId(null); setReassignUserId(''); }} className="text-xs font-bold px-2 py-1 rounded-lg bg-sand-200">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-sand-200 dark:border-sand-700">
          <p className="text-xs opacity-60">{pagination.total} payment{pagination.total !== 1 ? 's' : ''}</p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="p-2 rounded-lg border disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-sm font-semibold">{page} / {pagination.totalPages}</span>
            <button type="button" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="p-2 rounded-lg border disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {failModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setFailModal(null)}>
          <div className="bg-[var(--bg-elevated)] rounded-xl p-5 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-2">Reject payment</h3>
            <p className="text-sm opacity-70 mb-3">This comment will be sent to <strong>{failModal.user_name}</strong> and shown on their checkout page.</p>
            <textarea
              className="input-field w-full text-sm resize-none"
              rows={4}
              placeholder="Reason verification failed (e.g. screenshot unclear, wrong amount, invalid ref ID)…"
              value={failNote}
              onChange={(e) => setFailNote(e.target.value)}
            />
            <div className="flex gap-2 mt-4 justify-end">
              <button type="button" onClick={() => setFailModal(null)} className="btn-outline text-sm">Cancel</button>
              <button type="button" disabled={actionId === failModal.id} onClick={confirmFail} className="text-sm font-bold px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-50">Send & mark failed</button>
            </div>
          </div>
        </div>
      )}

      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setPreviewUrl(null)}>
          <div className="bg-white dark:bg-sand-900 rounded-xl p-3 max-w-lg w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-bold mb-2">Payment proof</p>
            {previewUrl.endsWith('.pdf') ? (
              <a href={previewUrl} target="_blank" rel="noreferrer" className="btn-primary text-sm inline-flex">Open PDF</a>
            ) : (
              <img src={previewUrl} alt="Payment proof" className="w-full rounded-lg" />
            )}
            <button type="button" onClick={() => setPreviewUrl(null)} className="btn-outline w-full mt-3 text-sm">Close</button>
          </div>
        </div>
      )}
    </DashCard>
  );
}
