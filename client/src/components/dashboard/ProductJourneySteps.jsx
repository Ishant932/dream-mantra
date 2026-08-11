import { motion } from 'framer-motion';
import { CheckCircle2, Lock, ChevronRight, Fingerprint, ClipboardList, Calendar, FileText, Phone, Sparkles, UserCircle, Users, BookOpen, Layers, PenLine, MessageCircle } from 'lucide-react';

const ICONS = {
  enrol: Sparkles, team_connect: Phone, profile: UserCircle, fingerprints: Fingerprint,
  process: ClipboardList, take_test: ClipboardList, book_counselling: Calendar,
  counselling_done: CheckCircle2, additional_counselling: MessageCircle, reports: FileText,
  community: Users, schedule: Calendar, resources: BookOpen, details: Layers, cv: PenLine,
};

const CONFIG = {
  brain: ['enrol', 'team_connect', 'profile', 'fingerprints', 'book_counselling', 'counselling_done', 'additional_counselling', 'reports'],
  skill: ['enrol', 'team_connect', 'profile', 'take_test', 'reports'],
  combo: ['enrol', 'team_connect', 'profile', 'fingerprints', 'take_test', 'book_counselling', 'counselling_done', 'additional_counselling', 'reports'],
  launchpad: ['enrol', 'team_connect', 'community', 'resources', 'cv'],
  readiness: ['enrol', 'team_connect', 'schedule', 'resources', 'cv'],
};

const LABELS = {
  enrol: 'Enrol & pay', team_connect: 'Dream Team connects with you', profile: 'Complete your profile',
  fingerprints: 'Give fingerprints (Brain Mapping)', take_test: 'Take Skill Mapping tests',
  book_counselling: 'Book counselling session', counselling_done: 'Counselling session',
  additional_counselling: 'Additional counselling', reports: 'View your report',
  community: 'Join community', schedule: 'Schedule all 8 sessions', resources: 'Access resources', cv: 'Build your CV',
};

const HINTS = {
  team_connect: 'Our counsellor team will call/WhatsApp you within 24–48 hours after payment.',
  schedule: 'Pick date & time for each session — Session 1 first, then 2…8 in order.',
  profile: 'Fill every step so counsellors and admin see your full details.',
  additional_counselling: 'Purchase an additional counselling session (₹999), then book your follow-up slot.',
};

function filterJourneySteps(focus, includesCounselling, showAdditionalCounselling) {
  let ids = [...(CONFIG[focus] || CONFIG.brain)];
  if (focus === 'skill' && includesCounselling) {
    const base = ids.filter((id) => id !== 'reports');
    ids = [
      ...base,
      'book_counselling',
      'counselling_done',
      ...(showAdditionalCounselling ? ['additional_counselling'] : []),
      'reports',
    ];
  }
  if (!includesCounselling) {
    return ids.filter((id) => !['book_counselling', 'counselling_done', 'additional_counselling'].includes(id));
  }
  if (!showAdditionalCounselling) {
    ids = ids.filter((id) => id !== 'additional_counselling');
  }
  return ids;
}

function stepLabel(id, done, ctx) {
  if (id === 'counselling_done' && done) return 'Session completed';
  if (id === 'book_counselling' && ctx.hasBooking && !ctx.counsellingDone) return 'Counselling booked';
  return LABELS[id];
}

