const API = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const REQUEST_TIMEOUT_MS = import.meta.env.PROD ? 45000 : 30000;
const RETRY_STATUS = new Set([408, 429, 502, 503, 504]);
const RETRYABLE_PATHS = /^\/(auth\/me|health|warmup|careers|slots|admin\/|user\/|counsellor\/|payments\/(products|promotions|mode))/;

function headers(token) {
  const h = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(path, method, status) {
  if (method && method !== 'GET') return false;
  if (status && RETRY_STATUS.has(status)) return true;
  if (!import.meta.env.PROD) return true;
  return RETRYABLE_PATHS.test(path);
}

async function request(path, options = {}, attempt = 0) {
  const method = options.method || 'GET';
  const maxAttempts = shouldRetry(path, method) ? 3 : 1;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const { signal: externalSignal, ...rest } = options;

  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    const res = await fetch(`${API}${path}`, { ...rest, signal: controller.signal });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (attempt + 1 < maxAttempts && shouldRetry(path, method, res.status)) {
        await sleep(1200 * (attempt + 1));
        return request(path, options, attempt + 1);
      }
      const err = new Error(data.message || `Request failed (${res.status})`);
      err.status = res.status;
      throw err;
    }
    return data;
  } catch (err) {
    if (err.name === 'AbortError' && attempt + 1 < maxAttempts && shouldRetry(path, method)) {
      await sleep(1500 * (attempt + 1));
      return request(path, options, attempt + 1);
    }
    if (err.name === 'AbortError') {
      throw new Error(
        import.meta.env.PROD
          ? 'Server is waking up — please wait a moment and try again.'
          : 'API request timed out. From the project folder run: npm run dev — then refresh this page.'
      );
    }
    if (err.message === 'Failed to fetch') {
      if (attempt + 1 < maxAttempts && shouldRetry(path, method)) {
        await sleep(1500 * (attempt + 1));
        return request(path, options, attempt + 1);
      }
      throw new Error(
        import.meta.env.PROD
          ? 'Unable to reach server. The site may be starting — please retry.'
          : 'Cannot reach the API (port 5000). Run npm run dev from the project root, then refresh.'
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export const publicApi = {
  availableSlots: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/slots/available${q ? `?${q}` : ''}`);
  },
  submitContact: (body) =>
    request('/contact', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),
};

export const authApi = {
  register: (body) =>
    request('/auth/register', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),
  login: (body) =>
    request('/auth/login', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),
  verify2FA: (body) =>
    request('/auth/verify-2fa', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),
  me: (token, signal) => request('/auth/me', { headers: headers(token), signal }),
  setup2FA: (token) => request('/auth/2fa/setup', { headers: headers(token) }),
  enable2FA: (token, code) =>
    request('/auth/2fa/enable', { method: 'POST', headers: headers(token), body: JSON.stringify({ code }) }),
  disable2FA: (token, body) =>
    request('/auth/2fa/disable', { method: 'POST', headers: headers(token), body: JSON.stringify(body) }),
  forgotPassword: (email) =>
    request('/auth/forgot-password', { method: 'POST', headers: headers(), body: JSON.stringify({ email }) }),
  resetPassword: (body) =>
    request('/auth/reset-password', { method: 'POST', headers: headers(), body: JSON.stringify(body) }),
};

export const userApi = {
  dashboard: (token) => request('/user/dashboard', { headers: headers(token) }),
  updateProfile: (token, body) =>
    request('/user/profile', { method: 'PATCH', headers: headers(token), body: JSON.stringify(body) }),
  careerMatches: (token) => request('/user/career-matches', { headers: headers(token) }),
  aiTrends: (token) => request('/user/ai-trends', { headers: headers(token) }),
  aiCareerAdvice: (token, body) =>
    request('/user/ai-career-advice', { method: 'POST', headers: headers(token), body: JSON.stringify(body) }),
  streamInsight: (token, stream) =>
    request(`/user/stream-insight${stream ? `?stream=${encodeURIComponent(stream)}` : ''}`, { headers: headers(token) }),
  bookConsultation: (token, body) =>
    request('/user/consultations', { method: 'POST', headers: headers(token), body: JSON.stringify(body) }),
  cancelConsultation: (token, id) =>
    request(`/user/consultations/${id}`, { method: 'DELETE', headers: headers(token) }),
  notifications: (token) => request('/user/notifications', { headers: headers(token) }),
  markNotificationRead: (token, id) =>
    request(`/user/notifications/${id}/read`, { method: 'PATCH', headers: headers(token) }),
  markAllNotificationsRead: (token) =>
    request('/user/notifications/read-all', { method: 'POST', headers: headers(token) }),
  messages: (token) => request('/user/messages', { headers: headers(token) }),
  sendMessage: (token, body) =>
    request('/user/messages', { method: 'POST', headers: headers(token), body: JSON.stringify(body) }),
  availableSlots: (token, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/user/slots/available${q ? `?${q}` : ''}`, { headers: headers(token) });
  },
  reports: (token) => request('/user/reports', { headers: headers(token) }),
  bookAssessment: (token, body) =>
    request('/user/assessments/book', { method: 'POST', headers: headers(token), body: JSON.stringify(body) }),
  cancelAssessment: (token, id) =>
    request(`/user/assessments/${id}`, { method: 'DELETE', headers: headers(token) }),
  testAccess: (token, id) => request(`/user/assessments/${id}/test-access`, { headers: headers(token) }),
  getAssessmentFlow: (token, id) => request(`/user/assessments/${id}/flow`, { headers: headers(token) }),
  updateAssessmentFlow: (token, id, body) =>
    request(`/user/assessments/${id}/flow`, { method: 'PATCH', headers: headers(token), body: JSON.stringify(body) }),
  setSkillMappingBand: (token, id, skillMappingBand) =>
    request(`/user/assessments/${id}/skill-mapping-band`, {
      method: 'PATCH',
      headers: headers(token),
      body: JSON.stringify({ skillMappingBand }),
    }),
  getSkillTests: (token, assessmentId) =>
    request(`/user/assessments/${assessmentId}/skill-tests`, { headers: headers(token) }),
  verifyTestAccess: (token, assessmentId, body) =>
    request(`/user/assessments/${assessmentId}/verify-test-access`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(body),
    }),
};

