import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureSiteSettings } from './siteSettings.js';
import { getData, saveData } from './database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '../uploads/blog-images');

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function getBlogImagesDir() {
  return UPLOAD_DIR;
}

function ensureUploadDir() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

function parseBase64Image(dataUrl) {
  let mime = 'image/jpeg';
  let base64 = dataUrl;
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl || '');
  if (match) {
    mime = match[1];
    base64 = match[2];
  }
  if (!ALLOWED_MIME.includes(mime)) {
    throw new Error('Image must be JPG, PNG, WebP, or GIF');
  }
  const ext =
    mime === 'image/png' ? '.png'
    : mime === 'image/webp' ? '.webp'
    : mime === 'image/gif' ? '.gif'
    : '.jpg';
  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length > 6 * 1024 * 1024) {
    throw new Error('Image is too large (max 6MB)');
  }
  return { mime, buffer, ext };
}

function mediaKey(url) {
  return url;
}

export function saveBlogImage(dataUrl, originalName = 'cover') {
  ensureUploadDir();
  const { mime, buffer, ext } = parseBase64Image(dataUrl);
  const safeName = String(originalName || 'cover').replace(/[^a-z0-9._-]+/gi, '-').slice(0, 40);
  const filename = `blog_${Date.now()}_${safeName}${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filePath, buffer);

  const url = `/api/uploads/blog-images/${filename}`;
  const data = getData();
  ensureSiteSettings();
  if (!data.site_settings.media_files || typeof data.site_settings.media_files !== 'object') {
    data.site_settings.media_files = {};
  }
  data.site_settings.media_files[mediaKey(url)] = {
    base64: buffer.toString('base64'),
    mime,
    filename,
    updated_at: new Date().toISOString(),
  };
  saveData();

  return { url, filename, mime, size: buffer.length };
}

export function hydrateBlogImagesFromStore() {
  const data = getData();
  ensureSiteSettings();
  const files = data.site_settings.media_files || {};
  ensureUploadDir();
  let count = 0;
  for (const [url, meta] of Object.entries(files)) {
    if (!meta?.base64 || !url.includes('/blog-images/')) continue;
    const filename = path.basename(url);
    const dest = path.join(UPLOAD_DIR, filename);
    if (!fs.existsSync(dest)) {
      fs.writeFileSync(dest, Buffer.from(meta.base64, 'base64'));
      count += 1;
    }
  }
  return count;
}
