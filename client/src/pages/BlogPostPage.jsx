import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, Calendar, User, Sparkles } from 'lucide-react';
import { blogApi } from '../api';
import { isMobilePerf } from '../utils/mobilePerf';

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reduce = useReducedMotion();
  const lite = isMobilePerf();
  const { scrollYProgress } = useScroll();
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const coverY = useTransform(scrollYProgress, [0, 0.35], [0, lite ? 0 : 80]);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError('');
    try {
      const data = await blogApi.get(slug);
      setPost(data.post);
    } catch (e) {
      setPost(null);
      setError(e.message || 'Article not found');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="blog-post-root min-h-screen pt-28 flex flex-col items-center justify-center gap-4">
        <motion.div
          className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
        />
        <motion.p
          className="text-sm font-semibold opacity-60"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading article…
        </motion.p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="blog-post-root min-h-screen pt-28 px-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-semibold text-lg"
        >
          {error || 'Article not found'}
        </motion.p>
        <Link to="/blog" className="btn-outline mt-6 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to blog
        </Link>
      </div>
    );
  }

  const paragraphs = (post.content || '').split(/\n\n+/).filter(Boolean);

  return (
    <article className="blog-post-root min-h-screen pb-16 relative">
      {/* Reading progress */}
      <motion.div className="blog-read-progress" style={{ scaleX: progressScale }} />

      {post.cover_image && (
        <div className="w-full max-h-[24rem] overflow-hidden relative">
          <motion.div style={{ y: lite || reduce ? 0 : coverY }} className="w-full h-full">
            <img src={post.cover_image} alt="" className="w-full h-full object-cover max-h-[24rem] scale-105" />
          </motion.div>
          <div className="blog-post-cover-fade" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 relative z-[1]">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={post.cover_image ? '-mt-8 sm:-mt-12 mb-6' : 'pt-24 mb-6'}
        >
          <Link to="/blog" className="blog-back-link inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 mb-6 group">
            <motion.span whileHover={{ x: -4 }} transition={{ type: 'spring', stiffness: 500 }}>
              <ArrowLeft className="w-4 h-4" />
            </motion.span>
            All articles
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="blog-post-card rounded-3xl border border-sand-200/80 dark:border-sand-700/60 bg-[var(--bg-elevated)]/95 backdrop-blur-sm p-6 sm:p-10 shadow-xl"
        >
          <motion.div
            className="flex flex-wrap items-center gap-3 text-sm opacity-70 mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-500" />
              {post.published_at && new Date(post.published_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}
            </span>
            <span className="blog-card__dot" />
            <span className="inline-flex items-center gap-1.5">
              <User className="w-4 h-4 text-amber-500" />
              {post.author}
            </span>
          </motion.div>

          <motion.h1
            className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            {post.title}
          </motion.h1>

          {post.excerpt && (
            <motion.p
              className="text-lg opacity-80 mb-6 leading-relaxed border-l-4 border-amber-400 pl-4"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 0.85, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              {post.excerpt}
            </motion.p>
          )}

          {post.tags?.length > 0 && (
            <motion.div
              className="flex flex-wrap gap-2 mb-8"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.06 } },
              }}
            >
              {post.tags.map((tag) => (
                <motion.span
                  key={tag}
                  variants={{
                    hidden: { opacity: 0, scale: 0.85, y: 8 },
                    show: { opacity: 1, scale: 1, y: 0 },
                  }}
                  whileHover={lite ? undefined : { scale: 1.08, y: -2 }}
                  className="blog-tag"
                >
                  <Sparkles className="w-3 h-3 inline mr-1 opacity-70" />
                  {tag}
                </motion.span>
              ))}
            </motion.div>
          )}

          <div className="border-t border-sand-200 dark:border-sand-700 pt-8 space-y-5">
            {paragraphs.length > 0 ? (
              paragraphs.map((para, i) => (
                <motion.p
                  key={i}
                  className="prose-blog text-base sm:text-lg leading-relaxed opacity-90"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 0.92, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.45 }}
                >
                  {para}
                </motion.p>
              ))
            ) : (
              <p className="prose-blog text-base sm:text-lg leading-relaxed whitespace-pre-wrap opacity-90">
                {post.content}
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </article>
  );
}
