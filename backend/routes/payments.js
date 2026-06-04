import { Router } from 'express';
import crypto from 'crypto';
import db, { repo, getData, saveData } from '../lib/database.js';
import { getProduct } from '../config/products.js';
import { validateCoupon, applyCouponDiscount } from '../lib/couponService.js';
import { authRequired } from '../middleware/auth.js';
import { isGatewayEnabled, getPaymentMode } from '../lib/paymentGateway.js';
import { syncAssessmentSelection, COUNSELLING_ADDON_PRICE, getActiveModuleCatalog, assertSkillMappingBandSelected, buildModuleSelection } from '../lib/moduleCatalog.js';
import { listPublicVouchers } from '../lib/catalogStore.js';
import { setAssessmentSkillMappingBand } from '../lib/skillMappingBand.js';
import {
  confirmPayment,
  getPaymentForAssessment,
  getAllPaymentsForAssessment,
  isAssessmentFullyPaid,
  normalizePaymentRow,
  handleRazorpayWebhook,
  migrateLegacyPayments,
  createPendingPaymentForAssessment,
  submitManualPayment,
} from '../lib/paymentService.js';

const router = Router();

router.get('/products', (_, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ products: getActiveModuleCatalog() });
});

router.get('/promotions', (_, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({
    products: getActiveModuleCatalog(),
    vouchers: listPublicVouchers(),
  });
});

router.get('/mode', (_, res) => {
  res.json({ mode: getPaymentMode(), gatewayEnabled: isGatewayEnabled() });
});

/** Razorpay webhook — only when gateway enabled */
router.post('/webhook/razorpay', (req, res) => {
  try {
    if (!isGatewayEnabled()) {
      return res.status(503).json({ message: 'Payment gateway is disabled. Manual admin confirmation only.' });
    }
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const result = handleRazorpayWebhook(req.body, signature, secret);
    res.json(result);
  } catch (e) {
    console.error('Webhook error', e);
    res.status(400).json({ message: e.message || 'Webhook failed' });
  }
});

router.get('/order/:assessmentId', authRequired, (req, res) => {
  let assessment = db.prepare('SELECT * FROM assessments WHERE id = ?').get(req.params.assessmentId);
  if (!assessment || Number(assessment.user_id) !== Number(req.user.id)) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const { assessment: synced, selection } = syncAssessmentSelection(assessment, repo);
  assessment = synced;

  let payment = normalizePaymentRow(getPaymentForAssessment(assessment.id));
  if (!payment && assessment.status === 'pending_payment') {
    payment = normalizePaymentRow(
      createPendingPaymentForAssessment({
        userId: req.user.id,
        assessmentId: assessment.id,
        amount: selection?.total ?? assessment.amount,
      })
    );
  }

  res.json({
    assessment,
    selection,
    addCounselling: !!selection?.addCounselling,
    counsellingAddonPrice: COUNSELLING_ADDON_PRICE,
    total: selection?.total ?? 0,
    payment,
    gatewayEnabled: isGatewayEnabled(),
    gatewayAvailable: isGatewayEnabled(),
    razorpayKey: isGatewayEnabled() ? process.env.RAZORPAY_KEY_ID : null,
  });
});

router.patch('/order/:assessmentId/selection', authRequired, (req, res) => {
  let assessment = db.prepare('SELECT * FROM assessments WHERE id = ?').get(req.params.assessmentId);
  if (!assessment || Number(assessment.user_id) !== Number(req.user.id)) {
    return res.status(404).json({ message: 'Order not found' });
  }
  if (assessment.status !== 'pending_payment') {
    return res.status(400).json({ message: 'This order can no longer be changed' });
  }

  const payment = getPaymentForAssessment(assessment.id);
  if (payment?.submitted_at) {
    return res.status(400).json({ message: 'Payment already submitted for this order' });
  }

  const slug = assessment.product_slug || assessment.progress?.selection?.moduleSlug;
  const catalog = buildModuleSelection(slug, !!req.body.addCounselling);
  if (!catalog) {
    return res.status(400).json({ message: 'Invalid module selection' });
  }

  const progress = {
    ...(assessment.progress || {}),
    addCounselling: catalog.addCounselling,
    selection: {
      displayTitle: catalog.displayTitle,
      lineItems: catalog.lineItems,
      total: catalog.total,
      moduleSlug: catalog.moduleSlug,
      moduleTitle: catalog.moduleTitle,
      addCounselling: catalog.addCounselling,
    },
  };

  repo.updateAssessment(assessment.id, {
    amount: catalog.total,
    type: catalog.moduleTitle,
    product_slug: catalog.moduleSlug,
    progress,
  });

  createPendingPaymentForAssessment({
    userId: req.user.id,
    assessmentId: assessment.id,
    amount: catalog.total,
  });

  assessment = repo.getAssessment(assessment.id);
  const { assessment: synced, selection } = syncAssessmentSelection(assessment, repo);

  res.json({
    assessment: synced,
    selection,
    addCounselling: !!selection?.addCounselling,
    total: selection?.total ?? 0,
  });
});

