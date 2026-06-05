import nodemailer from 'nodemailer';

export function isEmailConfigured() {
  return Boolean(process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim());
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST?.trim() || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER?.trim(),
      pass: process.env.SMTP_PASS?.trim(),
    },
  });
}

export async function sendMail({ to, subject, text, html }) {
  if (!isEmailConfigured()) {
    return { ok: false, skipped: true, reason: 'SMTP not configured' };
  }
  const from = process.env.EMAIL_FROM?.trim() || process.env.SMTP_USER?.trim();
  const transporter = createTransport();
  await transporter.sendMail({ from, to, subject, text, html });
  return { ok: true };
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
