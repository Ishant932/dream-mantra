import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2, Clock, XCircle, RotateCcw, Search, ChevronLeft, ChevronRight,
  Image as ImageIcon, Pencil, Check, X,
} from 'lucide-react';
import { adminApi } from '../api';
import { DashCard } from './DashboardUI';
import CopyableUserId from './CopyableUserId';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'all', label: 'All' },
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
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('created_at');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [actionId, setActionId] = useState(null);
  const [adminNotes, setAdminNotes] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ amount: '', adminNote: '', userNote: '' });
  const [reassignId, setReassignId] = useState(null);
  const [reassignUserId, setReassignUserId] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

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

  const handleStatus = async (paymentId, status) => {
    setActionId(paymentId);
    try {
      await adminApi.updatePayment(token, paymentId, {
        status,
        adminNote: adminNotes[paymentId] || '',
      });
      onNotice?.(`Payment marked as ${status}`);
      await load();
    } catch (e) {
      onError?.(e.message);
    } finally {
      setActionId(null);
    }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditForm({
      amount: String(p.amount ?? ''),
      adminNote: p.admin_note || adminNotes[p.id] || '',
      userNote: p.user_note || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ amount: '', adminNote: '', userNote: '' });
  };

  const saveEdit = async (paymentId) => {
    setActionId(paymentId);
    try {
      await adminApi.updatePayment(token, paymentId, {
        amount: editForm.amount ? Number(editForm.amount) : undefined,
        adminNote: editForm.adminNote,
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

  const pendingCount = useMemo(
    () => (statusFilter === 'pending' ? pagination.total : null),
    [statusFilter, pagination.total]
  );

  return (
    <DashCard className="!p-5 sm:!p-6">
      <h2 className="text-lg font-bold mb-1">Payment Verification</h2>
      <p className="text-sm opacity-70 mb-5">
        Review pending orders, edit amounts or notes before confirming, or wait for Razorpay auto-confirmation.
        {pendingCount != null && pendingCount > 0 && (
          <span className="ml-2 font-bold text-amber-700">{pendingCount} pending</span>
        )}
      </p>

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
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm admin-data-table min-w-[1100px]">
            <thead>
              <tr className="border-b border-sand-200 dark:border-sand-700 text-left">
                <th className="py-3 px-2 font-semibold text-xs uppercase tracking-wide opacity-60">Order ID</th>
                <th className="py-3 px-2 font-semibold text-xs uppercase tracking-wide opacity-60">User</th>
                <th className="py-3 px-2 font-semibold text-xs uppercase tracking-wide opacity-60">Phone / Email</th>
                <th className="py-3 px-2 font-semibold text-xs uppercase tracking-wide opacity-60">Amount</th>
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
                    <p className="font-semibold">{p.user_name}</p>
                    <CopyableUserId uid={p.user_uid} compact />
                    {onViewUser && (
                      <button
                        type="button"
                        onClick={() => onViewUser(p.user_id)}
                        className="text-xs font-semibold text-amber-700 hover:underline mt-1 inline-flex items-center gap-1"
                      >
                        <Pencil className="w-3 h-3" /> View profile
                      </button>
                    )}
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
                  <td className="py-3 px-2">
                    <span className="text-xs font-semibold capitalize">
                      {p.payment_method || p.provider || 'manual'}
                    </span>
                    {p.payment_proof_url && (
                      <div className="mt-1 space-y-1">
                        <button
                          type="button"
                          onClick={() => setPreviewUrl(p.payment_proof_url)}
                          className="text-xs font-semibold text-brand-600 inline-flex items-center gap-1 hover:underline"
                        >
                          <ImageIcon className="w-3.5 h-3.5" /> View proof
                        </button>
                      </div>
                    )}
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
                          placeholder="Internal admin note…"
                          value={editForm.adminNote}
                          onChange={(e) => setEditForm({ ...editForm, adminNote: e.target.value })}
                          rows={2}
                          className="input-field !py-1.5 !text-xs w-full resize-none"
                        />
                        <textarea
                          placeholder="Note visible to user (optional)…"
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
                      placeholder="Internal admin note…"
                      value={adminNotes[p.id] ?? p.admin_note ?? ''}
                      onChange={(e) => setAdminNotes((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      rows={2}
                      className="input-field !py-1.5 !text-xs mb-2 w-full resize-none"
                    />
                    <div className="flex flex-wrap gap-1 justify-end">
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
                          onClick={() => handleStatus(p.id, 'failed')}
                          className="text-xs font-bold px-2 py-1 rounded-lg bg-red-100 text-red-700"
                        >
                          Mark Failed
                        </button>
                      )}
                      {p.payment_status === 'confirmed' && (
                        <>
                        <button
                          type="button"
                          disabled={actionId === p.id}
                          onClick={() => handleStatus(p.id, 'refunded')}
                          className="text-xs font-bold px-2 py-1 rounded-lg bg-sand-200 text-sand-700"
                        >
                          Mark Refunded
                        </button>
                        <button
                          type="button"
                          onClick={() => { setReassignId(p.id); setReassignUserId(String(p.user_id || '')); }}
                          className="text-xs font-bold px-2 py-1 rounded-lg border border-violet-300 text-violet-800 hover:bg-violet-50 inline-flex items-center gap-1"
                        >
                          <Pencil className="w-3 h-3" /> Edit user
                        </button>
                        </>
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