router.post('/validate-coupon', authRequired, (req, res) => {
  const paidTests = db
    .prepare("SELECT COUNT(*) as c FROM assessments WHERE user_id = ? AND status = 'paid'")
    .get(req.user.id)?.c ?? 0;
  const result = validateCoupon(req.body.code, {
    paidTestsCount: paidTests,
    moduleSlug: req.body.moduleSlug || null,
  });
  if (!result.valid) {
    return res.status(400).json({ message: result.message });
  }
  res.json(result);
});

/** Admin verification request — sends order to admin dashboard (no proof required) */
router.post('/submit-manual', authRequired, (req, res) => {
  try {
    const { assessmentId, proofDataUrl, proofFileName, userNote, skillMappingBand } = req.body;
    if (!assessmentId) return res.status(400).json({ message: 'assessmentId is required' });

    let assessment = getData().assessments.find(
      (a) => Number(a.id) === Number(assessmentId) && Number(a.user_id) === Number(req.user.id)
    );
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    if (skillMappingBand) {
      setAssessmentSkillMappingBand(assessmentId, req.user.id, skillMappingBand);
      assessment = getData().assessments.find(
        (a) => Number(a.id) === Number(assessmentId) && Number(a.user_id) === Number(req.user.id)
      );
    }

    assertSkillMappingBandSelected(assessment);

    const result = submitManualPayment({
      assessmentId,
      userId: req.user.id,
      proofDataUrl,
      proofFileName,
      userNote,
    });

    if (result.alreadyConfirmed) {
      return res.json({
        success: true,
        alreadyConfirmed: true,
        payment: result.payment,
        message: 'Payment already confirmed',
      });
    }

    res.json({
      success: true,
      pendingManual: true,
      payment: result.payment,
      message: 'Payment submitted for admin verification. You will be notified once confirmed.',
    });
  } catch (e) {
    console.error('submit-manual error', e);
    res.status(400).json({ message: e.message || 'Could not submit payment' });
  }
});

