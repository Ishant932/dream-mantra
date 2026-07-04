import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db, { repo } from '../db.js';
import { authRequired } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { generateTwoFactorSecret, qrCodeDataUrl, verifyTotp } from '../utils/totp.js';
import { normalizeProfile } from '../lib/profile.js';
import {
  findUserByLoginIdentifier,
  safeComparePassword,
} from '../lib/authHelpers.js';
import { isUserSuspended, suspensionMessage } from '../lib/userAccount.js';
import {
  requestPasswordResetOtp,
  resetPasswordWithOtp,
  validateResetIdentifier,
} from '../lib/passwordResetService.js';
import { flushDatabase } from '../db.js';

const router = Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 12, keyPrefix: 'login' });
const forgotPasswordLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, keyPrefix: 'forgot-pw' });
const resetPasswordLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, keyPrefix: 'reset-pw' });
const JWT_SECRET = () => process.env.JWT_SECRET || 'dreams-mantra-secret-key';
const JWT_EXPIRES = () => process.env.JWT_EXPIRES_IN || '7d';

function signToken(user, extra = {}) {
  return jwt.sign(
    { id: user.id, email: user.email, phone: user.phone, role: user.role, name: user.name, ...extra },
    JWT_SECRET(),
    { expiresIn: JWT_EXPIRES() }
  );
}

function signTemp2FAToken(user) {
  return jwt.sign(
    { id: user.id, purpose: '2fa' },
    JWT_SECRET(),
    { expiresIn: '5m' }
  );
}

function signTemp2FASetupToken(user) {
  return jwt.sign(
    { id: user.id, purpose: '2fa-setup' },
    JWT_SECRET(),
    { expiresIn: '10m' }
  );
}

function requiresMandatory2FA(user) {
  return user?.role === 'admin';
}

async function buildAdminSetupEntry(admin) {
  const { base32, otpauthUrl } = generateTwoFactorSecret(admin.email, admin.name);
  repo.updateUser(admin.id, { twoFactorPendingSecret: base32 });
  const qrCode = await qrCodeDataUrl(otpauthUrl);
  return {
    userId: admin.id,
    email: admin.email,
    name: admin.name,
    setupToken: signTemp2FASetupToken(admin),
    qrCode,
    manualEntry: base32,
  };
}

function sanitize(user) {
  if (!user) return null;
  const { password, twoFactorSecret, twoFactorPendingSecret, ...rest } = user;
  return {
    ...rest,
    profile: normalizeProfile(user.profile),
    twoFactorEnabled: !!user.twoFactorEnabled,
  };
}

function findByIdentifier(identifier) {
  return findUserByLoginIdentifier(identifier);
}

function validatePassword(password) {
  if (!password || password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  return null;
}

// ─── Register ──────────────────────────────────────────────────────────────
router.post('/register', (req, res) => {
  const { name, email, phone, password, identifier } = req.body;
  const trimmedName = name?.trim();
  const pwdErr = validatePassword(password);
  if (!trimmedName) return res.status(400).json({ message: 'Name is required' });
  if (pwdErr) return res.status(400).json({ message: pwdErr });

  let userEmail = (email || '').trim().toLowerCase() || null;
  let userPhone = (phone || '').trim() || null;

  if (identifier?.trim()) {
    const id = identifier.trim();
    if (id.includes('@')) userEmail = id.toLowerCase();
    else userPhone = id;
  }

  if (!userEmail && !userPhone) {
    return res.status(400).json({ message: 'Email or phone number is required' });
  }

  if (userEmail && db.prepare('SELECT * FROM users WHERE email = ?').get(userEmail)) {
    return res.status(409).json({ message: 'Email already registered' });
  }
  if (userPhone && db.prepare('SELECT * FROM users WHERE phone = ?').get(userPhone)) {
    return res.status(409).json({ message: 'Phone number already registered' });
  }

  try {
    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)'
    ).run(trimmedName, userEmail, userPhone, hash, 'user');

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = signToken(user);
    res.status(201).json({
      token,
      user: sanitize(user),
      user_uid: user.user_uid,
      message: `Account created successfully. Your Dreams ID is ${user.user_uid}`,
    });
  } catch (e) {
    if (e.message?.includes('UNIQUE')) {
      return res.status(409).json({ message: 'Email or phone already registered' });
    }
    console.error('Registration error:', e);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// ─── Login (password + optional 2FA; mandatory for admin) ───────────────────
router.post('/login', loginLimiter, async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier?.trim() || !password) {
    return res.status(400).json({ message: 'Email/phone and password required' });
  }

  const user = findByIdentifier(identifier);
  if (!user || !safeComparePassword(password, user.password)) {
    return res.status(401).json({ message: 'Invalid email, phone, Dreams ID, or password' });
  }
  if (isUserSuspended(user)) {
    return res.status(403).json({ message: suspensionMessage(user) });
  }

  if (requiresMandatory2FA(user)) {
    if (user.twoFactorEnabled && user.twoFactorSecret) {
      return res.json({
        requires2FA: true,
        tempToken: signTemp2FAToken(user),
        message: 'Enter the 6-digit code from Google Authenticator',
      });
    }

    try {
      const setup = await buildAdminSetupEntry(user);
      await flushDatabase();
      return res.json({
        requires2FASetup: true,
        setupToken: setup.setupToken,
        qrCode: setup.qrCode,
        manualEntry: setup.manualEntry,
        adminName: user.name,
        adminEmail: user.email,
        message:
          'Scan the QR code with Google Authenticator, then enter your 6-digit code to continue.',
      });
    } catch (e) {
      console.error('Admin 2FA setup QR error:', e);
      return res.status(500).json({ message: 'Could not start two-factor setup. Please try again.' });
    }
  }

  if (user.twoFactorEnabled && user.twoFactorSecret) {
    return res.json({
      requires2FA: true,
      tempToken: signTemp2FAToken(user),
      message: 'Enter the 6-digit code from your authenticator app',
    });
  }

  const token = signToken(user);
  res.json({ token, user: sanitize(user), message: 'Login successful' });
});

