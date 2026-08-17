import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ClipboardList, MessageCircle, AlertCircle, Package, Users, ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api';
import { DashCard } from './DashboardUI';
import CopyableUserId from './CopyableUserId';
import SkillMappingTestsSection from './SkillMappingTestsSection';
import { PROCESS_GUIDES, WHATSAPP_LINK } from '../data/processGuides';
import {
  getAvailableProcessGuideTabs,
  getConfirmedPaidAssessments,
  getProcessGuideIdsForAssessment,
  moduleHasTakeTest,
  resolveAssessmentSlug,
} from '../utils/moduleAccess';
import { getAssessmentDisplayTitle } from '../utils/assessmentHelpers';
import { parseDashboardPath } from '../utils/pathRoutes';
import { resolveCommunityUrl } from '../utils/communityLink';

function ProcessSection({ section }) {
  return (
    <div className="process-guide-section">
      <h4 className="process-guide-section__title">{section.title}</h4>
      {section.note && (
        <p className="process-guide-section__note">{section.note}</p>
      )}
      {section.items?.length > 0 && (
        <ul className="process-guide-list">
          {section.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {section.steps?.length > 0 && (
        <ol className="process-guide-steps">
          {section.steps.map((step, i) => (
            <li key={step.title}>
              <p className="process-guide-steps__title">
                <span className="process-guide-steps__num">{i + 1}</span>
                {step.title}
              </p>
              <p className="process-guide-steps__desc">{step.desc}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function ProcessGuideView({ guide }) {
  if (!guide) return null;

  return (
    <motion.div
      key={guide.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-5"
    >
      <div className="process-guide-intro">
        {guide.intro ? <p>{guide.intro}</p> : null}
        {guide.alert && (
          <p className="process-guide-alert">
            <MessageCircle className="w-4 h-4 shrink-0" />
            {guide.alert}
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="process-guide-wa-link">
              Chat on WhatsApp
            </a>
          </p>
        )}
      </div>

      {guide.sections.map((section) => (
        <ProcessSection key={section.title} section={section} />
      ))}
    </motion.div>
  );
}

export default function ProcessQuestionnairesPanel({ assessments = [], profile, user, communityLink, onRefresh }) {
  const { token } = useAuth();
  const location = useLocation();
  const parsedDash = parseDashboardPath(location.pathname, location.search);
  const sectionParam = parsedDash.section || new URLSearchParams(location.search).get('section');
  const openTestOnLoad = urlParams.get('open') === '1';

  const paidModules = useMemo(
    () => getConfirmedPaidAssessments(assessments),
    [assessments]
  );

  const availableTabs = useMemo(
    () => getAvailableProcessGuideTabs(assessments),
    [assessments]
  );

  const [mainSection, setMainSection] = useState(sectionParam === 'tests' ? 'questionnaires' : 'process');
  const [activeProcess, setActiveProcess] = useState(null);
  const [activeProductId, setActiveProductId] = useState(null);

  const productOptions = useMemo(() => {
    return paidModules
      .map((a) => ({
        assessment: a,
        guideIds: getProcessGuideIdsForAssessment(a),
        slug: resolveAssessmentSlug(a),
      }))
      .filter((p) => p.slug !== 'counselling-topup' && (p.guideIds.length > 0 || p.slug));
  }, [paidModules]);

  const activeProduct = productOptions.find((p) => p.assessment.id === activeProductId)
    || productOptions[0]
    || null;

  const tabsForProduct = useMemo(() => {
    if (!activeProduct) return availableTabs;
    const ids = activeProduct.guideIds.length
      ? activeProduct.guideIds
      : availableTabs;
    return availableTabs.filter((id) => ids.includes(id));
  }, [activeProduct, availableTabs]);

  const currentProcess = activeProcess && tabsForProduct.includes(activeProcess)
    ? activeProcess
    : tabsForProduct[0] || null;

  const guide = currentProcess ? PROCESS_GUIDES[currentProcess] : null;
  const showQuestionnairesForProduct = moduleHasTakeTest(activeProduct?.slug);
  const effectiveSection = showQuestionnairesForProduct ? mainSection : 'process';
  const showCommunityLink = activeProduct?.slug === 'crp-test';
  const communityUrl = resolveCommunityUrl(communityLink);
  const hasCommunityLink = Boolean(communityUrl);

  useEffect(() => {
    if (sectionParam === 'tests' && showQuestionnairesForProduct) setMainSection('questionnaires');
    if (sectionParam === 'process') setMainSection('process');
  }, [sectionParam, showQuestionnairesForProduct]);

  useEffect(() => {
    if (!showQuestionnairesForProduct && mainSection === 'questionnaires') {
      setMainSection('process');
    }
  }, [showQuestionnairesForProduct, mainSection]);

  useEffect(() => {
    if (productOptions.length && !productOptions.some((p) => p.assessment.id === activeProductId)) {
      setActiveProductId(productOptions[0].assessment.id);
    }
  }, [productOptions, activeProductId]);

  useEffect(() => {
    if (currentProcess) setActiveProcess(currentProcess);
  }, [currentProcess]);

  if (!paidModules.length) {
    return (
      <DashCard className="!p-8 text-center">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3 opacity-70" />
        <p className="font-bold">Process guides unlock after payment</p>
        <p className="text-sm dash-card-meta mt-2">
          Complete payment for a module to view its step-by-step process and questionnaires.
        </p>
        <Link to="/dashboard?tab=assess" className="btn-primary mt-4 inline-flex">Browse Modules</Link>
      </DashCard>
    );
  }

  if (!availableTabs.length && !productOptions.length) {
    return (
      <DashCard className="!p-8 text-center">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3 opacity-70" />
        <p className="font-bold">Process content is being prepared</p>
        <p className="text-sm dash-card-meta mt-2">Your payment is confirmed. Guides will appear here shortly — check back soon or contact support.</p>
      </DashCard>
    );
  }

  return (
    <div className="space-y-5">
      <DashCard className="!p-4 sm:!p-5" glow={false}>
        <div className="flex items-start gap-3">
          <Package className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Your purchased modules</p>
            <p className="text-xs dash-card-meta mt-1">
              Process steps and tests are shown only for products you have paid for.
            </p>
          </div>
        </div>
        {productOptions.length > 1 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {productOptions.map(({ assessment }) => (
              <button
                key={assessment.id}
                type="button"
                onClick={() => {
                  setActiveProductId(assessment.id);
                  setActiveProcess(null);
                }}
                className={`modules-paid-picker ${activeProduct?.assessment.id === assessment.id ? 'modules-paid-picker--active' : ''}`}
              >
                {getAssessmentDisplayTitle(assessment)}
              </button>
            ))}
          </div>
        )}
        {productOptions.length === 1 && (
          <p className="text-sm font-semibold mt-3 text-amber-800 dark:text-amber-200">
            {getAssessmentDisplayTitle(productOptions[0].assessment)}
          </p>
        )}
      </DashCard>

      {showQuestionnairesForProduct && (
        <div className="modules-subtabs flex-wrap">
          <button
            type="button"
            className={`modules-subtab ${effectiveSection === 'process' ? 'modules-subtab--active' : ''}`}
            onClick={() => setMainSection('process')}
          >
            <BookOpen className="w-4 h-4" />
            Process
          </button>
          <button
            type="button"
            className={`modules-subtab ${effectiveSection === 'questionnaires' ? 'modules-subtab--active' : ''}`}
            onClick={() => setMainSection('questionnaires')}
          >
            <ClipboardList className="w-4 h-4" />
            Take test
          </button>
        </div>
      )}

      {effectiveSection === 'process' && (
        <DashCard className="!p-5 sm:!p-6" glow>
          <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                Process
              </h2>
              <p className="text-sm dash-card-meta mt-1">
                Step-by-step instructions for {activeProduct ? getAssessmentDisplayTitle(activeProduct.assessment) : 'your module'}.
                Updates are shared on your registered WhatsApp.
              </p>
            </div>
            {user?.user_uid && (
              <div className="text-xs">
                <span className="opacity-60 block mb-1">Your Dreams ID for all forms</span>
                <CopyableUserId uid={user.user_uid} compact animate={false} />
              </div>
            )}
          </div>

          {tabsForProduct.length > 1 && (
            <div className="modules-subtabs flex-wrap mb-4">
              {tabsForProduct.map((id) => {
                const g = PROCESS_GUIDES[id];
                return (
                  <button
                    key={id}
                    type="button"
                    className={`modules-subtab ${currentProcess === id ? 'modules-subtab--active' : ''}`}
                    onClick={() => setActiveProcess(id)}
                  >
                    <span>{g.icon}</span>
                    {g.title.replace(' Process', '')}
                  </button>
                );
              })}
            </div>
          )}

          <AnimatePresence mode="wait">
            <ProcessGuideView guide={guide} />
          </AnimatePresence>

          {showCommunityLink && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 280, damping: 24 }}
              className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/60 dark:border-amber-700/40"
            >
              <div className="flex items-start gap-3">
                <span className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-base">Join Community</h3>
                  <p className="text-sm dash-card-meta mt-1">
                    {hasCommunityLink
                      ? 'Connect with your AI Career Launchpad cohort — session updates, assignments, and peer support.'
                      : 'Your community link will appear here once published. Contact support if you need help joining.'}
                  </p>
                  {hasCommunityLink && (
                    <motion.a
                      href={communityUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary inline-flex items-center gap-2 mt-4 !py-2.5 !px-5 text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Join Community <ExternalLink className="w-4 h-4" />
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>                                       
          )}
        </DashCard>
      )}

      {effectiveSection === 'questionnaires' && showQuestionnairesForProduct && (
        <DashCard className="!p-5 sm:!p-6" glow delay={0.05}>
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-bold text-lg">Take test</h3>
              <p className="text-sm dash-card-meta">
                Skill Mapping forms for {activeProduct ? getAssessmentDisplayTitle(activeProduct.assessment) : 'your module'}.
                The form opens here in your dashboard with your Dreams ID prefilled.
              </p>
            </div>
          </div>
          <SkillMappingTestsSection
            key={`skill-tests-${user?.id}-${user?.user_uid}-${activeProduct?.assessment?.id}`}
            assessment={activeProduct?.assessment}
            userUid={user?.user_uid}
            userName={user?.name}
            userEmail={user?.email}
            userPhone={user?.phone || profile?.whatsappNumber}
            openTestOnLoad={openTestOnLoad && effectiveSection === 'questionnaires'}
            onBandSaved={async (band) => {
              if (!token || !activeProduct?.assessment?.id) return;
              await userApi.setSkillMappingBand(token, activeProduct.assessment.id, band);
              await onRefresh?.();
            }}
          />
        </DashCard>
      )}
    </div>
  );
}

