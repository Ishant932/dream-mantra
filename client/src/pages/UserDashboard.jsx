import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, FlaskConical, User, CheckCircle, Award, Briefcase,
  Sparkles, AlertCircle, ExternalLink, BookOpen,
  FileText, Download,
} from 'lucide-react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { userApi } from '../api';
import { programs } from '../data/content';
import ModulesPanel from '../components/ModulesPanel';
import DashboardSidebarLayout from '../components/DashboardSidebarLayout';
import { lazyWithRetry } from '../utils/lazyWithRetry';
import SecuritySettings from '../components/SecuritySettings';
import ProfileOnboardingModal from '../components/ProfileOnboardingModal';
import ProfileDetailsCard from '../components/ProfileDetailsCard';
import NotificationBell from '../components/NotificationBell';
import { profileStreamToFilter } from '../utils/careerStreams';
import DashboardOverview from '../components/DashboardOverview';
import CounsellingBookingPanel from '../components/CounsellingBookingPanel';
import ProcessQuestionnairesPanel from '../components/ProcessQuestionnairesPanel';
import {
  canShowProcessTab,
  canShowCounsellingTopUp,
  hasCounsellingAccess,
  isAssessmentUnlocked,
  resolveAssessmentSlug,
} from '../utils/moduleAccess';
import { canCancelAssessment } from '../utils/assessmentHelpers';
import { getDashboardNextStep, NEXT_STEP_ACTIONS } from '../utils/dashboardNextStep';
import { hasSkillMappingTests } from '../data/moduleCatalog';
import { prefetchCareers } from '../utils/loadCareers';

const CareerLibraryExplorer = lazyWithRetry(() => import('../components/CareerLibraryExplorer'));

function TabLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-10 h-10 border-3 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
    </div>
  );
}
import {
  DashboardShell,
  DashboardLoading,
  DashSection,
  DashCard,
  DashAlert,
} from '../components/DashboardUI';
import DashboardB2BBanner from '../components/DashboardB2BBanner';
import { UserMessagesPanel } from '../components/MessagesPanel';

const toolkitIcons = [BookOpen, FlaskConical, Calendar];
const toolkitTabs = ['careers', 'assess', 'book'];
const toolkitLinks = ['/careers', null, null];

