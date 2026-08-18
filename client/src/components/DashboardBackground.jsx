/** Lightweight dashboard backdrop — no 3D shapes or animated orbs */
export default function DashboardBackground({ variant = 'user' }) {
  const isAdmin = variant === 'admin';

  return (
    <div
      className={[
        'dash-bg-root dash-bg-root--lite',
        isAdmin ? 'dash-bg-admin' : 'dash-bg-user',
      ].filter(Boolean).join(' ')}
      aria-hidden
    >
      <div className="dash-bg-base" />
    </div>
  );
}
