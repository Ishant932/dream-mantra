import { Router } from 'express';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { repo, flushDatabase } from '../lib/database.js';
import { buildModuleSelection, getActiveModuleCatalog } from '../lib/moduleCatalog.js';
import { getProduct } from '../config/products.js';
import { createPendingPaymentForAssessment } from '../lib/paymentService.js';
import { authRequired } from '../middleware/auth.js';
import { queryCareers } from '../lib/careersData.js';
import { calcProfileCompletion, profileChecklist, normalizeProfile, defaultProfile } from '../lib/profile.js';
import {
  buildStreamReply,
  normalizeStreamInput,
  getStreamInsight,
} from '../lib/streamKnowledge.js';
import { getAvailableSlots, bookConsultationWithSlot, enrichConsultation, cancelConsultationByUser } from '../lib/slots.js';
import { userHasCounsellingAccess } from '../lib/userAccess.js';
import { listReportsForUser } from '../lib/reports.js';
import { getAssessmentFlow, updateAssessmentFlow } from '../lib/assessmentProgress.js';
import { setAssessmentSkillMappingBand } from '../lib/skillMappingBand.js';
import { getSkillTestsForUser } from '../lib/skillMappingTests.js';
import { getCareerPathForUser } from '../lib/careerPath.js';
import { listPaymentsForUser, getPaymentForAssessment, isAssessmentFullyPaid, canCancelAssessment } from '../lib/paymentService.js';
import { getCommunityLink } from '../lib/siteSettings.js';
import {
  listNotificationsForUser,
  countUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  notifyUser,
} from '../lib/notifications.js';
import {
  onProfileUpdated,
  onPaymentPending,
  onConsultationBooked,
} from '../lib/whatsapp/events.js';
import {
  getThreadForUser,
  sendMessage,
  markThreadRead,
  countUnreadForUser,
} from '../lib/messages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const careersPath = path.join(__dirname, '../../client/public/data/careers.json');

const router = Router();
router.use(authRequired);

router.get('/dashboard', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  const consultations = db
    .prepare('SELECT * FROM consultations WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id)
    .map(enrichConsultation);
  const assessments = db
    .prepare('SELECT * FROM assessments WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id)
    .map((a) => {
      const pay = getPaymentForAssessment(a.id);
      return {
        ...a,
        payment_status: pay?.payment_status || (a.status === 'paid' ? 'confirmed' : 'pending'),
        payment_confirmed: isAssessmentFullyPaid(a),
        confirmation_source: pay?.confirmation_source || null,
      };
    });
  const paidTests = assessments.filter((a) => a.payment_confirmed).length;
  const pendingPayment = assessments.filter((a) => a.status === 'pending_payment').length;
  const profile = normalizeProfile(user?.profile);
  const profileCompletion = calcProfileCompletion(user, { paidTests, consultations: consultations.length });

  res.json({
    profile,
    profileChecklist: profileChecklist(user),
    user: {
      id: user.id,
      user_uid: user.user_uid,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
    consultations,
    assessments,
    reports: listReportsForUser(req.user.id),
    stats: {
      consultations: consultations.length,
      assessments: assessments.length,
      paidTests,
      pendingPayment,
      profileCompletion,
    },
    products: getActiveModuleCatalog(),
    careerPath: getCareerPathForUser(req.user.id),
    communityLink: getCommunityLink('crp-test'),
    payments: listPaymentsForUser(req.user.id),
    notifications: listNotificationsForUser(req.user.id, { limit: 20 }),
    unreadNotifications: countUnreadNotifications(req.user.id),
    counsellingAccess: userHasCounsellingAccess(req.user.id),
  });
});

router.patch('/profile', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const allowed = [
    'classLevel', 'stream', 'city', 'state', 'board', 'schoolOrCollege', 'careerGoal',
    'dateOfBirth', 'gender', 'hobbies', 'biggestChallenge', 'parentName', 'parentPhone',
    'whatsappNumber', 'whatsappOptIn', 'preferredMode', 'howHeard',
  ];
  const current = normalizeProfile(user.profile);
  const patch = { ...current };

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      if (key === 'whatsappOptIn') {
        patch[key] = !!req.body[key];
      } else {
        patch[key] = String(req.body[key] || '').trim();
      }
    }
  }

  if (req.body.setupComplete !== undefined) {
    patch.setupComplete = !!req.body.setupComplete;
  }

  const coreFilled = ['classLevel', 'stream', 'city', 'careerGoal', 'dateOfBirth', 'gender', 'whatsappNumber'].every((k) => patch[k]);
  if (coreFilled && req.body.markComplete !== false) {
    patch.setupComplete = true;
  }

  repo.updateUser(user.id, { profile: patch });

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
  const consultations = db.prepare('SELECT * FROM consultations WHERE user_id = ?').all(req.user.id) || [];
  const assessments = db.prepare('SELECT * FROM assessments WHERE user_id = ?').all(req.user.id) || [];
  const paidTests = assessments.filter((a) => a.status === 'paid').length;

  res.json({
    profile: normalizeProfile(updated.profile),
    profileChecklist: profileChecklist(updated),
    profileCompletion: calcProfileCompletion(updated, { paidTests, consultations: consultations.length }),
    message: 'Profile updated',
  });
  onProfileUpdated(updated);
});

