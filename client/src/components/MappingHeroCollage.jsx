const STICKERS = ['🧠', '🎯', '🚀', '✨'];
const CAPTIONS = ['Classroom', 'Focus', 'Campus', 'Guidance'];

/** Scattered polaroid collage of Indian students — local generated photos. */
export default function MappingHeroCollage({ images = [], alts = [], captions = CAPTIONS, className = '' }) {
  const pics = images.filter(Boolean).slice(0, 4);
  if (!pics.length) return null;
  return (
    <div className={`mapping-hero-stage ${className}`.trim()}>
      <span className="mapping-hero-stage__burst" aria-hidden />
      <span className="mapping-hero-stage__spark mapping-hero-stage__spark--a" aria-hidden>★</span>
      <span className="mapping-hero-stage__spark mapping-hero-stage__spark--b" aria-hidden>✦</span>
      {pics.map((src, i) => (
        <figure key={`${src}-${i}`} className={`mapping-polaroid mapping-polaroid--${i + 1}`}>
          <span className="mapping-polaroid__tape" aria-hidden />
          <img src={src} alt={alts[i] || captions[i] || ''} />
          <figcaption>{captions[i] || CAPTIONS[i]}</figcaption>
          <span className="mapping-polaroid__sticker" aria-hidden>{STICKERS[i]}</span>
        </figure>
      ))}
    </div>
  );
}
