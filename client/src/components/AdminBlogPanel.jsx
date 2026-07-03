import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, Save, X, ExternalLink } from 'lucide-react';
import { adminApi } from '../api';
import { DashCard } from './DashboardUI';
import AdminPanelHeader from './AdminPanelHeader';

const EMPTY_FORM = {
  title: '',
  excerpt: '',
  content: '',
  cover_image: '',
  author: 'Dream Mantra',
  status: 'draft',
  tags: '',
};

export default function AdminBlogPanel({ token, onNotice, onError }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await adminApi.blogs(token, { status: filter });
      setPosts(data.posts || []);
    } catch (e) {
      onError?.(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, filter, onError]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditing('new');
    setForm(EMPTY_FORM);
  };

  const openEdit = (post) => {
    setEditing(post.id);
    setForm({
      title: post.title || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      cover_image: post.cover_image || '',
      author: post.author || 'Dream Mantra',
      status: post.status || 'draft',
      tags: (post.tags || []).join(', '),
    });
  };

  const closeForm = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        cover_image: form.cover_image || null,
        author: form.author,
        status: form.status,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      if (editing === 'new') {
        await adminApi.createBlog(token, body);
        onNotice?.('Blog post created.');
      } else {
        await adminApi.updateBlog(token, editing, body);
        onNotice?.('Blog post updated.');
      }
      closeForm();
      load();
    } catch (err) {
      onError?.(err.message);
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (post) => {
    try {
      const next = post.status === 'published' ? 'draft' : 'published';
      await adminApi.updateBlog(token, post.id, { status: next });
      onNotice?.(next === 'published' ? 'Blog published on website.' : 'Blog moved to drafts.');
      load();
    } catch (err) {
      onError?.(err.message);
    }
  };

  const remove = async (post) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    try {
      await adminApi.deleteBlog(token, post.id);
      onNotice?.('Blog deleted.');
      if (editing === post.id) closeForm();
      load();
    } catch (err) {
      onError?.(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <AdminPanelHeader
        title="Blogs"
        subtitle="Create and publish articles on dreammantra.in/blog"
        exportProps={{
          title: 'Blogs',
          filename: 'blog-posts',
          rows: posts,
          columns: [
            { label: 'Title', get: (p) => p.title },
            { label: 'Slug', get: (p) => p.slug },
            { label: 'Status', get: (p) => p.status },
            { label: 'Author', get: (p) => p.author },
            { label: 'Published', get: (p) => p.published_at },
          ],
        }}
      >
        <button type="button" onClick={openNew} className="btn-primary !py-2 !px-4 text-sm inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> New blog
        </button>
      </AdminPanelHeader>

      <div className="flex flex-wrap gap-2">
        {['all', 'published', 'draft'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`subtab-btn capitalize ${filter === s ? 'active' : ''}`}
          >
            {s === 'all' ? 'All posts' : s}
          </button>
        ))}
      </div>

      {editing && (
        <DashCard className="!p-5 sm:!p-6" hover={false} glow={false}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="font-bold text-lg">{editing === 'new' ? 'New blog post' : 'Edit blog post'}</h3>
            <button type="button" onClick={closeForm} className="p-2 rounded-lg hover:bg-sand-100 dark:hover:bg-sand-800" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={save} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase opacity-60 block mb-1">Title</label>
                <input className="input-field w-full" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase opacity-60 block mb-1">Short excerpt</label>
                <textarea className="input-field w-full min-h-[4rem]" rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Shown on blog listing cards" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-60 block mb-1">Author</label>
                <input className="input-field w-full" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-60 block mb-1">Status</label>
                <select className="input-field w-full" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase opacity-60 block mb-1">Cover image URL (optional)</label>
                <input type="url" className="input-field w-full" value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} placeholder="https://..." />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase opacity-60 block mb-1">Tags (comma separated)</label>
                <input className="input-field w-full" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="career, counselling, class 10" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase opacity-60 block mb-1">Content</label>
                <textarea className="input-field w-full min-h-[14rem] font-mono text-sm" required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your blog article here. Line breaks are preserved." />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2">
                <Save className="w-4 h-4" /> {saving ? 'Saving…' : editing === 'new' ? 'Create post' : 'Save changes'}
              </button>
              <button type="button" onClick={closeForm} className="btn-outline">Cancel</button>
            </div>
          </form>
        </DashCard>
      )}

      {loading ? (
        <p className="text-sm opacity-60 py-8 text-center">Loading blogs…</p>
      ) : posts.length === 0 ? (
        <DashCard className="!p-10 text-center" hover={false} glow={false}>
          <p className="font-semibold">No blog posts yet</p>
          <p className="text-sm opacity-70 mt-2">Click &quot;New blog&quot; to write your first article.</p>
        </DashCard>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <DashCard key={post.id} className="!p-4" hover={false} glow={false}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-bold text-base">{post.title}</p>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      post.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-sand-200 text-sand-700'
                    }`}
                    >
                      {post.status}
                    </span>
                  </div>
                  {post.excerpt && <p className="text-sm opacity-80 line-clamp-2">{post.excerpt}</p>}
                  <p className="text-xs opacity-60 mt-2">
                    {post.author}
                    {post.published_at && ` · Published ${new Date(post.published_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}`}
                    {post.slug && ` · /blog/${post.slug}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 shrink-0">
                  {post.status === 'published' && (
                    <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold px-3 py-2 rounded-lg border border-sand-200 inline-flex items-center gap-1 hover:bg-amber-50">
                      <ExternalLink className="w-3.5 h-3.5" /> View
                    </a>
                  )}
                  <button type="button" onClick={() => openEdit(post)} className="text-sm font-bold px-3 py-2 rounded-lg border border-sand-200 inline-flex items-center gap-1 hover:bg-amber-50">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button type="button" onClick={() => togglePublish(post)} className="text-sm font-bold px-3 py-2 rounded-lg border border-amber-300 text-amber-800 bg-amber-50 inline-flex items-center gap-1">
                    {post.status === 'published' ? <><EyeOff className="w-3.5 h-3.5" /> Unpublish</> : <><Eye className="w-3.5 h-3.5" /> Publish</>}
                  </button>
                  <button type="button" onClick={() => remove(post)} className="text-sm font-bold px-3 py-2 rounded-lg border border-red-300 text-red-700 bg-red-50 inline-flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </DashCard>
          ))}
        </div>
      )}
    </div>
  );
}