router.get('/career-matches', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    const profile = normalizeProfile(user?.profile);
    const stream = normalizeStreamInput(profile.stream || '');
    const result = queryCareers({ limit: 80, stream: stream || undefined });
    const seed = req.user.id * 9301 + 49297;
    const list = [...result.careers];
    for (let i = list.length - 1; i > 0; i--) {
      const j = (seed + i * 31) % (i + 1);
      [list[i], list[j]] = [list[j], list[i]];
    }
    const picks = list.slice(0, 12).map((c, i) => ({
      slug: c.slug,
      title: c.title,
      category: c.category,
      relevance: stream ? 'Stream-aligned pick' : 'Suggested for you',
      rank: i + 1,
      salary: c.salaryRange,
      shortDescription: c.shortDescription || '',
    }));
    res.json({ careers: picks, label: stream ? 'Suggested careers for your stream' : 'Explore these careers' });
  } catch {
    res.json({ careers: [], label: 'Suggested careers' });
  }
});

router.get('/ai-trends', (_, res) => {
  res.json({
    trends: [
      { title: 'AI & Machine Learning', growth: '+42%', roles: ['AI Engineer', 'ML Engineer', 'Prompt Engineer'], hot: true },
      { title: 'Green Energy & Sustainability', growth: '+35%', roles: ['Renewable Energy Analyst', 'ESG Consultant'], hot: true },
      { title: 'Healthcare & Biotech', growth: '+28%', roles: ['Genetic Counselor', 'Health Informatics'], hot: false },
      { title: 'Digital Marketing & Creator Economy', growth: '+31%', roles: ['Growth Marketer', 'Content Strategist'], hot: true },
      { title: 'Cybersecurity', growth: '+38%', roles: ['Security Analyst', 'Ethical Hacker'], hot: true },
    ],
  });
});

router.post('/ai-career-advice', async (req, res) => {
  const { question, stream, classLevel } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  const profile = normalizeProfile(user?.profile);
  const effectiveStream = stream || profile.stream || '';
  const q = (question || '').trim() || 'What career path suits me best?';
  const streamId = normalizeStreamInput(effectiveStream);

  const streamFirst = streamId
    ? buildStreamReply(streamId, 'en', { includeGreeting: false })
    : null;

  const context = `Student: ${user?.name || 'User'}. Class/Level: ${classLevel || profile.classLevel || 'Not specified'}. Stream: ${effectiveStream || 'Not specified'}. Career goal: ${profile.careerGoal || 'Not specified'}.`;
  const prompt = `${context}

User question: ${q}

IMPORTANT INSTRUCTIONS:
1. If a stream is specified or the question is about a stream, FIRST give detailed advice about that stream — careers, exams, skills, and 2-3 specific options for India.
2. THEN add a short section promoting Dream Mantra: Mind Mapping + Skill Mapping for scientific stream validation, 7-Step Counselling, 950+ career library, free consultation at 9680102276 or /contact.
3. Keep total response under 350 words. Be actionable and warm.`;

  let advice = null;
  const key = process.env.GEMINI_API_KEY;
  if (key) {
    try {
      const gemRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 900 },
          }),
        }
      );
      if (gemRes.ok) {
        const data = await gemRes.json();
        advice = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      }
    } catch (e) {
      console.error('AI advice error:', e.message);
    }
  }

  if (!advice && streamFirst) {
    advice = streamFirst;
  }

  if (!advice) {
    advice = `Based on your profile${effectiveStream ? ` (${effectiveStream})` : ''}, explore careers via our 950+ Career Library. `
      + `For Class ${classLevel || profile.classLevel || '9-12'}, we recommend Mind Mapping + Skill Mapping before stream selection. `
      + `Book free counselling at 9680102276 or /contact — Dream Mantra's certified counsellors will build your personalised roadmap.`;
  }

  res.json({
    advice,
    stream: effectiveStream || null,
    streamInsight: streamId ? getStreamInsight(streamId) : null,
    source: advice.includes('9680102276') && !key ? 'knowledge' : 'gemini',
    generatedAt: new Date().toISOString(),
  });
});

