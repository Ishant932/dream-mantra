import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard, Shield, CheckCircle, Loader2, Tag, Clock,
  RefreshCw, UserCheck, MessageCircle, Download, QrCode, Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { paymentsApi, userApi } from '../api';
import { applyVoucherPrice } from '../data/promotions';
import { buildModuleSelection, getModuleBySlug, hasSkillMappingTests, MODULE_CATALOG, resolveCounsellingAddon } from '../data/moduleCatalog';
import { purchaseIncludesCounselling } from '../utils/moduleAccess';
import SkillMappingBandPicker from '../components/SkillMappingBandPicker';

const UPI_VPA = '8824652354@pthdfc';
const UPI_QR_IMAGE = '/payments/upi-qr.png';

function formatPrice(n) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function downloadUpiQr() {
  fetch(UPI_QR_IMAGE)
    .then((res) => res.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'dream-mantra-upi-qr.png';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    })
    .catch(() => {
      const link = document.createElement('a');
      link.href = UPI_QR_IMAGE;
      link.download = 'dream-mantra-upi-qr.png';
      link.target = '_blank';
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();
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
  const [paymentReferenceId, setPaymentReferenceId] = useState('');
  const [userNote, setUserNote] = useState('');
  const [skillMappingBand, setSkillMappingBand] = useState('');
  const [catalog, setCatalog] = useState(MODULE_CATALOG);
  const [liveVouchers, setLiveVouchers] = useState([]);
  const [updatingCounselling, setUpdatingCounselling] = useState(false);

  useEffect(() => {
    paymentsApi.products()
      .then((res) => {
        if (Array.isArray(res.products) && res.products.length) setCatalog(res.products);
      })
      .catch(() => {});
    paymentsApi.promotions(token)
      .then((res) => {
        if (Array.isArray(res.vouchers)) setLiveVouchers(res.vouchers);
      })
      .catch(() => {});
  }, [token]);

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
    if (order?.gatewayEnabled) {
      setPaymentMethod('phonepe');
    } else {
      setPaymentMethod('admin');
    }
  }, [order?.gatewayEnabled]);

  useEffect(() => {
    const pay = order?.payment;
    if (!pay || pay.payment_status === 'confirmed') return undefined;
    const interval = setInterval(() => {
      loadOrder().catch(() => {});
    }, 30000);
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

    const fromCatalog = buildModuleSelection(slug, addCounselling, catalog);
    if (!fromCatalog) return null;

    const lineItems =
      apiSelection?.lineItems?.length ? apiSelection.lineItems
      : navSelection?.lineItems?.length ? navSelection.lineItems
      : fromCatalog.lineItems;

    return {
      slug,
      moduleMeta: getModuleBySlug(slug, catalog) || fromCatalog.module,
      displayTitle: apiSelection?.displayTitle || navSelection?.displayTitle || fromCatalog.displayTitle,
      lineItems,
      catalogTotal: fromCatalog.total,
    };
  }, [order, navSelection, catalog]);

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
      const res = await paymentsApi.validateCoupon(token, coupon.trim(), checkout?.slug);
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

  /** Return from PhonePe checkout — verify order status and unlock */
  useEffect(() => {
    if (!token || !assessmentId || loading) return;
    const params = new URLSearchParams(location.search);
    if (params.get('phonepe') !== 'return') return;
    const orderId = params.get('orderId');
    if (!orderId) return;

    let cancelled = false;
    (async () => {
      setPaying(true);
      setError('');
      try {
        const res = await paymentsApi.verify(token, {
          assessmentId: Number(assessmentId),
          orderId,
        });
        if (cancelled) return;
        if (res.success) {
          navigate(
            postPayPath(
              order?.selection?.moduleSlug || order?.assessment?.product_slug,
              Number(assessmentId),
              order?.selection?.lineItems
            ),
            { replace: true }
          );
          return;
        }
        setError(res.message || 'Payment not confirmed yet');
      } catch (e) {
        if (!cancelled) {
          setError(
            e.message ||
              'Could not verify PhonePe payment. If money was deducted, contact support.'
          );
          await loadOrder().catch(() => {});
        }
      } finally {
        if (!cancelled) {
          setPaying(false);
          navigate(`/payment/${assessmentId}`, { replace: true });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on PhonePe return query
  }, [token, assessmentId, loading, location.search]);

  const includesCounselling = purchaseIncludesCounselling({
    slug: checkout?.slug,
    lineItems: checkout?.lineItems,
    addCounselling: checkout?.lineItems?.some((li) => li.type === 'counselling'),
  });

  const showCounsellingToggle = !!(
    checkout?.moduleMeta?.optionalCounselling
    && !checkout?.moduleMeta?.includesCounselling
  );
  const counsellingAddon = checkout?.moduleMeta ? resolveCounsellingAddon(checkout.moduleMeta) : null;
  const hasCounsellingInOrder = checkout?.lineItems?.some((li) => li.type === 'counselling');

  const toggleCounsellingAddon = async () => {
    if (!token || !assessmentId || updatingCounselling) return;
    setUpdatingCounselling(true);
    setError('');
    try {
      await paymentsApi.updateOrderSelection(token, assessmentId, {
        addCounselling: !hasCounsellingInOrder,
      });
      setCouponApplied(null);
      await loadOrder();
    } catch (e) {
      setError(e.message);
    } finally {
      setUpdatingCounselling(false);
    }
  };

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
      if (!proofPreview) {
        setError('Please upload your payment screenshot');
        return;
      }
      if (!paymentReferenceId.trim()) {
        setError('Please enter your payment reference / transaction ID');
        return;
      }
      const ok = await ensureSkillBandBeforePay();
      if (!ok) return;

      const res = await paymentsApi.submitManual(token, {
        assessmentId: Number(assessmentId),
        skillMappingBand: needsSkillBand ? skillMappingBand : undefined,
        proofDataUrl: proofPreview,
        proofFileName: proofFileName || undefined,
        paymentReferenceId: paymentReferenceId.trim(),
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
      setError('Online payment via PhonePe is not available yet. Please use UPI transfer.');
      return;
    }

    setPaying(true);
    setError('');
    try {
      const ok = await ensureSkillBandBeforePay();
      if (!ok) {
        setPaying(false);
        return;
      }

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

      if (created.manualMode || created.pendingManual || !created.redirectUrl) {
        setError('Online payment is unavailable. Please use UPI transfer.');
        await loadOrder();
        setPaying(false);
        return;
      }

      // PhonePe Standard Checkout — full-page redirect
      window.location.href = created.redirectUrl;
    } catch (e) {
      setError(e.message);
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
  const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || catalogTotal;
  const originalPrice = subtotal;
  const { final: finalPrice, savings } = couponApplied
    ? applyVoucherPrice(originalPrice, couponApplied)
    : { final: originalPrice, savings: 0 };

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
              <p className="text-xs font-mono bg-sand-100 dark:bg-sand-800 rounded-lg px-3 py-2 mb-2">
                Order ID: {payment.order_id}
              </p>
            )}
            {payment?.payment_reference_id && (
              <p className="text-xs font-mono bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 rounded-lg px-3 py-2 mb-4">
                Payment Ref: {payment.payment_reference_id}
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
    <div className="payment-page min-h-screen pt-24 pb-20 sm:pt-28 bg-gradient-to-b from-amber-50/90 to-[var(--bg-base)] dark:from-sand-950 dark:to-sand-900">
      <div className="payment-page__inner max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="payment-page__shell"
        >
          {/* Header */}
          <header className="payment-page__header">
            <div className="payment-page__header-icon" aria-hidden>
              <CreditCard className="w-7 h-7 text-amber-700" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="payment-page__eyebrow">Secure checkout</p>
              <h1 className="payment-page__title">Complete payment</h1>
              {payment?.order_id && (
                <p className="payment-page__order-id">Order {payment.order_id}</p>
              )}
            </div>
            <div className="payment-page__total-pill" aria-label={`Total ${formatPrice(finalPrice)}`}>
              <span className="payment-page__total-pill-label">Total</span>
              <span className="payment-page__total-pill-value">{formatPrice(finalPrice)}</span>
            </div>
          </header>

          <div className="payment-page__steps" aria-label="Checkout steps">
            <span className="payment-page__step payment-page__step--done">1. Order</span>
            <span className="payment-page__step-line" aria-hidden />
            <span className="payment-page__step payment-page__step--active">2. Pay</span>
          </div>

          <div className="payment-page__layout">
            {/* Left — order & coupon */}
            <aside className="payment-page__aside">
              <section className="payment-page__card payment-page__card--summary">
                <div className="payment-page__product">
                  {moduleMeta?.icon && <span className="payment-page__product-icon">{moduleMeta.icon}</span>}
                  <div className="min-w-0">
                    <h2 className="payment-page__product-title">{displayTitle}</h2>
                    <p className="payment-page__product-meta">{lineItems.length} item{lineItems.length !== 1 ? 's' : ''} in cart</p>
                  </div>
                </div>
                <ul className="payment-page__lines">
                  {lineItems.map((item) => (
                    <li key={`${item.type}-${item.label}`} className="payment-page__line">
                      <span>{item.label}</span>
                      <span>{formatPrice(item.amount)}</span>
                    </li>
                  ))}
                </ul>
                <div className="payment-page__totals">
                  <div className="payment-page__line payment-page__line--muted">
                    <span>Subtotal</span>
                    <span>{formatPrice(originalPrice)}</span>
                  </div>
                  {couponApplied && savings > 0 && (
                    <>
                      <div className="payment-page__line payment-page__line--discount">
                        <span>Coupon {couponApplied.code}</span>
                        <span>−{formatPrice(savings)}</span>
                      </div>
                    </>
                  )}
                  <div className="payment-page__line payment-page__line--total">
                    <span>Amount due</span>
                    <span>{formatPrice(finalPrice)}</span>
                  </div>
                </div>
              </section>

              <section className="payment-page__card payment-page__card--coupon">
                <h3 className="payment-page__section-title">
                  <Tag className="w-4 h-4 text-amber-600" /> Coupon
                </h3>
                {liveVouchers.length > 0 && (
                  <div className="payment-page__voucher-chips">
                    {liveVouchers.map((v) => (
                      <button
                        key={v.code}
                        type="button"
                        onClick={() => { setCoupon(v.code); setCouponApplied(null); }}
                        className="payment-page__voucher-chip"
                      >
                        {v.code}
                      </button>
                    ))}
                  </div>
                )}
                <div className="payment-page__coupon-row">
                  <input
                    value={coupon}
                    onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponApplied(null); }}
                    placeholder="Enter code"
                    className="input-field payment-page__coupon-input font-mono uppercase"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={validating || !coupon.trim()}
                    className="btn-outline payment-page__coupon-apply"
                  >
                    {validating ? '…' : 'Apply'}
                  </button>
                </div>
                {couponApplied && (
                  <p className="payment-page__coupon-ok">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    {couponApplied.label || couponApplied.code} applied
                  </p>
                )}
              </section>
            </aside>

            {/* Right — configure & pay */}
            <div className="payment-page__main">
              {needsSkillBand && (
                <section className="payment-page__card">
                  <h3 className="payment-page__section-title">Class band</h3>
                  <SkillMappingBandPicker
                    value={skillMappingBand}
                    onChange={handleSkillBandChange}
                    title="Which class band is this Skill Mapping for?"
                    hint="Only this band's tests unlock after payment."
                  />
                </section>
              )}

              {showCounsellingToggle && counsellingAddon && (
                <section className="payment-page__card">
                  <h3 className="payment-page__section-title">Add-on</h3>
                  <button
                    type="button"
                    disabled={updatingCounselling}
                    onClick={toggleCounsellingAddon}
                    className={`payment-page__addon${hasCounsellingInOrder ? ' payment-page__addon--on' : ''}`}
                  >
                    <MessageCircle className="w-5 h-5 shrink-0 text-amber-600" />
                    <div className="min-w-0 flex-1 text-left">
                      <p className="font-bold text-sm">{counsellingAddon.title}</p>
                      <p className="text-xs text-sand-600 mt-0.5 line-clamp-2">{counsellingAddon.description}</p>
                    </div>
                    <div className="payment-page__addon-meta shrink-0 text-right">
                      <p className="text-sm font-bold text-amber-700">+{formatPrice(counsellingAddon.price)}</p>
                      <p className="text-xs font-bold mt-0.5">
                        {updatingCounselling ? '…' : hasCounsellingInOrder ? 'Added' : 'Add'}
                      </p>
                    </div>
                  </button>
                </section>
              )}

              <section className="payment-page__card">
                <h3 className="payment-page__section-title">Payment method</h3>
                <div className="payment-page__methods">
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('admin'); setError(''); }}
                    className={`payment-page__method${paymentMethod === 'admin' ? ' payment-page__method--active' : ''}`}
                  >
                    <UserCheck className="w-5 h-5 shrink-0" />
                    <div className="text-left min-w-0">
                      <p className="font-bold text-sm">UPI transfer</p>
                      <p className="text-xs text-sand-500 mt-0.5">Scan QR → upload proof</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    disabled={!gatewayEnabled}
                    onClick={() => {
                      if (!gatewayEnabled) return;
                      setPaymentMethod('phonepe');
                      setError('');
                    }}
                    className={`payment-page__method${paymentMethod === 'phonepe' && gatewayEnabled ? ' payment-page__method--active' : ''}${!gatewayEnabled ? ' payment-page__method--locked' : ''}`}
                    aria-disabled={!gatewayEnabled}
                    title={gatewayEnabled ? 'Pay with PhonePe' : 'PhonePe — coming soon'}
                  >
                    <span className="payment-page__method-icon-wrap">
                      <CreditCard className="w-5 h-5 shrink-0" aria-hidden />
                      {!gatewayEnabled && (
                        <span className="payment-page__method-lock" aria-hidden>
                          <Lock className="w-3 h-3" />
                        </span>
                      )}
                    </span>
                    <div className="text-left min-w-0 flex-1">
                      <p className="font-bold text-sm flex items-center gap-1.5 flex-wrap">
                        Pay with PhonePe
                        {!gatewayEnabled && (
                          <span className="payment-page__method-soon">Locked</span>
                        )}
                      </p>
                      <p className="text-xs text-sand-500 mt-0.5">
                        {gatewayEnabled
                          ? 'UPI, cards, wallets — instant unlock'
                          : 'Online gateway — set keys to enable'}
                      </p>
                    </div>
                  </button>
                </div>

                {paymentMethod === 'admin' && (
                  <div className="payment-page__upi">
                    <div className="payment-page__qr-frame" aria-label="UPI QR code scanner">
                      <div className="payment-page__qr-frame-head">
                        <span className="payment-page__qr-badge">
                          <QrCode className="w-3.5 h-3.5" aria-hidden />
                          UPI Pay
                        </span>
                        <span className="payment-page__qr-brand">Dream Mantra</span>
                      </div>
                      <div className="payment-page__qr-mat">
                        <div className="payment-page__qr-scan-corners" aria-hidden />
                        <img
                          src={UPI_QR_IMAGE}
                          alt="Scan UPI QR code to pay Dream Mantra"
                          className="payment-page__qr-image"
                        />
                      </div>
                      <p className="payment-page__qr-caption">Scan with PhonePe, GPay, Paytm, or any UPI app</p>
                      <div className="payment-page__qr-actions">
                        <button
                          type="button"
                          onClick={downloadUpiQr}
                          className="payment-page__qr-download"
                        >
                          <Download className="w-4 h-4 shrink-0" aria-hidden />
                          Download QR
                        </button>
                      </div>
                    </div>
                    <div className="payment-page__upi-details">
                      <div className="payment-page__upi-row">
                        <span>UPI ID</span>
                        <code>{UPI_VPA}</code>
                      </div>
                      <div className="payment-page__upi-row">
                        <span>Amount</span>
                        <strong>{formatPrice(finalPrice)}</strong>
                      </div>
                      <p className="payment-page__upi-note">
                        Pay the exact amount, then upload your screenshot below. We confirm within 24 hours.
                      </p>
                      <label className="payment-page__field-label">
                        Payment screenshot <span className="text-red-600">*</span>
                      </label>
                      <input type="file" accept="image/*,.pdf" onChange={handleProofChange} className="input-field !py-2 text-sm w-full" />
                      {proofPreview && (
                        <div className="payment-page__proof-preview">
                          <p className="text-xs text-emerald-700">Attached: {proofFileName}</p>
                          {proofPreview.startsWith('data:image') && (
                            <img src={proofPreview} alt="Payment proof" />
                          )}
                        </div>
                      )}
                      <label className="payment-page__field-label">
                        Transaction ID <span className="text-red-600">*</span>
                      </label>
                      <input
                        className="input-field !py-2.5 w-full"
                        placeholder="UPI reference number"
                        value={paymentReferenceId}
                        onChange={(e) => setPaymentReferenceId(e.target.value)}
                        maxLength={120}
                      />
                      <label className="payment-page__field-label">Note (optional)</label>
                      <input
                        className="input-field !py-2.5 w-full"
                        placeholder="Any extra details"
                        value={userNote}
                        onChange={(e) => setUserNote(e.target.value)}
                        maxLength={500}
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'phonepe' && (
                  <p className="payment-page__razorpay-hint">
                    <Shield className="w-4 h-4 shrink-0 text-brand-500" />
                    Secured by PhonePe — you will be redirected to complete payment, then access unlocks.
                  </p>
                )}

                <ul className="payment-page__status-hints">
                  <li>
                    <Clock className="w-4 h-4 shrink-0 text-amber-500" />
                    {paymentMethod === 'admin'
                      ? 'Awaiting proof — admin verifies within 24 hours'
                      : paymentMethod === 'phonepe'
                        ? 'Instant unlock after successful PhonePe payment'
                        : 'Select a payment method above'}
                  </li>
                </ul>

                {error && <p className="payment-page__error">{error}</p>}

                <button
                  type="button"
                  onClick={handlePay}
                  disabled={paying || !paymentMethod}
                  className="btn-primary payment-page__pay-btn w-full"
                >
                  {paying
                    ? 'Processing…'
                    : paymentMethod === 'admin'
                      ? `Submit proof · ${formatPrice(finalPrice)}`
                      : paymentMethod === 'phonepe'
                        ? `Pay with PhonePe · ${formatPrice(finalPrice)}`
                        : 'Choose payment method'}
                </button>

                <div className="payment-page__footer-actions">
                  <button
                    type="button"
                    onClick={handleCancelOrder}
                    disabled={cancelling || paying}
                    className="payment-page__link-btn payment-page__link-btn--danger"
                  >
                    {cancelling ? 'Removing…' : 'Remove order'}
                  </button>
                  <Link to="/dashboard?tab=assess" className="payment-page__link-btn">
                    Back to modules
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