export const paymentsApi = {
  products: () => request('/payments/products'),
  promotions: (token) => request('/payments/promotions', { headers: headers(token) }),
  getOrder: (token, assessmentId) => request(`/payments/order/${assessmentId}`, { headers: headers(token) }),
  updateOrderSelection: (token, assessmentId, body) =>
    request(`/payments/order/${assessmentId}/selection`, {
      method: 'PATCH',
      headers: headers(token),
      body: JSON.stringify(body),
    }),
  createOrder: (token, assessmentId, couponCode, skillMappingBand) =>
    request('/payments/create-order', {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ assessmentId, couponCode, skillMappingBand }),
    }),
  validateCoupon: (token, code, moduleSlug) =>
    request('/payments/validate-coupon', {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({ code, moduleSlug: moduleSlug || null }),
    }),
  verify: (token, body) =>
    request('/payments/verify', { method: 'POST', headers: headers(token), body: JSON.stringify(body) }),
  submitManual: (token, body) =>
    request('/payments/submit-manual', {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(body),
    }),
  getMode: () => request('/payments/mode'),
};

export const adminApi = {
  stats: (token) => request('/admin/stats', { headers: headers(token) }),
  users: (token) => request('/admin/users', { headers: headers(token) }),
  getUser: (token, userId) => request(`/admin/users/${userId}`, { headers: headers(token) }),
  updateUser: (token, userId, body) =>
    request(`/admin/users/${userId}`, { method: 'PATCH', headers: headers(token), body: JSON.stringify(body) }),
  deleteUser: (token, userId) =>
    request(`/admin/users/${userId}`, { method: 'DELETE', headers: headers(token) }),
  consultations: (token) => request('/admin/consultations', { headers: headers(token) }),
  updateConsultation: (token, id, body) =>
    request(`/admin/consultations/${id}`, { method: 'PATCH', headers: headers(token), body: JSON.stringify(body) }),
  slots: (token, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/slots${q ? `?${q}` : ''}`, { headers: headers(token) });
  },
  createSlot: (token, body) =>
    request('/admin/slots', { method: 'POST', headers: headers(token), body: JSON.stringify(body) }),
  updateSlot: (token, id, body) =>
    request(`/admin/slots/${id}`, { method: 'PATCH', headers: headers(token), body: JSON.stringify(body) }),
  deleteSlot: (token, id) =>
    request(`/admin/slots/${id}`, { method: 'DELETE', headers: headers(token) }),
  slotBookings: (token, slotId) =>
    request(`/admin/slots/${slotId}/bookings`, { headers: headers(token) }),
  payments: (token, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/payments${q ? `?${q}` : ''}`, { headers: headers(token) });
  },
  updatePayment: (token, id, body) =>
    request(`/admin/payments/${id}`, { method: 'PATCH', headers: headers(token), body: JSON.stringify(body) }),
  reports: (token) => request('/admin/reports', { headers: headers(token) }),
  createReport: (token, body) =>
    request('/admin/reports', { method: 'POST', headers: headers(token), body: JSON.stringify(body) }),
  updateReport: (token, id, body) =>
    request(`/admin/reports/${id}`, { method: 'PATCH', headers: headers(token), body: JSON.stringify(body) }),
  deleteReport: (token, id) =>
    request(`/admin/reports/${id}`, { method: 'DELETE', headers: headers(token) }),
  settings: (token) => request('/admin/settings', { headers: headers(token) }),
  updateSettings: (token, body) =>
    request('/admin/settings', { method: 'PATCH', headers: headers(token), body: JSON.stringify(body) }),
  analytics: (token) => request('/admin/analytics', { headers: headers(token) }),
  leads: (token, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/leads${q ? `?${q}` : ''}`, { headers: headers(token) });
  },
  updateLead: (token, id, body) =>
    request(`/admin/leads/${id}`, { method: 'PATCH', headers: headers(token), body: JSON.stringify(body) }),
  modules: (token) => request('/admin/modules', { headers: headers(token) }),
  createModule: (token, body) =>
    request('/admin/modules', { method: 'POST', headers: headers(token), body: JSON.stringify(body) }),
  updateModule: (token, slug, body) =>
    request(`/admin/modules/${slug}`, { method: 'PATCH', headers: headers(token), body: JSON.stringify(body) }),
  deleteModule: (token, slug) =>
    request(`/admin/modules/${slug}`, { method: 'DELETE', headers: headers(token) }),
  vouchers: (token) => request('/admin/vouchers', { headers: headers(token) }),
  createVoucher: (token, body) =>
    request('/admin/vouchers', { method: 'POST', headers: headers(token), body: JSON.stringify(body) }),
  updateVoucher: (token, code, body) =>
    request(`/admin/vouchers/${encodeURIComponent(code)}`, { method: 'PATCH', headers: headers(token), body: JSON.stringify(body) }),
  deleteVoucher: (token, code) =>
    request(`/admin/vouchers/${encodeURIComponent(code)}`, { method: 'DELETE', headers: headers(token) }),
  messageThreads: (token) => request('/admin/messages/threads', { headers: headers(token) }),
  getUserMessages: (token, userId) =>
    request(`/admin/messages/user/${userId}`, { headers: headers(token) }),
  sendUserMessage: (token, userId, body) =>
    request(`/admin/messages/user/${userId}`, { method: 'POST', headers: headers(token), body: JSON.stringify(body) }),
  counsellors: (token) => request('/admin/counsellors', { headers: headers(token) }),
  createCounsellor: (token, body) =>
    request('/admin/counsellors', { method: 'POST', headers: headers(token), body: JSON.stringify(body) }),
  updateCounsellor: (token, id, body) =>
    request(`/admin/counsellors/${id}`, { method: 'PATCH', headers: headers(token), body: JSON.stringify(body) }),
  deleteCounsellor: (token, id) =>
    request(`/admin/counsellors/${id}`, { method: 'DELETE', headers: headers(token) }),
};

export const counsellorApi = {
  stats: (token) => request('/counsellor/stats', { headers: headers(token) }),
  users: (token) => request('/counsellor/users', { headers: headers(token) }),
  getUser: (token, userId) => request(`/counsellor/users/${userId}`, { headers: headers(token) }),
  updateUser: (token, userId, body) =>
    request(`/counsellor/users/${userId}`, { method: 'PATCH', headers: headers(token), body: JSON.stringify(body) }),
  consultations: (token) => request('/counsellor/consultations', { headers: headers(token) }),
  updateConsultation: (token, id, body) =>
    request(`/counsellor/consultations/${id}`, { method: 'PATCH', headers: headers(token), body: JSON.stringify(body) }),
  slots: (token, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/counsellor/slots${q ? `?${q}` : ''}`, { headers: headers(token) });
  },
  createSlot: (token, body) =>
    request('/counsellor/slots', { method: 'POST', headers: headers(token), body: JSON.stringify(body) }),
  updateSlot: (token, id, body) =>
    request(`/counsellor/slots/${id}`, { method: 'PATCH', headers: headers(token), body: JSON.stringify(body) }),
  deleteSlot: (token, id) =>
    request(`/counsellor/slots/${id}`, { method: 'DELETE', headers: headers(token) }),
  slotBookings: (token, slotId) =>
    request(`/counsellor/slots/${slotId}/bookings`, { headers: headers(token) }),
  payments: (token, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/counsellor/payments${q ? `?${q}` : ''}`, { headers: headers(token) });
  },
  reports: (token) => request('/counsellor/reports', { headers: headers(token) }),
  createReport: (token, body) =>
    request('/counsellor/reports', { method: 'POST', headers: headers(token), body: JSON.stringify(body) }),
  updateReport: (token, id, body) =>
    request(`/counsellor/reports/${id}`, { method: 'PATCH', headers: headers(token), body: JSON.stringify(body) }),
  deleteReport: (token, id) =>
    request(`/counsellor/reports/${id}`, { method: 'DELETE', headers: headers(token) }),
};

export const chatApi = {
  message: (message, lang, history = []) =>
    request('/chatbot/message', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ message, lang, history }),
    }),
};

export const careersApi = {
  list: (params = {}) => {
    const clean = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v != null && v !== '' && v !== 'all' && v !== 'default'
      )
    );
    const q = new URLSearchParams(clean).toString();
    return request(`/careers${q ? `?${q}` : ''}`);
  },
  get: (slug) => request(`/careers/${slug}`),
  categories: () => request('/careers/categories'),
};

/** Ping server early so Render free tier wakes before user actions */
export function warmupServer() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  return request('/warmup').catch(() => request('/health').catch(() => null));
}
