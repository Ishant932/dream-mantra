import { useState, useEffect, useCallback, useMemo } from 'react';
import { FileText, ExternalLink, Pencil, Send, Check, Trash2 } from 'lucide-react';
import CopyableUserId from '../CopyableUserId';
import { DashCard } from '../DashboardUI';

export default function StaffReportsPanel({ api, token, onError, onNotice }) {
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportForm, setReportForm] = useState({ userUid: '', assessmentId: '', reportLink: '', reportTitle: 'Assessment Report' });
  const [reportUserSearch, setReportUserSearch] = useState('');
  const [editingReportId, setEditingReportId] = useState(null);
  const [editReportForm, setEditReportForm] = useState({ reportTitle: '', reportLink: '', adminNotes: '' });
  const [reportSavingId, setReportSavingId] = useState(null);
  const [reportDeletingId, setReportDeletingId] = useState(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [usersRes, reportsRes, paymentsRes] = await Promise.all([
        api.users(token),
        api.reports(token),
        api.payments ? api.payments(token, { limit: 200 }) : Promise.resolve({ payments: [] }),
      ]);
      setUsers(usersRes.users || []);
      setReports(reportsRes.reports || []);
      setPayments(paymentsRes.payments || []);
    } catch (err) {
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  }, [api, token, onError]);

  useEffect(() => {
    load();
  }, [load]);

  const selectedReportUser = useMemo(
    () => users.find((u) => u.user_uid === reportForm.userUid),
    [users, reportForm.userUid]
  );

  const reportUserOptions = useMemo(() => {
    const q = reportUserSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const name = (u.name || '').toLowerCase();
      const uid = (u.user_uid || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const phone = (u.phone || '').replace(/\D/g, '');
      const qDigits = q.replace(/\D/g, '');
      return name.includes(q) || uid.includes(q) || email.includes(q) || (qDigits && phone.includes(qDigits));
    });
  }, [users, reportUserSearch]);

  const submitReport = async (e) => {
    e.preventDefault();
    try {
      await api.createReport(token, {
        userUid: reportForm.userUid,
        assessmentId: reportForm.assessmentId ? Number(reportForm.assessmentId) : null,
        reportLink: reportForm.reportLink,
        reportTitle: reportForm.reportTitle,
      });
      const r = await api.reports(token);
      setReports(r.reports || []);
      setReportForm({ userUid: '', assessmentId: '', reportLink: '', reportTitle: 'Assessment Report' });
      onNotice?.('Report published to user dashboard.');
    } catch (err) {
      onError?.(err.message);
    }
  };

  const startEditReport = (report) => {
    setEditingReportId(Number(report.id));
    setEditReportForm({
      reportTitle: report.report_title || '',
      reportLink: report.report_link || '',
      adminNotes: report.admin_notes || '',
    });
  };

  const cancelEditReport = () => {
    setEditingReportId(null);
    setEditReportForm({ reportTitle: '', reportLink: '', adminNotes: '' });
  };

  const saveEditReport = async (resend = false) => {
    if (!editingReportId) return;
    const link = editReportForm.reportLink.trim();
    if (!link) {
      onError?.('Report URL is required');
      return;
    }
    setReportSavingId(editingReportId);
    try {
      await api.updateReport(token, editingReportId, {
        reportTitle: editReportForm.reportTitle.trim(),
        reportLink: link,
        adminNotes: editReportForm.adminNotes.trim(),
        resendNotification: resend,
      });
      const r = await api.reports(token);
      setReports(r.reports || []);
      onNotice?.(resend ? 'Report updated and notification sent to user.' : 'Report updated — user will see changes on their dashboard.');
      cancelEditReport();
    } catch (err) {
      onError?.(err.message);
    } finally {
      setReportSavingId(null);
    }
  };

  const removeReport = async (report) => {
    if (!window.confirm(`Remove report "${report.report_title}" for ${report.user_name || report.user_uid}? The user will no longer see it.`)) {
      return;
    }
    setReportDeletingId(report.id);
    try {
      const r = await api.deleteReport(token, report.id);
      setReports(r.reports || []);
      if (editingReportId === report.id) cancelEditReport();
      onNotice?.('Report removed from user dashboard.');
    } catch (err) {
      onError?.(err.message);
    } finally {
      setReportDeletingId(null);
    }
  };

  if (loading) {
    return (
      <DashCard className="!p-5 sm:!p-6">
        <p className="text-sm opacity-70 text-center py-8">Loading reports…</p>
      </DashCard>
    );
  }

  return (
    <div className="space-y-6">
      <DashCard className="!p-5 sm:!p-6">
        <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-500" /> Add / Update Report Link
        </h2>
        <p className="text-sm opacity-70 mb-5">Paste a Google Drive, PDF or report URL — it will appear in the user&apos;s Reports tab.</p>
        <form onSubmit={submitReport} className="grid sm:grid-cols-2 gap-4 max-w-3xl">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wide opacity-60 mb-1.5 block">Search student</label>
            <input
              type="search"
              className="input-field"
              placeholder="Type name, Dreams ID, email or phone…"
              value={reportUserSearch}
              onChange={(e) => setReportUserSearch(e.target.value)}
            />
          </div>
          <select className="input-field" value={reportForm.userUid} onChange={(e) => setReportForm({ ...reportForm, userUid: e.target.value, assessmentId: '' })} required>
            <option value="">Select user by Dreams ID</option>
            {reportUserOptions.map((u) => (
              <option key={u.id} value={u.user_uid}>{u.user_uid} — {u.name}</option>
            ))}
          </select>
          <select className="input-field" value={reportForm.assessmentId} onChange={(e) => setReportForm({ ...reportForm, assessmentId: e.target.value })} disabled={!reportForm.userUid}>
            <option value="">Link to paid course (optional)</option>
            {payments.filter((p) => selectedReportUser && p.user_id === selectedReportUser.id && p.assessment_id).map((p) => (
              <option key={p.id} value={p.assessment_id}>{p.type || p.product_title} — ₹{p.amount}</option>
            ))}
          </select>
          <input type="text" className="input-field sm:col-span-2" placeholder="Report title" value={reportForm.reportTitle} onChange={(e) => setReportForm({ ...reportForm, reportTitle: e.target.value })} />
          <input type="url" className="input-field sm:col-span-2" placeholder="Report URL (Google Drive / PDF link)" value={reportForm.reportLink} onChange={(e) => setReportForm({ ...reportForm, reportLink: e.target.value })} required />
          <button type="submit" className="btn-primary sm:col-span-2">Publish report to user dashboard</button>
        </form>
      </DashCard>

      <DashCard className="!p-5 sm:!p-6">
        <h3 className="font-bold mb-4">Published Reports ({reports.length})</h3>
        {reports.length === 0 ? (
          <p className="text-sm opacity-60">No reports published yet.</p>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm admin-data-table min-w-[560px]">
              <thead>
                <tr className="border-b border-sand-200 dark:border-sand-700 text-left">
                  <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Dreams ID</th>
                  <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Student</th>
                  <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Report</th>
                  <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60">Updated</th>
                  <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wide opacity-60 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-b border-sand-100 dark:border-sand-800/60 hover:bg-amber-50/40 dark:hover:bg-sand-800/30 transition align-top">
                    {Number(editingReportId) === Number(r.id) ? (
                      <>
                        <td className="py-3 px-3"><CopyableUserId uid={r.user_uid} compact /></td>
                        <td className="py-3 px-3 font-semibold">{r.user_name}</td>
                        <td className="py-3 px-3" colSpan={2}>
                          <div className="space-y-2 max-w-md">
                            <input type="text" className="input-field !py-2 text-sm w-full" placeholder="Report title" value={editReportForm.reportTitle} onChange={(e) => setEditReportForm({ ...editReportForm, reportTitle: e.target.value })} />
                            <input type="url" className="input-field !py-2 text-sm w-full" placeholder="Report URL" value={editReportForm.reportLink} onChange={(e) => setEditReportForm({ ...editReportForm, reportLink: e.target.value })} />
                            <textarea className="input-field !py-2 text-sm w-full resize-none" rows={2} placeholder="Internal admin notes (optional)" value={editReportForm.adminNotes} onChange={(e) => setEditReportForm({ ...editReportForm, adminNotes: e.target.value })} />
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex flex-wrap gap-1.5 justify-end">
                            <button type="button" disabled={Number(reportSavingId) === Number(r.id)} onClick={() => saveEditReport(false)} className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 inline-flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Save
                            </button>
                            <button type="button" disabled={Number(reportSavingId) === Number(r.id) || !editReportForm.reportLink.trim()} onClick={() => saveEditReport(true)} className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 inline-flex items-center gap-1">
                              <Send className="w-3.5 h-3.5" /> Save &amp; resend
                            </button>
                            <button type="button" onClick={cancelEditReport} className="text-xs font-bold px-2 py-1.5 rounded-lg bg-sand-200 text-sand-700">Cancel</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-3"><CopyableUserId uid={r.user_uid} compact /></td>
                        <td className="py-3 px-3 font-semibold">{r.user_name}</td>
                        <td className="py-3 px-3">
                          <p className="font-medium">{r.report_title}</p>
                          <p className="text-xs opacity-70">{r.product_title}</p>
                        </td>
                        <td className="py-3 px-3 text-xs opacity-70 whitespace-nowrap">
                          {new Date(r.updated_at || r.created_at).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex flex-wrap gap-2 justify-end items-center">
                            {r.report_link ? (
                              <a href={r.report_link} target="_blank" rel="noopener noreferrer" className="text-sm text-amber-600 font-semibold inline-flex items-center gap-1"><ExternalLink className="w-3.5 h-3.5" /> Open</a>
                            ) : (
                              <span className="text-xs opacity-50">—</span>
                            )}
                            <button type="button" onClick={() => startEditReport(r)} disabled={Number(reportDeletingId) === Number(r.id)} className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-amber-300 text-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 inline-flex items-center gap-1 disabled:opacity-50">
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button type="button" onClick={() => removeReport(r)} disabled={Number(reportDeletingId) === Number(r.id)} className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 inline-flex items-center gap-1 disabled:opacity-50">
                              <Trash2 className="w-3.5 h-3.5" /> {Number(reportDeletingId) === Number(r.id) ? 'Removing…' : 'Remove'}
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashCard>
    </div>
  );
}
