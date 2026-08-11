import { GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { SKILL_MAPPING_INSTRUMENT_META } from '../data/skillMappingInstruments';

function instrumentLabel(id) {
  return SKILL_MAPPING_INSTRUMENT_META[id]?.label || id;
}

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
          const count = combo.instrumentCount || combo.instruments?.length || 0;
          const tests = combo.instruments || [];
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
              {isLocked ? (
                <span className="skill-band-picker__sub">Locked</span>
              ) : (
                <>
                  <span className="skill-band-picker__count">{count} {count === 1 ? 'test' : 'tests'}</span>
                  <ul className="skill-band-picker__tests">
                    {tests.map((id) => (
                      <li key={id}>{instrumentLabel(id)}</li>
                    ))}
                  </ul>
                </>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
