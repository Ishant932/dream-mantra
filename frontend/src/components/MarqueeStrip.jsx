import { Children, cloneElement } from 'react';

/**
 * Infinite horizontal scroll strip — two identical sets for a seamless loop.
 */
export default function MarqueeStrip({
  children,
  speed = '35s',
  direction = 'left',
  gap = 'gap-6',
  className = '',
}) {
  const items = Children.toArray(children);
  if (!items.length) return null;

  const animClass = direction === 'right' ? 'marquee-track-reverse' : 'marquee-track';
  const speedVal = typeof speed === 'number' ? `${speed}s` : speed;

  const renderSet = (setKey) => (
    <div
      key={setKey}
      className={`marquee-track-set flex flex-nowrap shrink-0 items-stretch ${gap}`}
      aria-hidden={setKey === 'b' ? true : undefined}
    >
      {items.map((child, i) =>
        cloneElement(child, {
          key: `${setKey}-${child.key ?? i}`,
        })
      )}
    </div>
  );

  return (
    <div className={`marquee-mask marquee-strip-root relative overflow-hidden ${className}`}>
      <div
        className={`marquee-track flex w-max flex-nowrap ${animClass}`}
        style={{ '--marquee-speed': speedVal }}
      >
        {renderSet('a')}
        {renderSet('b')}
      </div>
    </div>
  );
}

/** Partner / logo pill for partner marquee */
export function MarqueePill({ children, className = '' }) {
  return (
    <span
      className={`marquee-pill inline-flex shrink-0 items-center px-6 py-3 rounded-xl font-semibold whitespace-nowrap border transition-all duration-300 ${className}`}
      style={{
        background: 'var(--bg-elevated)',
        borderColor: 'var(--border-subtle)',
        color: 'var(--text-secondary)',
      }}
    >
      {children}
    </span>
  );
}
