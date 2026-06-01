import { Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SiteHeader from './SiteHeader';
import Footer from './Footer';
import Chatbot from './Chatbot';
import FloatingInfo from './FloatingInfo';
import AnimatedBackground from './AnimatedBackground';
import PageTransition from './PageTransition';
import ScrollRevealInit from './ScrollRevealInit';
import ScrollToTop from './ScrollToTop';
import ScrollToTopOnNavigate from './ScrollToTopOnNavigate';
import HashScrollHandler from './HashScrollHandler';
import ErrorBoundary from './ErrorBoundary';

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
      <Chatbot />
    </div>
  );
}
