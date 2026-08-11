import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import {
  CheckCircle,
  AlertCircle, ExternalLink,
  FileText, Download,
} from 'lucide-react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { userApi, publicApi } from '../api';
import { programs } from '../data/content';
import CounsellingBookingPanel from '../components/CounsellingBookingPanel';
import ModulesPanel from '../components/ModulesPanel';
import DashboardSidebarLayout from '../components/DashboardSidebarLayout';
import { lazyWithRetry } from '../utils/lazyWithRetry';
import ProfileOnboardingModal from '../components/ProfileOnboardingModal';
import ProfileDetailsCard from '../components/ProfileDetailsCard';
import NotificationBell from '../components/NotificationBell';
import CVMakerPanel from '../components/dashboard/CVMakerPanel';
import TrainingResourcesPanel from '../components/dashboard/TrainingResourcesPanel';
import SupportStudio from '../components/dashboard/SupportStudio';
import { profileStreamToFilter } from '../utils/careerStreams';
import DashboardOverview from '../components/DashboardOverview';
import { CounsellingProductPanel, TrainingProductPanel } from '../components/dashboard/DashboardProductPanel';
import {
  canShowCounsellingTopUp,
  hasCounsellingAccess,
  isAssessmentUnlocked,
  resolveAssessmentSlug,
} from '../utils/moduleAccess';
import { canCancelAssessment } from '../utils/assessmentHelpers';
import { hasSkillMappingTests } from '../data/moduleCatalog';
import { prefetchCareers } from '../utils/loadCareers';
import {
  buildProductCareerPath,
  hasPaidAccessForSlug,
  slugForCounsellingFocus,
  slugForTrainingFocus,
  findAssessmentForSlug,
} from '../utils/productCareerPath';
import { getModuleDashboardRoute } from '../utils/moduleDashboardNav';
import { startModuleCheckout } from '../utils/startCheckout';
import { programPageForSlug } from '../utils/routes';

const CareerLibraryExplorer = lazyWithRetry(() => import('../components/CareerLibraryExplorer'));

function TabLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-10 h-10 border-3 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
    </div>
  );
}
import { useFlashNotice } from '../hooks/useFlashNotice';
import {
  DashboardShell,
  DashboardLoading,
  DashCard,
  DashAlert,
} from '../components/DashboardUI';
import DashboardB2BBanner from '../components/DashboardB2BBanner';

const COUNSELLING_PATHS = [
  { id: 'brain', label: 'Brain Mapping', slug: 'dmit' },
  { id: 'skill', label: 'Skill Mapping', slug: 'psychometric' },
  { id: 'combo', label: 'Brain + Skill', slug: 'dmit-psychometric' },
];

const TRAINING_PATHS = [
  { id: 'launchpad', label: 'AI Career Launchpad', slug: 'crp-test' },
  { id: 'readiness', label: 'Personalised Career Readiness Program', slug: 'career-readiness' },
];

