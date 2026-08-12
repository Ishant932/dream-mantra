import { getData, saveData } from '../database.js';

export const WHATSAPP_TRIGGER_META = [
  { id: 'join_welcome', label: 'Join welcome (after join dream-mantra)', category: 'chat', vars: '{{name}}, {{uid}}, {{base}}' },
  { id: 'whatsapp_menu', label: 'Main menu (reply MENU)', category: 'chat', vars: '{{name}}, {{base}}' },
  { id: 'chat_welcome', label: 'Esh chat welcome', category: 'chat', vars: '{{name}}, {{base}}' },
  { id: 'sandbox_join_prompt', label: 'Sandbox join prompt', category: 'chat', vars: '{{joinPhrase}}, {{base}}' },
  { id: 'registration_success', label: 'Registration success', category: 'event', vars: '{{name}}, {{uid}}, {{base}}' },
  { id: 'welcome_step2', label: 'Welcome drip — profile', category: 'scheduled', delayKey: 'welcome_step2_hours', delayUnit: 'hours' },
  { id: 'welcome_step3', label: 'Welcome drip — modules', category: 'scheduled', delayKey: 'welcome_step3_hours', delayUnit: 'hours' },
  { id: 'welcome_step4', label: 'Welcome drip — book session', category: 'scheduled', delayKey: 'welcome_step4_hours', delayUnit: 'hours' },
  { id: 'profile_reminder', label: 'Profile incomplete reminder', category: 'reminder', delayKey: 'profile_reminder_min_account_hours', delayUnit: 'hours' },
  { id: 'profile_complete', label: 'Profile complete', category: 'event', vars: '{{name}}, {{base}}' },
  { id: 'payment_reminder', label: 'Payment pending reminder', category: 'reminder', delayKey: 'payment_reminder_first_hours', delayUnit: 'hours' },
  { id: 'payment_confirmed', label: 'Payment confirmed', category: 'event', vars: '{{name}}, {{moduleTitle}}, {{base}}' },
  { id: 'payment_proof_pending', label: 'Payment proof pending', category: 'reminder', delayKey: 'payment_proof_pending_hours', delayUnit: 'hours' },
  { id: 'session_reminder', label: 'Counselling session reminder', category: 'reminder' },
  { id: 'booking_confirmed', label: 'Booking confirmed', category: 'event', vars: '{{sessionDate}}, {{sessionTime}}, {{base}}' },
  { id: 'report_ready', label: 'Report ready', category: 'event', vars: '{{reportTitle}}, {{base}}' },
  { id: 'test_reminder', label: 'Take test reminder', category: 'reminder', delayKey: 'test_reminder_hours_after_pay', delayUnit: 'hours' },
  { id: 'community_invite', label: 'Community invite (CRP)', category: 'reminder', delayKey: 'community_invite_hours_after_pay', delayUnit: 'hours' },
  { id: 'journey_status', label: 'Journey status update', category: 'reminder', delayKey: 'journey_status_dedup_hours', delayUnit: 'hours' },
  { id: 'career_readiness_intro', label: 'Career Readiness — payment welcome', category: 'event', vars: '{{name}}, {{base}}' },
  { id: 'career_readiness_schedule_reminder', label: 'Career Readiness — schedule sessions', category: 'reminder', delayKey: 'readiness_schedule_hours_after_pay', delayUnit: 'hours' },
  { id: 'test_complete', label: 'Test complete', category: 'event', vars: '{{moduleTitle}}, {{statusSummary}}, {{base}}' },
  { id: 'all_tests_complete', label: 'All tests complete', category: 'event', vars: '{{statusSummary}}, {{base}}' },
];

export const DEFAULT_WHATSAPP_TIMING = {
  welcome_step2_hours: 2,
  welcome_step3_hours: 24,
  welcome_step4_hours: 48,
  payment_reminder_first_hours: 6,
  payment_reminder_second_hours: 24,
  payment_proof_pending_hours: 12,
  profile_reminder_min_account_hours: 24,
  test_reminder_hours_after_pay: 48,
  community_invite_hours_after_pay: 24,
  journey_status_dedup_hours: 72,
  readiness_schedule_hours_after_pay: 48,
  dedup_hours: 48,
  payment_schedule_delay_hours: 6,
};