export default function UserDashboard() {
  const { user, token, refreshUser } = useAuth();
  const { t, d } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const tabParam = new URLSearchParams(location.search).get('tab') || 'overview';

  useEffect(() => {
    if (tabParam === 'ai') {
      navigate({ pathname: location.pathname, search: '?tab=overview' }, { replace: true });
    }
  }, [tabParam, navigate, location.pathname]);
  const welcomeUid = location.state?.welcomeUid;
  const [data, setData] = useState({ consultations: [], assessments: [], stats: {} });
  const [program, setProgram] = useState('Class 9-10');
  const [notes, setNotes] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const counsellingAccess = useMemo(
    () => data.counsellingAccess === true || hasCounsellingAccess(data.assessments || []),
    [data.counsellingAccess, data.assessments]
  );

  const dashboardTabs = useMemo(() => {
    const tabs = Array.isArray(d('data.dashboardTabs')) ? d('data.dashboardTabs') : [];
    return tabs.map((tab) => {
      if (tab.id === 'process-guides' && !canShowProcessTab(data.assessments)) {
        return { ...tab, locked: true, desc: 'Purchase & confirm a module to unlock' };
      }
      if (tab.id === 'book' && !counsellingAccess) {
        return { ...tab, locked: true, desc: 'Unlock with a counselling module' };
      }
      return tab;
    });
  }, [d, data.assessments, counsellingAccess]);

  const toolkit = useMemo(() => {
    const services = Array.isArray(d('data.toolkitServices')) ? d('data.toolkitServices') : [];
    return services.map((item, i) => ({
      icon: toolkitIcons[i],
      title: item.title,
      desc: item.desc,
      link: toolkitLinks[i],
      tab: toolkitTabs[i],
      locked: toolkitTabs[i] === 'book' && !counsellingAccess,
    }));
  }, [d, counsellingAccess]);

  const loadSlots = useCallback(async () => {
    if (!token) return;
    setSlotsLoading(true);
    try {
      const from = new Date();
      from.setDate(1);
      const to = new Date(from);
      to.setMonth(to.getMonth() + 2);
      const data = await userApi.availableSlots(token, { from: from.toISOString(), to: to.toISOString() });
      setSlots(data.slots || []);
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
      navigate({ pathname: '/dashboard', search: '?tab=assess' }, { replace: true });
      return;
    }
    if (tabParam !== 'book') {
      navigate({ pathname: '/dashboard', search: `?tab=book&slot_id=${slotId}` }, { replace: true });
      return;
    }
    loadSlots();
  }, [location.search, tabParam, navigate, loadSlots, counsellingAccess, loading]);

  useEffect(() => {
    if (tabParam === 'book' && counsellingAccess) loadSlots();
  }, [tabParam, loadSlots, counsellingAccess]);

  useEffect(() => {
    const slotId = new URLSearchParams(location.search).get('slot_id');
    if (!slotId || !slots.length || !counsellingAccess) return;
    const match = slots.find((s) => String(s.id) === String(slotId));
    if (match) setSelectedSlot(match);
  }, [location.search, slots, counsellingAccess]);

  const goTab = (tabId, extraSearch = '') => {
    navigate({ pathname: '/dashboard', search: `?tab=${tabId}${extraSearch}` });
  };

  const openProfileModal = () => setShowProfileModal(true);

  const goProcessGuides = (section = 'process') => {
    goTab('process-guides', section === 'tests' ? '&section=tests&open=1' : '&section=process');
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
      setMsg('Session booked! See it in My Bookings below.');
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
      const res = await userApi.updateProfile(token, { ...form, markComplete });
      setData((prev) => ({
        ...prev,
        profile: res.profile,
        stats: { ...prev.stats, profileCompletion: res.profileCompletion },
      }));
      setShowProfileModal(false);
      setMsg('Profile updated! Your completion score has been refreshed.');
      await refreshUser();
    } catch (e) {
      setErr(e.message);
    } finally {
      setProfileSaving(false);
    }
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

  const nextStep = useMemo(() => {
    const step = getDashboardNextStep({
      profileCompletion,
      pendingPayment,
      assessments: data.assessments,
      paidAssessment,
      counsellingAccess,
      consultations: data.consultations,
    });
    const handlers = {
      [NEXT_STEP_ACTIONS.PROFILE]: openProfileModal,
      [NEXT_STEP_ACTIONS.PAYMENT]: () => pendingPayment && navigate(`/payment/${pendingPayment.id}`),
      [NEXT_STEP_ACTIONS.MODULES]: () => goTab('assess'),
      [NEXT_STEP_ACTIONS.PROCESS]: goToProductAction,
      [NEXT_STEP_ACTIONS.BOOK]: () => goTab('book'),
    };
    return {
      ...step,
      onClick: handlers[step.action] || openProfileModal,
    };
  }, [
    profileCompletion,
    pendingPayment,
    data.assessments,
    data.consultations,
    paidAssessment,
    counsellingAccess,
    navigate,
  ]);

  const stats = [
    { label: 'Profile', value: `${profileCompletion}%`, icon: User },
    { label: t('dashboard.modules'), value: data.stats?.assessments ?? 0, icon: FlaskConical },
    { label: 'Consultations', value: data.stats?.consultations ?? 0, icon: Calendar },
    { label: 'Career Options', value: '950+', icon: Briefcase },
  ];

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
          tag="Your Career Toolkit"
          title={`Welcome, ${displayUser?.name?.split(' ')[0] || 'Student'}`}
          subtitle={displayUser?.email || displayUser?.phone || 'Dream Mantra student dashboard'}
          variant="user"
          action={(
            <NotificationBell
              token={token}
              initialUnread={data.unreadNotifications || 0}
              onRefresh={refreshDashboard}
            />
          )}
          nextStep={nextStep}
        />

        {msg && (
          <DashAlert type="success">
            <CheckCircle className="w-5 h-5 shrink-0" /> {msg}
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
            defaultTab={tabParam}
            id="user-dashboard"
            user={displayUser}
            profileCompletion={profileCompletion}
            sectionTitle="My Dashboard"
            notifToken={token}
            notifUnread={data.unreadNotifications || 0}
            onNotifRefresh={refreshDashboard}
            nextStep={nextStep}
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
                      onProcess={() => goTab('process-guides')}
                      onProductAction={goToProductAction}
                      onViewReports={() => goTab('reports')}
                      onBookCounselling={() => goTab('book')}
                      onGoTab={goTab}
                    />
                  )}

              {tab === 'careers' && (
                <Suspense fallback={<TabLoader />}>
                  <CareerLibraryExplorer
                    embedded
                    showHeader={false}
                    initialStream={careerLibraryStream}
                  />
                </Suspense>
              )}

              {tab === 'security' && (
                <div>
                  <SecuritySettings />
                </div>
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
                  onSuccess={setMsg}
                  onRefresh={refreshDashboard}
                  onGoProcessGuides={goProcessGuides}
                  onGoTakeTest={goToTakeTest}
                />
              )}

              {tab === 'book' && (
                !counsellingAccess ? (
                  <DashCard className="!p-8 text-center" glow={false} hover={false}>
                    <Calendar className="w-12 h-12 text-amber-500 mx-auto mb-4 opacity-80" />
                    <h3 className="font-bold text-lg mb-2">Book Session — locked</h3>
                    <p className="text-sm opacity-70 mb-4 max-w-md mx-auto">
                      Purchase Mind Mapping, Skill Mapping, Combo or CRP with counselling access, then return here to pick a slot.
                    </p>
                    <button type="button" className="btn-primary" onClick={() => goTab('assess')}>Browse modules</button>
                  </DashCard>
                ) : (
                <CounsellingBookingPanel
                  counsellingAccess={counsellingAccess}
                  onBrowseModules={() => goTab('assess')}
                  showTopUpOffer={canShowCounsellingTopUp(data.assessments || [], data.consultations || [])}
                  onTopUpBook={goToCounsellingTopUp}
                  slots={slots}
                  slotsLoading={slotsLoading}
                  selectedSlot={selectedSlot}
                  onSelectSlot={setSelectedSlot}
                  onMonthChange={loadSlots}
                  displayUser={displayUser}
                  program={program}
                  onProgramChange={setProgram}
                  notes={notes}
                  onNotesChange={setNotes}
                  onSubmit={bookConsultation}
                  programs={programs}
                  bookings={(data.consultations || []).filter((c) => c.status !== 'cancelled')}
                  t={t}
                />
                )
              )}

              {tab === 'process-guides' && (
                !canShowProcessTab(data.assessments) ? (
                  <DashCard className="!p-8 text-center" glow={false} hover={false}>
                    <FlaskConical className="w-12 h-12 text-amber-500 mx-auto mb-4 opacity-80" />
                    <h3 className="font-bold text-lg mb-2">Process &amp; Take test — locked</h3>
                    <p className="text-sm opacity-70 mb-4 max-w-md mx-auto">
                      Buy and confirm payment for a module first. Then process guides, questionnaires and tests appear here.
                    </p>
                    <button type="button" className="btn-primary" onClick={() => goTab('assess')}>Go to modules</button>
                  </DashCard>
                ) : (
                <ProcessQuestionnairesPanel
                  assessments={data.assessments || []}
                  profile={data.profile}
                  user={displayUser}
                  communityLink={data.communityLink}
                  onRefresh={refreshDashboard}
                />
                )
              )}
              
              {tab === 'messages' && (
                <UserMessagesPanel token={token} />
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
                          Personalised Mind Mapping, Skill Mapping and assessment reports — published here after counsellor review.
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
                        <button type="button" onClick={() => goTab('assess')} className="btn-primary">Go to Modules</button>
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

        <DashSection title={t('dashboard.navigation')} icon={Sparkles} className="mt-6 dash-b2b-toolkit">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {toolkit.map((item, i) => (
              <motion.button
                key={item.title}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (item.locked) goTab('assess');
                  else if (item.link) navigate(item.link);
                  else goTab(item.tab);
                }}
                className={`dash-card dash-card-glow text-left group !p-6 ${item.locked ? 'opacity-75' : ''}`}
              >
                <motion.span
                  className="inline-flex mb-3"
                  whileHover={{ rotate: 8, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <item.icon className="w-10 h-10 text-amber-600" />
                </motion.span>
                <h3 className="font-bold dash-card-title">{item.title}</h3>
                <p className="text-xs dash-card-meta mt-2">
                  {item.locked ? 'Unlock with a counselling module purchase' : item.desc}
                </p>
              </motion.button>
            ))}
          </div>
        </DashSection>
      </div>
    </DashboardShell>
  );
}
