import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MessageSquare, Send, Paperclip, Image, FileText, Mic, Video, Loader2, User, Search,
} from 'lucide-react';
import { adminApi, userApi } from '../api';
import { DashCard } from './DashboardUI';

function fileToAttachment(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ data: reader.result, name: file.name });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function AttachmentPreview({ att }) {
  const url = att.url?.startsWith('/') ? att.url : att.url;
  if (att.type === 'image') {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block max-w-xs">
        <img src={url} alt={att.name} className="rounded-lg border max-h-48 object-cover" />
      </a>
    );
  }
  if (att.type === 'video') {
    return <video src={url} controls className="rounded-lg max-w-sm max-h-56 border" />;
  }
  if (att.type === 'audio') {
    return <audio src={url} controls className="w-full max-w-sm" />;
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-600 font-semibold hover:underline">
      <FileText className="w-4 h-4" /> {att.name || 'Download file'}
    </a>
  );
}

function MessageBubble({ msg, isOwn }) {
  return (
    <div className={`msg-bubble-row ${isOwn ? 'msg-bubble-row--own' : ''}`}>
      <div className={`msg-bubble ${isOwn ? 'msg-bubble--own' : 'msg-bubble--other'}`}>
        {msg.body && <p className="text-sm whitespace-pre-wrap">{msg.body}</p>}
        {msg.attachments?.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            {msg.attachments.map((att, i) => (
              <AttachmentPreview key={i} att={att} />
            ))}
          </div>
        )}
        <p className="msg-bubble__time">
          {new Date(msg.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
        </p>
      </div>
    </div>
  );
}

function Composer({ onSend, sending, placeholder = 'Type your message…' }) {
  const [text, setText] = useState('');
  const [pending, setPending] = useState([]);
  const fileRef = useRef(null);

  const pickFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    const next = [];
    for (const file of files) {
      try {
        next.push(await fileToAttachment(file));
      } catch {
        /* skip */
      }
    }
    if (next.length) setPending((p) => [...p, ...next]);
  };

  const submit = async () => {
    if (!text.trim() && !pending.length) return;
    await onSend({ body: text.trim(), attachments: pending });
    setText('');
    setPending([]);
  };

  return (
    <div className="msg-composer">
      {pending.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {pending.map((p, i) => (
            <span key={i} className="text-xs px-2 py-1 rounded-full bg-sand-100 border">{p.name}</span>
          ))}
        </div>
      )}
      <textarea
        className="input-field w-full min-h-[80px] text-sm resize-y"
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
      />
      <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
        <div className="flex flex-wrap gap-1">
          <input ref={fileRef} type="file" multiple accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt" className="hidden" onChange={pickFiles} />
          <button type="button" onClick={() => fileRef.current?.click()} className="msg-composer__btn" title="Attach file">
            <Paperclip className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => { if (fileRef.current) { fileRef.current.accept = 'image/*'; fileRef.current.click(); fileRef.current.accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.txt'; } }} className="msg-composer__btn" title="Photo">
            <Image className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => { if (fileRef.current) { fileRef.current.accept = 'audio/*'; fileRef.current.click(); fileRef.current.accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.txt'; } }} className="msg-composer__btn" title="Voice / audio">
            <Mic className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => { if (fileRef.current) { fileRef.current.accept = 'video/*'; fileRef.current.click(); fileRef.current.accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.txt'; } }} className="msg-composer__btn" title="Video">
            <Video className="w-4 h-4" />
          </button>
        </div>
        <button type="button" onClick={submit} disabled={sending} className="btn-primary !py-2 !px-4 text-sm inline-flex items-center gap-2">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Send
        </button>
      </div>
    </div>
  );
}

export function UserMessagesPanel({ token, variant = 'default' }) {
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await userApi.messages(token);
      setThread(data.thread);
      setMessages(data.messages || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const skipInitialScroll = useRef(true);
  useEffect(() => {
    if (skipInitialScroll.current) {
      skipInitialScroll.current = false;
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async ({ body, attachments }) => {
    setSending(true);
    setError('');
    try {
      const res = await userApi.sendMessage(token, { body, attachments });
      setThread(res.thread);
      setMessages((prev) => [...prev, res.message]);
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <p className="text-sm opacity-60 py-8 text-center">Loading messages…</p>;
  }

  return (
    <DashCard className={`!p-0 overflow-hidden msg-panel${variant === 'whatsapp' ? ' msg-panel--whatsapp' : ''}`} hover={false} glow={false}>
      <div className="msg-panel__head msg-panel__head--whatsapp">
        <div className="msg-wa-avatar" aria-hidden>DM</div>
        <div>
          <h2 className="font-bold">Dream Mantra Support</h2>
          <p className="text-xs opacity-70">Usually replies within a few hours · Mon–Sat 11 AM – 7 PM</p>
        </div>
      </div>
      {error && <p className="text-sm text-red-600 px-4 py-2">{error}</p>}
      <div className="msg-panel__body">
        {messages.length === 0 ? (
          <p className="text-sm opacity-60 text-center py-12">No messages yet. When admin sends you something, it will appear here.</p>
        ) : (
          messages.map((m) => (
            <MessageBubble key={m.id} msg={m} isOwn={m.sender_role === 'user'} />
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <div className="msg-panel__composer">
        <Composer onSend={send} sending={sending} placeholder="Reply to admin…" />
      </div>
    </DashCard>
  );
}

function isStudentUser(u) {
  return u && (u.role === 'user' || !u.role);
}

export default function AdminMessagesPanel({ token, users = [], onError }) {
  const [threads, setThreads] = useState([]);
  const [allUsers, setAllUsers] = useState(users);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => { if (users.length) setAllUsers(users); }, [users]);

  useEffect(() => {
    if (!token || users.length) return;
    adminApi.users(token)
      .then((data) => setAllUsers(data.users || []))
      .catch((e) => onError?.(e.message));
  }, [token, users.length, onError]);

  const loadThreads = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await adminApi.messageThreads(token);
      setThreads(data.threads || []);
    } catch (e) {
      onError?.(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, onError]);

  useEffect(() => { loadThreads(); }, [loadThreads]);

  const openUser = async (userId) => {
    setSelectedUserId(userId);
    setLoadingThread(true);
    try {
      const data = await adminApi.getUserMessages(token, userId);
      setThread(data.thread);
      setMessages(data.messages || []);
      await loadThreads();
    } catch (e) {
      onError?.(e.message);
    } finally {
      setLoadingThread(false);
    }
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async ({ body, attachments }) => {
    if (!selectedUserId) return;
    setSending(true);
    try {
      const res = await adminApi.sendUserMessage(token, selectedUserId, { body, attachments });
      setThread(res.thread);
      setMessages((prev) => [...prev, res.message]);
      await loadThreads();
    } catch (e) {
      onError?.(e.message);
    } finally {
      setSending(false);
    }
  };

  const studentUsers = allUsers.filter(isStudentUser);

  const filteredUsers = studentUsers.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      u.name?.toLowerCase().includes(q)
      || u.email?.toLowerCase().includes(q)
      || String(u.id).includes(q)
      || u.user_uid?.toLowerCase().includes(q)
    );
  });

  const threadUserIds = new Set(threads.map((t) => t.user_id));

  return (
    <DashCard className="!p-0 overflow-hidden msg-panel msg-panel--admin" hover={false} glow={false}>
      <div className="msg-panel__head">
        <MessageSquare className="w-5 h-5 text-amber-600" />
        <div>
          <h2 className="font-bold">Direct Messages</h2>
          <p className="text-xs opacity-70">Send text, photos, documents, voice notes, or video to specific students</p>
        </div>
      </div>
      <div className="msg-panel__split">
        <aside className="msg-panel__sidebar">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
              <input
                className="input-field !py-2 !pl-9 text-sm w-full"
                placeholder="Search students…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="msg-panel__user-list">
            {loading ? (
              <p className="text-xs opacity-60 p-4">Loading…</p>
            ) : (
              <>
                {threads.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => openUser(t.user_id)}
                    className={`msg-panel__user-item ${selectedUserId === t.user_id ? 'msg-panel__user-item--active' : ''}`}
                  >
                    <span className="font-semibold text-sm truncate">{t.user_name}</span>
                    {t.unread_by_admin > 0 && (
                      <span className="msg-panel__badge">{t.unread_by_admin}</span>
                    )}
                    <p className="text-xs opacity-60 truncate">{t.last_preview || 'No messages'}</p>
                  </button>
                ))}
                <p className="text-[10px] uppercase tracking-wide opacity-50 px-3 pt-3 pb-1 font-bold">All students</p>
                {filteredUsers.filter((u) => !threadUserIds.has(u.id)).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => openUser(u.id)}
                    className={`msg-panel__user-item ${selectedUserId === u.id ? 'msg-panel__user-item--active' : ''}`}
                  >
                    <User className="w-3.5 h-3.5 opacity-50 shrink-0" />
                    <span className="font-semibold text-sm truncate">{u.name}</span>
                    <p className="text-xs opacity-60 truncate">{u.email || `ID ${u.id}`}</p>
                  </button>
                ))}
              </>
            )}
          </div>
        </aside>
        <div className="msg-panel__main">
          {!selectedUserId ? (
            <p className="text-sm opacity-60 text-center py-16">Select a student to view or start a conversation</p>
          ) : loadingThread ? (
            <p className="text-sm opacity-60 text-center py-16">Loading conversation…</p>
          ) : (
            <>
              <div className="msg-panel__thread-head">
                <p className="font-bold">{thread?.user_name || filteredUsers.find((u) => u.id === selectedUserId)?.name}</p>
                <p className="text-xs opacity-60">{thread?.user_email}</p>
              </div>
              <div className="msg-panel__body">
                {messages.map((m) => (
                  <MessageBubble key={m.id} msg={m} isOwn={m.sender_role === 'admin'} />
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="msg-panel__composer">
                <Composer onSend={send} sending={sending} placeholder="Message this student…" />
              </div>
            </>
          )}
        </div>
      </div>
    </DashCard>
  );
}