export default function UserDashboard() {
  const { user, token, refreshUser } = useAuth();
  const { t, d } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const tabParam = new URLSearchParams(location.search).get('tab') || 'assess';

  useEffect(() => {
    if (tabParam === 'ai' || tabParam === 'overview') {
      navigate({ pathname: location.pathname, search: '?tab=assess' }, { replace: true, preventScrollReset: true });
    }
  }, [tabParam, navigate, location.pathname]);

  useEffect(() => {
    if (tabParam === 'support') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [tabParam]);
  const welcomeUid = location.state?.welcomeUid;
  const [data, setData] = useState({ consultations: [], assessments: [], stats: {} });
  const [program, setProgram] = useState('Class 9-10');
  const [notes, setNotes] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [counsellingFocus, setCounsellingFocus] = useState('brain');
  const [counsellingSubtab, setCounsellingSubtab] = useState(null);
  const [trainingFocus, setTrainingFocus] = useState('launchpad');
  const [trainingSubtab, setTrainingSubtab] = useState(null);

  const counsellingAccess = useMemo(
    () => data.counsellingAccess === true || hasCounsellingAccess(data.assessments || []),
    [data.counsellingAccess, data.assessments]
  );

  const dashboardTabs = useMemo(() => {
    const tabs = [
      { id: 'assess', label: 'Book Now', desc: 'Browse and purchase programs' },
      { id: 'counselling', label: 'Counselling', desc: 'Choose your counselling path' },
      { id: 'training', label: 'Training and Placement', desc: 'Explore job-ready training' },
      { id: 'support', label: 'Support', desc: 'Messages and help' },
      { id: 'careers', label: 'Career Library', desc: 'Explore 1000+ career paths' },
    ];

    return tabs.map((tab) => {
      if (tab.id === 'support') {
        return { ...tab, desc: 'Get help and messages from the team' };
      }
      return tab;
    });
  }, []);

  const loadSlots = useCallback(async (slotType) => {
    if (!token) return;
    setSlotsLoading(true);
    try {
      const from = new Date();
      const to = new Date();
      to.setMonth(to.getMonth() + 3);
      const params = { from: from.toISOString(), to: to.toISOString() };
      if (slotType) params.slot_type = slotType;
      let slotData = await userApi.availableSlots(token, params);
      if (!slotData?.slots?.length && !slotType) {
        try {
          const pub = await publicApi.availableSlots(params);
          slotData = { slots: pub.slots || [] };
        } catch {
          /* user route is primary */
        }
      }
      setSlots(slotData.slots || []);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [token]);

  const load = useCallback(async (activeToken, cancelled, { silent = false } = {}) => {
    if (!activeToken || cancelled()) return;
    setErr('');
    if (!silent) setLoading(true);
    try {
      const dash = await userApi.dashboard(activeToken);
      if (cancelled()) return;
      setData(dash);
    } catch (e) {
      if (!cancelled()) setErr(e.message);
    } finally {
      if (!cancelled() && !silent) setLoading(false);
    }
  }, []);

  const refreshDashboard = useCallback(async () => {
    if (!token) return;
    setErr('');
    try {
      const dash = await userApi.dashboard(token);
      setData(dash);
    } catch (e) {
      setErr(e.message);
    }
  }, [token]);

  const refreshNotifs = useCallback(async () => {
    if (!token) return;
    try { await refreshDashboard(); } catch { /* silent */ }
  }, [token, refreshDashboard]);
  const { notice: flashNotice, flash: flashMsg } = useFlashNotice(token, refreshNotifs);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    const isCancelled = () => cancelled;

    load(token, isCancelled);
    prefetchCareers();

    return () => {
      cancelled = true;
    };
  }, [token, load]);

  const displayUser = useMemo(
    () => ({ ...user, ...data.user, user_uid: data.user?.user_uid || user?.user_uid }),
    [user, data.user]
  );

  useEffect(() => {
    if (!token || loading) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const dash = await userApi.dashboard(token);
        if (!cancelled) setData(dash);
      } catch {
        /* silent refresh on tab change */
      }
    })();
    return () => { cancelled = true; };
  }, [tabParam, token, loading]);

  useEffect(() => {
    if (!token || tabParam !== 'reports') return undefined;
    const timer = window.setInterval(() => {
      userApi.dashboard(token).then((dash) => setData(dash)).catch(() => {});
    }, 30000);
    return () => window.clearInterval(timer);
  }, [token, tabParam]);

  useEffect(() => {
    const slotId = new URLSearchParams(location.search).get('slot_id');
    if (!slotId || loading) return;
    if (!counsellingAccess) {
      navigate({ pathname: '/dashboard', search: '?tab=book' }, { replace: true, preventScrollReset: true });
      return;
    }
    if (tabParam !== 'book') {
      navigate({ pathname: '/dashboard', search: `?tab=book&slot_id=${slotId}` }, { replace: true, preventScrollReset: true });
      return;
    }
    loadSlots();
  }, [location.search, tabParam, navigate, loadSlots, counsellingAccess, loading]);

  useEffect(() => {
    if (tabParam === 'support') {
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.getElementById('user-dashboard-anchor')?.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }, [tabParam]);

  useEffect(() => {
    if (token) loadSlots();
  }, [token, loadSlots]);

  useEffect(() => {
    const slotId = new URLSearchParams(location.search).get('slot_id');
    if (!slotId || !slots.length || !counsellingAccess) return;
    const match = slots.find((s) => String(s.id) === String(slotId));
    if (match) setSelectedSlot(match);
  }, [location.search, slots, counsellingAccess]);

  const goTab = (tabId, extraSearch = '') => {
    navigate(
      { pathname: '/dashboard', search: `?tab=${tabId}${extraSearch}` },
      { preventScrollReset: true },
    );
  };

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const focus = p.get('focus');
    const subtab = p.get('subtab');
    if (focus && COUNSELLING_PATHS.some((x) => x.id === focus)) setCounsellingFocus(focus);
    if (focus && TRAINING_PATHS.some((x) => x.id === focus)) setTrainingFocus(focus);
    if (subtab && tabParam === 'counselling') setCounsellingSubtab(subtab);
    if (subtab && tabParam === 'training') setTrainingSubtab(subtab);
  }, [location.search, tabParam]);

  const openPaidModule = useCallback((assessment, action = 'default') => {
    const route = getModuleDashboardRoute(assessment, action);
    if (route.focus && route.tab === 'counselling') setCounsellingFocus(route.focus);
    if (route.focus && route.tab === 'training') setTrainingFocus(route.focus);
    if (route.subtab) {
      if (route.tab === 'counselling') setCounsellingSubtab(route.subtab);
      if (route.tab === 'training') setTrainingSubtab(route.subtab);
    }
    const qs = new URLSearchParams();
    qs.set('tab', route.tab);
    if (route.focus) qs.set('focus', route.focus);
    if (route.subtab) qs.set('subtab', route.subtab);
    if (route.hubView) qs.set('hub', route.hubView);
    navigate({ pathname: '/dashboard', search: `?${qs.toString()}` }, { preventScrollReset: true });
  }, [navigate]);

  const openProfileModal = () => setShowProfileModal(true);

  const goProcessGuides = (section = 'process') => {
    goTab('support', section === 'tests' ? '&section=tests&open=1' : '&section=process');
  };

  const goToTakeTest = () => goProcessGuides('tests');

  const bookConsultation = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setErr('Please pick an available time slot from the calendar.');
      return;
    }
    try {
      await userApi.bookConsultation(token, { program, notes, slot_id: selectedSlot.id });
      flashMsg('Session booked! See it in My Bookings below.');
      setNotes('');
      setSelectedSlot(null);
      await load(token, () => false);
      loadSlots();
    } catch (e) {
      setErr(e.message);
    }
  };

  const profileCompletion = data.stats?.profileCompletion ?? 20;
  const careerLibraryStream = useMemo(
    () => profileStreamToFilter(data.profile?.stream),
    [data.profile?.stream]
  );

  const saveProfile = async (form, markComplete = true) => {
    setProfileSaving(true);
    setErr('');
    try {
      const payload = form.profile ? { ...form.profile, markComplete } : { ...form, markComplete };
      const name = form.name?.trim();
      const res = await userApi.updateProfile(token, name ? { ...payload, name } : payload);
      setData((prev) => ({
        ...prev,
        profile: res.profile,
        stats: { ...prev.stats, profileCompletion: res.profileCompletion },
      }));
      setShowProfileModal(false);
      flashMsg('Profile updated! Your completion score has been refreshed.');
      await refreshUser();
    } catch (e) {
      setErr(e.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const saveProfileWizard = async ({ profile: profilePatch, name }) => {
    await saveProfile({ ...profilePatch, name }, true);
  };

  const pendingPayment = data.assessments?.find((a) => canCancelAssessment(a));
  const paidAssessment = data.assessments?.find((a) => isAssessmentUnlocked(a))
    || data.careerPath?.activeAssessment;

  const goToProductAction = () => {
    const a = paidAssessment;
    const slug = a ? resolveAssessmentSlug(a) : data.careerPath?.productSlug;
    if (hasSkillMappingTests(slug)) goProcessGuides('tests');
    else goProcessGuides('process');
  };

  const goToCounsellingTopUp = () => goTab('assess', '&shop=counselling-topup');

  const openProgramPage = useCallback((assessmentOrSlug) => {
    const slug = typeof assessmentOrSlug === 'string'
      ? assessmentOrSlug
      : resolveAssessmentSlug(assessmentOrSlug);
    navigate(programPageForSlug(slug));
  }, [navigate]);

  const openModuleTest = useCallback((assessmentOrSlug) => {
    openPaidModule(assessmentOrSlug, 'test');
  }, [openPaidModule]);

  const goCheckout = useCallback(async (slug) => {
    if (!token || !slug) return;
    setErr('');
    try {
      const catalog = data.products?.length ? data.products : undefined;
      await startModuleCheckout({ token, slug, navigate, userApi, catalog });
    } catch (e) {
      setErr(e.message || 'Could not start checkout');
    }
  }, [token, navigate, data.products]);

  const counsellingProductSlug = slugForCounsellingFocus(counsellingFocus);
  const trainingProductSlug = slugForTrainingFocus(trainingFocus);
  const counsellingPaid = hasPaidAccessForSlug(data.assessments || [], counsellingProductSlug);
  const trainingPaid = hasPaidAccessForSlug(data.assessments || [], trainingProductSlug);

  const counsellingCareerPath = useMemo(
    () => buildProductCareerPath(data, counsellingProductSlug, {
      profileCompletion,
      profile: data.profile,
    }),
    [data, counsellingProductSlug, profileCompletion],
  );

  const trainingCareerPath = useMemo(
    () => buildProductCareerPath(data, trainingProductSlug, {
      profileCompletion,
      profile: data.profile,
    }),
    [data, trainingProductSlug, profileCompletion],
  );

  const counsellingReports = useMemo(() => {
    const slug = counsellingProductSlug;
    return (data.reports || []).filter((r) => !slug || r.product_slug === slug || r.product_title?.toLowerCase().includes(slug.split('-')[0]));
  }, [data.reports, counsellingProductSlug]);

  const counsellingSlots = useMemo(
    () => slots.filter((s) => !s.slot_type || s.slot_type === 'counselling'),
    [slots],
  );

  const programSessionSlots = useMemo(
    () => slots.filter((s) => s.slot_type === 'program_session'),
    [slots],
  );

  const bookAllProgramSessions = async ({ sessions, notes }) => {
    try {
      await userApi.bookConsultation(token, { sessions, notes, booking_type: 'program_session' });
      flashMsg('All 8 sessions booked successfully!');
      await load(token, () => false);
      loadSlots('program_session');
    } catch (e) {
      setErr(e.message);
      throw e;
    }
  };

  const bookingProps = {
    counsellingAccess,
    onBrowseModules: () => goTab('assess'),
    showTopUpOffer: canShowCounsellingTopUp(data.assessments || [], data.consultations || []),
    onTopUpBook: goToCounsellingTopUp,
    slots: counsellingSlots,
    slotsLoading,
    selectedSlot,
    onSelectSlot: setSelectedSlot,
    onMonthChange: () => loadSlots('counselling'),
    displayUser,
    program,
    onProgramChange: setProgram,
    notes,
    onNotesChange: setNotes,
    onSubmit: bookConsultation,
    programs,
    bookings: (data.consultations || []).filter((c) => c.status !== 'cancelled' && (!c.booking_type || c.booking_type === 'counselling')),
    t,
  };

  const programSessionBookings = (data.consultations || []).filter((c) => c.booking_type === 'program_session' && c.status !== 'cancelled');

  const sessionBookingProps = {
    slots: programSessionSlots,
    slotsLoading,
    bookings: programSessionBookings,
    onBookAll: bookAllProgramSessions,
    onMonthChange: () => loadSlots('program_session'),
  };

  const profilePanelProps = {
    displayUser,
    profile: data.profile,
    onProfileSave: saveProfileWizard,
    profileSaving,
  };

  const testSlugFor = (slug) => {
    if (slug === 'career-readiness') return 'dmit-psychometric';
    if (slug === 'brain' || slug === 'dmit') return 'dmit';
    if (slug === 'skill' || slug === 'psychometric') return 'psychometric';
    if (slug === 'combo') return 'dmit-psychometric';
    return slug || 'psychometric';
  };

  const makeJourneyCtx = (productSlug) => {
    const slug = productSlug || counsellingProductSlug;
    const testSlug = testSlugFor(slug);
    const assessment = findAssessmentForSlug(data.assessments || [], slug);
    const progress = assessment?.progress || {};
    return {
      hasReport: (data.reports || []).some((r) => r.report_link && (!r.product_slug || r.product_slug === slug || r.product_slug === testSlug)),
      hasBooking: (data.consultations || []).some((c) => c.status !== 'cancelled' && (!c.booking_type || c.booking_type === 'counselling')),
      counsellingDone: (data.consultations || []).some((c) => c.status === 'completed' || c.status === 'done'),
      profileComplete: profileCompletion >= 80 || !!data.profile?.setupComplete,
      sessionsBooked: programSessionBookings.length,
      sessionTarget: 8,
      communityJoined: !!progress.communityJoined,
      onProcess: () => openProgramPage(slug),
      onFingerprints: () => navigate('/dashboard/test/dmit'),
      onTakeTest: () => openModuleTest(slug),
      onReports: () => goTab('reports'),
    };
  };

  const activePanelTab = dashboardTabs.some((t) => t.id === tabParam) ? tabParam : dashboardTabs[0]?.id;

  if (loading) return <DashboardLoading />;

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role === 'counsellor') {
    return <Navigate to="/counsellor" replace />;
  }

  return (
    <DashboardShell variant="user" className="pt-16 pb-10">
      <ProfileOnboardingModal
        open={showProfileModal}
        initialProfile={{
          ...(data.profile || user?.profile),
          whatsappNumber: data.profile?.whatsappNumber || user?.phone || '',
        }}
        onSave={(form) => saveProfile(form, true)}
        onSkip={() => setShowProfileModal(false)}
        saving={profileSaving}
      />

      <div className="dash-b2b-page w-full max-w-none mx-0 px-0">
        <DashboardB2BBanner
          tag="Toolkit"
          title={`Hi, ${displayUser?.name?.trim() || 'Student'}`}
          subtitle="Your Dream Mantra dashboard"
          meta={displayUser?.email || displayUser?.phone || ''}
          dreamsUid={displayUser?.user_uid || welcomeUid}
          variant="user"
          toolkitTabs={dashboardTabs}
          activeTab={activePanelTab}
          onSelectTab={goTab}
          action={(
            <NotificationBell
              token={token}
              initialUnread={data.unreadNotifications || 0}
              onRefresh={refreshDashboard}
            />
          )}
        />

        {flashNotice && (
          <DashAlert type="success">
            <CheckCircle className="w-5 h-5 shrink-0" /> {flashNotice}
          </DashAlert>
        )}
        {err && (
          <DashAlert type="error" onRetry={() => load(token, () => false)}>
            <AlertCircle className="w-5 h-5 shrink-0" /> {err}
          </DashAlert>
        )}

        <div id="user-dashboard-anchor" className="scroll-mt-24">
        <DashboardSidebarLayout
            tabs={dashboardTabs}
            defaultTab={activePanelTab}
            id="user-dashboard"
            topbar
            hideNavigation
            hideMobileDeck
            hideSidebar
            hideMainHeader
            showProfileCompletion={false}
            user={displayUser}
            notifToken={token}
            notifUnread={data.unreadNotifications || 0}
            onNotifRefresh={refreshDashboard}
          >
            {(tab) => (
                <>
                  {tab === 'overview' && (
                    <DashboardOverview
                      data={data}
                      displayUser={displayUser}
                      profileCompletion={profileCompletion}
                      welcomeUid={welcomeUid}
                      counsellingAccess={counsellingAccess}
                      pendingPayment={pendingPayment}
                      paidAssessment={paidAssessment}
                      onCompleteProfile={openProfileModal}
                      onBookModule={() => goTab('assess')}
                      onPayment={() => pendingPayment && navigate(`/payment/${pendingPayment.id}`)}
                      onProcess={() => openProgramPage(paidAssessment || data.careerPath?.productSlug)}
                      onProductAction={() => openModuleTest(paidAssessment || data.careerPath?.productSlug)}
                      onOpenProgram={openProgramPage}
                      onOpenTest={openModuleTest}
                      onViewReports={() => goTab('reports')}
                      onBookCounselling={() => goTab('book')}
                      onGoTab={goTab}
                    />
                  )}

              {tab === 'careers' && (
                <Suspense fallback={<TabLoader />}>
                  <div className="dash-embed-host">
                    <CareerLibraryExplorer embedded />
                  </div>
                </Suspense>
              )}

              {tab === 'support' && <SupportStudio token={token} />}

              {tab === 'book' && (
                <CounsellingBookingPanel {...bookingProps} />
              )}

              {tab === 'assess' && (
                <ModulesPanel
                  token={token}
                  assessments={data.assessments || []}
                  payments={data.payments || []}
                  consultations={data.consultations || []}
                  profile={data.profile}
                  user={displayUser}
                  onError={setErr}
                  onSuccess={flashMsg}
                  onRefresh={refreshDashboard}
                  onGoProcessGuides={goProcessGuides}
                  onGoTakeTest={goToTakeTest}
                  onOpenModule={openPaidModule}
                  initialHubView={new URLSearchParams(location.search).get('hub') || undefined}
                />
              )}

              {tab === 'counselling' && (
                  <div className="space-y-3">
                    <div className="dash-product-path-rail dash-product-path-rail--inline dash-product-path-rail--center dash-product-path-rail--lg" role="tablist" aria-label="Counselling paths">
                      {COUNSELLING_PATHS.map((item) => {
                        const pathPaid = hasPaidAccessForSlug(data.assessments || [], item.slug);
                        return (
                        <button
                          key={item.id}
                          type="button"
                          role="tab"
                          aria-selected={counsellingFocus === item.id}
                          className={`dash-product-path-rail__chip${counsellingFocus === item.id ? ' dash-product-path-rail__chip--active' : ''}${!pathPaid ? ' dash-product-path-rail__chip--locked' : ''}`}
                          onClick={() => { setCounsellingFocus(item.id); setCounsellingSubtab(null); }}
                        >
                          {item.label}{!pathPaid ? ' 🔒' : ''}
                        </button>
                        );
                      })}
                    </div>
                    <CounsellingProductPanel
                      focus={counsellingFocus}
                      paid={counsellingPaid}
                      subtab={counsellingSubtab}
                      onSubtab={setCounsellingSubtab}
                      careerPath={counsellingCareerPath}
                      journeyCtx={makeJourneyCtx(counsellingProductSlug)}
                      reports={counsellingReports}
                      bookingProps={bookingProps}
                      onBook={() => goCheckout(counsellingProductSlug)}
                      {...profilePanelProps}
                      token={token}
                      onTestProgressSaved={refreshDashboard}
                    />
                  </div>
              )}

              {tab === 'training' && (
                <div className="dash-panel-clean space-y-3">
                  <div className="dash-product-path-rail dash-product-path-rail--inline dash-product-path-rail--center dash-product-path-rail--lg" role="tablist">
                    {TRAINING_PATHS.map((item) => {
                      const pathPaid = hasPaidAccessForSlug(data.assessments || [], item.slug);
                      return (
                      <button
                        key={item.id}
                        type="button"
                        className={`dash-product-path-rail__chip${trainingFocus === item.id ? ' dash-product-path-rail__chip--active' : ''}${!pathPaid ? ' dash-product-path-rail__chip--locked' : ''}`}
                        onClick={() => { setTrainingFocus(item.id); setTrainingSubtab(null); }}
                      >
                        {item.label}{!pathPaid ? ' 🔒' : ''}
                      </button>
                      );
                    })}
                  </div>
                  <TrainingProductPanel
                    focus={trainingFocus}
                    paid={trainingPaid}
                    subtab={trainingSubtab}
                    onSubtab={setTrainingSubtab}
                    careerPath={trainingCareerPath}
                    journeyCtx={makeJourneyCtx(trainingProductSlug)}
                    bookingProps={bookingProps}
                    resourcesPanel={<TrainingResourcesPanel token={token} resources={data.resources} />}
                    cvPanel={<CVMakerPanel />}
                    onBook={() => goCheckout(trainingProductSlug)}
                    communityLink={data.communityLink}
                    sessionBookingProps={sessionBookingProps}
                    token={token}
                    onCommunityJoined={refreshDashboard}
                    {...profilePanelProps}
                  />
                </div>
              )}

              {tab === 'reports' && (
                <div className="space-y-4 w-full max-w-none">
                  <DashCard className="!p-6 sm:!p-8" glow={false} hover={false}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                        <FileText className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold dash-card-title">My Reports</h2>
                        <p className="dash-card-meta mt-1 text-sm max-w-xl">
                          Personalised Brain Mapping, Skill Mapping and assessment reports — published here after counsellor review.
                        </p>
                        <p className="mt-2 text-sm font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 rounded-lg px-3 py-2 max-w-xl">
                          Note: Kindly download your report within 10 days of upload. Reports may be removed from the dashboard after this period.
                        </p>
                      </div>
                      <button type="button" onClick={refreshDashboard} className="btn-outline !py-2 !px-4 text-sm shrink-0">
                        Refresh
                      </button>
                    </div>
                  </DashCard>

                  {(data.reports || []).length === 0 ? (
                    <DashCard className="!p-10 text-center" glow={false} hover={false}>
                      <div className="w-16 h-16 rounded-full bg-sand-100 dark:bg-sand-800/50 flex items-center justify-center mx-auto mb-4">
                        <Download className="w-8 h-8 text-amber-600 opacity-60" />
                      </div>
                      <p className="font-semibold text-lg dash-card-title">No reports published yet</p>
                      <p className="text-sm dash-card-meta mt-2 max-w-md mx-auto">
                        Complete your module process and tests. Our counsellors will upload your report here — you will get a notification when it is ready.
                      </p>
                      <div className="flex flex-wrap justify-center gap-3 mt-6">
                        <button type="button" onClick={() => goTab('assess')} className="btn-primary">Book Now</button>
                        <button type="button" onClick={() => goProcessGuides('process')} className="btn-outline">View process</button>
                      </div>
                    </DashCard>
                  ) : (
                    <div className="grid gap-3">
                      {(data.reports || []).map((r, i) => (
                        <DashCard key={r.id} glow delay={i * 0.06} className="!p-0 overflow-hidden">
                          <div className="flex flex-col sm:flex-row">
                            <div className="sm:w-2 bg-gradient-to-b from-amber-500 to-orange-600 shrink-0" aria-hidden="true" />
                            <div className="flex-1 p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <span className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                                    {r.product_title || 'Assessment'}
                                  </span>
                                  {r.report_link ? (
                                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                      <CheckCircle className="w-3.5 h-3.5" /> Ready to view
                                    </span>
                                  ) : (
                                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">Being prepared</span>
                                  )}
                                </div>
                                <h3 className="font-bold text-lg dash-card-title">{r.report_title || 'Your Report'}</h3>
                                <p className="text-xs dash-card-meta mt-1">
                                  Updated {new Date(r.updated_at || r.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                </p>
                                {r.admin_notes && (
                                  <p className="text-sm mt-3 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/50 dash-card-meta leading-relaxed">
                                    {r.admin_notes}
                                  </p>
                                )}
                              </div>
                              {r.report_link ? (
                                <a
                                  href={r.report_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-primary flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto"
                                >
                                  <ExternalLink className="w-4 h-4" /> View Report
                                </a>
                              ) : (
                                <span className="text-sm dash-card-meta shrink-0 px-4 py-2 rounded-xl bg-sand-100 dark:bg-sand-800/50">
                                  Report being prepared…
                                </span>
                              )}
                            </div>
                          </div>
                        </DashCard>
                      ))}
                    </div>
                  )}

                  {paidAssessment && !data.reports?.length && (
                    <DashCard className="!p-5 border-amber-200/50" glow={false} hover={false}>
                      <p className="text-sm dash-card-meta">
                        <span className="font-semibold text-theme-primary">Module active:</span>{' '}
                        {paidAssessment.progress?.selection?.displayTitle || paidAssessment.type} — your report will appear here once our team publishes it.
                      </p>
                    </DashCard>
                  )}
                </div>
              )}
            </>
            )}
          </DashboardSidebarLayout>
        </div>
      </div>
    </DashboardShell>
  );
}
