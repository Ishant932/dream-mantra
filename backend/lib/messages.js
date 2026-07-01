import { getData, saveData } from './database.js';
import { saveMessageAttachment } from './messageAttachments.js';
import { notifyUser } from './notifications.js';

function ensureMessages() {
  const data = getData();
  if (!Array.isArray(data.message_threads)) data.message_threads = [];
  if (!Array.isArray(data.messages)) data.messages = [];
  if (!data.nextId.message_threads) data.nextId.message_threads = 1;
  if (!data.nextId.messages) data.nextId.messages = 1;
}

function findUser(userId) {
  return (getData().users || []).find((u) => u.id === Number(userId)) || null;
}

export function getOrCreateThread(userId) {
  ensureMessages();
  const data = getData();
  const uid = Number(userId);
  let thread = data.message_threads.find((t) => t.user_id === uid);
  if (!thread) {
    const id = data.nextId.message_threads++;
    thread = {
      id,
      user_id: uid,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      unread_by_user: 0,
      unread_by_admin: 0,
      last_preview: '',
    };
    data.message_threads.push(thread);
    saveData();
  }
  return thread;
}

function enrichThread(thread) {
  const user = findUser(thread.user_id);
  return {
    ...thread,
    user_name: user?.name || 'User',
    user_email: user?.email || '',
    user_uid: user?.user_uid || null,
  };
}

export function listThreadsForAdmin() {
  ensureMessages();
  return getData()
    .message_threads
    .slice()
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .map(enrichThread);
}

export function listMessagesForThread(threadId, { limit = 200 } = {}) {
  ensureMessages();
  return getData()
    .messages
    .filter((m) => m.thread_id === Number(threadId))
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .slice(-limit);
}

export function getThreadForUser(userId) {
  ensureMessages();
  const thread = getData().message_threads.find((t) => t.user_id === Number(userId));
  if (!thread) return { thread: null, messages: [] };
  return {
    thread: enrichThread(thread),
    messages: listMessagesForThread(thread.id),
  };
}

export function getThreadByUserId(userId) {
  const thread = getOrCreateThread(userId);
  return {
    thread: enrichThread(thread),
    messages: listMessagesForThread(thread.id),
  };
}

export function sendMessage({ threadId, userId, senderRole, senderId, body, attachments = [] }) {
  ensureMessages();
  const data = getData();
  const thread = threadId
    ? data.message_threads.find((t) => t.id === Number(threadId))
    : getOrCreateThread(userId);

  if (!thread) throw new Error('Conversation not found');

  const savedAttachments = [];
  for (const att of attachments) {
    if (!att?.data) continue;
    savedAttachments.push(
      saveMessageAttachment(thread.id, att.data, att.name || att.filename || 'file')
    );
  }

  const text = String(body || '').trim();
  if (!text && !savedAttachments.length) {
    throw new Error('Message cannot be empty');
  }

  const id = data.nextId.messages++;
  const now = new Date().toISOString();
  const preview = text || (savedAttachments[0]?.type === 'image' ? '📷 Photo' : savedAttachments[0]?.type === 'video' ? '🎬 Video' : savedAttachments[0]?.type === 'audio' ? '🎤 Voice' : '📎 Attachment');

  const message = {
    id,
    thread_id: thread.id,
    sender_role: senderRole,
    sender_id: senderId != null ? Number(senderId) : null,
    body: text,
    attachments: savedAttachments,
    created_at: now,
  };

  data.messages.push(message);
  thread.updated_at = now;
  thread.last_preview = preview.slice(0, 120);

  if (senderRole === 'admin') {
    thread.unread_by_user = (thread.unread_by_user || 0) + 1;
    notifyUser(thread.user_id, {
      type: 'message',
      title: 'New message from Dream Mantra',
      body: preview.slice(0, 120),
      link: '/dashboard?tab=messages',
    });
  } else {
    thread.unread_by_admin = (thread.unread_by_admin || 0) + 1;
  }

  saveData();
  return { thread: enrichThread(thread), message };
}

export function markThreadRead({ threadId, role }) {
  ensureMessages();
  const data = getData();
  const thread = data.message_threads.find((t) => t.id === Number(threadId));
  if (!thread) return null;
  if (role === 'admin') thread.unread_by_admin = 0;
  if (role === 'user') thread.unread_by_user = 0;
  saveData();
  return thread;
}

export function countUnreadForUser(userId) {
  ensureMessages();
  const thread = getData().message_threads.find((t) => t.user_id === Number(userId));
  return thread?.unread_by_user || 0;
}

export function countUnreadForAdmin() {
  ensureMessages();
  return getData().message_threads.reduce((sum, t) => sum + (t.unread_by_admin || 0), 0);
}
