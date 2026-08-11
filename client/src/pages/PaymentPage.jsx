import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard, Shield, CheckCircle, Loader2, Tag, Clock,
  RefreshCw, MessageCircle, Download, QrCode,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { paymentsApi, userApi, publicApi } from '../api';
import { applyVoucherPrice } from '../data/promotions';
import { buildModuleSelection, getModuleBySlug, hasSkillMappingTests, getSkillMappingComboLabel, MODULE_CATALOG, resolveCounsellingAddon } from '../data/moduleCatalog';
import { purchaseIncludesCounselling, resolveAssessmentSlug } from '../utils/moduleAccess';
import SkillMappingComboPicker from '../components/SkillMappingComboPicker';

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
  const { token, user } = useAuth();
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
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [proofPreview, setProofPreview] = useState(null);
  const [proofFileName, setProofFileName] = useState('');
  const [paymentReferenceId, setPaymentReferenceId] = useState('');
  const [userNote, setUserNote] = useState('');
  const [skillMappingBand, setSkillMappingBand] = useState('');
  const [skillCombos, setSkillCombos] = useState([]);
  const [catalog, setCatalog] = useState(MODULE_CATALOG);
  const [liveVouchers, setLiveVouchers] = useState([]);
  const [updatingCounselling, setUpdatingCounselling] = useState(false);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  const featuredVoucher = useMemo(() => liveVouchers[0] || null, [liveVouchers]);

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
    setPaymentMethod('razorpay');
  }, [assessmentId]);

  useEffect(() => {
    const pay = order?.payment;
    if (!pay || pay.payment_status === 'confirmed') return undefined;
    const interval = setInterval(() => {
      loadOrder().catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [order?.payment?.payment_status, loadOrder]);

  useEffect(() => {
    publicApi.skillMappingCombos()
      .then((res) => setSkillCombos(res.combos || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const comboId = order?.assessment?.progress?.skillMappingComboId || order?.assessment?.progress?.skillMappingBand;
    if (comboId) setSkillMappingBand(comboId);
  }, [order?.assessment?.progress?.skillMappingBand, order?.assessment?.progress?.skillMappingComboId]);

  const checkout = useMemo(() => {
    const assessment = order?.assessment;
    const apiSelection = order?.selection;
    const slug =
      apiSelection?.moduleSlug ||
      navSelection?.slug ||
      assessment?.product_slug ||
      resolveAssessmentSlug(assessment);
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

  useEffect(() => {
    if (order && !order.gatewayEnabled) {
      setAdminPanelOpen(true);
      setPaymentMethod('admin');
    }
  }, [order?.gatewayEnabled]);
  const isConfirmed = payment?.payment_status === 'confirmed';
  const isSubmitted = !!payment?.submitted_at;
  const isPending = payment?.payment_status === 'pending' && !isConfirmed;

  const needsSkillBand = hasSkillMappingTests(checkout?.slug);

  const persistSkillBand = async (band) => {
    if (!band || !token || !needsSkillBand) return;
    await userApi.setSkillMappingBand(token, Number(assessmentId), band);
    await loadOrder();
  };

  const handleSkillBandChange = async (band) => {
    setSkillMappingBand(band);
    setError('');
    if (needsSkillBand) {
      try {
        await persistSkillBand(band);
      } catch (e) {
        setError(e.message);
      }
    }
  };

  const ensureAdminBandBeforeSubmit = async () => {
    if (!skillMappingBand) {
      setError('Please select an agewise bifurcation combo before submitting.');
      return false;
    }
    if (needsSkillBand) {
      try {
        await persistSkillBand(skillMappingBand);
        return true;
      } catch (e) {
        setError(e.message);
        return false;
      }
    }
    return true;
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

  const DASHBOARD_PATH = '/dashboard';

  const postPayPath = (slug, id, items, addCounselling) => {
    if (purchaseIncludesCounselling({ slug, lineItems: items, addCounselling })) {
      return '/dashboard?tab=book';
    }
    const mod = getModuleBySlug(slug, catalog);
    const base = mod ? `/dashboard/test/${slug}` : `/dashboard/test/dmit`;
    return `${base}?id=${id}`;
  };

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
      const bandOk = await ensureAdminBandBeforeSubmit();
      if (!bandOk) return;

      const bandLabel = getSkillMappingComboLabel(skillMappingBand, skillCombos);
      const noteParts = [
        bandLabel ? `Age bifurcation: ${bandLabel}` : '',
        userNote.trim(),
      ].filter(Boolean);

      const res = await paymentsApi.submitManual(token, {
        assessmentId: Number(assessmentId),
        skillMappingBand: needsSkillBand ? skillMappingBand : undefined,
        proofDataUrl: proofPreview,
        proofFileName: proofFileName || undefined,
        paymentReferenceId: paymentReferenceId.trim(),
        userNote: noteParts.join(' | ') || undefined,
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
      setError('Razorpay is not configured. Use Admin Approval below to submit payment proof.');
      setAdminPanelOpen(true);
      return;
    }

    setPaying(true);
    setError('');
    try {
      if (needsSkillBand) {
        const bandOk = await ensureAdminBandBeforeSubmit();
        if (!bandOk) { setPaying(false); return; }
      }

      await loadRazorpayScript();

      const created = await paymentsApi.createOrder(
        token,
        Number(assessmentId),
        couponApplied?.code || undefined
      );

      if (created.alreadyPaid) {
        navigate(DASHBOARD_PATH, { replace: true });
        return;
      }

      if (created.manualMode || created.pendingManual || !created.orderId || !created.key) {
        setError('Online payment is unavailable. Please use UPI transfer.');
        await loadOrder();
        setPaying(false);
        return;
      }

      const options = {
        key: created.key,
        amount: created.amount,
        currency: created.currency || 'INR',
        name: 'Dream Mantra',
        description: checkout?.displayTitle,
        order_id: created.orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        notes: {
          assessment_id: String(assessmentId),
        },
        handler: async (response) => {
          try {
            setPaying(true);
            await paymentsApi.verify(token, {
              assessmentId: Number(assessmentId),
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            navigate(DASHBOARD_PATH, { replace: true });
          } catch (verifyErr) {
            setError(verifyErr.message || 'Payment verification failed. Contact support with your payment ID.');
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
        theme: { color: '#ea580c' },
      };

      if (!window.Razorpay) throw new Error('Payment gateway loading — try again');
      new window.Razorpay(options).open();
    } catch (e) {
      setError(e.message);
      setPaying(false);
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
                <Link to="/dashboard?tab=support&section=process" className="btn-outline inline-flex items-center justify-center gap-2">
                  View process
                </Link>
              </>
            ) : (
              <Link to={DASHBOARD_PATH} className="btn-primary inline-flex">
                Go to dashboard
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
            {payment?.user_note && (
              <p className="text-sm text-left rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 mb-4">
                <span className="font-bold">Admin note: </span>{payment.user_note}
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
                {featuredVoucher && (
                  <div className="payment-page__voucher-chips">
                    <button
                      type="button"
                      onClick={() => { setCoupon(featuredVoucher.code); setCouponApplied(null); }}
                      className="payment-page__voucher-chip"
                    >
                      {featuredVoucher.code}
                    </button>
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
              {showCounsellingToggle && counsellingAddon && (
                <section className="payment-page__card">
                  <h3 className="payment-page__section-title">Add-on counselling</h3>
                  <button
                    type="button"
                    disabled={updatingCounselling}
                    onClick={toggleCounsellingAddon}
                    className={`payment-page__addon payment-page__addon--orange${hasCounsellingInOrder ? ' payment-page__addon--on' : ''}`}
                  >
                    <MessageCircle className="w-5 h-5 shrink-0 text-orange-600" />
                    <div className="min-w-0 flex-1 text-left">
                      <p className="font-bold text-sm">{counsellingAddon.title}</p>
                      <p className="text-xs text-sand-600 mt-0.5 line-clamp-2">{counsellingAddon.description}</p>
                    </div>
                    <div className="payment-page__addon-meta shrink-0 text-right">
                      <p className="text-sm font-bold text-orange-700">+{formatPrice(counsellingAddon.price)}</p>
                      <p className="text-xs font-bold mt-0.5 text-orange-600">
                        {updatingCounselling ? '…' : hasCounsellingInOrder ? 'Included ✓' : 'Tap to add'}
                      </p>
                    </div>
                  </button>
                </section>
              )}

              {needsSkillBand && (
                <section className="payment-page__card">
                  <SkillMappingComboPicker
                    combos={skillCombos}
                    value={skillMappingBand}
                    onChange={handleSkillBandChange}
                    lockedComboId={order?.assessment?.progress?.skillMappingComboId || order?.assessment?.progress?.skillMappingBand}
                    title="Agewise Bifurcation (required)"
                    hint="Select the test package for this student. This cannot be changed after payment."
                  />
                </section>
              )}

              <section className="payment-page__card">
                <h3 className="payment-page__section-title">Payment</h3>
                {payment?.user_note && (
                  <div className="payment-page__admin-message">
                    <p className="font-bold text-sm mb-1">Message from admin</p>
                    <p className="text-sm">{payment.user_note}</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => { setPaymentMethod('razorpay'); setAdminPanelOpen(false); setError(''); }}
                  className={`payment-page__method payment-page__method--razorpay payment-page__method--featured${paymentMethod === 'razorpay' && !adminPanelOpen ? ' payment-page__method--active' : ''}`}
                >
                  <CreditCard className="w-6 h-6 shrink-0" />
                  <div className="text-left min-w-0 flex-1">
                    <p className="font-extrabold text-base">Pay with Razorpay</p>
                    <p className="text-xs mt-0.5 opacity-80">
                      {gatewayEnabled ? 'UPI, cards, netbanking — instant unlock' : 'Online gateway (enable keys on server for live pay)'}
                    </p>
                  </div>
                </button>

                {paymentMethod === 'razorpay' && !adminPanelOpen && (
                  <p className="payment-page__razorpay-hint">
                    <Shield className="w-4 h-4 shrink-0 text-brand-500" />
                    Secured by Razorpay — access unlocks after successful payment.
                  </p>
                )}

                <button
                  type="button"
                  className={`payment-page__admin-line${adminPanelOpen ? ' is-open' : ''}`}
                  onClick={() => { setAdminPanelOpen(true); setPaymentMethod('admin'); setError(''); }}
                >
                  Pay with Admin Approval
                </button>

                {adminPanelOpen && (
                  <div className="payment-page__admin-panel">
                    <div className="payment-page__admin-split">
                      <div className="payment-page__admin-left">
                        <div className="payment-page__qr-frame payment-page__qr-frame--split">
                          <div className="payment-page__qr-frame-head">
                            <span className="payment-page__qr-badge"><QrCode className="w-3.5 h-3.5" /> Scan to pay</span>
                            <span className="payment-page__qr-brand">Dream Mantra</span>
                          </div>
                          <div className="payment-page__qr-mat">
                            <img src={UPI_QR_IMAGE} alt="UPI QR" className="payment-page__qr-image" />
                          </div>
                          <button type="button" onClick={downloadUpiQr} className="payment-page__qr-download">
                            <Download className="w-4 h-4" /> Download QR
                          </button>
                        </div>
                        <div className="payment-page__upi-details payment-page__upi-details--split">
                          <div className="payment-page__upi-row"><span>UPI ID</span><code>{UPI_VPA}</code></div>
                          <div className="payment-page__upi-row"><span>Amount</span><strong>{formatPrice(finalPrice)}</strong></div>
                          <p className="payment-page__upi-note">Pay the exact amount shown. Then upload your payment screenshot and UPI reference on the right.</p>
                        </div>
                      </div>
                      <div className="payment-page__admin-right">
                        <label className="payment-page__field-label">Payment screenshot <span className="text-red-600">*</span></label>
                        <input type="file" accept="image/*,.pdf" onChange={handleProofChange} className="input-field !py-2 text-sm w-full" />
                        {proofPreview && (
                          <div className="payment-page__proof-preview">
                            <p className="text-xs text-orange-700">{proofFileName || 'File chosen'}</p>
                            {proofPreview.startsWith('data:image') && <img src={proofPreview} alt="Proof" />}
                          </div>
                        )}
                        <label className="payment-page__field-label">Transaction ID <span className="text-red-600">*</span></label>
                        <input className="input-field !py-2.5 w-full" placeholder="UPI / bank reference" value={paymentReferenceId} onChange={(e) => setPaymentReferenceId(e.target.value)} maxLength={120} />
                        <label className="payment-page__field-label">Note (optional)</label>
                        <input className="input-field !py-2.5 w-full" placeholder="Any extra details" value={userNote} onChange={(e) => setUserNote(e.target.value)} maxLength={500} />
                        <div className="payment-page__admin-band">
                          <SkillMappingComboPicker
                            combos={skillCombos}
                            value={skillMappingBand}
                            onChange={handleSkillBandChange}
                            title="Agewise Bifurcation (required)"
                            hint="Select the test package for this student. Payment cannot be submitted without this."
                          />
                        </div>
                        <button type="button" onClick={handleAdminSubmit} disabled={paying} className="btn-primary payment-page__admin-submit-btn w-full mt-2">
                          {paying ? 'Submitting…' : `Submit for verification · ${formatPrice(finalPrice)}`}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <ul className="payment-page__status-hints">
                  <li>
                    <Clock className="w-4 h-4 shrink-0 text-amber-500" />
                    {adminPanelOpen
                      ? 'Admin verifies within 24 hours after you submit proof'
                      : paymentMethod === 'razorpay'
                        ? 'Instant unlock after successful Razorpay payment'
                        : 'Choose Razorpay or Pay with Admin Approval'}
                  </li>
                </ul>

                {error && <p className="payment-page__error">{error}</p>}

                {!adminPanelOpen && (
                <button
                  type="button"
                  onClick={handleGatewayPay}
                  disabled={paying || paymentMethod !== 'razorpay'}
                  className="btn-primary payment-page__pay-btn w-full"
                >
                  {paying ? 'Processing…' : `Pay with Razorpay · ${formatPrice(finalPrice)}`}
                </button>
                )}

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
