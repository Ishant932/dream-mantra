/** Email delivery — Resend (preferred) or Gmail SMTP */

export function isEmailConfigured() {
  if (process.env.RESEND_API_KEY?.trim()) return true;
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  return !!(smtpUser?.trim() && smtpPass?.trim());
}

function fromAddress() {
  return (
    process.env.RESEND_FROM ||
    process.env.EMAIL_FROM ||
    process.env.SMTP_FROM ||
    'Dream Mantra <onboarding@resend.dev>'
  );
}

async function sendViaResend({ to, subject, html, text }) {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return false;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error (${res.status}): ${err}`);
  }
  return true;
}

async function sendViaSmtp({ to, subject, html, text }) {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  if (!user?.trim() || !pass?.trim()) return false;

  const nodemailer = await import('nodemailer');
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 587);

  const transporter = nodemailer.default.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `Dream Mantra <${user}>`,
    to,
    subject,
    html,
    text,
  });
  return true;
}

function otpEmailBody({ name, otp, purpose }) {
  const title = purpose === 'register' ? 'Verify your email' : 'Reset your password';
  const html = `
    <div style="font-family:Segoe UI,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px">
      <h2 style="color:#b45309;margin:0 0 12px">Dream Mantra</h2>
      <p style="color:#444;margin:0 0 16px">Hi ${name || 'there'},</p>
      <p style="color:#444;margin:0 0 16px">Your ${title.toLowerCase()} code is:</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#92400e;margin:16px 0">${otp}</p>
      <p style="color:#666;font-size:14px">Valid for 10 minutes. Do not share this code.</p>
      <p style="color:#999;font-size:12px;margin-top:24px">If you did not request this, ignore this email.</p>
    </div>`;
  const text = `Dream Mantra — Your ${title} code: ${otp}. Valid for 10 minutes.`;
  return { html, text, subject: `Dream Mantra — ${title} code: ${otp}` };
}

export async function sendOtpEmail({ to, name, otp, purpose = 'register' }) {
  if (!isEmailConfigured()) {
    throw new Error(
      'Email service is not configured. Set RESEND_API_KEY or SMTP_USER + SMTP_PASS in environment.'
    );
  }

  const { html, text, subject } = otpEmailBody({ name, otp, purpose });

  if (process.env.RESEND_API_KEY?.trim()) {
    await sendViaResend({ to, subject, html, text });
    return { channel: 'resend' };
  }

  const sent = await sendViaSmtp({ to, subject, html, text });
  if (sent) return { channel: 'smtp' };

  throw new Error('Email delivery failed. Check RESEND_API_KEY or SMTP credentials.');
}

export function maskEmail(email) {
  const [local, domain] = String(email || '').split('@');
  if (!domain) return '***';
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}
