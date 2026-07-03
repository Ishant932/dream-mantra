import { Children, cloneElement, useState } from 'react';
import { collegeLogoUrl } from '../data/collegePartners';
import { isMobilePerf } from '../utils/mobilePerf';

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

function PartnerMark({ domain, symbol }) {
  const [failed, setFailed] = useState(false);
  const perf = isMobilePerf();
  const logo = perf ? null : collegeLogoUrl(domain);

  return (
    <span className="marquee-pill__mark" aria-hidden>
      {!failed && logo ? (
        <img
          src={logo}
          alt=""
          className="marquee-pill__logo"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="marquee-pill__symbol">{symbol}</span>
      )}
    </span>
  );
}

/** Partner / logo pill for partner marquee */
export function MarqueePill({
  children,
  domain,
  symbol,
  className = '',
}) {
  return (
    <span
      className={`marquee-pill inline-flex shrink-0 items-center gap-2.5 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl font-semibold whitespace-nowrap border transition-all duration-300 ${className}`}
      style={{
        background: 'var(--bg-elevated)',
        borderColor: 'var(--border-subtle)',
        color: 'var(--text-secondary)',
      }}
    >
      {(domain || symbol) && <PartnerMark domain={domain} symbol={symbol || '🎓'} />}
      <span>{children}</span>
    </span>
  );
}

/** Pill wired to a college partner record */
export function CollegePartnerPill({ partner, className = '' }) {
  return (
    <MarqueePill domain={partner.domain} symbol={partner.symbol} className={className}>
      {partner.name}
    </MarqueePill>
  );
}
