import jwt from 'jsonwebtoken';
import { getData } from '../lib/database.js';
import { isUserSuspended, suspensionMessage } from '../lib/userAccount.js';

const JWT_SECRET = () => process.env.JWT_SECRET || 'dreams-mantra-secret-key';

function userFromToken(token) {
  const payload = jwt.verify(token, JWT_SECRET());
  return { ...payload, id: Number(payload.id) };
}

export function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  try {
    req.user = userFromToken(header.split(' ')[1]);
    const data = getData();
    const dbUser = data.users?.find((u) => Number(u.id) === Number(req.user.id));
    if (dbUser && isUserSuspended(dbUser)) {
      return res.status(403).json({ message: suspensionMessage(dbUser) });
    }
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/** Attach req.user when a valid Bearer token is present; never rejects. */
export function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = userFromToken(header.split(' ')[1]);
    } catch {
      /* ignore invalid token */
    }
  }
  next();
}

export function adminRequired(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

export function counsellorRequired(req, res, next) {
  if (req.user?.role !== 'counsellor') {
    return res.status(403).json({ message: 'Counsellor access required' });
  }
  next();
}
