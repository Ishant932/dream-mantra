import { useTheme } from '../context/ThemeContext';

/** Site-wide backdrop — static gradient only for fast load */
export default function AnimatedBackground() {
  const { theme } = useTheme();

  return (
    <div
      className={`live-bg-root live-bg-root--lite fixed inset-0 pointer-events-none overflow-hidden -z-10 ${theme === 'aurora' ? 'aurora-bg-root' : ''}`}
      aria-hidden
    >
      <div className="live-bg-base absolute inset-0" />
    </div>
  );
}
