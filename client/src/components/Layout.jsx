import { Suspense, lazy, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import SiteHeader from './SiteHeader';
import Footer from './Footer';
import AnimatedBackground from './AnimatedBackground';
import PageTransition from './PageTransition';
import ScrollRevealInit from './ScrollRevealInit';
import ScrollToTop from './ScrollToTop';
import HashScrollHandler from './HashScrollHandler';
import ErrorBoundary from './ErrorBoundary';
import { isMobilePerf, isPhoneViewport, runWhenIdle } from '../utils/mobilePerf';
import { isMobileBottomNavVisible } from '../utils/mobileBottomNav';
import MobileBottomNav from './MobileBottomNav';

const Chatbot = lazy(() => import('./Chatbot'));

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <div
        className="w-12 h-12 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin"
        role="status"
        aria-label="Loading"
      />
      <p className="text-sm font-semibold text-secondary-theme">Loading…</p>
    </div>
  );
}

export default function Layout() {
  const location = useLocation();
  const mobilePerf = isMobilePerf();
  const phoneNav = isPhoneViewport();
  const isDashboard =
    location.pathname.startsWith('/dashboard')
    || location.pathname.startsWith('/admin')
    || location.pathname.startsWith('/counsellor');
  const showMobileNavPadding = phoneNav && isMobileBottomNavVisible(location.pathname);
  const [loadChatbot, setLoadChatbot] = useState(!mobilePerf);
  const [enableScrollReveal, setEnableScrollReveal] = useState(false);

  useEffect(() => {
    if (isMobilePerf()) return undefined;
    let cancelled = false;
    runWhenIdle(() => {
      if (!cancelled) setEnableScrollReveal(true);
    }, 2000);
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (mobilePerf) return undefined;
    const id = window.setTimeout(() => setLoadChatbot(true), import.meta.env.PROD ? 3000 : 1000);
    return () => window.clearTimeout(id);
  }, [mobilePerf]);

  return (
    <div
      className={`layout-shell min-h-screen flex flex-col relative${isDashboard ? ' layout-shell--dashboard' : ''}${isDashboard && phoneNav ? ' layout-shell--dashboard-mobile' : ''}${showMobileNavPadding ? ' layout-shell--mobile-nav' : ''}`}
    >
      <AnimatedBackground />
      {enableScrollReveal && <ScrollRevealInit />}
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
      <HashScrollHandler />
      {mobilePerf && !loadChatbot && (
        <button
          type="button"
          className="esh-fab"
          aria-label="Open chat assistant"
          onClick={() => setLoadChatbot(true)}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
      {loadChatbot && (
        <Suspense fallback={null}>
          <Chatbot />
        </Suspense>
      )}
      <MobileBottomNav />
    </div>
  );
}
