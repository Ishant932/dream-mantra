import { motion } from 'framer-motion';
import {
  User, FlaskConical, Calendar, Briefcase, Play,
  BookOpen, Brain, Lock, Sparkles, ArrowRight, CheckCircle2, Clock,
} from 'lucide-react';
import { DashCard } from './DashboardUI';
import CopyableUserId from './CopyableUserId';
import JourneyProgressBox from './JourneyProgressBox';
import WelcomeOfferBanner from './WelcomeOfferBanner';
import ProfileDetailsCard from './ProfileDetailsCard';
import { dedupeAssessmentsBySlug, getAssessmentDisplayTitle } from '../utils/assessmentHelpers';
import { getConfirmedPaidAssessments, isAssessmentUnlocked } from '../utils/moduleAccess';

function QuickStat({ icon: Icon, label, value, accent }) {
  return (
    <div className={`dash-overview-stat dash-overview-stat--${accent}`}>
      <Icon className="w-5 h-5 shrink-0 opacity-90" />
      <div>
        <p className="dash-overview-stat__value">{value}</p>
        <p className="dash-overview-stat__label">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardOverview({
  data,
  displayUser,
  profileCompletion,
  welcomeUid,
  counsellingAccess,
  onCompleteProfile,
  onBookModule,
  onPayment,
  onProcess,
  onProductAction,
  onViewReports,
  onBookCounselling,
  onGoTab,
  pendingPayment,
  paidAssessment,
}) {
  const activeModules = getConfirmedPaidAssessments(data.assessments || []);
  const upcomingBookings = (data.consultations || []).filter(
    (c) => c.status !== 'cancelled' && c.scheduled_at && new Date(c.scheduled_at) > new Date()
  );

  let nextAction = {
    title: 'Complete your profile',
    desc: 'Add class, stream, and goals so we can personalise your journey.',
    cta: 'Complete profile',
    onClick: onCompleteProfile,
  };

  if (profileCompletion >= 60 && pendingPayment && pendingPayment.payment_confirmed !== true) {
    nextAction = {
      title: 'Finish payment',
      desc: `Complete checkout for ${getAssessmentDisplayTitle(pendingPayment)}.`,
      cta: 'Pay now',
      onClick: onPayment,
    };
  } else if (profileCompletion >= 60 && !activeModules.length) {
    nextAction = {
      title: 'Choose your first module',
      desc: 'Mind Mapping, Skill Mapping, or the full combo — start your assessment journey.',
      cta: 'Browse modules',
      onClick: onBookModule,
    };
  } else if (paidAssessment) {
    nextAction = {
      title: 'Continue your assessment',
      desc: 'Follow the process steps or take your skill mapping tests.',
      cta: 'Process & Take test',
      onClick: onProcess,
    };
  } else if (counsellingAccess && !upcomingBookings.length) {
    nextAction = {
      title: 'Book your counselling session',
      desc: 'Your counselling add-on is active — pick a slot with our certified counsellor.',
      cta: 'Book session',
      onClick: onBookCounselling,
    };
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {welcomeUid && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-200/70"
        >
          <p className="font-bold text-amber-900 dark:text-amber-100 mb-1">Welcome! Your account is ready.</p>
          <p className="text-sm text-sand-600 dark:text-sand-400 mb-3">Save your Unique ID for support and forms.</p>
          <CopyableUserId uid={welcomeUid} />
        </motion.div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <QuickStat icon={User} label="Profile" value={`${profileCompletion}%`} accent="gold" />
        <QuickStat icon={FlaskConical} label="Active modules" value={activeModules.length} accent="orange" />
        <QuickStat
          icon={Calendar}
          label="Counselling"
          value={counsellingAccess ? (upcomingBookings.length ? 'Booked' : 'Unlocked') : 'Locked'}
          accent={counsellingAccess ? 'green' : 'muted'}
        />
        <QuickStat icon={Briefcase} label="Careers" value="950+" accent="blue" />
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="dash-overview-next">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-1">Recommended next step</p>
            <h3 className="font-bold text-lg dash-card-title">{nextAction.title}</h3>
            <p className="text-sm dash-card-meta mt-1 max-w-xl">{nextAction.desc}</p>
          </div>
          <button type="button" onClick={nextAction.onClick} className="btn-primary shrink-0 inline-flex items-center gap-2">
            {nextAction.cta} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-4">
        <button type="button" onClick={() => onGoTab('careers')} className="dash-overview-quick">
          <BookOpen className="w-6 h-6 text-amber-600" />
          <span className="font-bold text-sm">Career Library</span>
        </button>
        <button type="button" onClick={() => onGoTab('ai')} className="dash-overview-quick">
          <Brain className="w-6 h-6 text-amber-600" />
          <span className="font-bold text-sm">AI Corner</span>
        </button>
        <button type="button" onClick={() => onGoTab('assess')} className="dash-overview-quick">
          <FlaskConical className="w-6 h-6 text-amber-600" />
          <span className="font-bold text-sm">Modules & Orders</span>
        </button>
      </div>

      <JourneyProgressBox
        careerPath={data.careerPath}
        showCounsellingStep={counsellingAccess}
        onCompleteProfile={onCompleteProfile}
        onBookModule={onBookModule}
        onPayment={onPayment}
        onProcess={onProcess}
        onProductAction={onProductAction}
        onViewReports={onViewReports}
        onBookCounselling={counsellingAccess ? onBookCounselling : onBookModule}
      />

      {!counsellingAccess && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <DashCard className="!p-5 border-amber-200/60" glow={false} hover={false}>
          <div className="flex gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-amber-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm">Counselling sessions are locked</h3>
              <p className="text-sm dash-card-meta mt-1">
                Book 1-on-1 sessions after you purchase a module with counselling — add the counselling add-on at checkout, or choose Mind Mapping + Skill Mapping (counselling included).
              </p>
              <button type="button" onClick={onBookModule} className="btn-primary mt-3 !py-2 !px-4 text-sm">
                Browse modules with counselling
              </button>
            </div>
            </div>
          </DashCard>
        </motion.div>
      )}

      {counsellingAccess && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl border border-emerald-200/60 bg-emerald-50/60 dark:bg-emerald-950/20 flex items-center gap-3"
        >
          <Calendar className="w-5 h-5 text-emerald-700 dark:text-emerald-300 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-emerald-900 dark:text-emerald-100">Counselling booking unlocked</p>
            <p className="text-xs text-emerald-800 dark:text-emerald-200/90 mt-0.5">Pick your slot from the Book tab anytime.</p>
          </div>
          <button type="button" onClick={onBookCounselling} className="btn-primary !py-2 !px-4 text-sm shrink-0">
            Book now
          </button>
        </motion.div>
      )}

      <WelcomeOfferBanner compact />

      <ProfileDetailsCard
        user={displayUser}
        profile={data.profile}
        profileCompletion={profileCompletion}
        onEdit={onCompleteProfile}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <DashCard glow={false} hover={false} className="!p-5">
          <h3 className="font-bold mb-3 flex items-center gap-2 dash-card-title">
            <FlaskConical className="w-5 h-5 text-amber-600" /> Your modules
          </h3>
          {activeModules.length === 0 ? (
            <p className="text-sm dash-card-meta">No active modules yet.</p>
          ) : (
            <ul className="space-y-2">
              {dedupeAssessmentsBySlug(activeModules).slice(0, 3).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2 text-sm p-2 rounded-lg bg-sand-50 dark:bg-sand-800/50">
                  <span className="font-medium">{getAssessmentDisplayTitle(a)}</span>
                  <button type="button" onClick={onProcess} className="text-xs font-semibold text-amber-600 inline-flex items-center gap-1">
                    <Play className="w-3 h-3" /> Process
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button type="button" onClick={onBookModule} className="text-sm font-semibold text-amber-600 mt-3 inline-flex items-center gap-1">
            Manage all modules <ArrowRight className="w-4 h-4" />
          </button>
        </DashCard>

        <DashCard glow={false} hover={false} className="!p-5">
          <h3 className="font-bold mb-3 flex items-center gap-2 dash-card-title">
            <Clock className="w-5 h-5 text-amber-600" /> Recent activity
          </h3>
          <ul className="space-y-2 text-sm">
            {(data.consultations || []).slice(0, 2).map((c) => (
              <li key={`c-${c.id}`} className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="dash-card-meta">
                  Session · {c.status}
                  {c.scheduled_at && ` · ${new Date(c.scheduled_at).toLocaleDateString('en-IN')}`}
                </span>
              </li>
            ))}
            {(data.assessments || []).slice(0, 2).map((a) => (
              <li key={`a-${a.id}`} className="flex gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="dash-card-meta">
                  {getAssessmentDisplayTitle(a)} · {isAssessmentUnlocked(a) ? 'Active' : 'Pending payment'}
                </span>
              </li>
            ))}
            {!data.consultations?.length && !data.assessments?.length && (
              <li className="dash-card-meta">Activity appears here as you purchase modules and book sessions.</li>
            )}
          </ul>
        </DashCard>
      </div>
    </div>
  );
}
