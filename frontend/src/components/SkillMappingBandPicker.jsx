import { GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { SKILL_MAPPING_BANDS } from '../data/moduleCatalog';

/**
 * Class band picker — used at payment and (legacy) after purchase if band was never set.
 */
export default function SkillMappingBandPicker({
  value,
  onChange,
  disabled = false,
  lockedBand = null,
  title = 'Which class band is this for?',
  hint = 'Skill Mapping tests differ by age group. Choose the band that matches the student — this cannot be changed after payment.',
}) {
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
        {SKILL_MAPPING_BANDS.map((b) => {
          const isLocked = lockedBand && b.id !== lockedBand;
          const isSelected = value === b.id;
          const isDisabled = disabled || isLocked;
          return (
            <motion.button
              key={b.id}
              type="button"
              disabled={isDisabled}
              whileHover={isDisabled ? undefined : { y: -2 }}
              whileTap={isDisabled ? undefined : { scale: 0.98 }}
              onClick={() => !isDisabled && onChange?.(b.id)}
              className={`skill-band-picker__option ${isSelected ? 'skill-band-picker__option--active' : ''} ${isLocked ? 'skill-band-picker__option--locked' : ''}`}
            >
              <span className="skill-band-picker__label">{b.label}</span>
              <span className="skill-band-picker__sub">{isLocked ? 'Locked' : b.subtitle}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
