const buckets = new Map();

function prune() {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (now - entry.start > entry.windowMs) buckets.delete(key);
  }
}

/** Simple in-memory rate limiter — suitable for single-instance deploys */
export function rateLimit({ windowMs = 15 * 60 * 1000, max = 20, keyPrefix = '' } = {}) {
  return (req, res, next) => {
    prune();
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();
    let entry = buckets.get(key);
    if (!entry || now - entry.start > windowMs) {
      entry = { start: now, windowMs, count: 0 };
      buckets.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > max) {
      return res.status(429).json({ message: 'Too many requests. Please try again later.' });
    }
    next();
  };
}
