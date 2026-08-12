import { ensureSiteSettings } from './siteSettings.js';
import { getData, saveData } from './database.js';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function parseDataUrl(input) {
  const raw = String(input || '').trim();
  const match = /^data:([^;]+);base64,(.+)$/.exec(raw);
  if (match) return { mime: match[1], base64: match[2] };
  return { mime: 'image/png', base64: raw };
}

export function saveBlogImage(input, { mime, filename } = {}) {
  const parsed = input?.includes('base64,') ? parseDataUrl(input) : { mime: mime || 'image/png', base64: input };
  if (!ALLOWED.has(parsed.mime)) throw new Error('Only JPEG, PNG, WebP, or GIF images are allowed');
  const buffer = Buffer.from(parsed.base64, 'base64');
  if (!buffer.length) throw new Error('Image data is empty');
  if (buffer.length > MAX_SIZE) throw new Error('Image is too large (max 5MB)');

  const data = getData();
  ensureSiteSettings();
  if (!data.site_settings.blog_media || typeof data.site_settings.blog_media !== 'object') {
    data.site_settings.blog_media = {};
  }

  const id = `blog_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  data.site_settings.blog_media[id] = {
    mime: parsed.mime,
    data: parsed.base64,
    filename: String(filename || 'image').slice(0, 120),
    created_at: new Date().toISOString(),
  };
  saveData();
  return { id, url: `/api/blog/media/${id}` };
}

export function getBlogImage(id) {
  ensureSiteSettings();
  const row = getData().site_settings?.blog_media?.[id];
  if (!row?.data) return null;
  return {
    mime: row.mime || 'image/png',
    buffer: Buffer.from(row.data, 'base64'),
  };
}
