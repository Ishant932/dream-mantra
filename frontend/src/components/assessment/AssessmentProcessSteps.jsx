import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AssessmentProcessSteps({
  title,
  subtitle,
  steps,
  onContinue,
  continueLabel = 'Continue',
  saving,
  badge,
}) {
  return (
    <div>
      {badge && (
        <span className="inline-block text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40 px-3 py-1 rounded-full mb-4">
          {badge}
        </span>
      )}
      <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">{title}</h1>
      {subtitle && <p className="text-sand-600 dark:text-sand-400 mb-8">{subtitle}</p>}

      <ol className="space-y-4 mb-8">
        {steps.map((step, i) => (
          <motion.li
            key={step.title || i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex gap-4 p-4 md:p-5 rounded-xl bg-sand-50 dark:bg-sand-800/60 border border-sand-100 dark:border-sand-700"
          >
            <span className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-amber-50 flex items-center justify-center font-bold shrink-0 text-sm">
              {step.step || step.num || String(i + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="font-bold text-base">{step.title}</p>
              <p className="text-sm text-sand-600 dark:text-sand-400 mt-1 leading-relaxed">{step.desc}</p>
              {step.topics && (
                <ul className="mt-2 space-y-1">
                  {step.topics.map((t) => (
                    <li key={t} className="text-xs text-sand-500 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.li>
        ))}
      </ol>

      <button type="button" onClick={onContinue} disabled={saving} className="btn-primary inline-flex items-center gap-2 !px-8">
        {saving ? 'Saving…' : continueLabel}
        {!saving && <ArrowRight className="w-4 h-4" />}
      </button>
    </div>
  );
}
