import { getData, saveData } from './database.js';

function ensureBlogs() {
  const data = getData();
  if (!data.blog_posts) data.blog_posts = [];
  if (!data.nextId.blog_posts) data.nextId.blog_posts = 1;
}

export function slugify(title) {
  const base = String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return base || 'post';
}

function uniqueSlug(base, excludeId = null) {
  ensureBlogs();
  const posts = getData().blog_posts || [];
  let slug = base;
  let n = 2;
  while (posts.some((p) => p.slug === slug && p.id !== excludeId)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

function sanitizePost(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt || '',
    content: row.content || '',
    cover_image: row.cover_image || null,
    author: row.author || 'Dream Mantra',
    status: row.status || 'draft',
    tags: Array.isArray(row.tags) ? row.tags : [],
    published_at: row.published_at || null,
    created_at: row.created_at,
    updated_at: row.updated_at || null,
  };
}

export function listBlogPosts({ status, limit } = {}) {
  ensureBlogs();
  let rows = (getData().blog_posts || []).map(sanitizePost);
  if (status && status !== 'all') rows = rows.filter((p) => p.status === status);
  rows.sort((a, b) => {
    const da = new Date(b.published_at || b.created_at);
    const db = new Date(a.published_at || a.created_at);
    return da - db;
  });
  if (limit) rows = rows.slice(0, limit);
  return rows;
}

export function listPublishedPosts({ limit } = {}) {
  return listBlogPosts({ status: 'published', limit });
}

export function getBlogPostBySlug(slug, { publishedOnly = true } = {}) {
  ensureBlogs();
  const row = (getData().blog_posts || []).find((p) => p.slug === slug);
  if (!row) return null;
  if (publishedOnly && row.status !== 'published') return null;
  return sanitizePost(row);
}

export function getBlogPostById(id) {
  ensureBlogs();
  const row = (getData().blog_posts || []).find((p) => p.id === Number(id));
  return sanitizePost(row);
}

export function createBlogPost({
  title,
  excerpt,
  content,
  cover_image,
  author,
  status = 'draft',
  tags,
  slug,
}) {
  ensureBlogs();
  const data = getData();
  const trimmedTitle = String(title || '').trim();
  if (!trimmedTitle) throw new Error('Title is required');

  const id = data.nextId.blog_posts++;
  const now = new Date().toISOString();
  const baseSlug = slugify(slug || trimmedTitle);
  const finalSlug = uniqueSlug(baseSlug);
  const postStatus = status === 'published' ? 'published' : 'draft';

  const row = {
    id,
    title: trimmedTitle,
    slug: finalSlug,
    excerpt: String(excerpt || '').trim().slice(0, 500),
    content: String(content || '').trim(),
    cover_image: cover_image ? String(cover_image).trim() : null,
    author: String(author || 'Dream Mantra').trim().slice(0, 120),
    status: postStatus,
    tags: Array.isArray(tags) ? tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 10) : [],
    published_at: postStatus === 'published' ? now : null,
    created_at: now,
    updated_at: now,
  };

  data.blog_posts.unshift(row);
  saveData();
  return sanitizePost(row);
}

export function updateBlogPost(id, patch) {
  ensureBlogs();
  const data = getData();
  const row = data.blog_posts.find((p) => p.id === Number(id));
  if (!row) return null;

  if (patch.title !== undefined) {
    const trimmedTitle = String(patch.title || '').trim();
    if (!trimmedTitle) throw new Error('Title is required');
    row.title = trimmedTitle;
  }
  if (patch.excerpt !== undefined) row.excerpt = String(patch.excerpt || '').trim().slice(0, 500);
  if (patch.content !== undefined) row.content = String(patch.content || '').trim();
  if (patch.cover_image !== undefined) row.cover_image = patch.cover_image ? String(patch.cover_image).trim() : null;
  if (patch.author !== undefined) row.author = String(patch.author || 'Dream Mantra').trim().slice(0, 120);
  if (patch.tags !== undefined) {
    row.tags = Array.isArray(patch.tags) ? patch.tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 10) : [];
  }
  if (patch.slug !== undefined && patch.slug) {
    row.slug = uniqueSlug(slugify(patch.slug), row.id);
  }
  if (patch.status !== undefined) {
    const next = patch.status === 'published' ? 'published' : 'draft';
    if (next === 'published' && row.status !== 'published') {
      row.published_at = new Date().toISOString();
    }
    if (next === 'draft') row.published_at = null;
    row.status = next;
  }

  row.updated_at = new Date().toISOString();
  saveData();
  return sanitizePost(row);
}

export function deleteBlogPost(id) {
  ensureBlogs();
  const data = getData();
  const idx = data.blog_posts.findIndex((p) => p.id === Number(id));
  if (idx < 0) return false;
  data.blog_posts.splice(idx, 1);
  saveData();
  return true;
}
