import { motion } from 'framer-motion';
import { GraduationCap, CheckCircle2 } from 'lucide-react';
import { PSYCHOMETRIC_CLASS_OPTIONS } from '../../data/assessmentFlows';

export default function AssessmentClassSelect({ selected, profileClass, onSelect, onContinue, saving }) {
  const prefill = selected || profileClass || '';

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <GraduationCap className="w-8 h-8 text-amber-600" />
        <h1 className="font-display text-2xl md:text-3xl font-bold">Tell us your class</h1>
      </div>
      <p className="text-sand-600 dark:text-sand-400 mb-8">
        Skill Mapping questions and guidance are tailored to your academic stage. Select the option that best describes you.
      </p>

      {profileClass && !selected && (
        <p className="text-sm text-amber-700 dark:text-amber-400 mb-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 rounded-xl px-4 py-3">
          We found <strong>{profileClass}</strong> in your profile — confirm or choose another level below.
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        {PSYCHOMETRIC_CLASS_OPTIONS.map((opt) => {
          const active = prefill === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                active
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 shadow-md'
                  : 'border-sand-200 dark:border-sand-700 hover:border-amber-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold">{opt.label}</p>
                  <p className="text-xs text-sand-500 dark:text-sand-400 mt-1">{opt.desc}</p>
                </div>
                {active && <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />}
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!prefill || saving}
        onClick={() => onContinue(prefill)}
        className="btn-primary w-full sm:w-auto !px-8"
      >
        {saving ? 'Saving…' : 'Continue to process guide'}
      </button>
    </div>
  );
}