function stepDone(id, ctx) {
  const { paid, progress, hasReport, hasBooking, counsellingDone, profileComplete, sessionsBooked, sessionTarget, additionalCounsellingBooked } = ctx;
  if (!paid) return id === 'enrol' ? false : false;
  if (id === 'enrol') return paid;
  if (id === 'team_connect') return paid;
  if (id === 'profile') return profileComplete || !!progress.profileComplete;
  if (id === 'fingerprints') return !!progress.fingerprintDone;
  if (id === 'take_test') {
    const tests = progress.skillTestProgress;
    if (tests && typeof tests === 'object') {
      const vals = Object.values(tests);
      if (vals.length && vals.every((t) => t?.status === 'completed')) return true;
    }
    return progress.step === 'complete' || !!progress.completedAt || !!progress.testsDone;
  }
  if (id === 'book_counselling') return hasBooking;
  if (id === 'counselling_done') return counsellingDone;
  if (id === 'additional_counselling') return !!additionalCounsellingBooked;
  if (id === 'reports') return hasReport;
  if (id === 'schedule') return sessionsBooked >= (sessionTarget || 8);
  if (id === 'community') return !!ctx.communityJoined;
  if (id === 'resources' || id === 'cv') return false;
  return false;
}

const ACTIONS = {
  profile: 'onProfile', fingerprints: 'onFingerprints', take_test: 'onTakeTest',
  book_counselling: 'onBookCounselling', additional_counselling: 'onAdditionalCounselling',
  reports: 'onReports', community: 'onCommunity',
  schedule: 'onSchedule', resources: 'onResources', cv: 'onCv',
};

export default function ProductJourneySteps(props) {
  const {
    focus, paid, progress = {}, includesCounselling = true, showAdditionalCounselling = false,
  } = props;
  const ids = filterJourneySteps(focus, includesCounselling, showAdditionalCounselling);
  const ctx = { paid, progress, ...props };
  const doneCount = ids.filter((id) => stepDone(id, ctx)).length;
  const pct = ids.length ? Math.round((doneCount / ids.length) * 100) : 0;
  const nextIdx = ids.findIndex((id) => !stepDone(id, ctx));

  return (
    <div className="dash-journey-crazy">
      <div className="dash-journey-crazy__glow" aria-hidden />
      <div className="dash-journey-crazy__head">
        <div>
          <span className="dash-journey-crazy__badge"><Sparkles className="w-3.5 h-3.5" /> Your Journey</span>
          <div className="dash-journey-crazy__track"><motion.div className="dash-journey-crazy__track-fill" animate={{ width: `${pct}%` }} /></div>
        </div>
        <span className="dash-journey-crazy__pct">{pct}%</span>
      </div>
      <ol className="dash-journey-crazy__list">
        {ids.map((id, i) => {
          const done = stepDone(id, ctx);
          const isNext = i === nextIdx && paid;
          const locked = !paid && id !== 'enrol';
          const Icon = ICONS[id] || FileText;
          const actionKey = ACTIONS[id];
          const action = !locked && !done && paid && actionKey ? props[actionKey] : null;
          const showBookNow = id === 'additional_counselling' && ctx.counsellingDone && !done && paid && action;
          const label = stepLabel(id, done, ctx);
          return (
            <motion.li key={id} className={`dash-journey-crazy__step${done ? ' is-done' : ''}${isNext ? ' is-next' : ''}${locked ? ' is-locked' : ''}`}
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <span className="dash-journey-crazy__node">{done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}</span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm flex items-center gap-1">{label}{locked && <Lock className="w-3 h-3 opacity-50" />}</p>
                {done && id === 'counselling_done' && (
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold mt-0.5">Session completed</p>
                )}
                {HINTS[id] && paid && !done && <p className="text-xs dash-card-meta mt-1">{HINTS[id]}</p>}
                {showBookNow && (
                  <button type="button" className="dash-journey-crazy__btn" onClick={action}>Book now <ChevronRight className="w-3.5 h-3.5" /></button>
                )}
                {action && !showBookNow && id !== 'additional_counselling' && !done && (
                  <button type="button" className="dash-journey-crazy__btn" onClick={action}>Continue <ChevronRight className="w-3.5 h-3.5" /></button>
                )}
                {id === 'additional_counselling' && !ctx.counsellingDone && paid && includesCounselling && (
                  <p className="text-xs dash-card-meta mt-1">Unlocks after your first counselling session is complete.</p>
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