router.post('/create-order', authRequired, async (req, res) => {
  const { assessmentId, couponCode, skillMappingBand } = req.body;
  let assessment = getData().assessments.find(
    (a) => Number(a.id) === Number(assessmentId) && Number(a.user_id) === Number(req.user.id)
  );
  if (!assessment) {
    return res.status(404).json({ message: 'Assessment not found' });
  }

  if (skillMappingBand) {
    setAssessmentSkillMappingBand(assessmentId, req.user.id, skillMappingBand);
    assessment = getData().assessments.find(
      (a) => Number(a.id) === Number(assessmentId) && Number(a.user_id) === Number(req.user.id)
    );
  }

  const existingPay = getPaymentForAssessment(assessment.id);
  if (isAssessmentFullyPaid(assessment)) {
    return res.json({ alreadyPaid: true, testLink: assessment.test_link });
  }

  const { assessment: synced, selection } = syncAssessmentSelection(assessment, repo);
  assessment = synced;

  try {
    assertSkillMappingBandSelected(assessment);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }

  let finalPrice = selection?.total ?? 0;
  let pricing = { original: finalPrice, final: finalPrice, discount: 0, discountPercent: 0, coupon: null };

  if (couponCode) {
    const paidTests = db
      .prepare("SELECT COUNT(*) as c FROM assessments WHERE user_id = ? AND status = 'paid'")
      .get(req.user.id)?.c ?? 0;
    const coupon = validateCoupon(couponCode, {
      paidTestsCount: paidTests,
      moduleSlug: selection?.moduleSlug || assessment.product_slug,
    });
    if (!coupon.valid) {
      return res.status(400).json({ message: coupon.message });
    }
    pricing = { ...applyCouponDiscount(finalPrice, coupon), coupon: coupon.code };
    finalPrice = pricing.final;
    repo.updateAssessment(assessment.id, { amount: finalPrice });
  } else if (assessment.amount !== finalPrice) {
    repo.updateAssessment(assessment.id, { amount: finalPrice });
  }

  const product = getProduct(selection?.moduleSlug || assessment.product_slug);

  /** Manual mode — always until gateway explicitly enabled */
  if (!isGatewayEnabled()) {
    const payment = createPendingPaymentForAssessment({
      userId: req.user.id,
      assessmentId: assessment.id,
      amount: finalPrice,
    });

    return res.json({
      manualMode: true,
      pendingManual: true,
      gatewayUnavailable: true,
      orderId: payment.order_id,
      payment,
      amount: finalPrice * 100,
      currency: 'INR',
      product: { ...product, price: finalPrice },
      pricing,
      assessmentId: assessment.id,
      message: 'Complete payment offline and submit proof for admin verification.',
    });
  }

  const amountPaise = finalPrice * 100;

  try {
    const Razorpay = (await import('razorpay')).default;
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `asm_${assessment.id}`,
      notes: { assessmentId: String(assessment.id), userId: String(req.user.id) },
    });

    const reusablePay = getAllPaymentsForAssessment(assessment.id).find(
      (p) => p.payment_status === 'pending' || p.payment_status === 'failed'
    );
    if (reusablePay) {
      const data = getData();
      const pay = data.payments.find((p) => p.id === reusablePay.id);
      if (pay) {
        pay.order_id = order.id;
        pay.provider = 'razorpay';
        pay.payment_method = 'razorpay';
        pay.amount = finalPrice;
        pay.payment_status = 'pending';
        pay.submitted_at = null;
        pay.updated_at = new Date().toISOString();
        saveData();
      }
    } else if (!getAllPaymentsForAssessment(assessment.id).some((p) => p.payment_status === 'confirmed')) {
      repo.createPayment({
        userId: req.user.id,
        assessmentId: assessment.id,
        amount: finalPrice,
        orderId: order.id,
        provider: 'razorpay',
        paymentMethod: 'razorpay',
      });
    }
    res.json({
      manualMode: false,
      mock: false,
      orderId: order.id,
      amount: amountPaise,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID,
      product: { ...product, price: finalPrice },
      pricing,
      assessmentId: assessment.id,
    });
  } catch (e) {
    console.error('Razorpay error', e);
    res.status(500).json({ message: 'Payment gateway error' });
  }
});

router.post('/verify', authRequired, (req, res) => {
  if (!isGatewayEnabled()) {
    return res.status(403).json({
      message: 'Automatic payment verification is disabled. Awaiting admin confirmation.',
    });
  }

  const { assessmentId, orderId, paymentId, signature, mock } = req.body;
  const assessment = db.prepare('SELECT * FROM assessments WHERE id = ?').get(assessmentId);
  if (!assessment || assessment.user_id !== req.user.id) {
    return res.status(404).json({ message: 'Assessment not found' });
  }

  try {
    assertSkillMappingBandSelected(assessment);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }

  if (mock || orderId?.startsWith('mock_') || orderId?.startsWith('pending_') || orderId?.startsWith('DM-')) {
    return res.status(403).json({
      message: 'Payment cannot be auto-confirmed. Awaiting admin manual confirmation.',
    });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  const body = orderId + '|' + paymentId;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  if (expected !== signature) {
    return res.status(400).json({ message: 'Invalid payment signature' });
  }

  const result = confirmPayment({
    orderId,
    paymentId,
    source: 'gateway',
    paymentMethod: 'razorpay',
    gatewayResponse: { verified_at: new Date().toISOString() },
  });

  res.json({
    success: true,
    alreadyConfirmed: result.alreadyConfirmed,
    testLink: result.assessment?.test_link,
    assessmentId: assessment.id,
    payment: result.payment,
    message: 'Payment confirmed',
  });
});

export default router;
