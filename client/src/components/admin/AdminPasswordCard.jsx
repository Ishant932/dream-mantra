import { motion } from 'framer-motion';
import { Download, Send, KeyRound } from 'lucide-react';

function drawCardToCanvas({ name, email, password }) {
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 280;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 480, 280);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, 440, 240);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px system-ui,sans-serif';
  ctx.fillText('Dream Mantra', 40, 58);
  ctx.font = '14px system-ui,sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Login credentials', 40, 88);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px system-ui,sans-serif';
  ctx.fillText(name || 'Student', 40, 124);
  ctx.font = '13px system-ui,sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText(email || '', 40, 152);
  ctx.font = 'bold 28px monospace';
  ctx.fillStyle = '#b45309';
  ctx.fillText(password, 40, 196);
  ctx.font = '12px system-ui,sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('dreammantra.in/login', 40, 228);
  return canvas;
}

export default function AdminPasswordCard({ user, password, messageSent, onSend, sending, onClose }) {
  const download = () => {
    const canvas = drawCardToCanvas({ name: user?.name, email: user?.email, password });
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dream-mantra-password-${user?.user_uid || user?.id}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <motion.div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}>
      <motion.div
        className="admin-password-card admin-password-card--pro"
        initial={{ scale: 0.96, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="admin-password-card__eyebrow">Password updated</p>
        <h3 className="admin-password-card__name">{user?.name}</h3>
        <p className="admin-password-card__email">{user?.email || user?.phone}</p>
        <div className="admin-password-card__pwd">
          <KeyRound className="w-4 h-4" />
          <span>{password}</span>
        </div>
        {messageSent && <p className="text-xs text-emerald-600">Sent to user messages</p>}
        <div className="admin-password-card__actions">
          <button type="button" className="btn-outline !py-2 text-sm" onClick={download}>
            <Download className="w-4 h-4" /> Download card
          </button>
          {!messageSent && onSend && (
            <button type="button" className="btn-primary !py-2 text-sm" onClick={onSend} disabled={sending}>
              <Send className="w-4 h-4" /> {sending ? 'Sending…' : 'Send to user'}
            </button>
          )}
          <button type="button" className="text-sm opacity-70" onClick={onClose}>Close</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
