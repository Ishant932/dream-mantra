import { getData, saveData } from './database.js';

const TTL_MS = 10 * 24 * 60 * 60 * 1000;

function purgeExpired(data) {
  const now = Date.now();
  const before = (data.user_cvs || []).length;
  data.user_cvs = (data.user_cvs || []).filter((r) => {
    const exp = new Date(r.expires_at).getTime();
    return exp > now;
  });
  if (data.user_cvs.length !== before) saveData(data);
}

export function listUserCvs(userId) {
  const data = getData();
  purgeExpired(data);
  return (data.user_cvs || [])
    .filter((r) => r.user_id === Number(userId))
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
}

export function upsertUserCv(userId, payload) {
  const data = getData();
  purgeExpired(data);
  if (!Array.isArray(data.user_cvs)) data.user_cvs = [];
  if (!data.nextId.user_cvs) data.nextId.user_cvs = 1;

  const now = new Date().toISOString();
  const expires = new Date(Date.now() + TTL_MS).toISOString();
  let row = (data.user_cvs || []).find((r) => r.user_id === Number(userId));

  if (row) {
    row.form = payload.form || row.form;
    row.template_id = payload.template_id || row.template_id;
    row.ats_score = payload.ats_score ?? row.ats_score;
    row.updated_at = now;
    row.expires_at = expires;
  } else {
    const id = data.nextId.user_cvs++;
    row = {
      id,
      user_id: Number(userId),
      form: payload.form || {},
      template_id: payload.template_id || 'modern-ats',
      ats_score: payload.ats_score ?? 0,
      created_at: now,
      updated_at: now,
      expires_at: expires,
    };
    data.user_cvs.push(row);
  }
  saveData(data);
  return row;
}

export function deleteUserCv(userId, id) {
  const data = getData();
  const idx = (data.user_cvs || []).findIndex((r) => r.user_id === Number(userId) && r.id === Number(id));
  if (idx < 0) return false;
  data.user_cvs.splice(idx, 1);
  saveData(data);
  return true;
}
