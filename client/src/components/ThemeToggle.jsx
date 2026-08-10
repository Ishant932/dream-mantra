import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const themeMeta = {
  light: { icon: Sun, label: 'Light', color: 'border-[#C9A84C] text-[#013220] hover:bg-[rgba(201,168,76,0.15)]' },
  dark: { icon: Moon, label: 'Dark', color: 'border-[rgba(201,168,76,0.4)] text-[#E8C96A] hover:bg-[rgba(201,168,76,0.12)]' },
};

export default function ThemeToggle({ compact = false }) {
  const { theme, cycleTheme } = useTheme();
  const meta = themeMeta[theme] || themeMeta.light;
  const Icon = meta.icon;

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      onClick={cycleTheme}
      title={`Theme: ${meta.label}`}
      className={`flex items-center gap-1.5 rounded-full border-2 transition-all duration-300 ${meta.color} ${compact ? 'p-2' : 'px-3 py-1.5 text-xs font-bold'}`}
      aria-label="Toggle light / dark theme"
    >
      <AnimatePresence mode="wait">
        <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
          <Icon className="w-4 h-4" />
        </motion.span>
      </AnimatePresence>
      {!compact && <span>{meta.label}</span>}
    </motion.button>
  );
}
