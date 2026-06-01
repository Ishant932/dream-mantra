import { motion } from 'framer-motion';
import PersonPhoto from './PersonPhoto';

export default function AdvisoryPersonCard({ person, index = 0, compact = false }) {
  if (compact) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        whileHover={{ y: -4 }}
        className="infigon-card p-6 glow-card shine-hover relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B4A] via-[#C9A84C] to-[#FF6B4A]" />
        <div className="flex gap-4 items-start">
          <PersonPhoto src={person.image} name={person.name} size="lg" variant="founder" />
          <div className="min-w-0">
            <h3 className="font-display text-xl font-bold">{person.name}</h3>
            <p className="font-semibold mt-0.5 text-sm" style={{ color: 'var(--orange)' }}>{person.role}</p>
            <p className="text-sm mt-2 italic" style={{ color: 'var(--text-muted)' }}>{person.tagline}</p>
            {person.bio && (
              <p className="mt-3 text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--text-body)' }}>
                {person.bio}
              </p>
            )}
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.12, duration: 0.55 }}
      whileHover={{ y: -6 }}
      className="infigon-card p-8 lg:p-10 glow-card shine-hover relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B4A] via-[#C9A84C] to-[#FF6B4A] bg-[length:200%_auto] animate-[goldShimmer_4s_linear_infinite]" />
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <PersonPhoto src={person.image} name={person.name} size="xl" variant="founder" />
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-2xl font-bold">{person.name}</h3>
          <p className="font-semibold mt-1" style={{ color: 'var(--orange)' }}>{person.role}</p>
          <p className="text-sm mt-2 italic" style={{ color: 'var(--text-muted)' }}>{person.tagline}</p>
        </div>
      </div>

      {person.bio && (
        <p className="mt-5 text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>
          {person.bio}
        </p>
      )}

      <div className="mt-6 space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--gold)' }}>Before Dream Mantra</p>
          <ul className="space-y-1.5">
            {person.before.map((item) => (
              <li key={item} className="text-sm flex gap-2" style={{ color: 'var(--text-body)' }}>
                <span style={{ color: 'var(--orange)' }}>•</span> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 rounded-xl" style={{ background: 'var(--orange-soft)', borderLeft: '3px solid var(--orange)' }}>
          <p className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--orange)' }}>Key Insight</p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>{person.insight}</p>
        </div>

        {person.vision && (
          <div className="p-4 rounded-xl border" style={{ background: 'var(--gold-dim)', borderColor: 'var(--gold-border)' }}>
            <p className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--gold)' }}>Vision</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-body)' }}>{person.vision}</p>
          </div>
        )}

        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--gold)' }}>Role at Dream Mantra</p>
          <ul className="space-y-1.5">
            {person.responsibilities.map((item) => (
              <li key={item} className="text-sm flex gap-2" style={{ color: 'var(--text-body)' }}>
                <span className="text-[#C9A84C] font-bold">✓</span> {item}
              </li>
            ))}
          </ul>
        </div>

        {person.certs?.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--gold)' }}>Certifications</p>
            <div className="flex flex-wrap gap-2">
              {person.certs.map((c) => (
                <span
                  key={c}
                  className="text-xs px-2.5 py-1 rounded-full border font-medium"
                  style={{ borderColor: 'var(--gold-border)', color: 'var(--text-secondary)', background: 'var(--bg-elevated)' }}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.article>
  );
}