function ensureWhatsAppAdmin() {
  const data = getData();
  if (!data.whatsapp_admin) {
    data.whatsapp_admin = { templates: {}, timing: { ...DEFAULT_WHATSAPP_TIMING }, updated_at: null };
    saveData();
  }
  if (!data.whatsapp_admin.templates) data.whatsapp_admin.templates = {};
  if (!data.whatsapp_admin.timing) data.whatsapp_admin.timing = { ...DEFAULT_WHATSAPP_TIMING };
  return data.whatsapp_admin;
}

export function getWhatsAppAdminConfig() {
  const row = ensureWhatsAppAdmin();
  const customTriggers = Array.isArray(row.custom_triggers) ? row.custom_triggers : [];
  const customTimingFields = Array.isArray(row.custom_timing_fields) ? row.custom_timing_fields : [];
  return {
    templates: { ...row.templates },
    timing: { ...DEFAULT_WHATSAPP_TIMING, ...row.timing },
    triggers: [...WHATSAPP_TRIGGER_META, ...customTriggers],
    customTriggers,
    customTimingFields,
    joinPhrase: row.join_phrase || 'join dream-mantra',
    updated_at: row.updated_at || null,
  };
}

export function getTemplateOverride(trigger) {
  const t = ensureWhatsAppAdmin().templates?.[trigger];
  return typeof t === 'string' && t.trim() ? t.trim() : null;
}

export function getJoinPhrase() {
  const row = ensureWhatsAppAdmin();
  const configured = row.join_phrase?.trim();
  if (configured) return configured;
  const code = process.env.TWILIO_WHATSAPP_SANDBOX_CODE?.trim() || 'dream-mantra';
  return /^join\s+/i.test(code) ? code : `join ${code}`;
}

export function updateWhatsAppAdminConfig({
  templates = {},
  timing = {},
  joinPhrase,
  customTriggers,
  customTimingFields,
} = {}) {
  const row = ensureWhatsAppAdmin();
  for (const [key, body] of Object.entries(templates)) {
    if (body === null || body === '') {
      delete row.templates[key];
    } else if (typeof body === 'string') {
      row.templates[key] = body;
    }
  }
  row.timing = { ...DEFAULT_WHATSAPP_TIMING, ...row.timing, ...timing };
  if (joinPhrase !== undefined) {
    row.join_phrase = String(joinPhrase || 'join dream-mantra').trim() || 'join dream-mantra';
  }
  if (customTriggers !== undefined) {
    row.custom_triggers = Array.isArray(customTriggers) ? customTriggers : [];
  }
  if (customTimingFields !== undefined) {
    row.custom_timing_fields = Array.isArray(customTimingFields) ? customTimingFields : [];
  }
  row.updated_at = new Date().toISOString();
  saveData();
  return getWhatsAppAdminConfig();
}

export function getWhatsAppTiming(key, fallback) {
  const timing = ensureWhatsAppAdmin().timing || {};
  const val = Number(timing[key]);
  return Number.isFinite(val) && val >= 0 ? val : fallback;
}

export function getWhatsAppTimingMs(key, fallbackHours) {
  return getWhatsAppTiming(key, fallbackHours) * 60 * 60 * 1000;
}

export function applyTemplateVars(text, user = {}, extra = {}) {
  const base = (process.env.WHATSAPP_SITE_URL || process.env.SITE_URL || 'https://dreammantra.in').replace(/\/$/, '');
  const name = user?.name?.split(' ')[0] || 'there';
  const map = {
    '{{name}}': name,
    '{{uid}}': user?.user_uid || '',
    '{{base}}': base,
    '{{moduleTitle}}': extra.moduleTitle || '',
    '{{sessionDate}}': extra.sessionDate || '',
    '{{sessionTime}}': extra.sessionTime || '',
    '{{reportTitle}}': extra.reportTitle || '',
    '{{joinPhrase}}': extra.joinPhrase || getJoinPhrase(),
    '{{statusSummary}}': extra.statusSummary || '',
    '{{progressPercent}}': String(extra.progressPercent ?? ''),
  };
  let out = String(text);
  for (const [k, v] of Object.entries(map)) {
    out = out.split(k).join(v);
  }
  return out;
}
