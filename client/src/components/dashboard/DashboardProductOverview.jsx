import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';
import { PRODUCT_OVERVIEWS } from '../../data/dashboardProductContent';
import { READINESS_SESSIONS, READINESS_INCLUDED, READINESS_WHO } from '../../data/crReadinessContent';

const TONES = ['red', 'purple', 'green', 'blue', 'orange'];

function Section({ tone, eyebrow, title, children, className = '' }) {
  return (
    <section className={`dash-overview-section dash-overview-section--${tone} ${className}`}>
      {eyebrow ? <p className="dash-overview-section__eyebrow">{eyebrow}</p> : null}
      {title ? <h4 className="dash-overview-section__title">{title}</h4> : null}
      {children}
    </section>
  );
}

function ProcessList({ items, numbered = true }) {
  return (
    <ol className={`dash-overview-process${numbered ? '' : ' dash-overview-process--plain'}`}>
      {items.map((item, i) => (
        <li key={item.title || item}>
          {numbered ? <span className="dash-overview-process__num">{String(i + 1).padStart(2, '0')}</span> : null}
          <div>
            {item.title ? <p className="font-bold text-sm">{item.title}</p> : null}
            {item.desc ? <p className="text-sm dash-card-meta mt-0.5">{item.desc}</p> : null}
            {item.points?.map((p) => (
              <p key={p} className="text-xs dash-card-meta mt-1">• {p}</p>
            ))}
            {!item.title && !item.desc ? <span className="text-sm">{item}</span> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

function CardGrid({ items, titleKey = 'title', descKey = 'desc' }) {
  return (
    <div className="dash-overview-grid">
      {items.map((item, i) => (
        <div key={item[titleKey] || item} className={`dash-overview-card dash-overview-card--${TONES[i % TONES.length]}`}>
          {item.icon ? <span className="text-xl mb-1" aria-hidden>{item.icon}</span> : null}
          <p className="font-bold text-sm">{item[titleKey] || item}</p>
          {item[descKey] ? <p className="text-xs dash-card-meta mt-1">{item[descKey]}</p> : null}
          {item.stage ? <p className="text-xs font-bold text-amber-700 mt-1">{item.stage}</p> : null}
          {item.points?.slice(0, 3).map((p) => (
            <p key={p} className="text-xs dash-card-meta">• {p}</p>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function DashboardProductOverview({ focus, onBook }) {
  const { d } = useLang();
  const meta = PRODUCT_OVERVIEWS[focus];
  if (!meta) return null;

  const dmit = d('pages.dmit');
  const psycho = d('pages.psychometric');
  const combo = d('pages.dmitPsychometric');
  const crp = d('pages.crp');
  const crpProgram = d('data.crpProgram');
  const crpHighlights = d('data.crpAdditionalParameters') || [];

  return (
    <div className="dash-product-overview dash-product-overview--rich">
      <div className="dash-product-overview__head">
        <h4 className="dash-product-overview__title">{meta.title}</h4>
        <span className="dash-product-overview__price">{meta.price}</span>
      </div>
      <p className="dash-product-overview__lede">{meta.desc}</p>
      <div className="flex flex-wrap gap-3 mt-4 mb-4">
        <button type="button" className="btn-primary dash-product-overview__book" onClick={onBook}>Book Now</button>
        <Link to={meta.link} className="dash-product-overview__link">{meta.linkLabel} <ArrowRight className="w-4 h-4" /></Link>
      </div>
      <ul className="dash-product-overview__perks">
        {meta.perks.map((p) => <li key={p}>{p}</li>)}
      </ul>

      {focus === 'brain' && (
        <>
          <Section tone="red" title="What is the Brain Mapping process?">
            <ProcessList items={dmit.howDone?.steps || []} />
          </Section>
          <Section tone="purple" title={dmit.whyChooseTitle}>
            <CardGrid items={dmit.whyChoose || []} />
          </Section>
          <Section tone="green" eyebrow={dmit.whoFor?.label} title={dmit.whoFor?.title}>
            <CardGrid items={dmit.whoFor?.groups || []} titleKey="stage" descKey="tag" />
          </Section>
          <Section tone="blue" eyebrow={dmit.howDone?.label} title={dmit.howDone?.title}>
            <p className="text-sm dash-card-meta mb-3">{dmit.howDone?.subtitle}</p>
            <ProcessList items={dmit.howDone?.steps || []} />
          </Section>
          <Section tone="orange" eyebrow={psycho.ageWise?.label} title={psycho.ageWise?.title}>
            <CardGrid items={d('programs').map((p) => ({ title: p.title, desc: p.subtitle }))} />
          </Section>
        </>
      )}

      {focus === 'skill' && (
        <>
          <Section tone="red" title="What is the Skill Mapping process?">
            <ProcessList items={d('data.psychoProcess') || []} />
          </Section>
          <Section tone="purple" title={psycho.why?.title || 'Why Skill Mapping?'}>
            <CardGrid items={d('data.psychoWhy') || []} />
          </Section>
          <Section tone="green" eyebrow={psycho.process?.label} title={psycho.process?.title}>
            <ProcessList items={d('data.psychoProcess') || []} />
          </Section>
          <Section tone="blue" eyebrow={psycho.ageWise?.label} title={psycho.ageWise?.title}>
            <CardGrid items={d('data.psychoAgeMap') || []} titleKey="age" descKey="tag" />
          </Section>
        </>
      )}

      {focus === 'combo' && (
        <>
          <Section tone="red" title="Brain + Skill Mapping process">
            <ProcessList items={d('data.comboSteps') || []} />
          </Section>
          <Section tone="purple" title={combo.benefitsTitle || 'Why Choose the Combo?'}>
            <CardGrid items={d('data.comboBenefits') || []} />
          </Section>
          <Section tone="green" eyebrow={combo.process?.label} title={combo.process?.title || 'How It Works'}>
            <p className="text-sm dash-card-meta">{combo.process?.desc}</p>
          </Section>
          <Section tone="blue" title="How counselling works">
            <ProcessList items={(d('data.processSteps') || []).map((s) => ({ title: s.title, points: s.points }))} />
          </Section>
          <Section tone="orange" title={combo.process?.title || 'Both Tests → Reports → Counselling'}>
            <p className="text-sm dash-card-meta">{combo.process?.desc}</p>
            <p className="text-sm mt-2">{combo.counselling?.desc}</p>
          </Section>
        </>
      )}

      {focus === 'launchpad' && (
        <>
          <Section tone="red" title={`${crp.sessions?.title || '5 AI Skill'} ${crp.sessions?.titleHighlight || 'Sessions'}`}>
            <div className="dash-overview-sessions">
              {(crpProgram.sessions || []).map((s, i) => (
                <div key={s.number} className={`dash-overview-session dash-overview-session--${TONES[i % TONES.length]}`}>
                  <span className="dash-overview-session__badge">Session {s.number}</span>
                  <p className="font-bold">{s.title}</p>
                  <p className="text-xs dash-card-meta">{s.duration}</p>
                  <ul className="mt-2 space-y-1">
                    {s.topics?.slice(0, 4).map((t) => (
                      <li key={t} className="text-xs flex gap-1"><CheckCircle2 className="w-3 h-3 text-amber-600 shrink-0" />{t}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
          <Section tone="purple" title={`${crp.highlights?.title || 'Additional'} ${crp.highlights?.titleHighlight || 'Program Highlights'}`}>
            <CardGrid items={crpHighlights} titleKey="label" descKey="desc" />
          </Section>
          <Section tone="green" title={crp.outcomes?.title || 'Program Outcomes'}>
            <CardGrid items={crpProgram.outcomes || []} />
          </Section>
        </>
      )}

      {focus === 'readiness' && (
        <>
          <Section tone="red" title="The 8-Session Career Journey">
            <div className="dash-overview-sessions">
              {READINESS_SESSIONS.map((s, i) => (
                <div key={s.number} className={`dash-overview-session dash-overview-session--${TONES[i % TONES.length]}`}>
                  <span className="dash-overview-session__badge">Session {s.number}</span>
                  <p className="font-bold">{s.title}</p>
                  <p className="text-xs dash-card-meta">{s.duration}</p>
                  <ul className="mt-2 space-y-1">
                    {s.workOn?.slice(0, 4).map((t) => (
                      <li key={t} className="text-xs flex gap-1"><CheckCircle2 className="w-3 h-3 text-amber-600 shrink-0" />{t}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
          <Section tone="purple" title="What&apos;s included?">
            <ul className="dash-product-overview__perks dash-product-overview__perks--grid">
              {READINESS_INCLUDED.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </Section>
          <Section tone="green" title="Who is this for?">
            <CardGrid items={READINESS_WHO} />
          </Section>
        </>
      )}

      <div className="flex flex-wrap gap-3 mt-5">
        <button type="button" className="btn-primary dash-product-overview__book" onClick={onBook}>Book Now</button>
        <Link to={meta.link} className="dash-product-overview__link">{meta.linkLabel} <ArrowRight className="w-4 h-4" /></Link>
      </div>
    </div>
  );
}
