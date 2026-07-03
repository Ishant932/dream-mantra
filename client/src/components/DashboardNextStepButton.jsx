import { ArrowRight } from 'lucide-react';

export default function DashboardNextStepButton({ nextStep, variant = 'hero', className = '' }) {
  if (!nextStep?.onClick) return null;

  return (
    <button
      type="button"
      className={`dash-next-step-btn dash-next-step-btn--${variant} ${className}`.trim()}
      onClick={nextStep.onClick}
      title={nextStep.title}
      aria-label={`${nextStep.shortCta || 'Next step'}: ${nextStep.title}`}
    >
      <span className="dash-next-step-btn__icon" aria-hidden>
        <ArrowRight className="w-4 h-4" strokeWidth={2.75} />
      </span>
      <span className="dash-next-step-btn__label">{nextStep.shortCta || 'Next step'}</span>
    </button>
  );
}
