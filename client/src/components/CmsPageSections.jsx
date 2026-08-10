import { ExternalLink } from 'lucide-react';

/** CMS-managed sections block — shown when admin saves content in Site Pages */
export default function CmsPageSections({ cms, className = '' }) {
  if (!cms?.sections?.length && !cms?.intro) return null;
  return (
    <section className={`py-12 bg-[var(--bg-elevated)] ${className}`}>
      <div className="max-w-4xl mx-auto px-4">
        {cms.intro ? (
          <p className="text-sand-600 text-lg leading-relaxed mb-8 text-center">{cms.intro}</p>
        ) : null}
        <div className="space-y-8">
          {cms.sections?.map((s, i) => (
            <article key={`${s.title}-${i}`} className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
              {s.image ? (
                <img src={s.image} alt="" className="w-full max-h-56 object-cover rounded-xl mb-4" />
              ) : null}
              {s.title ? <h3 className="font-display font-bold text-xl text-brand-800 mb-2">{s.title}</h3> : null}
              {s.content ? <p className="text-sand-600 leading-relaxed whitespace-pre-line">{s.content}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CmsPreviewLink({ route }) {
  if (!route) return null;
  return (
    <a href={route} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:underline">
      View live <ExternalLink className="w-3 h-3" />
    </a>
  );
}
