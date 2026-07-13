import { motion } from 'framer-motion';
import { Mail, Phone, Github, MessageCircle } from 'lucide-react';
import PersonPhoto from './PersonPhoto';
import { IMAGES } from '../data/content';

const PLACEHOLDER_IMAGES = [IMAGES.team, IMAGES.counselling, IMAGES.workshop, IMAGES.college, IMAGES.professional, IMAGES.students];

function LeadershipExtendedMeta({ highlights, skills, contact }) {
  const hasContent = highlights?.length || skills?.length || contact;
  if (!hasContent) return null;

  const links = [
    contact?.phone && {
      href: `tel:${contact.phone.replace(/\s/g, '')}`,
      label: contact.phone,
      short: 'Call',
      icon: Phone,
      external: false,
    },
    contact?.email && {
      href: `mailto:${contact.email}`,
      label: contact.email,
      short: 'Email',
      icon: Mail,
      external: false,
    },
    contact?.whatsapp && {
      href: contact.whatsapp,
      label: 'WhatsApp',
      short: 'WhatsApp',
      icon: MessageCircle,
      external: true,
    },
    contact?.github && {
      href: contact.github,
      label: 'GitHub',
      short: 'GitHub',
      icon: Github,
      external: true,
    },
  ].filter(Boolean);

  return (
    <div className="leadership-card__meta-panel">
      {highlights?.length > 0 && (
        <div className="leadership-card__meta-block">
          <p className="leadership-card__meta-label">Expertise</p>
          <ul className="leadership-card__highlights">
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {skills?.length > 0 && (
        <div className="leadership-card__meta-block">
          <p className="leadership-card__meta-label">Tech stack</p>
          <div className="leadership-card__skills leadership-card__skills--grid">
            {skills.map((skill) => (
              <span key={skill} className="leadership-card__skill-chip">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {links.length > 0 && (
        <div className="leadership-card__meta-block leadership-card__meta-block--contact">
          <p className="leadership-card__meta-label">Connect</p>
          <div className="leadership-card__contact leadership-card__contact--grid">
            {links.map(({ href, label, short, icon: Icon, external }) => (
              <a
                key={label}
                href={href}
                className="leadership-card__contact-link leadership-card__contact-link--compact"
                title={label}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <Icon className="shrink-0" aria-hidden />
                <span className="leadership-card__contact-text">{label}</span>
                <span className="leadership-card__contact-short">{short}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExecutiveLeadershipEntry({ person, index, isLast }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`leadership-executive-group__entry${isLast ? ' leadership-executive-group__entry--last' : ''}`}
    >
      <h3 className="leadership-card__name">{person.name}</h3>
      <p className="leadership-card__role leadership-card__role--highlight">{person.role}</p>
      {person.location && (
        <p className="leadership-card__location">{person.location}</p>
      )}
      {person.bio && (
        <p className="leadership-card__bio">{person.bio}</p>
      )}
    </motion.div>
  );
}

function ExecutiveLeadershipGroup({ people, indexOffset = 0 }) {
  if (!people.length) return null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="leadership-executive-group infigon-card glow-card leadership-card leadership-card--featured h-full"
    >
      <div className="leadership-executive-group__inner">
        {people.map((person, i) => (
          <ExecutiveLeadershipEntry
            key={person.name || i}
            person={person}
            index={indexOffset + i}
            isLast={i === people.length - 1}
          />
        ))}
      </div>
    </motion.article>
  );
}

function ExecutiveLeadershipCard({ person, index, featured }) {
  const hasPhoto = Boolean(person.image?.trim());
  const hasExtras = person.contact || person.highlights?.length || person.skills?.length;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className={`leadership-card leadership-card--executive infigon-card glow-card h-full flex flex-col ${featured ? 'leadership-card--featured' : ''} ${hasPhoto ? 'leadership-card--executive-photo' : ''} ${hasExtras ? 'leadership-card--extended' : ''}`}
    >
      <div className={`leadership-card__header ${hasPhoto ? 'leadership-card__header--photo' : ''}`}>
        {hasPhoto && (
          <PersonPhoto
            src={person.image}
            name={person.name}
            size="portrait"
            variant="founder"
            animate={false}
            className="leadership-card__photo leadership-card__photo--executive shrink-0"
          />
        )}
        <div className="leadership-card__header-text min-w-0">
          <h3 className="leadership-card__name">{person.name}</h3>
          <p className={`leadership-card__role${hasPhoto ? ' leadership-card__role--highlight' : ''}`}>{person.role}</p>
          {person.location && (
            <p className="leadership-card__location">{person.location}</p>
          )}
        </div>
      </div>

      {person.bio && (
        <p className="leadership-card__bio">{person.bio}</p>
      )}
      <LeadershipExtendedMeta
        highlights={person.highlights}
        skills={person.skills}
        contact={person.contact}
      />
    </motion.article>
  );
}

export default function LeadershipGrid({
  title,
  subtitle,
  people = [],
  columns = 3,
  compact = false,
  featured = false,
  photosOnlyWhenSet = false,
  layout = 'default',
}) {
  if (!people.length) return null;

  const isExecutive = layout === 'executive';
  const executivePrimary = isExecutive && people.length
    ? (people.find((p) => p.image?.trim()) || people[0])
    : null;
  const executiveRegional = isExecutive && executivePrimary
    ? people.filter((p) => p !== executivePrimary)
    : [];

  const gridClass = isExecutive
    ? 'leadership-grid--executive leadership-grid--executive-split'
    : columns === 1
      ? 'grid max-w-md mx-auto gap-6'
      : columns === 2
        ? 'grid md:grid-cols-2 gap-8'
        : columns === 4
          ? 'grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-5 leadership-grid--four'
          : 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6';

  return (
    <section
      className={compact ? '' : 'py-16 lg:py-20'}
      style={featured ? { background: 'var(--bg-muted)' } : undefined}
    >
      <div className={compact ? '' : 'max-w-7xl mx-auto px-4'}>
        {(title || subtitle) && (
          <motion.div
            className={`text-center ${compact ? 'mb-8' : 'mb-10 lg:mb-12'}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {title && <h2 className={compact ? 'home-headline' : 'section-title'}>{title}</h2>}
            {subtitle && (
              <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        <div className={gridClass}>
          {isExecutive ? (
            <>
              {executivePrimary && (
                <ExecutiveLeadershipCard
                  key={executivePrimary.name}
                  person={executivePrimary}
                  index={0}
                  featured={featured}
                />
              )}
              {executiveRegional.length > 0 && (
                <ExecutiveLeadershipGroup people={executiveRegional} indexOffset={1} />
              )}
            </>
          ) : people.map((person, i) => {
                const hasPhoto = Boolean(person.image?.trim());
                const showPhoto = photosOnlyWhenSet ? hasPhoto : true;
                const photoSrc = hasPhoto
                  ? person.image
                  : PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length];

                return (
                  <motion.article
                    key={person.name || i}
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={featured ? { y: -6 } : undefined}
                    className={`infigon-card glow-card h-full flex flex-col items-center text-center leadership-card ${featured ? 'leadership-card--featured p-5 sm:p-6' : 'p-6'} ${!showPhoto ? 'leadership-card--no-photo' : ''}`}
                  >
                    {showPhoto && (
                      <PersonPhoto
                        src={photoSrc}
                        name={person.name}
                        size={featured ? 'portrait' : (compact ? 'md' : 'lg')}
                        variant={featured ? 'founder' : 'default'}
                        animate={false}
                        className="mx-auto mb-4 leadership-card__photo"
                      />
                    )}
                    <h3 className="font-display font-bold text-base sm:text-lg">{person.name}</h3>
                    <p className="text-xs sm:text-sm font-semibold mt-1" style={{ color: 'var(--orange)' }}>{person.role}</p>
                    {person.org && <p className="text-xs mt-1 opacity-70">{person.org}</p>}
                    {person.bio && (
                      <p className="text-xs sm:text-sm mt-3 leading-relaxed flex-1 text-left sm:text-center" style={{ color: 'var(--text-secondary)' }}>
                        {person.bio}
                      </p>
                    )}
                  </motion.article>
                );
              })}
        </div>
      </div>
    </section>
  );
}