router.get('/stream-insight', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  const profile = normalizeProfile(user?.profile);
  const stream = req.query.stream || profile.stream || '';
  const streamId = normalizeStreamInput(stream);
  if (!streamId) {
    return res.json({ insight: null, message: 'No stream specified' });
  }
  res.json({ insight: getStreamInsight(streamId), streamId });
});

router.post('/consultations', (req, res) => {
  const { program, notes, slot_id } = req.body;
  try {
    if (!userHasCounsellingAccess(req.user.id)) {
      return res.status(403).json({
        message: 'Counselling sessions unlock when you purchase a module with counselling. Go to Modules to add counselling at checkout.',
      });
    }

    if (!slot_id) {
      return res.status(400).json({
        message: 'Please select a time slot to book your counselling session.',
      });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    const result = bookConsultationWithSlot(req.user.id, { program, notes, slot_id }, user);
    notifyUser(req.user.id, {
      type: 'booking',
      title: 'Session booked',
      body: `Your counselling session is booked for ${new Date(result.consultation.scheduled_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}.`,
      link: '/dashboard?tab=book',
      meta: { consultationId: result.consultation.id },
    });
    onConsultationBooked(user, result.consultation);
    return res.status(201).json(result);
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
});

router.delete('/consultations/:id', (req, res) => {
  const result = cancelConsultationByUser(req.user.id, req.params.id);
  if (!result.ok) {
    return res.status(result.error === 'Booking not found' ? 404 : 400).json({ message: result.error });
  }
  res.json({ ok: true, message: 'Booking cancelled', consultation: enrichConsultation(result.consultation) });
});

router.get('/notifications', (req, res) => {
  res.json({
    notifications: listNotificationsForUser(req.user.id),
    unread: countUnreadNotifications(req.user.id),
  });
});

router.patch('/notifications/:id/read', (req, res) => {
  const row = markNotificationRead(req.user.id, req.params.id);
  if (!row) return res.status(404).json({ message: 'Notification not found' });
  res.json({ notification: row, unread: countUnreadNotifications(req.user.id) });
});

router.post('/notifications/read-all', (req, res) => {
  const count = markAllNotificationsRead(req.user.id);
  res.json({ ok: true, marked: count, unread: 0 });
});

router.get('/messages', (req, res) => {
  const data = getThreadForUser(req.user.id);
  if (data.thread) markThreadRead({ threadId: data.thread.id, role: 'user' });
  res.json({ ...data, unread: countUnreadForUser(req.user.id) });
});

router.post('/messages', async (req, res) => {
  try {
    const { body, attachments } = req.body || {};
    const threadData = getThreadForUser(req.user.id);
    const result = sendMessage({
      threadId: threadData.thread?.id,
      userId: req.user.id,
      senderRole: 'user',
      senderId: req.user.id,
      body,
      attachments: Array.isArray(attachments) ? attachments : [],
    });
    await flushDatabase();
    res.json(result);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.get('/slots/available', (req, res) => {
  if (!userHasCounsellingAccess(req.user.id)) {
    return res.status(403).json({
      message: 'Purchase a module with counselling to view and book available slots.',
      slots: [],
    });
  }
  const from = req.query.from || new Date().toISOString();
  const to = req.query.to;
  const slots = getAvailableSlots({ from, to });
  res.json({ slots });
});

router.get('/reports', (req, res) => {
  res.json({ reports: listReportsForUser(req.user.id) });
});

/** Book test → pending payment → redirect to /payment/:id */
router.post('/assessments/book', (req, res) => {
  const { productSlug, type, addCounselling, amount: clientAmount, lineItems: clientLineItems, selectionTitle } = req.body;
  const slug = productSlug || type || 'dmit';
  const catalog = buildModuleSelection(slug, !!addCounselling);

  if (!catalog) {
    return res.status(400).json({ message: 'Invalid module selected' });
  }

  const userAssessments = db.prepare('SELECT * FROM assessments WHERE user_id = ?').all(req.user.id);
  const alreadyOwned = userAssessments.find(
    (a) => a.product_slug === catalog.moduleSlug && isAssessmentFullyPaid(a)
  );
  if (alreadyOwned) {
    return res.status(400).json({
      message: 'You already own this module. Open it from My Purchased Modules.',
      assessmentId: alreadyOwned.id,
    });
  }

  if (clientAmount != null && Number(clientAmount) !== catalog.total) {
    return res.status(400).json({ message: 'Price mismatch — refresh the page and try again.' });
  }

  const progress = {
    addCounselling: catalog.addCounselling,
    selection: {
      displayTitle: selectionTitle || catalog.displayTitle,
      lineItems: Array.isArray(clientLineItems) && clientLineItems.length ? clientLineItems : catalog.lineItems,
      total: catalog.total,
      moduleSlug: catalog.moduleSlug,
      moduleTitle: catalog.moduleTitle,
      addCounselling: catalog.addCounselling,
    },
  };

  const existingPending = db
    .prepare('SELECT * FROM assessments WHERE user_id = ?')
    .all(req.user.id)
    .find((a) => a.product_slug === catalog.moduleSlug && a.status === 'pending_payment');

  if (existingPending) {
    repo.updateAssessment(existingPending.id, {
      amount: catalog.total,
      type: catalog.moduleTitle,
      product_slug: catalog.moduleSlug,
      progress: {
        ...(existingPending.progress || {}),
        addCounselling: catalog.addCounselling,
        selection: {
          displayTitle: selectionTitle || catalog.displayTitle,
          lineItems: Array.isArray(clientLineItems) && clientLineItems.length ? clientLineItems : catalog.lineItems,
          total: catalog.total,
          moduleSlug: catalog.moduleSlug,
          moduleTitle: catalog.moduleTitle,
          addCounselling: catalog.addCounselling,
        },
      },
    });
    createPendingPaymentForAssessment({
      userId: req.user.id,
      assessmentId: existingPending.id,
      amount: catalog.total,
    });
    const bookUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    onPaymentPending(bookUser, repo.getAssessment(existingPending.id));
    return res.status(200).json({
      assessment: repo.getAssessment(existingPending.id),
      paymentUrl: `/payment/${existingPending.id}`,
      reused: true,
    });
  }

  const result = db
    .prepare('INSERT INTO assessments (user_id, type, status, amount, product_slug) VALUES (?, ?, ?, ?, ?)')
    .run(req.user.id, catalog.moduleTitle, 'pending_payment', catalog.total, catalog.moduleSlug);
  const assessment = db.prepare('SELECT * FROM assessments WHERE id = ?').get(result.lastInsertRowid);
  repo.updateAssessment(assessment.id, { progress });
  createPendingPaymentForAssessment({
    userId: req.user.id,
    assessmentId: assessment.id,
    amount: catalog.total,
  });
  const bookUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  onPaymentPending(bookUser, repo.getAssessment(assessment.id));
  res.status(201).json({
    assessment: repo.getAssessment(assessment.id),
    paymentUrl: `/payment/${assessment.id}`,
  });
});

router.post('/assessments', (req, res) => {
  const { type, productSlug } = req.body;
  const product = getProduct(productSlug || type || 'dmit');
  const result = db
    .prepare('INSERT INTO assessments (user_id, type, status, amount, product_slug) VALUES (?, ?, ?, ?, ?)')
    .run(req.user.id, product.title, 'pending_payment', product.price, product.slug);
  const assessment = db.prepare('SELECT * FROM assessments WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ assessment, paymentUrl: `/payment/${assessment.id}` });
});

router.get('/assessments/:id/test-access', (req, res) => {
  const assessment = db.prepare('SELECT * FROM assessments WHERE id = ?').get(req.params.id);
  if (!assessment || Number(assessment.user_id) !== Number(req.user.id)) {
    return res.status(404).json({ message: 'Not found' });
  }
  if (!isAssessmentFullyPaid(assessment)) {
    return res.status(402).json({ message: 'Payment required', paymentUrl: `/payment/${assessment.id}` });
  }
  res.json({
    allowed: true,
    testLink: assessment.test_link,
    type: assessment.type,
    product_slug: assessment.product_slug,
    progress: assessment.progress || null,
  });
});

router.get('/assessments/:id/flow', (req, res) => {
  const assessment = db.prepare('SELECT * FROM assessments WHERE id = ?').get(req.params.id);
  if (!assessment || Number(assessment.user_id) !== Number(req.user.id)) {
    return res.status(404).json({ message: 'Assessment not found' });
  }
  if (!isAssessmentFullyPaid(assessment)) {
    return res.status(402).json({ message: 'Payment required', paymentUrl: `/payment/${assessment.id}` });
  }
  const flow = getAssessmentFlow(req.params.id, req.user.id);
  if (!flow) return res.status(404).json({ message: 'Assessment not found' });
  res.json(flow);
});

router.patch('/assessments/:id/flow', (req, res) => {
  try {
    const {
      step,
      classLevel,
      answers,
      skillMappingBand,
      fingerprintDone,
      communityJoined,
      processComplete,
      completedAt,
    } = req.body;
    const flow = updateAssessmentFlow(req.params.id, req.user.id, {
      step,
      classLevel,
      answers,
      skillMappingBand,
      fingerprintDone,
      communityJoined,
      processComplete,
      completedAt,
    });
    res.json(flow);
  } catch (e) {
    const status = e.message === 'Payment required' ? 402 : 400;
    res.status(status).json({ message: e.message });
  }
});

/** Skill Mapping tests — form links tied to the logged-in user's registered email */
router.get('/assessments/:id/skill-tests', (req, res) => {
  try {
    const assessment = db.prepare('SELECT * FROM assessments WHERE id = ?').get(req.params.id);
    if (!assessment || Number(assessment.user_id) !== Number(req.user.id)) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    if (!isAssessmentFullyPaid(assessment)) {
      return res.status(402).json({
        message: 'Payment required before taking tests',
        paymentUrl: `/payment/${assessment.id}`,
      });
    }
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    const data = getSkillTestsForUser(assessment, user);
    res.json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

/** Verify registered Dream Mantra ID + password before opening skill tests */
router.post('/assessments/:id/verify-test-access', (req, res) => {
  const { userUid, password } = req.body || {};
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const assessment = db.prepare('SELECT * FROM assessments WHERE id = ?').get(req.params.id);
  if (!assessment || Number(assessment.user_id) !== Number(req.user.id)) {
    return res.status(404).json({ message: 'Assessment not found' });
  }

  const inputUid = String(userUid || '').trim();
  const storedUid = String(user.user_uid || '').trim();
  if (!inputUid || inputUid !== storedUid) {
    return res.status(401).json({
      message: 'Dream Mantra ID does not match your registered account.',
    });
  }
  if (!password || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Incorrect password for this account.' });
  }

  res.json({
    verified: true,
    registeredUserUid: user.user_uid,
    registeredEmail: user.email || null,
    registeredName: user.name || null,
  });
});

/** Save class band before payment (Skill Mapping / combo modules) */
router.patch('/assessments/:id/skill-mapping-band', (req, res) => {
  try {
    const assessment = setAssessmentSkillMappingBand(
      req.params.id,
      req.user.id,
      req.body.skillMappingBand
    );
    res.json({ assessment: repo.getAssessment(assessment.id) });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

/** Cancel / remove a pending or unconfirmed module booking */
router.delete('/assessments/:id', (req, res) => {
  const assessment = db.prepare('SELECT * FROM assessments WHERE id = ?').get(req.params.id);
  if (!assessment || Number(assessment.user_id) !== Number(req.user.id)) {
    return res.status(404).json({ message: 'Module not found' });
  }
  if (!canCancelAssessment(assessment)) {
    return res.status(400).json({ message: 'Confirmed modules cannot be removed. Contact support if you need help.' });
  }
  const removed = repo.deleteAssessment(assessment.id);
  if (!removed) {
    return res.status(404).json({ message: 'Module not found or already removed.' });
  }
  res.json({ ok: true, message: 'Module removed' });
});

export default router;
