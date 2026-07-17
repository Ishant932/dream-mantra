import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Tag, Quote,
} from 'lucide-react';
import PageHero from '../components/PageHero';
import SubTabs from '../components/SubTabs';
import { IMAGES } from '../data/content';
import { PRODUCTS } from '../data/products';
import { applyVoucherPrice } from '../data/promotions';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { paymentsApi } from '../api';
import { useUserVouchers } from '../hooks/useUserVouchers';

const fade = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45 },
};

const TRAINING_PRODUCT_SLUGS = new Set(['crp-test']);
const LEGACY_TO_VERTICAL = {
  tests: 'counselling',
  ai: 'counselling',
  library: 'counselling',
  stream: 'counselling',
  degree: 'counselling',
  launchpad: 'training',
  crp: 'training',
};

export default function MarketplaceHub() {
  const { t, d } = useLang();
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [liveProducts, setLiveProducts] = useState([]);
  const { vouchers: liveVouchers } = useUserVouchers(token);
  const marketplacePage = d('pages.marketplace');
  const marketplaceTabs = d('data.marketplaceTabs');

  useEffect(() => {
    paymentsApi.products()
      .then((res) => {
        if (Array.isArray(res.products)) setLiveProducts(res.products);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const raw = params.get('tab');
    if (raw && LEGACY_TO_VERTICAL[raw]) {
      params.set('tab', LEGACY_TO_VERTICAL[raw]);
      navigate({ pathname: location.pathname, search: `?${params.toString()}` }, { replace: true, preventScrollReset: true });
    }
  }, [location.pathname, location.search, navigate]);

  const localizedProducts = useMemo(() => {
    const base = d('data.products').map((loc) => {
      const staticP = PRODUCTS[loc.slug] || {};
      const live = liveProducts.find((p) => p.slug === loc.slug);
      return {
        ...staticP,
        ...loc,
        ...live,
        title: live?.title || loc.title || staticP.title,
        price: live?.price ?? staticP.price,
        description: live?.description || loc.description || staticP.description,
      };
    });
    const known = new Set(base.map((p) => p.slug));
    const extras = liveProducts
      .filter((p) => !known.has(p.slug) && !p.hidden && !p.followUpOnly)
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        price: p.price,
        description: p.description || '',
      }));
    return [...base, ...extras];
  }, [d, liveProducts]);

  const counsellingProducts = localizedProducts.filter((p) => !TRAINING_PRODUCT_SLUGS.has(p.slug));
  const trainingProducts = localizedProducts.filter((p) => TRAINING_PRODUCT_SLUGS.has(p.slug));

  const promoCode = liveVouchers[0]?.code || null;
  const promoCoupon = liveVouchers[0] || null;
  const verticals = marketplacePage.verticals || {};
  const counsellingCopy = verticals.counselling || {};
  const trainingCopy = verticals.training || {};

  const renderProductGrid = (products) => (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((p, i) => (
        <motion.div
          key={p.slug}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 + i * 0.06 }}
          className="infigon-card p-5 border-l-4 border-amber-500"
        >
          <p className="font-bold text-theme-primary">{p.title}</p>
          <p className="text-xs text-theme-muted mt-1">{p.description}</p>
          <div className="mt-3 flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-bold text-amber-700">
              ₹{Number(p.price || 0).toLocaleString('en-IN')}
            </span>
            {promoCoupon && promoCode && (
              <span className="text-xs text-amber-600 font-semibold">
                ₹{applyVoucherPrice(p.price, promoCoupon).final.toLocaleString('en-IN')}{' '}
                {marketplacePage.tests?.withCode} {promoCode}
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link to="/contact#guidance" className="text-amber-700 font-semibold hover:underline">
              {d('freeGuidance')?.cta || 'Book a free guidance call'}
            </Link>
            <Link to="/signup" className="text-theme-muted font-semibold hover:underline">
              {d('freeGuidance')?.authCta || 'Sign in to know more'}
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <>
      <PageHero
        title={marketplacePage.title}
        subtitle={marketplacePage.subtitle}
        image={IMAGES.marketplace || IMAGES.skills || IMAGES.professional}
        cta={marketplacePage.cta || d('freeGuidance')?.cta}
        ctaLink="/contact#guidance"
      />

      <section className="py-12 max-w-7xl mx-auto px-4 no-reveal">
        {marketplacePage.quote && (
          <motion.blockquote
            {...fade}
            className="marketplace-quote mb-8 max-w-3xl mx-auto text-center"
          >
            <Quote className="w-8 h-8 text-amber-500 mx-auto mb-3 opacity-70" />
            <p className="text-lg font-semibold text-theme-primary italic">{marketplacePage.quote}</p>
          </motion.blockquote>
        )}

        <SubTabs tabs={marketplaceTabs} defaultTab="counselling" id="marketplace">
          {(tab) => (
            <>
              {tab === 'counselling' && (
                <div className="space-y-10">
                  {counsellingProducts.length > 0 && (
                    <div>
                      <h3 className="font-bold mb-4 flex items-center gap-2 text-theme-primary">
                        <Tag className="w-5 h-5 text-amber-500" />{' '}
                        {counsellingCopy.productsTitle || marketplacePage.tests?.paidProductsTitle}
                      </h3>
                      {renderProductGrid(counsellingProducts)}
                    </div>
                  )}
                </div>
              )}

              {tab === 'training' && (
                <div className="space-y-8">
                  <motion.div {...fade} className="marketplace-training-hero">
                    <div className="marketplace-training-hero__copy">
                      <p className="marketplace-training-hero__eyebrow">
                        {trainingCopy.programEyebrow || 'AI Career Launchpad'}
                      </p>
                      <h2 className="text-2xl sm:text-3xl font-bold text-theme-primary mb-3">
                        {trainingCopy.programTitle || 'Training & Placement'}
                      </h2>
                      <p className="text-theme-muted leading-relaxed max-w-2xl">
                        {trainingCopy.programDesc ||
                          'Job-ready skill sessions, interviews, resume and placement support for college students, freshers, and professionals.'}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-6">
                        <Link to="/contact#guidance" className="btn-primary inline-flex items-center gap-2">
                          {d('freeGuidance')?.cta || 'Book a free guidance call'} <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link to="/crp?tab=launchpad" className="btn-outline inline-flex items-center gap-2">
                          {trainingCopy.exploreCta || 'Explore Launchpad'}
                        </Link>
                        <Link to="/signup" className="page-next-step__auth inline-flex items-center gap-2">
                          {d('freeGuidance')?.authCta || 'Sign in to know more'}
                        </Link>
                      </div>
                    </div>
                    <ul className="marketplace-training-hero__points">
                      {(trainingCopy.points || [
                        '5 skill sessions for job readiness',
                        'Resume, LinkedIn & interview practice',
                        'Placement-focused outcomes',
                      ]).map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </motion.div>

                  {trainingProducts.length > 0 && (
                    <div>
                      <h3 className="font-bold mb-4 flex items-center gap-2 text-theme-primary">
                        <Tag className="w-5 h-5 text-orange-500" />{' '}
                        {trainingCopy.productsTitle || 'Training programs'}
                      </h3>
                      {renderProductGrid(trainingProducts)}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </SubTabs>
      </section>
    </>
  );
}
