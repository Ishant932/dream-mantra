import { forwardRef } from 'react';

/** Full-page embed of standalone HTML apps */
const EmbeddedAppFrame = forwardRef(function EmbeddedAppFrame({ src, title, className = '', embed = false }, ref) {
  const url = embed && !src.includes('embed=') ? `${src}${src.includes('?') ? '&' : '?'}embed=1` : src;
  return (
    <iframe
      ref={ref}
      title={title}
      src={url}
      className={`embedded-app-frame ${className}`}
      loading="lazy"
      referrerPolicy="same-origin"
    />
  );
});

export default EmbeddedAppFrame;
