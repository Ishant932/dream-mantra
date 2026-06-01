import { Sun, Moon, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const themeMeta = {
  light: {
    icon: Sun,
    label: 'Light',
    color: 'border-[#C9A84C] text-[#013220] hover:bg-[rgba(201,168,76,0.15)]',
  },
  dark: {
    icon: Moon,
    label: 'Dark',
    color: 'border-[rgba(201,168,76,0.4)] text-[#E8C96A] hover:bg-[rgba(201,168,76,0.12)]',
  },
  aurora: {
    icon: Flame,
    label: 'Solar Flux',
    color: 'border-[rgba(255,107,53,0.5)] text-[#FFD060] hover:bg-[rgba(255,107,53,0.15)] aurora-toggle-glow',
  },
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
      title={`Theme: ${meta.label} — click to switch`}
      className={`flex items-center gap-1.5 rounded-full border-2 transition-all duration-300 ${meta.color} ${
        compact ? 'p-2' : 'px-3 py-1.5 text-xs font-bold'
      }`}
      aria-label="Cycle theme: Light, Dark, Solar Flux"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.25 }}
        >
          <Icon className="w-4 h-4" />
        </motion.span>
      </AnimatePresence>
      {!compact && <span>{meta.label}</span>}
    </motion.button>
  );
}
