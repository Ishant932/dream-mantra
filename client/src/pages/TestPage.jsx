import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { userApi } from '../api';
import AssessmentClassSelect from '../components/assessment/AssessmentClassSelect';
import AssessmentProcessSteps from '../components/assessment/AssessmentProcessSteps';
import AssessmentQuestionnaire from '../components/assessment/AssessmentQuestionnaire';
import AssessmentFingerprintStep from '../components/assessment/AssessmentFingerprintStep';
import AssessmentCommunityStep from '../components/assessment/AssessmentCommunityStep';
import {
  FLOW_STEPS,
  initialStep,
  nextStep,
  getQuestionnaire,
  psychometricProcessIntro,
  PRODUCT_META,
} from '../data/assessmentFlows';

export default function TestPage() {
  const { slug } = useParams();
  const location = useLocation();
  const assessmentId = new URLSearchParams(location.search).get('id');
  const { token } = useAuth();
  const { d } = useLang();
  const navigate = useNavigate();

  const [flow, setFlow] = useState(null);
  const [access, setAccess] = useState(null);
  const [step, setStep] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const meta = PRODUCT_META[slug] || PRODUCT_META.dmit;

  const loadFlow = useCallback(async () => {
    if (!token || !assessmentId) return;
    setError('');
    try {
      const [accessRes, flowRes] = await Promise.all([
        userApi.testAccess(token, assessmentId),
        userApi.getAssessmentFlow(token, assessmentId),
      ]);
      setAccess(accessRes);
      setFlow(flowRes);
      const progress = flowRes?.assessment?.progress;
      const classLevel = progress?.classLevel || flowRes?.profileClassLevel || '';
      setSelectedClass(classLevel);
      setStep(initialStep(slug, progress));
    } catch (e) {
      if (e.message.includes('Payment')) {
        navigate(`/payment/${assessmentId}`);
        return;
      }
      setError(e.message || 'Could not load assessment');
    } finally {
      setLoading(false);
    }
  }, [token, assessmentId, slug, navigate]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!assessmentId) {
      setLoading(false);
      setError('Invalid assessment link. Open this page from your dashboard after payment.');
      return;
    }
    loadFlow();
  }, [token, assessmentId, navigate, loadFlow]);

  const saveProgress = async (patch) => {
    setSaving(true);
    setError('');
    try {
      const updated = await userApi.updateAssessmentFlow(token, assessmentId, patch);
      setFlow(updated);
      if (patch.classLevel) setSelectedClass(patch.classLevel);
      if (patch.step) setStep(patch.step);
      return updated;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const processSteps = useMemo(() => {
    if (slug === 'dmit') {
      return (d('pages.dmit')?.steps || []).map((s) => ({ step: s.num, title: s.title, desc: s.desc }));
    }
    if (slug === 'psychometric') {
      return (d('data.psychoProcess') || []).map((s) => ({ step: s.step, title: s.title, desc: s.desc, icon: s.icon }));
    }
    if (slug === 'crp-test') {
      return (d('data.crpProgram')?.sessions || []).map((s) => ({
        step: String(s.number).padStart(2, '0'),
        title: s.title,
        desc: `${s.duration} — ${s.topics?.slice(0, 2).join(', ')}…`,
        topics: s.topics,
      }));
    }
    if (slug === 'dmit-psychometric') {
      const dmitSteps = (d('pages.dmit')?.steps || []).map((s) => ({ step: s.num, title: s.title, desc: s.desc }));
      const psychoSteps = (d('data.psychoProcess') || []).slice(0, 3).map((s) => ({ step: s.step, title: s.title, desc: s.desc }));
      return [...dmitSteps, ...psychoSteps];
    }
    return [];
  }, [slug, d]);

  const classLevel = flow?.assessment?.progress?.classLevel || selectedClass;

  const handleClassContinue = async (classVal) => {
    await saveProgress({ classLevel: classVal, step: FLOW_STEPS.PROCESS });
    setStep(FLOW_STEPS.PROCESS);
  };

  const handleProcessContinue = async () => {
    const next = nextStep(slug, FLOW_STEPS.PROCESS);
    await saveProgress({ processComplete: true, step: next });
    setStep(next);
  };

  const handleFingerprintConfirm = async () => {
    await saveProgress({
      fingerprintDone: true,
      step: FLOW_STEPS.COMPLETE,
      completedAt: new Date().toISOString(),
    });
    setStep(FLOW_STEPS.COMPLETE);
  };

  const handleCommunityJoin = async () => {
    await saveProgress({
      communityJoined: true,
      step: FLOW_STEPS.COMPLETE,
      completedAt: new Date().toISOString(),
    });
    setStep(FLOW_STEPS.COMPLETE);
  };

  const handleQuestionnaireSubmit = async (answers) => {
    await saveProgress({ answers, step: FLOW_STEPS.COMPLETE, completedAt: new Date().toISOString() });
    setStep(FLOW_STEPS.COMPLETE);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!assessmentId || (access && !access.allowed)) {
    return (
      <div className="min-h-screen pt-28 text-center px-4">
        <Lock className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">{assessmentId ? 'Payment required' : 'Assessment link missing'}</h1>
        <p className="text-sm text-sand-500 mt-2 max-w-md mx-auto">{error || 'Please complete payment or open from your dashboard.'}</p>
        {assessmentId ? (
          <Link to={`/payment/${assessmentId}`} className="btn-primary mt-6 inline-flex">Pay now</Link>
        ) : (
          <Link to="/dashboard?tab=assess" className="btn-primary mt-6 inline-flex">Go to Dashboard</Link>
        )}
      </div>
    );
  }

  const flowProgress = {
    [FLOW_STEPS.CLASS]: 20,
    [FLOW_STEPS.PROCESS]: 40,
    [FLOW_STEPS.QUESTIONNAIRE]: 60,
    [FLOW_STEPS.FINGERPRINT]: 60,
    [FLOW_STEPS.COMMUNITY]: 60,
    [FLOW_STEPS.COMPLETE]: 100,
  };
  const progressPct = flowProgress[step] || 25;

  return (
    <div className="min-h-screen pt-28 pb-16 bg-gradient-to-b from-brand-50 to-[var(--bg-base)] dark:from-sand-950 dark:to-sand-900">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link to="/dashboard?tab=assess" className="text-sm font-semibold text-brand-600 inline-flex items-center gap-1 hover:underline">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div className="flex-1 max-w-xs">
            <div className="h-2 rounded-full bg-sand-200 dark:bg-sand-800 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-600"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 md:p-10"
        >
          <p className="text-amber-600 font-semibold text-sm mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Payment confirmed — {meta.title}
          </p>

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          {step === FLOW_STEPS.CLASS && slug === 'psychometric' && (
            <AssessmentClassSelect
              selected={selectedClass}
              profileClass={flow?.profileClassLevel}
              onSelect={setSelectedClass}
              onContinue={handleClassContinue}
              saving={saving}
            />
          )}

          {step === FLOW_STEPS.PROCESS && (
            <AssessmentProcessSteps
              title={
                slug === 'dmit' || slug === 'dmit-psychometric'
                  ? slug === 'dmit-psychometric'
                    ? 'Brain + Skill Mapping — Your Process'
                    : 'Brain Mapping — Your Process'
                  : slug === 'crp-test'
                    ? 'AI Career Launchpad — Training Roadmap'
                    : 'Skill Mapping — Your Process'
              }
              subtitle={
                slug === 'psychometric'
                  ? psychometricProcessIntro(classLevel)
                  : slug === 'dmit-psychometric'
                    ? 'Complete Brain Mapping fingerprint scan, Skill Mapping questionnaire, and your included counselling session.'
                    : slug === 'dmit'
                      ? 'Follow these steps for your fingerprint scan, report, and counselling session.'
                      : 'Your 5-session AI-powered career training journey starts here.'
              }
              badge={slug === 'psychometric' ? classLevel : undefined}
              steps={processSteps}
              onContinue={handleProcessContinue}
              continueLabel={
                slug === 'psychometric'
                  ? 'Continue to questionnaire'
                  : slug === 'dmit' || slug === 'dmit-psychometric'
                    ? 'Continue to fingerprint step'
                    : 'Continue to community'
              }
              saving={saving}
            />
          )}

          {step === FLOW_STEPS.QUESTIONNAIRE && slug === 'psychometric' && (
            <AssessmentQuestionnaire
              questions={getQuestionnaire(classLevel)}
              initialAnswers={flow?.assessment?.progress?.answers || {}}
              onSubmit={handleQuestionnaireSubmit}
              saving={saving}
            />
          )}

          {step === FLOW_STEPS.FINGERPRINT && (slug === 'dmit' || slug === 'dmit-psychometric') && (
            <AssessmentFingerprintStep onConfirm={handleFingerprintConfirm} saving={saving} />
          )}

          {step === FLOW_STEPS.COMMUNITY && slug === 'crp-test' && (
            <AssessmentCommunityStep
              communityLink={flow?.communityLink}
              onJoin={handleCommunityJoin}
              saving={saving}
            />
          )}

          {step === FLOW_STEPS.COMPLETE && (
            <div className="text-center py-4">
              <CheckCircle2 className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h1 className="font-display text-2xl font-bold mb-3">{meta.completeTitle}</h1>
              <p className="text-sand-600 dark:text-sand-400 max-w-lg mx-auto mb-4">{meta.completeDesc}</p>
              <p className="text-sm text-amber-700 dark:text-amber-400 font-semibold mb-8">Your report will be ready in 3–7 days.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/dashboard?tab=reports" className="btn-primary">View Reports</Link>
                {(slug === 'psychometric' || slug === 'dmit-psychometric') && (
                  <Link to="/dashboard?tab=assess" className="btn-outline">Open Skill Mapping tests</Link>
                )}
                <Link to="/dashboard?tab=book" className="btn-outline">Book Counselling</Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
