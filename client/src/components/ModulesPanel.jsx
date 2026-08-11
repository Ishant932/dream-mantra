import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  CreditCard, Play, ClipboardList, Package, ShoppingBag,
  CheckCircle2, AlertCircle, Sparkles, MessageCircle, Clock, XCircle, Trash2,
  Receipt, ArrowRight, X,
} from 'lucide-react';
import { userApi, paymentsApi } from '../api';
import { DashCard } from './DashboardUI';
import CopyableUserId from './CopyableUserId';
import {
  MODULE_CATALOG,
  resolveCounsellingAddon,
} from '../data/moduleCatalog';
import {
  canCancelAssessment,
  getAssessmentDisplayTitle,
  getPaymentDisplayTitle,
  getPaymentLineItemsSummary,
} from '../utils/assessmentHelpers';
import {
  getBlockedCatalogSlugs,
  isAssessmentUnlocked,
  resolveAssessmentSlug,
  canShowCounsellingTopUp,
  assessmentGrantsSlotBooking,
  moduleHasTakeTest,
} from '../utils/moduleAccess';
import { moduleActionFlags, moduleActionLabel } from '../utils/moduleDashboardNav';

function formatPrice(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN')}`;
}

function PaymentStatusBadge({ status }) {
  if (status === 'confirmed') {
    return (
      <span className="modules-status-pill modules-status-pill--confirmed">
        <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="modules-status-pill modules-status-pill--pending">
        <Clock className="w-3.5 h-3.5" /> Pending
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="modules-status-pill modules-status-pill--failed">
        <XCircle className="w-3.5 h-3.5" /> Failed
      </span>
    );
  }
  return <span className="modules-status-pill modules-status-pill--muted">{status || '—'}</span>;
}

/** Two-step delete — no window.confirm (works reliably everywhere) */
function DeleteOrderButton({ onConfirm, loading, disabled }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return undefined;
    const t = setTimeout(() => setArmed(false), 8000);
    return () => clearTimeout(t);
  }, [armed]);

  if (armed) {
    return (
      <div className="modules-delete-confirm">
        <span className="text-xs font-semibold text-red-700 hidden sm:inline">Remove?</span>
        <button
          type="button"
          disabled={loading || disabled}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onConfirm?.();
            setArmed(false);
          }}
          className="modules-delete-confirm__yes"
        >
          {loading ? <Clock className="w-4 h-4 animate-spin" /> : 'Yes, remove'}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setArmed(false);
          }}
          className="modules-delete-confirm__no"
          aria-label="Cancel remove"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setArmed(true);
      }}
      className="modules-order-btn modules-order-btn--danger"
      title="Remove order"
      aria-label="Remove order"
    >
      <Trash2 className="w-4 h-4" />
      <span className="hidden sm:inline">Remove</span>
    </button>
  );
}

function ModulesStatBar({ active, pending, completed }) {
  return (
    <div className="modules-stat-bar">
      <div className="modules-stat-bar__item">
        <span className="modules-stat-bar__value">{active}</span>
        <span className="modules-stat-bar__label">Active</span>
      </div>
      <div className="modules-stat-bar__item">
        <span className="modules-stat-bar__value">{pending}</span>
        <span className="modules-stat-bar__label">Pending</span>
      </div>
      <div className="modules-stat-bar__item">
        <span className="modules-stat-bar__value">{completed}</span>
        <span className="modules-stat-bar__label">Completed</span>
      </div>
    </div>
  );
}

