import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '../uploads/payment-proofs');

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];

export function getUploadsDir() {
  return UPLOAD_DIR;
}

export function ensureUploadDir() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/** Save base64 data URL or raw base64 — returns public API path */
export function savePaymentProof(paymentId, dataUrl, originalName = 'proof') {
  ensureUploadDir();

  let mime = 'image/jpeg';
  let base64 = dataUrl;
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl || '');
  if (match) {
    mime = match[1];
    base64 = match[2];
  }

  if (!ALLOWED_MIME.includes(mime)) {
    throw new Error('Payment proof must be an image (JPG, PNG, WebP) or PDF');
  }

  const ext =
    mime === 'image/png' ? '.png'
    : mime === 'image/webp' ? '.webp'
    : mime === 'image/gif' ? '.gif'
    : mime === 'application/pdf' ? '.pdf'
    : '.jpg';

  const filename = `pay_${paymentId}_${Date.now()}${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);
  const buffer = Buffer.from(base64, 'base64');

  if (buffer.length > 8 * 1024 * 1024) {
    throw new Error('Payment proof file is too large (max 8MB)');
  }

  fs.writeFileSync(filePath, buffer);
  return {
    url: `/api/uploads/payment-proofs/${filename}`,
    filename,
    mime,
    size: buffer.length,
    originalName: originalName || filename,
  };
}
