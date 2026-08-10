import { motion } from 'framer-motion';
import { CheckCircle2, Lock, ChevronRight, Fingerprint, ClipboardList, Calendar, FileText, Phone, Sparkles } from 'lucide-react';

const ICONS = {
  team_connect: Phone,
  process: ClipboardList,
  fingerprints: Fingerprint,
  take_test: ClipboardList,
  book_counselling: Calendar,
  counselling_done: CheckCircle2,
  reports: FileText,
};

const CONFIG = {
  brain: ['team_connect', 'fingerprints', 'book_counselling', 'counselling_done', 'reports'],
  skill: ['process', 'take_test', 'book_counselling', 'counselling_done', 'reports'],
  combo: ['team_connect', 'fingerprints', 'take_test', 'book_counselling', 'counselling_done', 'reports'],
  launchpad: ['team_connect', 'book_counselling', 'counselling_done', 'reports'],
  readiness: ['team_connect', 'book_counselling', 'counselling_done', 'reports'],
};

const LABELS = {
  team_connect: 'Our team will connect',
  process: 'Process',
  fingerprints: 'Give fingerprints',
  take_test: 'Take test',
  book_counselling: 'Book Counselling session',
  counselling_done: 'Counselling Done',
  reports: 'Reports',
};

const HINTS = {
  team_connect: 'After payment, our counsellor team will call you to guide the next step.',
};

function stepDone(id, ctx) {
  const { paid, progress, hasReport, hasBooking, counsellingDone } = ctx;
  if (!paid) return false;
  if (id === 'team_connect') return paid;
  if (id === 'process') return !!progress.processComplete || progress.step >= 2;
  if (id === 'fingerprints') return !!progress.fingerprintDone;
  if (id === 'take_test') return progress.step === 'complete' || !!progress.completedAt || !!progress.testsDone;
  if (id === 'book_counselling') return hasBooking;
  if (id === 'counselling_done') return counsellingDone;
  if (id === 'reports') return hasReport;
  return false;
}

export default function ProductJourneySteps({
  focus, paid, progress = {}, hasReport, hasBooking, counsellingDone,
  onProcess, onFingerprints, onTakeTest, onBookCounselling, onReports,
}) {
  const ids = CONFIG[focus] || CONFIG.brain;
  const ctx = { paid, progress, hasReport, hasBooking, counsellingDone };
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
          const locked = !paid && id !== 'team_connect';
          const Icon = ICONS[id] || FileText;
          let action = null;
          if (!locked && !done && paid && id !== 'team_connect') {
            if (id === 'process') action = onProcess;
            else if (id === 'fingerprints') action = onFingerprints;
            else if (id === 'take_test') action = onTakeTest;
            else if (id === 'book_counselling') action = onBookCounselling;
            else if (id === 'reports') action = onReports;
          }
          return (
            <motion.li
              key={id}
              className={`dash-journey-crazy__step${done ? ' is-done' : ''}${isNext ? ' is-next' : ''}${locked ? ' is-locked' : ''}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <span className="dash-journey-crazy__node">{done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}</span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm flex items-center gap-1">
                  {LABELS[id]}
                  {locked && <Lock className="w-3 h-3 opacity-50" />}
                </p>
                {id === 'team_connect' && paid && <p className="text-xs dash-card-meta mt-1">{HINTS.team_connect}</p>}
                {action && (
                  <button type="button" className="dash-journey-crazy__btn" onClick={action}>
                    Continue <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
