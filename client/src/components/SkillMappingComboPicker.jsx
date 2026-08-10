import { GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Agewise bifurcation combo picker — options from admin-defined combos.
 */
export default function SkillMappingComboPicker({
  combos = [],
  value,
  onChange,
  disabled = false,
  lockedComboId = null,
  title = 'Agewise Bifurcation',
  hint = 'Choose the test package that matches the student. This cannot be changed after payment.',
}) {
  if (!combos.length) {
    return (
      <div className="skill-band-picker">
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          No test combos configured yet. Ask admin to add combos in Community & Links → Agewise Bifurcation.
        </p>
      </div>
    );
  }

  return (
    <div className="skill-band-picker">
      <div className="flex items-start gap-2 mb-3">
        <GraduationCap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-theme-primary">{title}</p>
          <p className="text-xs text-theme-muted mt-0.5 leading-relaxed">{hint}</p>
        </div>
      </div>
      <div className="skill-band-picker__grid">
        {combos.map((combo) => {
          const isLocked = lockedComboId && combo.id !== lockedComboId;
          const isSelected = value === combo.id;
          const isDisabled = disabled || isLocked;
          return (
            <motion.button
              key={combo.id}
              type="button"
              disabled={isDisabled}
              whileHover={isDisabled ? undefined : { y: -2 }}
              whileTap={isDisabled ? undefined : { scale: 0.98 }}
              onClick={() => !isDisabled && onChange?.(combo.id)}
              className={`skill-band-picker__option ${isSelected ? 'skill-band-picker__option--active' : ''} ${isLocked ? 'skill-band-picker__option--locked' : ''}`}
            >
              <span className="skill-band-picker__label">{combo.name}</span>
              <span className="skill-band-picker__sub">
                {isLocked ? 'Locked' : `${combo.instrumentCount || combo.instruments?.length || 0} tests · ${combo.summary || ''}`}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
