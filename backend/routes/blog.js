import { Router } from 'express';
import { listPublishedPosts, getBlogPostBySlug } from '../lib/blogs.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const limit = req.query.limit ? Math.min(50, Number(req.query.limit) || 20) : undefined;
    const posts = listPublishedPosts({ limit });
    res.set('Cache-Control', 'public, max-age=60');
    res.json({ posts, total: posts.length });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Failed to load blogs' });
  }
});

router.get('/:slug', (req, res) => {
  try {
    const post = getBlogPostBySlug(req.params.slug, { publishedOnly: true });
    if (!post) return res.status(404).json({ message: 'Blog post not found' });
    res.set('Cache-Control', 'public, max-age=120');
    res.json({ post });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Failed to load blog post' });
  }
});

export default router;
