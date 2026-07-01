import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tag, Copy, Check, Sparkles, TrendingUp, Gift, ArrowRight, Percent } from 'lucide-react';
import { WELCOME_OFFER } from '../data/promotions';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useUserVouchers } from '../hooks/useUserVouchers';

function voucherDiscountLabel(v) {
  if (v.discountFixed != null) return `₹${Number(v.discountFixed).toLocaleString('en-IN')} off`;
  if (v.discountPercent != null) return `${v.discountPercent}% off`;
  return 'Special offer';
}

function VoucherChip({ voucher, copiedCode, onCopy, variant = 'light' }) {
  const isDark = variant === 'dark';
  return (
    <button
      type="button"
      onClick={() => onCopy(voucher.code)}
      className={
        isDark
          ? 'inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/15 border border-white/25 text-white text-sm font-semibold hover:bg-white/20 transition'
          : 'inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 dark:bg-stone-900/60 border border-amber-200/70 text-xs font-semibold hover:border-amber-400 transition'
      }
    >
      <Tag className={`w-3.5 h-3.5 ${isDark ? 'text-amber-200' : 'text-amber-600'}`} />
      <code>{voucher.code}</code>
      <span className={isDark ? 'text-white/80 text-xs' : 'opacity-70'}>{voucher.label || voucherDiscountLabel(voucher)}</span>
      <span className={isDark ? 'text-white/70 text-xs' : 'text-amber-700 font-bold'}>{voucherDiscountLabel(voucher)}</span>
      {copiedCode === voucher.code ? <Check className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`} /> : null}
    </button>
  );
}

export default function WelcomeOfferBanner({ variant = 'home', compact = false }) {
  const { d } = useLang();
  const { token } = useAuth();
  const offer = d('welcomeOffer');
  const { vouchers } = useUserVouchers(token);
  const [copiedCode, setCopiedCode] = useState('');

  const featured = useMemo(() => {
    if (!vouchers.length) {
      return token
        ? null
        : { code: null, label: offer.discountLine || WELCOME_OFFER.headline };
    }
    return vouchers.find((v) => v.code === WELCOME_OFFER.code) || vouchers[0];
  }, [vouchers, offer.discountLine, token]);

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(''), 2500);
    } catch {
      setCopiedCode('');
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
              <p className="font-accent font-bold text-sand-900 dark:text-amber-50">
                {vouchers.length > 1 ? `${vouchers.length} active offers` : (featured?.label || offer.headline)}
              </p>
              <p className="text-xs text-sand-600">{offer.validFor}</p>
            </div>
          </div>
          {vouchers.length <= 1 && featured?.code && (
            <div className="flex items-center gap-2">
              <code className="coupon-code-pill">{featured.code}</code>
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => copyCode(featured.code)}
                className="coupon-copy-btn"
                aria-label={offer.copyCoupon}
              >
                {copiedCode === featured.code ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </motion.button>
            </div>
          )}
        </div>
        {vouchers.length > 0 ? (
          <div className="relative flex flex-wrap gap-2 mt-4 pt-4 border-t border-amber-200/50">
            {vouchers.map((v) => (
              <VoucherChip key={v.code} voucher={v} copiedCode={copiedCode} onCopy={copyCode} />
            ))}
          </div>
        ) : !token ? (
          <p className="relative text-xs text-sand-600 mt-4 pt-4 border-t border-amber-200/50">
            <Link to="/login" className="text-amber-700 font-bold hover:underline">Sign in</Link>
            {' '}to see voucher codes assigned to your account.
          </p>
        ) : (
          <p className="relative text-xs text-sand-600 mt-4 pt-4 border-t border-amber-200/50">No active offers for your account right now.</p>
        )}
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
              {vouchers.length > 0 ? (
                <div className="mt-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-3">Your active offers</p>
                  <div className="flex flex-wrap gap-2">
                    {vouchers.map((v) => (
                      <VoucherChip key={v.code} voucher={v} copiedCode={copiedCode} onCopy={copyCode} variant="dark" />
                    ))}
                  </div>
                </div>
              ) : token ? (
                <p className="mt-6 text-sm text-white/80">No voucher codes are active for your account.</p>
              ) : (
                <p className="mt-6 text-sm text-white/80">
                  <Link to="/login" className="text-amber-200 font-bold hover:underline">Sign in</Link>
                  {' '}to view offers assigned to you.
                </p>
              )}
            </div>

            {featured?.code ? (
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
                  <code className="coupon-ticket__code">{featured.code}</code>
                </motion.div>
                <p className="text-amber-800 font-bold text-base mt-3 mb-5">{featured.label || offer.discountLine}</p>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => copyCode(featured.code)}
                  className="coupon-ticket__copy w-full"
                >
                  {copiedCode === featured.code ? <><Check className="w-5 h-5 text-emerald-600" /> {offer.copied}</> : <><Copy className="w-5 h-5" /> {offer.copyCode}</>}
                </motion.button>
              </div>
            </motion.div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
