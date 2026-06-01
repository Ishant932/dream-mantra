import { useState, useEffect } from 'react';
import PromoBar from './PromoBar';
import Navbar from './Navbar';

/** Promo strip + navbar — navbar stays visible; promo bar collapses on scroll */
export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="site-header fixed top-0 left-0 right-0 z-50">
      <div
        className={`overflow-hidden transition-all duration-300 ${scrolled ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100'}`}
        aria-hidden={scrolled}
      >
        <PromoBar />
      </div>
      <Navbar scrolled={scrolled} />
    </div>
  );
}
