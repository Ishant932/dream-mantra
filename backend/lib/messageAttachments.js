import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '../uploads/message-files');

const ALLOWED_MIME = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  audio: ['audio/webm', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
};

const ALL_MIME = Object.values(ALLOWED_MIME).flat();
const MAX_SIZE = 12 * 1024 * 1024;

export function getMessageUploadsDir() {
  return UPLOAD_DIR;
}

function ensureDir() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function detectType(mime) {
  for (const [type, list] of Object.entries(ALLOWED_MIME)) {
    if (list.includes(mime)) return type;
  }
  return 'file';
}

function extForMime(mime) {
  const map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt',
    'audio/webm': '.webm',
    'audio/mpeg': '.mp3',
    'audio/mp3': '.mp3',
    'audio/wav': '.wav',
    'audio/ogg': '.ogg',
    'audio/mp4': '.m4a',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/quicktime': '.mov',
  };
  return map[mime] || '.bin';
}

/** Save base64 data URL attachment — returns metadata for message record */
export function saveMessageAttachment(threadId, dataUrl, originalName = 'file') {
  ensureDir();

  let mime = 'application/octet-stream';
  let base64 = dataUrl;
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl || '');
  if (match) {
    mime = match[1];
    base64 = match[2];
  }

  if (!ALL_MIME.includes(mime)) {
    throw new Error('File type not allowed. Use images, PDF, documents, audio, or video.');
  }

  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length > MAX_SIZE) {
    throw new Error('Attachment is too large (max 12MB)');
  }

  const ext = extForMime(mime);
  const safeName = String(originalName || 'file').replace(/[^\w.\-]+/g, '_').slice(0, 80);
  const filename = `msg_${threadId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filePath, buffer);

  return {
    url: `/api/uploads/message-files/${filename}`,
    filename,
    mime,
    type: detectType(mime),
    size: buffer.length,
    name: safeName,
  };
}
