import { normalizePhone, maskPhone } from './passwordReset.js';

export { maskPhone };

export function isSmsConfigured() {
  return !!(
    process.env.TWILIO_ACCOUNT_SID?.trim()
    && process.env.TWILIO_AUTH_TOKEN?.trim()
    && process.env.TWILIO_PHONE?.trim()
  );
}

function toE164(phone) {
  const digits = normalizePhone(phone);
  if (!digits) return '';
  if (String(phone).trim().startsWith('+')) return `+${digits}`;
  return `+91${digits}`;
}

export async function sendOtpSms({ to, otp, purpose = 'reset' }) {
  const label = purpose === 'reset' ? 'password reset' : 'verification';
  const body = `Dream Mantra: Your ${label} code is ${otp}. Valid for 10 minutes. Do not share.`;

  if (isSmsConfigured()) {
    const sid = process.env.TWILIO_ACCOUNT_SID.trim();
    const token = process.env.TWILIO_AUTH_TOKEN.trim();
    const from = process.env.TWILIO_PHONE.trim();
    const toNumber = toE164(to);

    const params = new URLSearchParams({
      To: toNumber,
      From: from,
      Body: body,
    });

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`SMS delivery failed (${res.status}): ${err}`);
    }
    return { channel: 'sms' };
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n📱 [OTP SMS — dev] ${to} → ${otp} (${purpose})\n`);
    return { channel: 'console', devOtp: otp };
  }

  throw new Error('SMS service is not configured');
}
