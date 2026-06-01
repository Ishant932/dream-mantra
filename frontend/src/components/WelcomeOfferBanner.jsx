import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tag, Copy, Check, Sparkles, TrendingUp, Gift, ArrowRight, Percent } from 'lucide-react';
import { WELCOME_OFFER } from '../data/promotions';
import { useLang } from '../context/LanguageContext';

export default function WelcomeOfferBanner({ variant = 'home', compact = false }) {
  const { d } = useLang();
  const offer = d('welcomeOffer');
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(WELCOME_OFFER.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="coupon-compact mb-8"
      >
        <div className="coupon-compact__shine" aria-hidden />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="coupon-compact__icon">
              <Gift className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {offer.badge}
              </p>
              <p className="font-accent font-bold text-sand-900 dark:text-amber-50">{offer.headline}</p>
              <p className="text-xs text-sand-600">{offer.validFor}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code className="coupon-code-pill">{WELCOME_OFFER.code}</code>
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={copyCode}
              className="coupon-copy-btn"
              aria-label={offer.copyCoupon}
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <section className="py-14 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="coupon-banner relative"
        >
          <div className="coupon-banner__glow coupon-banner__glow--left" aria-hidden />
          <div className="coupon-banner__glow coupon-banner__glow--right" aria-hidden />
          <div className="coupon-banner__dots" aria-hidden />

          <div className="relative grid lg:grid-cols-[1fr_auto] gap-8 p-8 md:p-10 lg:p-12 items-center">
            <div>
              <motion.span
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="coupon-banner__badge"
              >
                <Sparkles className="w-4 h-4" />
                {offer.badge} · {offer.trendingNow}
              </motion.span>
              <h2 className="home-headline text-white mb-3 leading-tight">
                {offer.titleLine1}{' '}
                <span className="text-amber-200">{offer.titleHighlight}</span>
                {offer.titleLine2 ? ` ${offer.titleLine2}` : ''}
              </h2>
              <p className="text-white/90 text-lg mb-6 leading-relaxed max-w-lg">
                {offer.desc} {offer.validFor.toLowerCase()}.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/signup" className="btn-gold inline-flex items-center gap-2 shadow-lg">
                  {offer.claimOffer} <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/assessments/dmit" className="px-6 py-3 rounded-xl border-2 border-white/40 text-white font-semibold hover:bg-white/10 transition">
                  {offer.exploreAssessments}
                </Link>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 260 }}
              className="coupon-ticket"
            >
              <div className="coupon-ticket__notch coupon-ticket__notch--left" aria-hidden />
              <div className="coupon-ticket__notch coupon-ticket__notch--right" aria-hidden />
              <div className="coupon-ticket__inner">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Percent className="w-5 h-5 text-amber-600" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">{offer.couponLabel}</p>
                </div>
                <motion.div
                  animate={{ boxShadow: ['0 0 0 0 rgba(251,191,36,0.5)', '0 0 0 14px rgba(251,191,36,0)', '0 0 0 0 rgba(251,191,36,0)'] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                  className="coupon-ticket__code-wrap"
                >
                  <code className="coupon-ticket__code">{WELCOME_OFFER.code}</code>
                </motion.div>
                <p className="text-amber-800 font-bold text-base mt-3 mb-5">{offer.discountLine}</p>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={copyCode}
                  className="coupon-ticket__copy w-full"
                >
                  {copied ? <><Check className="w-5 h-5 text-emerald-600" /> {offer.copied}</> : <><Copy className="w-5 h-5" /> {offer.copyCode}</>}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