function UnpaidModuleCard({ module, selected, onSelect, onClear, addCounselling, onCounsellingToggle }) {
  const addon = resolveCounsellingAddon(module);
  const cardTotal = module.price + (selected && addCounselling && module.optionalCounselling ? addon.price : 0);

  return (
    <div className={`modules-product-card ${selected ? 'modules-product-card--selected' : ''}`}>
      {selected && onClear && (
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClear(); }}
          className="modules-product-card__remove"
          aria-label="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <label className="modules-product-card__select">
        <input type="radio" name="module" checked={selected} onChange={onSelect} className="sr-only" />
        <div className="modules-product-card__icon">{module.icon}</div>
        <div className="modules-product-card__body">
          <p className="modules-product-card__title">{module.title}</p>
          <p className="modules-product-card__desc">{module.description}</p>
          {module.includesCounselling && (
            <p className="modules-product-card__included">
              <CheckCircle2 className="w-3.5 h-3.5" /> Counselling included
            </p>
          )}
        </div>
        <div className="modules-product-card__price">
          <span className="modules-product-card__amount">{formatPrice(selected ? cardTotal : module.price)}</span>
        </div>
      </label>
      {selected && module.optionalCounselling && (
        <div className="modules-product-card__counselling">
          <button
            type="button"
            onClick={onCounsellingToggle}
            className={`modules-counselling-card w-full text-left ${addCounselling ? 'modules-counselling-card--active' : ''}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">💬</span>
              <div className="flex-1">
                <p className="font-bold text-sm">{addon.title}</p>
                <p className="text-xs dash-card-meta mt-0.5">{addon.description || `+${formatPrice(addon.price)}`}</p>
                {addon.description && <p className="text-xs font-semibold text-amber-700 mt-0.5">+{formatPrice(addon.price)}</p>}
              </div>
              <span className="text-xs font-bold">{addCounselling ? 'Added ✓' : 'Add'}</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

function PaidModuleActions({ onGoProcess, onGoTest, onGoBook, showTakeTest = true, showProcess = true, showBook = false, testLabel = 'Take test', bookLabel = 'Book session' }) {
  return (
    <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--border-subtle)]">
      {showProcess && (
        <button type="button" onClick={onGoProcess} className="modules-order-btn modules-order-btn--primary">
          <Play className="w-4 h-4" /> Process
        </button>
      )}
      {showTakeTest && (
        <button type="button" onClick={onGoTest} className="modules-order-btn modules-order-btn--ghost">
          <ClipboardList className="w-4 h-4" /> {testLabel}
        </button>
      )}
      {showBook && (
        <button type="button" onClick={onGoBook} className="modules-order-btn modules-order-btn--primary">
          <MessageCircle className="w-4 h-4" /> {bookLabel}
        </button>
      )}
    </div>
  );
}

export default function ModulesPanel({
  token,
  assessments = [],
  payments = [],
  consultations = [],
  profile,
  user,
  onError,
  onSuccess,
  onRefresh,
  onGoProcessGuides,
  onGoTakeTest,
  onOpenModule,
  initialHubView,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const shopSlug = new URLSearchParams(location.search).get('shop');
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [counsellingBySlug, setCounsellingBySlug] = useState({});
  const [booking, setBooking] = useState(false);
  const [activePaidId, setActivePaidId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [removedIds, setRemovedIds] = useState(() => new Set());
  const [hubView, setHubView] = useState(initialHubView || 'book');
  const [catalog, setCatalog] = useState(MODULE_CATALOG);
  const [liveVouchers, setLiveVouchers] = useState([]);

  const reloadCatalog = useCallback(() => {
    paymentsApi.products()
      .then((res) => {
        if (Array.isArray(res.products) && res.products.length) setCatalog(res.products);
      })
      .catch(() => {});
    paymentsApi.promotions(token)
      .then((res) => {
        if (Array.isArray(res.vouchers)) setLiveVouchers(res.vouchers);
        else setLiveVouchers([]);
      })
      .catch(() => setLiveVouchers([]));
  }, [token]);

  useEffect(() => { reloadCatalog(); }, [reloadCatalog]);

  useEffect(() => {
    const onFocus = () => reloadCatalog();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [reloadCatalog]);

  const getMod = useCallback((slug) => catalog.find((m) => m.slug === slug), [catalog]);
  const buildSelection = useCallback((slug, addCouns) => {
    const mod = getMod(slug);
    if (!mod) return null;
    const withCounselling = !!(addCouns && mod.optionalCounselling);
    const lineItems = [{ label: mod.title, amount: mod.price, slug: mod.slug, type: 'module' }];
    if (withCounselling) {
      const addon = resolveCounsellingAddon(mod);
      lineItems.push({ label: addon.title, amount: addon.price, type: 'counselling', description: addon.description });
    }
    const total = lineItems.reduce((s, i) => s + i.amount, 0);
    const addon = resolveCounsellingAddon(mod);
    return {
      slug: mod.slug,
      moduleTitle: mod.title,
      lineItems,
      addCounselling: withCounselling,
      total,
      displayTitle: withCounselling ? `${mod.title} + ${addon.title}` : mod.title,
      moduleSlug: mod.slug,
    };
  }, [getMod]);

  const visibleAssessments = useMemo(
    () => assessments.filter((a) => !removedIds.has(Number(a.id))),
    [assessments, removedIds]
  );

  const paymentByAssessment = useMemo(() => {
    const rank = { confirmed: 4, pending: 3, failed: 2, refunded: 1 };
    const map = new Map();
    for (const p of payments) {
      if (p.assessment_id == null) continue;
      const id = Number(p.assessment_id);
      const prev = map.get(id);
      const pr = rank[p.payment_status] || 0;
      const prevR = prev ? (rank[prev.payment_status] || 0) : 0;
      if (!prev || pr > prevR) map.set(id, p);
    }
    return map;
  }, [payments]);

  const confirmedAssessments = useMemo(
    () => visibleAssessments
      .filter((a) => isAssessmentUnlocked(a))
      .sort((a, b) => new Date(b.paid_at || b.created_at) - new Date(a.paid_at || a.created_at)),
    [visibleAssessments]
  );

  const pendingOrders = useMemo(
    () => visibleAssessments
      .filter((a) => {
        if (!canCancelAssessment(a)) return false;
        const pay = paymentByAssessment.get(Number(a.id));
        return !pay?.submitted_at;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [visibleAssessments, paymentByAssessment]
  );

  const paymentHistory = useMemo(
    () => [...payments]
      .sort((a, b) => new Date(b.paid_at || b.submitted_at || b.created_at) - new Date(a.paid_at || a.submitted_at || a.created_at)),
    [payments]
  );

  const blockedSlugs = getBlockedCatalogSlugs(visibleAssessments);
  const showCounsellingTopUp = canShowCounsellingTopUp(visibleAssessments, consultations);
  const catalogModules = catalog.filter((mod) => {
    if (blockedSlugs.has(mod.slug)) return false;
    if (mod.followUpOnly && !showCounsellingTopUp) return false;
    return true;
  });
  const hasConfirmed = confirmedAssessments.length > 0;

  const addCounselling = selectedSlug ? !!counsellingBySlug[selectedSlug] : false;
  const selection = selectedSlug ? buildSelection(selectedSlug, addCounselling) : null;
  const checkoutTotal = selection?.total || 0;

  const activePaid = activePaidId
    ? confirmedAssessments.find((a) => Number(a.id) === Number(activePaidId))
    : confirmedAssessments[0];

  const activePaidSlug = activePaid ? resolveAssessmentSlug(activePaid) : null;
  const activeShowTest = activePaidSlug && moduleHasTakeTest(activePaidSlug);
  const activeShowBook = activePaid && assessmentGrantsSlotBooking(activePaid);
  const activeShowProcess = activePaidSlug !== 'counselling-topup';

  useEffect(() => {
    if (confirmedAssessments.length && !confirmedAssessments.some((a) => Number(a.id) === Number(activePaidId))) {
      setActivePaidId(confirmedAssessments[0]?.id ?? null);
    }
  }, [confirmedAssessments, activePaidId]);

  useEffect(() => {
    if (selectedSlug && blockedSlugs.has(selectedSlug)) setSelectedSlug(null);
  }, [selectedSlug, blockedSlugs]);

  useEffect(() => {
    if (!shopSlug || blockedSlugs.has(shopSlug)) return;
    if (catalogModules.some((m) => m.slug === shopSlug)) {
      setSelectedSlug(shopSlug);
      const mod = catalogModules.find((m) => m.slug === shopSlug);
      if (mod?.optionalCounselling) {
        setCounsellingBySlug((prev) => ({ ...prev, [shopSlug]: true }));
      }
    }
  }, [shopSlug, blockedSlugs, catalogModules]);

  useEffect(() => {
    if (!selectedSlug) return;
    const mod = getMod(selectedSlug);
    if (mod?.optionalCounselling) {
      setCounsellingBySlug((prev) => {
        if (prev[selectedSlug] != null) return prev;
        return { ...prev, [selectedSlug]: true };
      });
    }
  }, [selectedSlug, getMod]);

  const handleRemoveOrder = useCallback(async (assessmentId) => {
    const id = Number(assessmentId);
    if (!token) {
      onError?.('Please sign in again to manage orders.');
      return;
    }

    setCancellingId(id);
    onError?.('');
    setRemovedIds((prev) => new Set(prev).add(id));

    try {
      await userApi.cancelAssessment(token, id);
      if (Number(activePaidId) === id) setActivePaidId(null);
      onSuccess?.('Order removed successfully.');
      if (onRefresh) {
        await onRefresh();
        setRemovedIds(new Set());
      }
    } catch (e) {
      setRemovedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      onError?.(e.message || 'Could not remove order. Please try again.');
    } finally {
      setCancellingId(null);
    }
  }, [token, activePaidId, onError, onSuccess, onRefresh]);

  useEffect(() => {
    if (initialHubView && ['book', 'active', 'history'].includes(initialHubView)) {
      setHubView(initialHubView);
    }
  }, [initialHubView]);

  const goToProcessGuides = (section = 'process') => {
    if (onGoProcessGuides) onGoProcessGuides(section);
  };

  const goToTakeTest = () => {
    if (onGoTakeTest) onGoTakeTest();
    else goToProcessGuides('tests');
  };

  const openModule = useCallback((assessment, action = 'default') => {
    if (onOpenModule) {
      onOpenModule(assessment, action);
      return;
    }
    if (action === 'test') goToTakeTest();
    else goToProcessGuides('process');
  }, [onOpenModule, goToTakeTest, goToProcessGuides]);

  const handleBook = async () => {
    if (!selection || !selectedSlug || !token) return;
    setBooking(true);
    onError?.('');
    try {
      const res = await userApi.bookAssessment(token, {
        productSlug: selectedSlug,
        addCounselling: selection.addCounselling,
        amount: selection.total,
        lineItems: selection.lineItems,
        selectionTitle: selection.displayTitle,
      });
      navigate(`/payment/${res.assessment.id}`, { state: { selection } });
    } catch (e) {
      onError?.(e.message);
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="modules-hub w-full max-w-none space-y-7 sm:space-y-8">
      <div className="modules-hub-header">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 dash-card-title">
            <Package className="w-7 h-7 text-amber-600" />
            Book Now & Orders
          </h2>
          <p className="text-sm dash-card-meta mt-1">
            Buy modules, track payments, and access your assessments — all in one place.
          </p>
        </div>
        <ModulesStatBar
          active={confirmedAssessments.length}
          pending={pendingOrders.length + paymentHistory.filter((p) => p.payment_status !== 'confirmed').length}
          completed={paymentHistory.filter((p) => p.payment_status === 'confirmed').length}
        />
      </div>

      <div className="modules-hub-tabs dash-subtab-rail dash-subtab-rail--center dash-subtab-rail--lg flex flex-wrap gap-2 justify-center">
        {[
          { id: 'book', label: 'Book program' },
          { id: 'active', label: 'Active modules' },
          { id: 'history', label: 'Payment history' },
        ].map((t) => (
          <button key={t.id} type="button" className={`dash-subtab-rail__chip${hubView === t.id ? ' is-active' : ''}`} onClick={() => setHubView(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {hubView === 'active' && hasConfirmed && (
        <DashCard className="modules-hub-card" glow={false} hover={false}>
          <div className="flex items-center justify-between gap-3 mb-5">
          <h3 className="font-bold text-lg sm:text-xl flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Active modules {confirmedAssessments.length > 1 ? `(${confirmedAssessments.length})` : ''}
            </h3>
            <button type="button" onClick={() => setHubView('active')} className="text-sm font-semibold text-amber-600 inline-flex items-center gap-1 hover:underline">
              View active modules <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="modules-active-list">
            {confirmedAssessments.map((a) => {
              const slug = resolveAssessmentSlug(a);
              const mod = getMod(slug) || { icon: '📋' };
              const selected = Number(activePaid?.id) === Number(a.id);
              const { showTest, showProcess, showBook } = moduleActionFlags(a);
              return (
                <div key={a.id} className={`modules-active-row ${selected ? 'modules-active-row--selected' : ''}`}>
                  <button type="button" className="modules-active-row__main" onClick={() => setActivePaidId(a.id)}>
                    <span className="text-2xl">{mod.icon}</span>
                    <div className="text-left min-w-0">
                      <p className="font-bold text-sm sm:text-base break-words">{getAssessmentDisplayTitle(a)}</p>
                      <p className="text-xs text-emerald-800 dark:text-emerald-200 font-semibold">Paid · Access unlocked</p>
                    </div>
                  </button>
                  <div className="flex flex-wrap gap-2">
                    {showProcess && (
                      <button type="button" onClick={() => openModule(a, 'default')} className="modules-order-btn modules-order-btn--ghost">
                        <Play className="w-4 h-4" /> Open
                      </button>
                    )}
                    {showTest && (
                      <button type="button" onClick={() => openModule(a, 'test')} className="modules-order-btn modules-order-btn--primary">
                        <ClipboardList className="w-4 h-4" /> {moduleActionLabel(a, 'test')}
                      </button>
                    )}
                    {showBook && (
                      <button type="button" onClick={() => openModule(a, 'book')} className="modules-order-btn modules-order-btn--primary">
                        <MessageCircle className="w-4 h-4" /> {moduleActionLabel(a, 'book')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {activePaid && (
            <PaidModuleActions
              onGoProcess={() => openModule(activePaid, 'default')}
              onGoTest={() => openModule(activePaid, 'test')}
              onGoBook={() => openModule(activePaid, 'book')}
              showTakeTest={!!activeShowTest}
              showProcess={activeShowProcess}
              showBook={!!activeShowBook}
              testLabel={moduleActionLabel(activePaid, 'test')}
              bookLabel={moduleActionLabel(activePaid, 'book')}
            />
          )}
        </DashCard>
      )}

      {hubView === 'book' && pendingOrders.length > 0 && (
        <DashCard className="modules-hub-card modules-hub-card--pending" glow={false} hover={false}>
          <h3 className="font-bold text-lg sm:text-xl flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-amber-600" />
            Pending checkout
          </h3>
          <p className="text-sm dash-card-meta mb-4">Complete payment or remove orders you no longer need.</p>
          <div className="modules-order-list">
            {pendingOrders.map((a) => {
              const pay = paymentByAssessment.get(Number(a.id));
              const sel = buildSelection(
                resolveAssessmentSlug(a),
                a.progress?.addCounselling ?? a.progress?.selection?.addCounselling
              );
              const total = a.progress?.selection?.total ?? sel?.total ?? a.amount ?? 0;
              const isRemoving = cancellingId === Number(a.id);

              return (
                <article key={a.id} className="modules-order-row modules-order-row--pending">
                  <div className="modules-order-row__info">
                    <p className="font-bold text-sm sm:text-base break-words">{getAssessmentDisplayTitle(a)}</p>
                    <p className="text-xs dash-card-meta mt-0.5">
                      Order #{a.id} · {formatPrice(total)}
                      {pay?.submitted_at ? ' · Submitted for verification' : ' · Payment not completed'}
                    </p>
                    <PaymentStatusBadge status={pay?.payment_status || 'pending'} />
                  </div>
                  <div className="modules-order-row__actions">
                    <Link to={`/payment/${a.id}`} className="modules-order-btn modules-order-btn--primary">
                      <CreditCard className="w-4 h-4" />
                      {pay?.submitted_at ? 'View order' : 'Pay now'}
                    </Link>
                    <DeleteOrderButton
                      loading={isRemoving}
                      disabled={isRemoving}
                      onConfirm={() => handleRemoveOrder(a.id)}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </DashCard>
      )}

      {hubView === 'history' && paymentHistory.length > 0 && (
        <DashCard className="modules-hub-card" glow={false} hover={false}>
          <h3 className="font-bold text-lg flex items-center gap-2 mb-1">
            <Receipt className="w-5 h-5 text-amber-600" />
            Payment history
          </h3>
          <p className="text-sm dash-card-meta mb-4">
            Receipts for completed payments. Pending submissions can be removed if you need to cancel.
          </p>
          <div className="modules-order-list">
            {paymentHistory.map((p) => {
              const linked = visibleAssessments.find((a) => Number(a.id) === Number(p.assessment_id));
              const canRemove = linked && canCancelAssessment(linked);
              const isRemoving = cancellingId === Number(p.assessment_id);

              return (
                <article key={p.id} className="modules-order-row">
                  <div className="modules-order-row__info">
                    <p className="font-bold text-sm">{getPaymentDisplayTitle(p, linked)}</p>
                    {getPaymentLineItemsSummary(linked) && (
                      <p className="text-xs text-amber-700/90 dark:text-amber-300/90 mt-0.5 font-medium">
                        {getPaymentLineItemsSummary(linked)}
                      </p>
                    )}
                    <p className="text-xs dash-card-meta mt-0.5">
                      {p.order_id || `Payment #${p.id}`}
                      {' · '}
                      {new Date(p.paid_at || p.submitted_at || p.created_at).toLocaleString('en-IN')}
                    </p>
                    <PaymentStatusBadge status={p.payment_status} />
                  </div>
                  <div className="modules-order-row__actions">
                    <p className="font-bold text-amber-600 modules-order-row__amount">{formatPrice(p.amount)}</p>
                    {linked && isAssessmentUnlocked(linked) && resolveAssessmentSlug(linked) !== 'counselling-topup' && (
                      <button type="button" onClick={() => openModule(linked, 'default')} className="modules-order-btn modules-order-btn--ghost">
                        Open module
                      </button>
                    )}
                    {canRemove && (
                      <DeleteOrderButton
                        loading={isRemoving}
                        disabled={isRemoving}
                        onConfirm={() => handleRemoveOrder(linked.id)}
                      />
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </DashCard>
      )}

      {hubView === 'book' && catalogModules.length > 0 ? (
        <DashCard className="modules-hub-card modules-hub-card--browse" glow={false} hover={false}>
          <h3 className="text-xl font-bold flex items-center gap-2 mb-1">
            <ShoppingBag className="w-6 h-6 text-amber-600" />
            {hasConfirmed ? 'Add another program' : 'Browse programs'}
          </h3>
          <p className="text-sm dash-card-meta mb-5">Select → Pay → Get access after confirmation</p>
          {!hasConfirmed && liveVouchers.length > 0 && (
            <div className="text-sm text-amber-800 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 rounded-xl px-4 py-3 mb-5">
              <p className="font-semibold mb-2">Active coupon codes</p>
              <div className="flex flex-wrap gap-2">
                {liveVouchers.map((v) => (
                  <span key={v.code} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-stone-900 border border-amber-200 text-xs font-mono font-bold">
                    {v.code}
                    <span className="font-sans font-normal opacity-70">
                      {v.discountPercent != null ? `${v.discountPercent}% off` : v.discountFixed != null ? `₹${v.discountFixed} off` : ''}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
          {!hasConfirmed && liveVouchers.length === 0 && token && (
            <p className="text-sm text-sand-600 bg-sand-50 dark:bg-stone-900/40 border border-sand-200/60 rounded-xl px-4 py-2 mb-5">
              No voucher codes are assigned to your account yet. Admin can share offers directly with you.
            </p>
          )}
          <div className="space-y-3 mb-5">
            {catalogModules.map((mod) => (
              <UnpaidModuleCard
                key={mod.slug}
                module={mod}
                selected={selectedSlug === mod.slug}
                onSelect={() => setSelectedSlug(mod.slug)}
                onClear={() => setSelectedSlug(null)}
                addCounselling={!!counsellingBySlug[mod.slug]}
                onCounsellingToggle={() => setCounsellingBySlug((prev) => ({ ...prev, [mod.slug]: !prev[mod.slug] }))}
              />
            ))}
          </div>
          {selection && (
            <div className="modules-checkout-summary mb-4">
              {selection.lineItems.map((item) => (
                <div key={item.label} className="flex justify-between text-sm py-1">
                  <span>{item.label}</span>
                  <span className="font-semibold">{formatPrice(item.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-amber-200/50 mt-2">
                <span>Total</span>
                <span className="text-amber-600">{formatPrice(checkoutTotal)}</span>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleBook}
            disabled={booking || !selectedSlug || !token}
            className="btn-primary w-full py-4 inline-flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            {booking ? 'Processing…' : selectedSlug ? `Proceed to payment · ${formatPrice(checkoutTotal)}` : 'Select a module above'}
          </button>
        </DashCard>
      ) : hubView === 'book' && hasConfirmed ? (
        <DashCard className="modules-hub-card text-center" glow={false} hover={false}>
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <p className="font-bold">You own all available modules</p>
          <p className="text-sm dash-card-meta mt-1">Need help? Contact us on WhatsApp.</p>
        </DashCard>
      ) : null}

      {user?.user_uid && (
        <p className="text-xs text-center dash-card-meta flex flex-wrap items-center justify-center gap-2">
          Your Dreams ID for all forms: <CopyableUserId uid={user.user_uid} compact animate={false} />
        </p>
      )}

    </div>
  );
}
