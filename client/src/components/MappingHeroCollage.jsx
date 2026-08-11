/** Compact 2×2 collage of Indian students / working youth — used on mapping heroes. */
export default function MappingHeroCollage({ images = [], alts = [], className = '' }) {
  const pics = images.filter(Boolean).slice(0, 4);
  if (!pics.length) return null;
  return (
    <div className={`mapping-hero-collage ${className}`.trim()}>
      {pics.map((src, i) => (
        <figure key={`${src}-${i}`} className="mapping-hero-collage__cell">
          <img src={src} alt={alts[i] || ''} loading="lazy" />
        </figure>
      ))}
    </div>
  );
}
