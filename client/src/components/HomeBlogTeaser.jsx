import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { blogApi } from '../api';

export default function HomeBlogTeaser() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    blogApi.list({ limit: 3 }).then((data) => setPosts(data.posts || [])).catch(() => setPosts([]));
  }, []);

  if (!posts.length) return null;

  return (
    <section className="home-section home-section--yellow home-blog-teaser">
      <div className="home-section__inner max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-amber-600 mb-2 inline-flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> From our blog
            </p>
            <h2 className="home-headline">Latest <span className="gradient-text text-pop">Insights</span></h2>
          </div>
          <Link to="/blog" className="text-sm font-bold text-amber-700 inline-flex items-center gap-1 hover:gap-2 transition-all">
            View all articles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="block p-5 rounded-2xl border border-sand-200 dark:border-sand-700 bg-[var(--bg-elevated)] hover:border-amber-300 hover:shadow-md transition"
            >
              <p className="text-xs opacity-60 mb-2">
                {post.published_at && new Date(post.published_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </p>
              <h3 className="font-bold leading-snug line-clamp-2">{post.title}</h3>
              {post.excerpt && <p className="text-sm opacity-75 mt-2 line-clamp-2">{post.excerpt}</p>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
