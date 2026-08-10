/** Full-page embed of standalone HTML apps */
export default function EmbeddedAppFrame({ src, title, className = '', embed = false }) {
  const url = embed && !src.includes('embed=') ? `${src}${src.includes('?') ? '&' : '?'}embed=1` : src;
  return (
    <iframe
      title={title}
      src={url}
      className={`embedded-app-frame ${className}`}
      loading="lazy"
      referrerPolicy="same-origin"
    />
  );
}
