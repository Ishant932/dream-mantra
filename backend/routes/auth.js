import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db, { repo, flushDatabase } from '../db.js';
import { authRequired } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { generateTwoFactorSecret, qrCodeDataUrl, verifyTotp } from '../utils/totp.js';
import { normalizeProfile } from '../lib/profile.js';
import {
  normalizeIdentifier,
  validateEmail,
} from '../utils/passwordReset.js';
import {
  findUserByEmail,
  findUserByLoginIdentifier,
  safeComparePassword,
} from '../lib/authHelpers.js';

const router = Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 12, keyPrefix: 'login' });
const resetLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 8, keyPrefix: 'pwd-reset' });
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

// ─── Login (password + optional 2FA) ───────────────────────────────────────
router.post('/login', loginLimiter, (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier?.trim() || !password) {
    return res.status(400).json({ message: 'Email/phone and password required' });
  }

  const user = findByIdentifier(identifier);
  if (!user || !safeComparePassword(password, user.password)) {
    return res.status(401).json({ message: 'Invalid email, phone, Dreams ID, or password' });
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

  const token = signToken(user);
  res.json({ token, user: sanitize(user), message: 'Login successful' });
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

router.patch('/password', authRequired, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const pwdErr = validatePassword(newPassword);
  if (!currentPassword) return res.status(400).json({ message: 'Current password is required' });
  if (pwdErr) return res.status(400).json({ message: pwdErr });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (!safeComparePassword(currentPassword, user.password)) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }

  repo.updateUser(user.id, { password: bcrypt.hashSync(newPassword, 10) });
  res.json({ message: 'Password updated successfully' });
});

// ─── Reset password (registered email + new password) ─────────────────────
router.post('/reset-password', resetLimiter, async (req, res) => {
  const email = normalizeIdentifier(req.body?.email || req.body?.identifier);
  const { newPassword, confirmPassword } = req.body || {};
  const emailErr = validateEmail(email);
  const pwdErr = validatePassword(newPassword);

  if (emailErr) return res.status(400).json({ message: emailErr });
  if (pwdErr) return res.status(400).json({ message: pwdErr });
  if (confirmPassword != null && confirmPassword !== newPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(404).json({
      message: 'No account found with this email address. Use the email you used at signup. If you registered with mobile only, sign in with your phone number or contact 9680102276.',
    });
  }
  if (!user.email) {
    return res.status(400).json({
      message: 'This account has no registered email. Sign in with your mobile number or contact support at 9680102276.',
    });
  }

  try {
    repo.updateUser(user.id, { password: bcrypt.hashSync(newPassword, 10) });
    await flushDatabase();
    res.json({ message: 'Password updated successfully. Sign in with your new password.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Could not update password. Please try again.' });
  }
});

export default router;
