import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { User, FlaskConical, CreditCard, BookOpen, Fingerprint, FileText, Calendar, Lock,
  CheckCircle2, ChevronRight, Sparkles, Users, ClipboardList,
} from 'lucide-react';
import { useLang } from '../context/LanguageContext';

const STEP_ICONS = {
  profile: User,
  book: FlaskConical,
  payment: CreditCard,
  process: BookOpen,
  product_action: Fingerprint,
  report: FileText,
  book_counselling: Calendar,
};

const HIDDEN_STEP_IDS = new Set(['counselling']);

export default function JourneyProgressBox({
  careerPath,
  showCounsellingStep = true,
  onCompleteProfile,
  onBookModule,
  onPayment,
  onProcess,
  onProductAction,
  onViewReports,
  onBookCounselling,
}) {
  const { d } = useLang();
  const jp = d('journeyProgress');
  const productSlug = careerPath?.productSlug;
  const productMeta = productSlug ? jp.productSteps?.[productSlug] : null;
  const pendingPayment = careerPath?.pendingPayment;

  const steps = useMemo(() => {
    const defs = jp.steps || [];
    const doneMap = Object.fromEntries((careerPath?.steps || []).map((s) => [s.id, s.done]));

    const processTitle = productSlug && jp.processTitles?.[productSlug]
      ? jp.processTitles[productSlug]
      : defs[3]?.title;

    const actionTitle = productMeta?.actionTitle || defs[4]?.title;
    const actionDesc = productMeta?.actionDesc || defs[4]?.desc;

    return [
      {
        id: 'profile',
        title: defs[0]?.title,
        desc: defs[0]?.desc,
        done: doneMap.profile,
        action: onCompleteProfile,
        actionLabel: doneMap.profile ? defs[0]?.actionEdit : defs[0]?.actionComplete,
        icon: STEP_ICONS.profile,
      },
      {
        id: 'book',
        title: defs[1]?.title,
        desc: defs[1]?.desc,
        done: doneMap.book,
        action: onBookModule,
        actionLabel: defs[1]?.actionLabel,
        icon: STEP_ICONS.book,
      },
      {
        id: 'payment',
        title: defs[2]?.title,
        desc: defs[2]?.desc,
        done: doneMap.payment,
        action: pendingPayment ? onPayment : onBookModule,
        actionLabel: pendingPayment ? defs[2]?.actionPay : defs[2]?.actionBookFirst,
        highlight: !!pendingPayment,
        icon: STEP_ICONS.payment,
      },
      {
        id: 'process',
        title: processTitle,
        desc: defs[3]?.desc,
        done: doneMap.process,
        action: onProcess,
        actionLabel: defs[3]?.actionLabel,
        icon: STEP_ICONS.process,
      },
      {
        id: 'product_action',
        title: actionTitle,
        desc: actionDesc,
        done: doneMap.product_action,
        action: onProductAction,
        actionLabel: defs[4]?.actionLabel,
        icon: productSlug === 'crp-test' ? Users : productSlug === 'psychometric' ? ClipboardList : STEP_ICONS.product_action,
      },
      {
        id: 'report',
        title: defs[5]?.title,
        desc: defs[5]?.desc,
        done: doneMap.report,
        action: onViewReports,
        actionLabel: defs[5]?.actionLabel,
        icon: STEP_ICONS.report,
        waiting: doneMap.product_action && !doneMap.report,
      },
      {
        id: 'book_counselling',
        title: defs[6]?.title,
        desc: defs[6]?.desc,
        done: doneMap.book_counselling,
        action: showCounsellingStep && doneMap.payment ? onBookCounselling : onBookModule,
        actionLabel: showCounsellingStep && !doneMap.payment ? (defs[6]?.actionPurchaseFirst || 'Purchase counselling first') : defs[6]?.actionLabel,
        icon: STEP_ICONS.book_counselling,
        locked: showCounsellingStep && !doneMap.payment,
      },
    ].filter((s) => s.title && !HIDDEN_STEP_IDS.has(s.id) && (s.id !== 'book_counselling' || showCounsellingStep));
  }, [jp, careerPath, productSlug, productMeta, pendingPayment, showCounsellingStep, onCompleteProfile, onBookModule, onPayment, onProcess, onProductAction, onViewReports, onBookCounselling]);

  const completedCount = steps.filter((s) => s.done).length;
  const recommendedIdx = steps.findIndex((s) => !s.done);
  const progressPct = steps.length ? Math.round((completedCount / steps.length) * 100) : 0;
  const allDone = steps.length > 0 && completedCount === steps.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="dash-journey rounded-2xl border border-amber-200/80 dark:border-amber-800/60 bg-[var(--bg-elevated)] dark:bg-sand-900/40 shadow-md overflow-hidden"
    >
      <div className="relative bg-gradient-to-r from-amber-700 via-orange-600 to-amber-600 px-4 py-3 sm:px-5 text-amber-50">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-200/90">
              <Sparkles className="w-3 h-3 shrink-0" /> {jp.label}
            </span>
            <h3 className="font-display text-base sm:text-lg font-bold">{jp.title}</h3>
            {jp.subtitle && (
              <p className="text-[11px] sm:text-xs text-amber-100/85 mt-0.5 max-w-md">{jp.subtitle}</p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <span className="text-xl sm:text-2xl font-extrabold leading-none">{progressPct}%</span>
            <p className="text-[10px] text-amber-200/80 mt-0.5">{completedCount}/{steps.length}</p>
          </div>
        </div>
        <div className="mt-2.5 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-amber-300 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {allDone && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 text-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">{jp.allComplete}</p>
          </div>
        )}

        <ol className="space-y-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isRecommended = i === recommendedIdx;
            const stepNum = i + 1;

            let statusLabel = jp.available;
            let statusClass = 'bg-sand-100 text-sand-600 dark:bg-sand-800 dark:text-sand-300';
            if (step.done) {
              statusLabel = jp.completed;
              statusClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
            } else if (isRecommended) {
              statusLabel = jp.recommended;
              statusClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200';
            }

            return (
              <li key={step.id}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`rounded-xl border p-3.5 sm:p-4 transition-all ${
                    step.done
                      ? 'border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/10'
                      : isRecommended
                        ? 'border-amber-300/80 dark:border-amber-700/60 bg-amber-50/60 dark:bg-amber-950/20 shadow-sm'
                        : 'border-sand-200/80 dark:border-sand-700/60 bg-white/50 dark:bg-sand-900/30'
                  } ${step.highlight ? 'ring-2 ring-amber-400/40' : ''}`}
                >
                  <div className="flex gap-3 sm:gap-4">
                    <div
                      className={`shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-bold text-sm border-2 ${
                        step.done
                          ? 'bg-emerald-500 border-emerald-400 text-white'
                          : isRecommended
                            ? 'bg-gradient-to-br from-amber-600 to-orange-600 border-amber-300 text-amber-50'
                            : 'bg-sand-100 dark:bg-sand-800 border-sand-200 dark:border-sand-600 text-sand-500'
                      }`}
                    >
                      {step.done ? <CheckCircle2 className="w-5 h-5" /> : stepNum}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          {Icon && (
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
                                step.done ? 'text-emerald-600' : isRecommended ? 'text-amber-600' : 'text-sand-400'
                              }`}
                            />
                          )}
                          <h4
                            className={`font-bold text-sm sm:text-base leading-snug ${
                              step.done ? 'text-sand-600 dark:text-sand-300' : 'text-sand-900 dark:text-amber-50'
                            }`}
                          >
                            {step.title}
                          </h4>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${statusClass}`}>
                          {statusLabel}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-sand-500 dark:text-sand-400 leading-relaxed">
                        {step.desc}
                      </p>

                      {step.locked && (
                        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-1.5 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Unlocks after payment confirmation
                        </p>
                      )}

                      {step.waiting && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1.5">
                          {jp.reportWaiting}
                        </p>
                      )}

                      {step.action && (
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={step.action}
                          className={`mt-3 text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg inline-flex items-center gap-1.5 ${
                            step.done
                              ? 'border border-sand-300 dark:border-sand-600 text-sand-700 dark:text-sand-200 bg-white/80 dark:bg-sand-800/80 hover:bg-sand-50'
                              : isRecommended
                                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-amber-50 shadow-sm'
                                : 'border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 bg-amber-50/80 dark:bg-amber-950/30 hover:bg-amber-100/80'
                          }`}
                        >
                          {step.actionLabel} <ChevronRight className="w-3.5 h-3.5" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </li>
            );
          })}
        </ol>
      </div>
    </motion.div>
  );
}
