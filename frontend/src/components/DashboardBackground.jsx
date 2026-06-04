import { useTheme } from '../context/ThemeContext';

/** Lightweight dashboard backdrop — no 3D shapes or animated orbs */
export default function DashboardBackground({ variant = 'user' }) {
  const { theme } = useTheme();
  const isAdmin = variant === 'admin';

  return (
    <div
      className={[
        'dash-bg-root dash-bg-root--lite',
        isAdmin ? 'dash-bg-admin' : 'dash-bg-user',
        theme === 'aurora' ? 'dash-bg-aurora' : '',
      ].filter(Boolean).join(' ')}
      aria-hidden
    >
      <div className="dash-bg-base" />
    </div>
  );
}
