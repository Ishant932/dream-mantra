import bcrypt from 'bcryptjs';
import { repo } from '../db.js';
import { findUserByEmail } from './authHelpers.js';
import { generateOtp, saveOtp, verifyOtp } from '../utils/otp.js';
import { sendOtpEmail, maskEmail, isEmailConfigured } from '../utils/mail.js';
import { normalizeIdentifier, validateEmail } from '../utils/passwordReset.js';

const OTP_TYPE = 'password_reset';

const GENERIC_SENT_MESSAGE =
  'If an account exists with this email, a 6-digit code has been sent. Check your inbox and spam folder.';

export async function requestPasswordResetOtp(email) {
  if (!isEmailConfigured()) {
    return {
      ok: false,
      status: 503,
      message:
        'Password reset email is not configured yet. Please contact support at 9680102276.',
    };
  }

  const normalized = normalizeIdentifier(email);
  if (!normalized || !normalized.includes('@')) {
    return { ok: false, status: 400, message: 'Enter your registered email address' };
  }

  const emailErr = validateEmail(normalized);
  if (emailErr) {
    return { ok: false, status: 400, message: emailErr };
  }

  const user = findUserByEmail(normalized);
  if (!user?.email) {
    return {
      ok: true,
      message: GENERIC_SENT_MESSAGE,
      sent: false,
    };
  }

  const otp = generateOtp();
  saveOtp(OTP_TYPE, user.email, otp);

  await sendOtpEmail({
    to: user.email,
    name: user.name,
    otp,
    purpose: 'reset',
  });

  const masked = maskEmail(user.email);

  return {
    ok: true,
    message: `We sent a 6-digit code to ${masked}. Check your inbox and spam folder.`,
    sent: true,
    channel: 'email',
    maskedDestination: masked,
  };
}

export function resetPasswordWithOtp({ email, otp, password }) {
  const normalized = normalizeIdentifier(email);
  const code = String(otp || '').trim();

  if (!normalized || !normalized.includes('@')) {
    return { ok: false, status: 400, message: 'Enter your registered email address' };
  }
  const emailErr = validateEmail(normalized);
  if (emailErr) {
    return { ok: false, status: 400, message: emailErr };
  }
  if (!code) {
    return { ok: false, status: 400, message: 'Enter the 6-digit OTP from your email' };
  }
  if (!password || password.length < 6) {
    return { ok: false, status: 400, message: 'Password must be at least 6 characters' };
  }

  const user = findUserByEmail(normalized);
  if (!user?.email) {
    return { ok: false, status: 400, message: 'Invalid OTP or email. Request a new code.' };
  }

  const check = verifyOtp(OTP_TYPE, user.email, code);
  if (!check.ok) {
    return { ok: false, status: 400, message: check.message };
  }

  const hash = bcrypt.hashSync(password, 10);
  repo.updateUser(user.id, { password: hash });

  return {
    ok: true,
    message: 'Password updated successfully. You can sign in with your new password.',
  };
}

export function validateResetIdentifier(identifier) {
  const id = normalizeIdentifier(identifier);
  if (!id) return 'Enter your registered email address';
  if (!id.includes('@')) return 'Enter your registered email address';
  return validateEmail(id);
}
