const VARIANTS = {
  brain: {
    theme: 'brain',
    hero: '/images/mapping/brain-mapping-hero.png',
    chips: ['Fingerprint scan', 'Classroom session', 'DMIT report'],
    caption: 'Brain Mapping — fingerprint session in classroom',
  },
  skill: {
    theme: 'skill',
    hero: '/images/mapping/skill-mapping-hero.png',
    chips: ['Computer lab', 'Aptitude tests', 'Indian students'],
    caption: 'Skill Mapping — lab assessments for career fit',
  },
  combo: {
    theme: 'combo',
    hero: '/images/mapping/brain-skill-hero.png',
    chips: ['Brain + Skill', '1:1 counselling', 'Full roadmap'],
    caption: 'Brain + Skill — personalised counselling session',
  },
};

/** Wide horizontal program hero — fills the column without side gaps. */
export default function MappingHeroShowcase({ variant = 'brain', alt = '', className = '' }) {
  const cfg = VARIANTS[variant] || VARIANTS.brain;
  return (
    <div className={`mapping-showcase mapping-showcase--${cfg.theme} mapping-showcase--banner ${className}`.trim()} aria-label={alt || cfg.caption}>
      <div className="mapping-showcase__banner">
        <div className="mapping-showcase__glow" aria-hidden />
        <img
          src={cfg.hero}
          alt={alt || cfg.caption}
          className="mapping-showcase__banner-img"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        <div className="mapping-showcase__banner-overlay">
          <p className="mapping-showcase__banner-caption">{cfg.caption}</p>
          <div className="mapping-showcase__banner-chips">
            {cfg.chips.map((chip) => (
              <span key={chip} className="mapping-showcase__chip">{chip}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
