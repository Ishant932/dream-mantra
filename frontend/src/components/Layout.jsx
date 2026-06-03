import { Suspense, lazy, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SiteHeader from './SiteHeader';
import Footer from './Footer';
import FloatingInfo from './FloatingInfo';
import AnimatedBackground from './AnimatedBackground';
import PageTransition from './PageTransition';
import ScrollRevealInit from './ScrollRevealInit';
import ScrollToTop from './ScrollToTop';
import ScrollToTopOnNavigate from './ScrollToTopOnNavigate';
import HashScrollHandler from './HashScrollHandler';
import ErrorBoundary from './ErrorBoundary';

const Chatbot = lazy(() => import('./Chatbot'));

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <motion.div
          className="w-14 h-14 rounded-full border-4"
          style={{ borderColor: 'var(--gold-dim)', borderTopColor: 'var(--gold)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-1 rounded-full border-2 border-dashed"
          style={{ borderColor: 'var(--orange-soft)' }}
          animate={{ rotate: -360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>
      <motion.p
        className="text-sm font-semibold text-secondary-theme"
        animate={{ opacity: [0.65, 1, 0.65] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Loading…
      </motion.p>
    </div>
  );
}

export default function Layout() {
  const location = useLocation();
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 1024px)').matches;
    const delay = isMobile ? (import.meta.env.PROD ? 5000 : 1500) : (import.meta.env.PROD ? 2500 : 800);
    const id = window.setTimeout(() => setShowChatbot(true), delay);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="layout-shell min-h-screen flex flex-col relative">
      <AnimatedBackground />
      <ScrollRevealInit />
      <SiteHeader />
      <div className="site-header-spacer" aria-hidden="true" />
      <main className="flex-1 relative w-full min-w-0">
        <ErrorBoundary resetKey={location.pathname + location.search}>
          <Suspense fallback={<PageLoader />}>
            <PageTransition />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <ScrollToTop />
      <ScrollToTopOnNavigate />
      <HashScrollHandler />
      <FloatingInfo />
      {showChatbot && (
        <Suspense fallback={null}>
          <Chatbot />
        </Suspense>
      )}
    </div>
  );
}
