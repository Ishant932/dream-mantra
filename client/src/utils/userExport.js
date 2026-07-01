function escapeCsv(val) {
  const s = val == null ? '' : String(val);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function fmtDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return String(iso);
  }
}

function profileFields(user = {}) {
  const p = user.profile || {};
  return [
    { label: 'Dreams ID', value: user.user_uid },
    { label: 'Name', value: user.name },
    { label: 'Email', value: user.email },
    { label: 'Phone', value: user.phone },
    { label: 'Account status', value: user.account_status || 'active' },
    { label: 'Suspended until', value: user.suspended_until ? fmtDate(user.suspended_until) : '' },
    { label: 'Joined', value: fmtDate(user.created_at) },
    { label: 'Assigned counsellor', value: user.assigned_counsellor_name || '' },
    { label: 'Profile completion', value: user.profileCompletion != null ? `${user.profileCompletion}%` : '' },
    { label: 'Class / Level', value: p.classLevel },
    { label: 'Stream', value: p.stream },
    { label: 'City', value: p.city },
    { label: 'State', value: p.state },
    { label: 'Career goal', value: p.careerGoal },
    { label: 'Date of birth', value: p.dateOfBirth },
    { label: 'Gender', value: p.gender },
    { label: 'Parent name', value: p.parentName },
    { label: 'Parent phone', value: p.parentPhone },
    { label: 'WhatsApp', value: p.whatsappNumber },
    { label: '2FA enabled', value: user.twoFactorEnabled ? 'Yes' : 'No' },
  ];
}

const ASSESSMENT_COLUMNS = [
  { label: 'Module', get: (a) => a.type || a.product_slug || '—' },
  { label: 'Status', get: (a) => a.status },
  { label: 'Payment', get: (a) => (a.payment_confirmed ? 'Confirmed' : a.status === 'paid' ? 'Paid' : 'Pending') },
  { label: 'Amount', get: (a) => a.amount },
  { label: 'Booked', get: (a) => fmtDate(a.created_at) },
];

function safeFilename(user) {
  const id = (user.user_uid || user.id || 'user').toString().replace(/[^\w-]+/g, '-');
  const name = (user.name || 'student').toString().replace(/[^\w-]+/g, '-').slice(0, 40);
  return `user-${id}-${name}`.toLowerCase();
}

export function buildUserExportPayload(user, stats = {}) {
  const assessments = Array.isArray(stats.assessmentsList)
    ? stats.assessmentsList
    : [];
  const summary = user.stats || {};
  return {
    profile: profileFields(user),
    assessments,
    summary: [
      { label: 'Consultations booked', value: stats.consultations ?? summary.consultations ?? '' },
      { label: 'Modules booked', value: summary.assessmentsBooked ?? assessments.length },
      { label: 'Paid modules', value: summary.paidTests ?? stats.paidTests ?? '' },
      { label: 'Completed tests', value: summary.completedTests ?? '' },
      { label: 'Payment pending', value: summary.pendingPayment ? 'Yes' : 'No' },
    ],
  };
}

export function exportUserDetailToCsv(user, stats = {}) {
  const { profile, assessments, summary } = buildUserExportPayload(user, stats);
  const lines = ['Section,Field,Value'];

  profile.forEach(({ label, value }) => {
    lines.push(['Profile', label, value ?? ''].map(escapeCsv).join(','));
  });
  summary.forEach(({ label, value }) => {
    lines.push(['Activity summary', label, value ?? ''].map(escapeCsv).join(','));
  });

  if (assessments.length) {
    lines.push('');
    lines.push(['Modules', 'Module', 'Status', 'Payment', 'Amount', 'Booked'].map(escapeCsv).join(','));
    assessments.forEach((a) => {
      lines.push(
        ['Modules', ...ASSESSMENT_COLUMNS.map((c) => c.get(a) ?? '')].map(escapeCsv).join(',')
      );
    });
  }

  const csv = lines.join('\r\n');
  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeFilename(user)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportUserDetailToPdf(user, stats = {}) {
  const { profile, assessments, summary } = buildUserExportPayload(user, stats);
  const title = `User record — ${user.name || 'Student'}`;

  const profileHtml = profile.map(({ label, value }) =>
    `<tr><th>${label}</th><td>${String(value ?? '—').replace(/</g, '&lt;')}</td></tr>`
  ).join('');

  const summaryHtml = summary.map(({ label, value }) =>
    `<tr><th>${label}</th><td>${String(value ?? '—').replace(/</g, '&lt;')}</td></tr>`
  ).join('');

  const assessHtml = assessments.length
    ? `<h2>Modules & assessments</h2><table><thead><tr>${ASSESSMENT_COLUMNS.map((c) => `<th>${c.label}</th>`).join('')}</tr></thead><tbody>${
      assessments.map((a) => `<tr>${ASSESSMENT_COLUMNS.map((c) => `<td>${String(c.get(a) ?? '—').replace(/</g, '&lt;')}</td>`).join('')}</tr>`).join('')
    }</tbody></table>`
    : '';

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;padding:24px;font-size:12px;color:#111}
h1{font-size:18px;margin:0 0 4px}h2{font-size:14px;margin:24px 0 8px}
.meta{color:#666;margin-bottom:20px;font-size:11px}
table{width:100%;border-collapse:collapse;margin-bottom:12px}
th,td{border:1px solid #ccc;padding:6px 8px;text-align:left;vertical-align:top}
th{background:#f5f5f5;font-size:11px;width:38%}</style></head><body>
<h1>${title}</h1>
<p class="meta">Dreams ID: ${user.user_uid || '—'} · Exported ${new Date().toLocaleString('en-IN')}</p>
<h2>Profile</h2><table>${profileHtml}</table>
<h2>Activity summary</h2><table>${summaryHtml}</table>
${assessHtml}
</body></html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

/** Fetch full user from API when possible, then export */
export async function downloadUserRecord({ api, token, userId, listUser, format = 'csv' }) {
  let user = listUser;
  let stats = {};
  if (api?.getUser && token && userId) {
    const data = await api.getUser(token, userId);
    user = data.user;
    stats = data.stats || {};
  }
  if (!user) throw new Error('User not found');
  if (format === 'pdf') exportUserDetailToPdf(user, stats);
  else exportUserDetailToCsv(user, stats);
}
