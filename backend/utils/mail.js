import nodemailer from 'nodemailer';

function smtpUser() {
  return process.env.SMTP_USER?.trim() || process.env.EMAIL_USER?.trim() || '';
}

function smtpPass() {
  return process.env.SMTP_PASS?.trim() || process.env.EMAIL_PASS?.trim() || '';
}

export function isEmailConfigured() {
  if (process.env.RESEND_API_KEY?.trim()) return true;
  return Boolean(smtpUser() && smtpPass());
}

function defaultFrom() {
  return (
    process.env.EMAIL_FROM?.trim() ||
    process.env.RESEND_FROM?.trim() ||
    `Dream Mantra <${smtpUser() || 'onboarding@resend.dev'}>`
  );
}

async function sendViaResend({ to, subject, text, html }) {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return { ok: false, skipped: true, reason: 'Resend not configured' };

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: defaultFrom(),
      to: [to],
      subject,
      text,
      html,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || `Resend HTTP ${res.status}`);
  }
  return { ok: true, provider: 'resend', id: data.id };
}

async function sendViaSmtp({ to, subject, text, html }) {
  if (!isEmailConfigured() || !smtpUser() || !smtpPass()) {
    return { ok: false, skipped: true, reason: 'SMTP not configured' };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST?.trim() || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: smtpUser(), pass: smtpPass() },
  });

  await transporter.sendMail({ from: defaultFrom(), to, subject, text, html });
  return { ok: true, provider: 'smtp' };
}

export async function sendMail({ to, subject, text, html }) {
  if (process.env.RESEND_API_KEY?.trim()) {
    try {
      return await sendViaResend({ to, subject, text, html });
    } catch (err) {
      console.error('Resend failed, trying SMTP:', err.message);
      if (smtpUser() && smtpPass()) {
        return sendViaSmtp({ to, subject, text, html });
      }
      throw err;
    }
  }
  return sendViaSmtp({ to, subject, text, html });
}

export async function sendPasswordResetOtp({ to, name, otp }) {
  const subject = 'Dream Mantra — Password reset code';
  const text = `Hi ${name || 'there'},\n\nYour password reset code is: ${otp}\n\nThis code expires in 15 minutes.\n\nIf you did not request this, ignore this email.\n\n— Dream Mantra`;
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
      <h2 style="color:#b45309">Dream Mantra</h2>
      <p>Hi ${name || 'there'},</p>
      <p>Use this code to reset your password:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:6px;color:#052e16;background:#fef3c7;padding:16px 24px;border-radius:12px;text-align:center">${otp}</p>
      <p style="color:#666;font-size:14px">Expires in 15 minutes. If you did not request this, you can ignore this email.</p>
    </div>`;
  return sendMail({ to, subject, text, html });
}
