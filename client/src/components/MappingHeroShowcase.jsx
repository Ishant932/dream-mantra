import { Brain, Fingerprint, Target, Users, BarChart3, MessageCircle, Sparkles } from 'lucide-react';

const VARIANTS = {
  brain: {
    theme: 'brain',
    hero: '/images/mapping/brain-mapping-hero.png',
    accent: '/images/mapping/session.png',
    orbit: [
      { icon: Fingerprint, label: 'Fingerprint scan', tone: 'amber' },
      { icon: Brain, label: 'Neural profile', tone: 'violet' },
      { icon: Target, label: 'Inborn talent', tone: 'emerald' },
    ],
    chips: ['Classroom session', 'DMIT report', 'No exams'],
    caption: 'Brain Mapping — fingerprint + classroom guidance',
  },
  skill: {
    theme: 'skill',
    hero: '/images/mapping/skill-mapping-hero.png',
    accent: '/images/mapping/test.png',
    orbit: [
      { icon: BarChart3, label: 'Aptitude test', tone: 'blue' },
      { icon: Target, label: 'Skill gaps', tone: 'orange' },
      { icon: Sparkles, label: 'Career fit', tone: 'emerald' },
    ],
    chips: ['Computer lab', 'Psychometric', 'Indian students'],
    caption: 'Skill Mapping — lab assessments & aptitude',
  },
  combo: {
    theme: 'combo',
    hero: '/images/mapping/brain-skill-hero.png',
    accent: '/images/mapping/campus.png',
    orbit: [
      { icon: Brain, label: 'Brain map', tone: 'violet' },
      { icon: BarChart3, label: 'Skill map', tone: 'blue' },
      { icon: MessageCircle, label: 'Counselling', tone: 'amber' },
    ],
    chips: ['1:1 session', 'Full roadmap', 'Brain + Skill'],
    caption: 'Brain + Skill — personalised counselling',
  },
};

function OrbitIcon({ item, index }) {
  const Icon = item.icon;
  return (
    <div className={`mapping-showcase__orbit-item mapping-showcase__orbit-item--${index + 1} mapping-showcase__orbit-item--${item.tone}`}>
      <span className="mapping-showcase__orbit-icon"><Icon className="w-4 h-4" aria-hidden /></span>
      <span className="mapping-showcase__orbit-label">{item.label}</span>
    </div>
  );
}

/** Immersive program hero — brain / skill / combo variants with orbit UI (not a polaroid collage). */
export default function MappingHeroShowcase({ variant = 'brain', alt = '', className = '' }) {
  const cfg = VARIANTS[variant] || VARIANTS.brain;
  return (
    <div className={`mapping-showcase mapping-showcase--${cfg.theme} ${className}`.trim()} aria-label={alt || cfg.caption}>
      <div className="mapping-showcase__aura" aria-hidden />
      <div className="mapping-showcase__ring mapping-showcase__ring--outer" aria-hidden />
      <div className="mapping-showcase__ring mapping-showcase__ring--inner" aria-hidden />
      <div className="mapping-showcase__orbit">
        {cfg.orbit.map((item, i) => (
          <OrbitIcon key={item.label} item={item} index={i} />
        ))}
      </div>
      <figure className="mapping-showcase__hero">
        <img src={cfg.hero} alt={alt || cfg.caption} loading="eager" />
        <figcaption className="mapping-showcase__caption">{cfg.caption}</figcaption>
      </figure>
      <figure className="mapping-showcase__accent">
        <img src={cfg.accent} alt="" loading="lazy" />
      </figure>
      <div className="mapping-showcase__chips" aria-hidden>
        {cfg.chips.map((chip) => (
          <span key={chip} className="mapping-showcase__chip">{chip}</span>
        ))}
      </div>
      {variant === 'combo' && (
        <div className="mapping-showcase__fusion" aria-hidden>
          <Brain className="w-5 h-5" />
          <span className="mapping-showcase__fusion-line" />
          <Users className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