// ─── Forgot password (OTP via registered email) ────────────────────────────
router.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
  const { identifier, email } = req.body || {};
  const targetEmail = email || identifier;
  const idErr = validateResetIdentifier(targetEmail);
  if (idErr) return res.status(400).json({ message: idErr });

  try {
    const result = await requestPasswordResetOtp(targetEmail);
    if (!result.ok) {
      return res.status(result.status || 400).json({ message: result.message });
    }
    await flushDatabase();
    res.json({
      message: result.message,
      sent: result.sent,
      channel: result.channel,
      maskedDestination: result.maskedDestination,
    });
  } catch (e) {
    console.error('Forgot password OTP error:', e.message);
    const domainPending = /RESEND_DOMAIN_REQUIRED|verify a domain|testing emails/i.test(
      e.message || ''
    );
    res.status(503).json({
      message: domainPending
        ? 'Password reset email is being set up for all users. Please try again in a few hours or contact support at 9680102276.'
        : 'Could not send OTP email. Try again shortly or contact support at 9680102276.',
    });
  }
});

router.post('/reset-password', resetPasswordLimiter, async (req, res) => {
  const { identifier, email, otp, password } = req.body || {};
  const result = resetPasswordWithOtp({ email: email || identifier, otp, password });
  if (!result.ok) {
    return res.status(result.status || 400).json({ message: result.message });
  }
  await flushDatabase();
  res.json({ message: result.message });
});

