import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ExternalLink, ClipboardList } from 'lucide-react';
import {
  SKILL_MAPPING_BANDS,
  getSkillMappingTestsForBand,
} from '../data/moduleCatalog';

/**
 * Public Skill Mapping tests — website only, no dashboard verification.
 */
export default function PublicSkillMappingTests({ compact = false }) {
  const [bandId, setBandId] = useState('class-9-12');

  const tests = useMemo(() => {
    return getSkillMappingTestsForBand(bandId).map((t) => ({
      ...t,
      openUrl: t.url,
    }));
  }, [bandId]);

  return (
    <section className={compact ? '' : 'py-16 lg:py-20'} id="skill-mapping-tests">
      <div className={compact ? '' : 'max-w-7xl mx-auto px-4'}>
        <div className="text-center mb-8 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 mb-3">
            <ClipboardList className="w-4 h-4" /> Skill Mapping Tests
          </span>
          <h2 className="section-title mb-3">Take your tests online</h2>
          <p className="text-sm md:text-base text-theme-muted leading-relaxed">
            Choose your class band and open each test in a new tab. Use your Dreams ID, name, and phone on every form.
            {' '}
            <Link to="/signup" className="text-amber-700 font-semibold hover:underline">Sign up</Link>
            {' '}to get your Dreams ID.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {SKILL_MAPPING_BANDS.map((band) => (
            <button
              key={band.id}
              type="button"
              onClick={() => setBandId(band.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                bandId === band.id
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'border-amber-200 text-theme-primary hover:border-amber-400'
              }`}
            >
              {band.label}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {tests.map((t) => (
            <a
              key={t.id}
              href={t.openUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="infigon-card p-5 hover:border-amber-400 hover:shadow-lg transition group"
            >
              <span className="text-3xl">{t.icon}</span>
              <h3 className="font-bold mt-3 group-hover:text-amber-700">{t.title}</h3>
              <p className="text-xs text-theme-muted mt-1 line-clamp-2">{t.desc}</p>
              <p className="text-xs font-semibold text-amber-700 mt-3 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {t.duration}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-600 mt-4">
                Open test <ExternalLink className="w-4 h-4" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
