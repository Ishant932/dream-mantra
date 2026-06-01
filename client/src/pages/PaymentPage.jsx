import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard, Shield, CheckCircle, Loader2, Tag, Sparkles, Clock,
  AlertCircle, RefreshCw, UserCheck, Smartphone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { paymentsApi, userApi } from '../api';
import { WELCOME_OFFER, calcDiscountedPrice } from '../data/promotions';
import { buildModuleSelection, getModuleBySlug, hasSkillMappingTests } from '../data/moduleCatalog';
import { purchaseIncludesCounselling } from '../utils/moduleAccess';
import SkillMappingBandPicker from '../components/SkillMappingBandPicker';

function formatPrice(n) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Could not load payment gateway'));
    document.body.appendChild(script);
  });
}

export default function PaymentPage() {
  const { assessmentId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navSelection = location.state?.selection;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [validating, setValidating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [proofFileName, setProofFileName] = useState('');
  const [userNote, setUserNote] = useState('');
  const [skillMappingBand, setSkillMappingBand] = useState('');

  const loadOrder = useCallback(async () => {
    if (!token) return;
    const data = await paymentsApi.getOrder(token, assessmentId);
    setOrder(data);
    return data;
  }, [token, assessmentId]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadOrder()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, assessmentId, navigate, loadOrder]);

  useEffect(() => {
    const pay = order?.payment;
    if (!pay || pay.payment_status === 'confirmed') return undefined;
    const interval = setInterval(() => {
      loadOrder().catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [order?.payment?.payment_status, loadOrder]);

  useEffect(() => {
    const band = order?.assessment?.progress?.skillMappingBand;
    if (band) setSkillMappingBand(band);
  }, [order?.assessment?.progress?.skillMappingBand]);

  const checkout = useMemo(() => {
    const assessment = order?.assessment;
    const apiSelection = order?.selection;
    const slug = apiSelection?.moduleSlug || navSelection?.slug || assessment?.product_slug;
    const addCounselling =
      apiSelection?.addCounselling ??
      navSelection?.addCounselling ??
      order?.addCounselling ??
      assessment?.progress?.addCounselling ??
      false;

    const fromCatalog = buildModuleSelection(slug, addCounselling);
    if (!fromCatalog) return null;

    const lineItems =
      apiSelection?.lineItems?.length ? apiSelection.lineItems
      : navSelection?.lineItems?.length ? navSelection.lineItems
      : fromCatalog.lineItems;

    return {
      slug,
      moduleMeta: fromCatalog.module,
      displayTitle: apiSelection?.displayTitle || navSelection?.displayTitle || fromCatalog.displayTitle,
      lineItems,
      catalogTotal: fromCatalog.total,
    };
  }, [order, navSelection]);

  const gatewayEnabled = order?.gatewayEnabled === true;
  const payment = order?.payment;
  const isConfirmed = payment?.payment_status === 'confirmed';
  const isSubmitted = !!payment?.submitted_at;
  const isPending = payment?.payment_status === 'pending' && !isConfirmed;

  const needsSkillBand = hasSkillMappingTests(checkout?.slug);

  const persistSkillBand = async (band) => {
    if (!band || !token) return;
    await userApi.setSkillMappingBand(token, Number(assessmentId), band);
    await loadOrder();
  };

  const handleSkillBandChange = async (band) => {
    setSkillMappingBand(band);
    setError('');
    try {
      await persistSkillBand(band);
    } catch (e) {
      setError(e.message);
    }
  };

  const ensureSkillBandBeforePay = async () => {
    if (!needsSkillBand) return true;
    if (!skillMappingBand) {
      setError('Please select which class band this purchase is for (Class 6–8, 9–12, or Adults).');
      return false;
    }
    try {
      await persistSkillBand(skillMappingBand);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  };

  const applyCoupon = async () => {
    setValidating(true);
    setError('');
    try {
      const res = await paymentsApi.validateCoupon(token, coupon.trim());
      setCouponApplied(res);
    } catch (e) {
      setCouponApplied(null);
      setError(e.message);
    } finally {
      setValidating(false);
    }
  };

  const handleProofChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setError('Payment proof must be under 4 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProofPreview(reader.result);
      setProofFileName(file.name);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const postPayPath = (slug, id, items, addCounselling) => {
    if (purchaseIncludesCounselling({ slug, lineItems: items, addCounselling })) {
      return '/dashboard?tab=book';
    }
    const mod = getModuleBySlug(slug);
    const base = mod ? `/dashboard/test/${slug}` : `/dashboard/test/dmit`;
    return `${base}?id=${id}`;
  };

  const includesCounselling = purchaseIncludesCounselling({
    slug: checkout?.slug,
    lineItems: checkout?.lineItems,
    addCounselling: checkout?.lineItems?.some((li) => li.type === 'counselling'),
  });

  const handleCancelOrder = async () => {
    setCancelling(true);
    setError('');
    try {
      await userApi.cancelAssessment(token, Number(assessmentId));
      navigate('/dashboard?tab=assess', { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setCancelling(false);
    }
  };

  const handleAdminSubmit = async () => {
    setPaying(true);
    setError('');
    try {
      const ok = await ensureSkillBandBeforePay();
      if (!ok) return;

      const res = await paymentsApi.submitManual(token, {
        assessmentId: Number(assessmentId),
        skillMappingBand: needsSkillBand ? skillMappingBand : undefined,
        proofDataUrl: proofPreview || undefined,
        proofFileName: proofFileName || undefined,
        userNote: userNote.trim() || undefined,
      });

      if (res.alreadyConfirmed) {
        navigate(postPayPath(checkout?.slug, Number(assessmentId), checkout?.lineItems));
        return;
      }

      await loadOrder();
    } catch (e) {
      setError(e.message);
    } finally {
      setPaying(false);
    }
  };

  const handleGatewayPay = async () => {
    if (!gatewayEnabled) {
      setError('Online payment via Razorpay is not available yet. Please use admin verification.');
      return;
    }

    setPaying(true);
    setError('');
    try {
      const ok = await ensureSkillBandBeforePay();
      if (!ok) return;

      await loadRazorpayScript();

      const created = await paymentsApi.createOrder(
        token,
        Number(assessmentId),
        couponApplied?.code || undefined,
        needsSkillBand ? skillMappingBand : undefined
      );

      if (created.alreadyPaid) {
        navigate(postPayPath(checkout?.slug, Number(assessmentId), checkout?.lineItems));
        return;
      }

      if (created.manualMode || created.pendingManual) {
        setError('Online payment is unavailable. Please use admin verification.');
        await loadOrder();
        return;
      }

      const options = {
        key: created.key,
        amount: created.amount,
        currency: created.currency,
        name: 'Dream Mantra',
        description: checkout?.displayTitle,
        order_id: created.orderId,
        handler: async (response) => {
          await paymentsApi.verify(token, {
            assessmentId: Number(assessmentId),
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
          navigate(postPayPath(checkout?.slug, Number(assessmentId), checkout?.lineItems));
        },
        theme: { color: '#ea580c' },
      };

      if (!window.Razorpay) throw new Error('Payment gateway loading — try again');
      new window.Razorpay(options).open();
    } catch (e) {
      setError(e.message);
    } finally {
      setPaying(false);
    }
  };

  const handlePay = () => {
    if (!paymentMethod) {
      setError('Please choose a payment method');
      return;
    }
    if (paymentMethod === 'admin') {
      handleAdminSubmit();
    } else {
      handleGatewayPay();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!order?.assessment || !checkout) {
    return (
      <div className="min-h-screen pt-28 text-center px-4">
        <p className="text-red-600">{error || 'Order not found'}</p>
        <Link to="/dashboard" className="btn-primary mt-6 inline-flex">Back to Dashboard</Link>
      </div>
    );
  }

  const { lineItems, displayTitle, catalogTotal, moduleMeta, slug } = checkout;
  const originalPrice = catalogTotal;
  const finalPrice = couponApplied
    ? calcDiscountedPrice(originalPrice, couponApplied.discountPercent)
    : originalPrice;
  const savings = originalPrice - finalPrice;

  if (isConfirmed) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 bg-gradient-to-b from-emerald-50/80 to-[var(--bg-base)]">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md mx-auto text-center glass-card p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.1 }}
          >
            <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold mb-2">Payment Confirmed</h1>
          <p className="text-sand-600 mb-6">{displayTitle} is active on your account.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {includesCounselling ? (
              <>
                <Link to="/dashboard?tab=book" className="btn-primary inline-flex items-center justify-center gap-2">
                  Book counselling slot
                </Link>
                <Link to="/dashboard?tab=process-guides" className="btn-outline inline-flex items-center justify-center gap-2">
                  View process
                </Link>
              </>
            ) : (
              <Link to={postPayPath(slug, Number(assessmentId), lineItems)} className="btn-primary inline-flex">
                Start assessment
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  if (isSubmitted && isPending) {
    return (
      <div className="min-h-screen pt-28 pb-16 bg-gradient-to-b from-amber-50 to-[var(--bg-base)]">
        <div className="max-w-lg mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 text-center">
            <Clock className="w-14 h-14 text-amber-600 mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold mb-2">Payment Verification Pending</h1>
            <p className="text-sand-600 text-sm mb-4">
              Your order for <strong>{displayTitle}</strong> ({formatPrice(finalPrice)}) has been sent to admin for verification.
            </p>
            {payment?.order_id && (
              <p className="text-xs font-mono bg-sand-100 dark:bg-sand-800 rounded-lg px-3 py-2 mb-4">
                Order ID: {payment.order_id}
              </p>
            )}
            <div className="flex items-center justify-center gap-2 text-sm text-amber-700 mb-6">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Checking status automatically…
            </div>
            <Link to="/dashboard" className="btn-primary inline-flex">Back to Dashboard</Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 bg-gradient-to-b from-amber-50 to-[var(--bg-base)] dark:from-sand-950 dark:to-sand-900">
      <div className="max-w-lg mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-brand-100 dark:bg-brand-900">
              <CreditCard className="w-8 h-8 text-brand-600" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Complete Payment</h1>
              <p className="text-sm text-sand-500">Choose how you would like to pay</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-sand-50 dark:bg-sand-800 mb-6">
            <div className="flex items-start gap-3 mb-4">
              {moduleMeta?.icon && <span className="text-2xl">{moduleMeta.icon}</span>}
              <div>
                <p className="font-bold text-lg">{displayTitle}</p>
                {payment?.order_id && (
                  <p className="text-xs font-mono text-sand-500 mt-1">Order: {payment.order_id}</p>
                )}
              </div>
            </div>
            <ul className="space-y-2 text-sm border-t border-sand-200 dark:border-sand-700 pt-3">
              {lineItems.map((item) => (
                <li key={`${item.type}-${item.label}`} className="flex justify-between gap-3">
                  <span className="text-sand-600">{item.label}</span>
                  <span className="font-semibold">{formatPrice(item.amount)}</span>
                </li>
              ))}
              <li className="flex justify-between pt-2 border-t font-bold">
                <span>Total</span>
                <span className="text-brand-600">{formatPrice(finalPrice)}</span>
              </li>
            </ul>
          </div>

          {needsSkillBand && (
            <div className="mb-6 p-4 rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50/80 dark:bg-amber-950/20">
              <SkillMappingBandPicker
                value={skillMappingBand}
                onChange={handleSkillBandChange}
                title="Which class band is this Skill Mapping for?"
                hint="Pick the age group for the student taking the tests. After payment, only this band's tests will unlock — other bands stay locked."
              />
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm font-semibold mb-3">Payment method</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => { setPaymentMethod('admin'); setError(''); }}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  paymentMethod === 'admin'
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 ring-2 ring-brand-200'
                    : 'border-sand-200 dark:border-sand-700 hover:border-brand-300'
                }`}
              >
                <UserCheck className={`w-6 h-6 mb-2 ${paymentMethod === 'admin' ? 'text-brand-600' : 'text-sand-500'}`} />
                <p className="font-bold text-sm">Admin Verification</p>
                <p className="text-xs text-sand-500 mt-1">Order sent to admin for manual confirmation</p>
              </button>

              <button
                type="button"
                onClick={() => { if (gatewayEnabled) { setPaymentMethod('razorpay'); setError(''); } }}
                disabled={!gatewayEnabled}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  !gatewayEnabled
                    ? 'border-sand-200 dark:border-sand-700 opacity-50 cursor-not-allowed'
                    : paymentMethod === 'razorpay'
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 ring-2 ring-brand-200'
                      : 'border-sand-200 dark:border-sand-700 hover:border-brand-300'
                }`}
              >
                <Smartphone className={`w-6 h-6 mb-2 ${paymentMethod === 'razorpay' ? 'text-brand-600' : 'text-sand-500'}`} />
                <p className="font-bold text-sm">Pay via Razorpay</p>
                <p className="text-xs text-sand-500 mt-1">
                  {gatewayEnabled ? 'Instant online payment' : 'Coming soon — not connected yet'}
                </p>
              </button>
            </div>
          </div>

          {paymentMethod === 'admin' && (
            <div className="mb-6 space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold text-amber-900">Admin verification</p>
                  <p className="text-amber-800 mt-1">
                    Pay via UPI, then upload your payment screenshot. Our team confirms within 24 hours.
                  </p>
                  <ul className="mt-2 space-y-0.5 text-amber-800">
                    <li>• UPI / PhonePe / GPay: <strong>9680102276</strong></li>
                    <li>• Amount: <strong>{formatPrice(finalPrice)}</strong></li>
                  </ul>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold block mb-2">Payment screenshot (optional but recommended)</label>
                <input type="file" accept="image/*,.pdf" onChange={handleProofChange} className="input-field !py-2 text-sm" />
                {proofPreview && (
                  <p className="text-xs text-emerald-700 mt-1">Attached: {proofFileName}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold block mb-2">Note for admin (optional)</label>
                <input
                  className="input-field !py-2.5"
                  placeholder="UPI reference, transaction ID, etc."
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  maxLength={500}
                />
              </div>
            </div>
          )}

          {paymentMethod === 'razorpay' && gatewayEnabled && (
            <>
              <motion.div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-amber-50 border border-amber-200 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-800">First-time offer: {WELCOME_OFFER.code}</p>
                  <p className="text-xs text-sand-600 mt-0.5">{WELCOME_OFFER.discountPercent}% off your first assessment</p>
                </div>
              </motion.div>

              <div className="mb-6">
                <label className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-amber-600" /> Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponApplied(null); }}
                    placeholder={WELCOME_OFFER.code}
                    className="input-field flex-1 !py-2.5 font-mono uppercase"
                  />
                  <button type="button" onClick={applyCoupon} disabled={validating || !coupon.trim()} className="btn-outline !py-2.5">
                    {validating ? '...' : 'Apply'}
                  </button>
                </div>
                {couponApplied && (
                  <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> {couponApplied.label} applied!
                    {savings > 0 && <span className="text-sand-500"> (save {formatPrice(savings)})</span>}
                  </p>
                )}
              </div>
            </>
          )}

          <ul className="space-y-2 mb-6 text-sm text-sand-600">
            <li className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              {paymentMethod === 'admin'
                ? 'Status: Awaiting admin confirmation after you submit'
                : paymentMethod === 'razorpay'
                  ? 'Access unlocks instantly after successful payment'
                  : 'Select a payment method to continue'}
            </li>
            {paymentMethod === 'razorpay' && (
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand-500" /> Secured by Razorpay
              </li>
            )}
          </ul>

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <button
            type="button"
            onClick={handlePay}
            disabled={paying || !paymentMethod}
            className="btn-primary w-full text-lg py-4 disabled:opacity-50"
          >
            {paying
              ? 'Processing…'
              : paymentMethod === 'admin'
                ? `Send to Admin · ${formatPrice(finalPrice)}`
                : paymentMethod === 'razorpay'
                  ? `Pay ${formatPrice(finalPrice)}`
                  : 'Choose a payment method'}
          </button>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              type="button"
              onClick={handleCancelOrder}
              disabled={cancelling || paying}
              className="flex-1 text-center text-sm py-3 rounded-xl border border-sand-300 dark:border-sand-600 text-sand-600 hover:border-red-300 hover:text-red-600 transition disabled:opacity-50"
            >
              {cancelling ? 'Removing…' : 'Remove order'}
            </button>
            <Link to="/dashboard?tab=assess" className="flex-1 text-center text-sm py-3 text-sand-500 hover:text-brand-600">
              Back to modules
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