// ─── Verify 2FA after login ────────────────────────────────────────────────
router.post('/verify-2fa', (req, res) => {
  const { tempToken, code } = req.body;
  if (!tempToken || !code) {
    return res.status(400).json({ message: 'Verification code required' });
  }

  let payload;
  try {
    payload = jwt.verify(tempToken, JWT_SECRET());
  } catch {
    return res.status(401).json({ message: 'Session expired. Please login again.' });
  }

  if (payload.purpose !== '2fa') {
    return res.status(401).json({ message: 'Invalid verification session' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.id);
  if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
    return res.status(400).json({ message: 'Two-factor authentication is not enabled' });
  }

  if (!verifyTotp(user.twoFactorSecret, code)) {
    return res.status(401).json({ message: 'Invalid authenticator code' });
  }
  if (isUserSuspended(user)) {
    return res.status(403).json({ message: suspensionMessage(user) });
  }

  const token = signToken(user);
  res.json({ token, user: sanitize(user), message: 'Login successful' });
});

// ─── Complete mandatory admin 2FA setup after login ─────────────────────────
router.post('/complete-2fa-setup', async (req, res) => {
  const { setupToken, code, setups, loginUserId } = req.body;
  const items =
    Array.isArray(setups) && setups.length > 0
      ? setups
      : setupToken && code
        ? [{ setupToken, code }]
        : null;

  if (!items?.length) {
    return res.status(400).json({ message: 'Setup token and verification code required' });
  }

  let sessionUserId = loginUserId ? Number(loginUserId) : null;

  for (const item of items) {
    if (!item?.setupToken || !item?.code) {
      return res.status(400).json({ message: 'Each admin needs a verification code' });
    }

    let payload;
    try {
      payload = jwt.verify(item.setupToken, JWT_SECRET());
    } catch {
      return res.status(401).json({ message: 'Setup session expired. Please login again.' });
    }

    if (payload.purpose !== '2fa-setup') {
      return res.status(401).json({ message: 'Invalid setup session' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.id);
    if (!user || !requiresMandatory2FA(user)) {
      return res.status(400).json({ message: 'Two-factor setup is not required for this account' });
    }
    if (!user.twoFactorPendingSecret) {
      return res.status(400).json({ message: 'Setup expired. Please login again.' });
    }
    if (!verifyTotp(user.twoFactorPendingSecret, item.code)) {
      return res.status(401).json({
        message: `Invalid code for ${user.email || user.name}. Check the matching authenticator entry.`,
      });
    }
    if (isUserSuspended(user)) {
      return res.status(403).json({ message: suspensionMessage(user) });
    }

    repo.updateUser(user.id, {
      twoFactorEnabled: true,
      twoFactorSecret: user.twoFactorPendingSecret,
      twoFactorPendingSecret: null,
    });

    if (!sessionUserId) sessionUserId = user.id;
  }

  await flushDatabase();

  const sessionUser = db.prepare('SELECT * FROM users WHERE id = ?').get(sessionUserId);
  if (!sessionUser) {
    return res.status(400).json({ message: 'Login session not found. Please sign in again.' });
  }

  const token = signToken(sessionUser);
  res.json({
    token,
    user: sanitize(sessionUser),
    message: 'Two-factor authentication enabled. Login successful.',
  });
});

// ─── 2FA setup (authenticated) ─────────────────────────────────────────────
router.get('/2fa/setup', authRequired, async (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.twoFactorEnabled) {
    return res.status(400).json({ message: 'Two-factor authentication is already enabled' });
  }

  const { base32, otpauthUrl } = generateTwoFactorSecret(user.email, user.name);
  repo.updateUser(user.id, { twoFactorPendingSecret: base32 });

  try {
    const qrCode = await qrCodeDataUrl(otpauthUrl);
    res.json({
      secret: base32,
      qrCode,
      manualEntry: base32,
      message: 'Scan QR with Google Authenticator, Authy, or Microsoft Authenticator',
    });
  } catch (e) {
    console.error('2FA QR error:', e);
    res.status(500).json({ message: 'Could not generate QR code' });
  }
});

router.post('/2fa/enable', authRequired, (req, res) => {
  const { code } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.twoFactorEnabled) {
    return res.status(400).json({ message: 'Two-factor authentication is already enabled' });
  }
  if (!user.twoFactorPendingSecret) {
    return res.status(400).json({ message: 'Start setup first from Security settings' });
  }
  if (!verifyTotp(user.twoFactorPendingSecret, code)) {
    return res.status(401).json({ message: 'Invalid code. Check your authenticator app.' });
  }

  repo.updateUser(user.id, {
    twoFactorEnabled: true,
    twoFactorSecret: user.twoFactorPendingSecret,
    twoFactorPendingSecret: null,
  });

  res.json({ message: 'Two-factor authentication enabled', twoFactorEnabled: true });
});

router.post('/2fa/disable', authRequired, (req, res) => {
  const { password, code } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (requiresMandatory2FA(user)) {
    return res.status(403).json({ message: 'Two-factor authentication cannot be disabled for admin accounts' });
  }
  if (!user.twoFactorEnabled) {
    return res.status(400).json({ message: 'Two-factor authentication is not enabled' });
  }
  if (!password || !safeComparePassword(password, user.password)) {
    return res.status(401).json({ message: 'Incorrect password' });
  }
  if (!verifyTotp(user.twoFactorSecret, code)) {
    return res.status(401).json({ message: 'Invalid authenticator code' });
  }

  repo.updateUser(user.id, {
    twoFactorEnabled: false,
    twoFactorSecret: null,
    twoFactorPendingSecret: null,
  });

  res.json({ message: 'Two-factor authentication disabled', twoFactorEnabled: false });
});

router.get('/me', authRequired, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user: sanitize(user) });
});

export default router;
