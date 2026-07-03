import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { BookOpen, ArrowRight, Calendar, Sparkles, PenLine } from 'lucide-react';
import { blogApi } from '../api';
import { isMobilePerf } from '../utils/mobilePerf';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
};

const itemUp = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 320, damping: 26 },
  },
};

function BlogCard({ post, index, featured = false, lite }) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      variants={!lite && !reduce ? itemUp : undefined}
      initial={lite || reduce ? { opacity: 0, y: 12 } : undefined}
      animate={lite || reduce ? { opacity: 1, y: 0 } : undefined}
      whileHover={lite || reduce ? undefined : { y: -8, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className={`blog-card group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-sand-200/80 dark:border-sand-700/80 bg-[var(--bg-elevated)] shadow-sm ${
        featured ? 'blog-card--featured md:col-span-2' : ''
      }`}
      style={{ '--blog-card-i': index }}
    >
      <div className="blog-card__shine" aria-hidden="true" />
      <div className="blog-card__glow" aria-hidden="true" />

      {post.cover_image ? (
        <div className={`blog-card__media overflow-hidden ${featured ? 'aspect-[21/9] sm:aspect-[2.4/1]' : 'aspect-[16/10]'}`}>
          <motion.img
            src={post.cover_image}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            whileHover={lite ? undefined : { scale: 1.08 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="blog-card__media-overlay" />
        </div>
      ) : (
        <div className={`blog-card__media blog-card__media--placeholder flex items-center justify-center ${featured ? 'aspect-[21/9]' : 'aspect-[16/10]'}`}>
          <PenLine className="w-10 h-10 text-amber-400/50" />
        </div>
      )}

      <div className={`relative z-[1] p-5 sm:p-6 ${featured ? 'sm:p-8' : ''}`}>
        <motion.div
          className="flex flex-wrap items-center gap-2 text-xs opacity-70 mb-3"
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 0.85, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <Calendar className="w-3.5 h-3.5 text-amber-500" />
          {post.published_at && new Date(post.published_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
          <span className="blog-card__dot" />
          <span>{post.author}</span>
        </motion.div>

        <h2 className={`font-display font-bold mb-2 leading-snug group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors ${featured ? 'text-2xl sm:text-3xl' : 'text-xl'}`}>
          <Link to={`/blog/${post.slug}`} className="blog-card__title-link">
            {post.title}
          </Link>
        </h2>

        {post.excerpt && (
          <p className={`text-sm opacity-80 line-clamp-3 mb-4 ${featured ? 'sm:text-base sm:line-clamp-2 max-w-2xl' : ''}`}>
            {post.excerpt}
          </p>
        )}

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((tag, ti) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * ti }}
                whileHover={lite ? undefined : { scale: 1.06, y: -2 }}
                className="blog-tag"
              >
                {tag}
              </motion.span>
            ))}
          </div>
        )}

        <Link to={`/blog/${post.slug}`} className="blog-read-link">
          <span>Read article</span>
          <motion.span
            className="inline-flex"
            whileHover={lite ? undefined : { x: 4 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            <ArrowRight className="w-4 h-4" />
          </motion.span>
        </Link>
      </div>
    </motion.article>
  );
}

function LoadingSkeleton({ lite }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.08 }}
          className={`blog-skeleton rounded-2xl overflow-hidden ${i === 0 ? 'md:col-span-2' : ''}`}
        >
          <div className={`blog-skeleton__block ${i === 0 ? 'h-48 sm:h-56' : 'h-40'}`} />
          <div className="p-6 space-y-3">
            <div className="blog-skeleton__line w-1/3" />
            <div className="blog-skeleton__line w-full h-5" />
            <div className="blog-skeleton__line w-4/5" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const reduce = useReducedMotion();
  const lite = isMobilePerf();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await blogApi.list();
      setPosts(data.posts || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const [featured, rest] = useMemo(() => {
    if (!posts.length) return [null, []];
    return [posts[0], posts.slice(1)];
  }, [posts]);

  return (
    <div className="blog-page-root min-h-screen pt-24 pb-20 relative overflow-hidden">
      {/* Ambient background */}
      <div className="blog-page__mesh" aria-hidden="true" />
      {!lite && !reduce && (
        <>
          <motion.div
            className="blog-orb blog-orb--1"
            animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="blog-orb blog-orb--2"
            animate={{ x: [0, -50, 30, 0], y: [0, 30, -30, 0], scale: [1, 0.9, 1.15, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="blog-orb blog-orb--3"
            animate={{ x: [0, 40, -30, 0], y: [0, 50, -20, 0] }}
            transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      <div className="relative z-[1] max-w-5xl mx-auto px-4">
        <motion.header
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            className="blog-hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 400 }}
          >
            <motion.span
              animate={lite ? undefined : { rotate: [0, 12, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <BookOpen className="w-4 h-4" />
            </motion.span>
            Dream Mantra Blog
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </motion.span>

          <motion.h1
            className="font-display text-4xl md:text-6xl font-extrabold mb-4 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Career insights &{' '}
            <span className="gradient-text blog-hero-gradient-text">guidance</span>
          </motion.h1>

          <motion.p
            className="text-lg opacity-80 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            transition={{ delay: 0.35 }}
          >
            Articles on career counselling, stream selection, assessments, and student success from the Dream Mantra team.
          </motion.p>

          {!loading && posts.length > 0 && (
            <motion.p
              className="mt-4 text-sm font-bold text-amber-700 dark:text-amber-400"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
            >
              {posts.length} article{posts.length === 1 ? '' : 's'} to explore
            </motion.p>
          )}
        </motion.header>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <LoadingSkeleton lite={lite} />
            </motion.div>
          ) : posts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="blog-empty text-center py-16 sm:py-20 rounded-3xl"
            >
              <motion.div
                animate={lite ? undefined : { y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <BookOpen className="w-14 h-14 text-amber-400/60 mx-auto mb-4" />
              </motion.div>
              <p className="font-semibold text-lg">No articles published yet</p>
              <p className="text-sm opacity-70 mt-2">Check back soon for career tips and updates.</p>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              variants={lite || reduce ? undefined : container}
              initial="hidden"
              animate="show"
              className="grid gap-6 md:grid-cols-2"
            >
              {featured && (
                <BlogCard post={featured} index={0} featured lite={lite || reduce} />
              )}
              {rest.map((post, i) => (
                <BlogCard key={post.id} post={post} index={i + 1} lite={lite || reduce} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
