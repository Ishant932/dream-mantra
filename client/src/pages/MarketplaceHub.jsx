import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FlaskConical, Brain, Sparkles,
  ArrowRight, Tag, Zap, MessageCircle, Quote,
} from 'lucide-react';
import PageHero from '../components/PageHero';
import SubTabs from '../components/SubTabs';
import WelcomeOfferBanner from '../components/WelcomeOfferBanner';
import { assessments, IMAGES } from '../data/content';
import { PRODUCTS } from '../data/products';
import { applyVoucherPrice } from '../data/promotions';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { assessmentPath } from '../utils/routes';
import { paymentsApi } from '../api';
import { useUserVouchers } from '../hooks/useUserVouchers';

const fade = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45 },
};

export default function MarketplaceHub() {
  const { t, d } = useLang();
  const { token } = useAuth();
  const [liveProducts, setLiveProducts] = useState([]);
  const { vouchers: liveVouchers } = useUserVouchers(token);
  const marketplacePage = d('pages.marketplace');
  const marketplaceTabs = d('data.marketplaceTabs');
  const localizedAssessments = d('data.assessments').map((loc, i) => ({
    ...assessments[i],
    ...loc,
  }));

  useEffect(() => {
    paymentsApi.products()
      .then((res) => {
        if (Array.isArray(res.products)) setLiveProducts(res.products);
      })
      .catch(() => {});
  }, []);

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

  const promoCode = liveVouchers[0]?.code || null;
  const promoCoupon = liveVouchers[0] || null;

  return (
    <>
      <PageHero
        title={marketplacePage.title}
        subtitle={marketplacePage.subtitle}
        image={IMAGES.skillMapping || IMAGES.psychometric}
        cta={t('common.browseTests')}
        ctaLink="/marketplace?tab=tests"
      />

      <section className="py-12 max-w-7xl mx-auto px-4 no-reveal">
        <WelcomeOfferBanner compact />

        {marketplacePage.quote && (
          <motion.blockquote
            {...fade}
            className="marketplace-quote mb-8 max-w-3xl mx-auto text-center"
          >
            <Quote className="w-8 h-8 text-amber-500 mx-auto mb-3 opacity-70" />
            <p className="text-lg font-semibold text-theme-primary italic">{marketplacePage.quote}</p>
          </motion.blockquote>
        )}

        <SubTabs tabs={marketplaceTabs} defaultTab="tests" id="marketplace">
          {(tab) => (
            <>
              {tab === 'tests' && (
                <div className="space-y-10">
                  <motion.div {...fade}>
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-theme-primary">
                      <FlaskConical className="w-7 h-7 text-amber-600" /> {marketplacePage.tests.premiumTitle}
                    </h2>
                    <p className="text-theme-muted mb-6">{marketplacePage.tests.premiumDesc}</p>
                  </motion.div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {localizedAssessments.filter((a) => a.slug !== 'why-dreams-mantra').map((a, i) => (
                      <motion.div
                        key={a.slug}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        whileHover={{ y: -6 }}
                      >
                        <Link
                          to={assessmentPath(a.slug)}
                          className="block infigon-card p-6 h-full hover:border-amber-400 hover:shadow-xl transition-all group"
                        >
                          <span className="text-4xl">{a.icon}</span>
                          <h3 className="font-bold mt-3 group-hover:text-amber-700 text-theme-primary">{a.title}</h3>
                          <p className="text-sm text-theme-muted mt-2 line-clamp-2">{a.subtitle}</p>
                          <span className="inline-flex items-center gap-1 text-sm text-amber-600 font-semibold mt-4 group-hover:gap-2 transition-all">
                            {t('common.viewDetails')} <ArrowRight className="w-4 h-4" />
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  <div>
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-theme-primary">
                      <Tag className="w-5 h-5 text-amber-500" /> {marketplacePage.tests.paidProductsTitle}
                    </h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {localizedProducts.map((p, i) => (
                        <motion.div
                          key={p.slug}
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 + i * 0.06 }}
                          className="infigon-card p-5 border-l-4 border-amber-500"
                        >
                          <p className="font-bold text-theme-primary">{p.title}</p>
                          <p className="text-xs text-theme-muted mt-1">{p.description}</p>
                          <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-lg font-bold text-amber-700">₹{p.price.toLocaleString('en-IN')}</span>
                            {promoCoupon && promoCode && (
                              <span className="text-xs text-amber-600 font-semibold">
                                ₹{applyVoucherPrice(p.price, promoCoupon).final.toLocaleString('en-IN')} {marketplacePage.tests.withCode} {promoCode}
                              </span>
                            )}
                          </div>
                          <Link to="/signup" className="text-sm text-amber-600 font-semibold mt-3 inline-block hover:underline">
                            {t('common.signUpToBook')}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab === 'ai' && (
                <motion.div {...fade} className="space-y-6">
                  <div className="infigon-card p-8 bg-gradient-to-br from-amber-50/90 to-orange-50/80 dark:from-amber-900/25 dark:to-orange-900/20">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <motion.span
                        animate={{ rotate: [0, 8, -8, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center text-amber-50 shadow-lg shrink-0"
                      >
                        <Brain className="w-8 h-8" />
                      </motion.span>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-theme-primary">
                          {marketplacePage.ai.title} <Sparkles className="w-5 h-5 text-amber-500" />
                        </h2>
                        <p className="text-theme-muted mb-4 leading-relaxed">{marketplacePage.ai.desc}</p>
                        <div className="flex flex-wrap gap-3">
                          <Link to="/signup" className="btn-primary inline-flex items-center gap-2">
                            <Zap className="w-4 h-4" /> {marketplacePage.ai.dashboardCta}
                          </Link>
                          <Link to="/contact" className="btn-outline inline-flex items-center gap-2">
                            <MessageCircle className="w-4 h-4" /> {marketplacePage.ai.bookCounselling}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {marketplacePage.ai.prompts.map((item, i) => (
                      <motion.div
                        key={item.q}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        className="infigon-card p-4 text-sm"
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <p className="font-semibold mt-2 text-theme-body">{item.q}</p>
                        <p className="text-xs text-theme-muted mt-1">{marketplacePage.ai.askEsh}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </>
          )}
        </SubTabs>
      </section>
    </>
  );
}
