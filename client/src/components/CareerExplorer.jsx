import React, { useState, useMemo, useEffect } from 'react';

const DEMAND_ORDER = ['Very High', 'High', 'Medium', 'Low'];
const RISK_ORDER = ['Low', 'Medium', 'High'];

const demandColor = (v) =>
  ({
    'Very High': 'bg-[#0E6E63] text-white',
    High: 'bg-[#1f9d63] text-white',
    Medium: 'bg-[#E8A23D] text-[#3a2a08]',
    Low: 'bg-[#cdd6dd] text-[#3a4753]',
  }[v] || 'bg-[#cdd6dd] text-[#3a4753]');

const riskColor = (v) =>
  ({
    Low: 'bg-[#e6f4ec] text-[#1f7a4d] border border-[#bfe3cf]',
    Medium: 'bg-[#fdf1dc] text-[#9a6b12] border border-[#f1d9a6]',
    High: 'bg-[#fbe6e6] text-[#a23030] border border-[#f0c4c4]',
  }[v] || 'bg-[#eef2f5] text-[#5B6B7A]');

const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));

function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0E6E63]/10 text-[#0E6E63] text-xs font-medium px-3 py-1">
      {label}
      <button type="button" onClick={onRemove} aria-label={`Remove ${label}`} className="hover:text-[#16243A]">
        ×
      </button>
    </span>
  );
}

function FilterGroup({ title, options, selected, onToggle, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  if (!options.length) return null;
  return (
    <div className="border-b border-[#e7ecef] py-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left text-sm font-semibold text-[#16243A]"
      >
        {title}
        <span className="text-[#9aa7b1] text-xs">{open ? '–' : '+'}</span>
      </button>
      {open && (
        <div className="mt-2.5 space-y-1.5 max-h-56 overflow-auto pr-1">
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm text-[#3a4753] cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => onToggle(opt)}
                className="h-4 w-4 rounded border-[#c4ced5] text-[#0E6E63] focus:ring-[#0E6E63]"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function AIResilienceMeter({ score }) {
  const pct = Math.max(0, Math.min(10, score)) * 10;
  const color = score >= 8 ? '#0E6E63' : score >= 6 ? '#1f9d63' : score >= 4 ? '#E8A23D' : '#c2693a';
  return (
    <div className="w-full">
      <div className="flex justify-between text-[11px] text-[#5B6B7A] mb-1">
        <span>AI-resilience</span>
        <span className="font-semibold text-[#16243A]">{score}/10</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#eef2f5]">
        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  if (!value || (Array.isArray(value) && !value.length)) return null;
  return (
    <div className="grid grid-cols-3 gap-3 py-2 border-b border-[#f0f3f5] last:border-0">
      <dt className="col-span-1 text-xs font-semibold uppercase tracking-wide text-[#8a97a1]">{label}</dt>
      <dd className="col-span-2 text-sm text-[#2c3742]">{Array.isArray(value) ? value.join(', ') : value}</dd>
    </div>
  );
}

function DetailModal({ c, onClose }) {
  if (!c) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#16243A]/50 p-0 sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white w-full sm:max-w-3xl max-h-[92vh] overflow-auto rounded-t-2xl sm:rounded-2xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pathway-detail-title"
      >
        <div className="sticky top-0 bg-white border-b border-[#eef2f5] px-6 py-4 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#0E6E63]">{c.cluster}</p>
            <h2 id="pathway-detail-title" className="text-xl font-bold text-[#16243A] font-display">
              {c.name}
            </h2>
            <p className="text-sm text-[#5B6B7A] mt-0.5">
              {c.degreeType} · {c.level} · {c.duration}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-[#9aa7b1] hover:text-[#16243A] text-2xl leading-none">
            ×
          </button>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-[#2c3742] mb-4">{c.description}</p>
          <dl>
            <DetailRow label="Streams" value={c.streams} />
            <DetailRow label="Key subjects" value={c.subjects} />
            <DetailRow label="Eligibility" value={c.eligibility} />
            <DetailRow label="Entrance exams" value={c.entranceExams} />
            <DetailRow label="What you study" value={c.whatYouStudy} />
            <DetailRow label="Skills developed" value={c.skills} />
            <DetailRow label="Top career roles" value={c.topCareers} />
            <DetailRow label="Difficulty" value={c.difficulty} />
            <DetailRow label="Cost range" value={c.costRange} />
            <DetailRow label="Scholarships" value={c.scholarship} />
            <DetailRow label="Industry demand" value={c.industryDemand} />
            <DetailRow label="Future demand" value={c.futureDemand} />
            <DetailRow label="AI impact risk" value={c.aiImpactRisk} />
            <DetailRow label="AI-proof score" value={`${c.aiProofScore}/10`} />
            <DetailRow label="Salary (entry)" value={c.salaryEntry} />
            <DetailRow label="Salary (mid)" value={c.salaryMid} />
            <DetailRow label="Salary (senior)" value={c.salarySenior} />
            <DetailRow label="Remote work" value={c.remoteWork} />
            <DetailRow label="Govt opportunities" value={c.govtOpportunities} />
            <DetailRow label="Private opportunities" value={c.privateOpportunities} />
            <DetailRow label="Entrepreneurship" value={c.entrepreneurship} />
            <DetailRow label="Research" value={c.research} />
            <DetailRow label="Global mobility" value={`${c.globalMobility}/10`} />
            <DetailRow label="Work environment" value={c.workEnvironment} />
            <DetailRow label="A typical day" value={c.typicalDay} />
            <DetailRow label="Personality fit" value={c.personalityFit} />
            <DetailRow label="Career Interest" value={c.riasec} />
            <DetailRow label="Personality fit" value={c.mbti} />
            <DetailRow label="Intelligence type" value={c.multipleIntelligence} />
            <DetailRow label="Future outlook" value={c.futureOutlook} />
            <DetailRow label="Progression path" value={c.progressionPath} />
            <DetailRow label="Related degrees" value={c.relatedDegrees} />
            <DetailRow label="Alternative degrees" value={c.alternativeDegrees} />
          </dl>
          <p className="mt-4 text-[11px] text-[#9aa7b1]">
            Guidance is indicative — verify fees, eligibility and exam details on official sources before deciding.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CareerExplorer({ data = null, jsonUrl = '/data/degree-pathways.json' }) {
  const [careers, setCareers] = useState(data || []);
  const [loading, setLoading] = useState(!data);
  const [q, setQ] = useState('');
  const [fStream, setFStream] = useState([]);
  const [fCluster, setFCluster] = useState([]);
  const [fType, setFType] = useState([]);
  const [fLevel, setFLevel] = useState([]);
  const [fDemand, setFDemand] = useState([]);
  const [fRisk, setFRisk] = useState([]);
  const [sort, setSort] = useState('relevance');
  const [selected, setSelected] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (data) return undefined;
    let cancelled = false;
    fetch(jsonUrl)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          setCareers(Array.isArray(d) ? d : d.pathways || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [data, jsonUrl]);

  const opts = useMemo(
    () => ({
      streams: uniq(careers.flatMap((c) => c.streams)).sort(),
      clusters: uniq(careers.map((c) => c.cluster)).sort(),
      types: uniq(careers.map((c) => c.degreeType)).sort(),
      levels: uniq(careers.map((c) => c.level)),
    }),
    [careers],
  );

  const toggler = (setter) => (v) =>
    setter((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]));

  const clearAll = () => {
    setQ('');
    setFStream([]);
    setFCluster([]);
    setFType([]);
    setFLevel([]);
    setFDemand([]);
    setFRisk([]);
  };

  const results = useMemo(() => {
    const ql = q.trim().toLowerCase();
    let r = careers.filter((c) => {
      if (
        ql &&
        !`${c.name} ${c.cluster} ${(c.skills || []).join(' ')} ${(c.topCareers || []).join(' ')}`
          .toLowerCase()
          .includes(ql)
      ) {
        return false;
      }
      if (fStream.length && !c.streams.some((s) => fStream.includes(s))) return false;
      if (fCluster.length && !fCluster.includes(c.cluster)) return false;
      if (fType.length && !fType.includes(c.degreeType)) return false;
      if (fLevel.length && !fLevel.includes(c.level)) return false;
      if (fDemand.length && !fDemand.includes(c.industryDemand)) return false;
      if (fRisk.length && !fRisk.includes(c.aiImpactRisk)) return false;
      return true;
    });
    if (sort === 'ai') r = [...r].sort((a, b) => b.aiProofScore - a.aiProofScore);
    else if (sort === 'demand') {
      r = [...r].sort(
        (a, b) => DEMAND_ORDER.indexOf(a.industryDemand) - DEMAND_ORDER.indexOf(b.industryDemand),
      );
    } else if (sort === 'name') r = [...r].sort((a, b) => a.name.localeCompare(b.name));
    return r;
  }, [careers, q, fStream, fCluster, fType, fLevel, fDemand, fRisk, sort]);

  const activeChips = [
    ...fStream.map((v) => ['stream', v, () => toggler(setFStream)(v)]),
    ...fCluster.map((v) => ['field', v, () => toggler(setFCluster)(v)]),
    ...fType.map((v) => ['type', v, () => toggler(setFType)(v)]),
    ...fLevel.map((v) => ['level', v, () => toggler(setFLevel)(v)]),
    ...fDemand.map((v) => ['demand', v, () => toggler(setFDemand)(v)]),
    ...fRisk.map((v) => ['AI risk', v, () => toggler(setFRisk)(v)]),
  ];

  const Filters = (
    <div>
      <FilterGroup title="Stream eligibility" options={opts.streams} selected={fStream} onToggle={toggler(setFStream)} />
      <FilterGroup title="Field / interest area" options={opts.clusters} selected={fCluster} onToggle={toggler(setFCluster)} />
      <FilterGroup title="Qualification type" options={opts.types} selected={fType} onToggle={toggler(setFType)} />
      <FilterGroup title="Entry level" options={opts.levels} selected={fLevel} onToggle={toggler(setFLevel)} />
      <FilterGroup title="Industry demand" options={DEMAND_ORDER} selected={fDemand} onToggle={toggler(setFDemand)} />
      <FilterGroup title="AI impact risk" options={RISK_ORDER} selected={fRisk} onToggle={toggler(setFRisk)} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F7F8] text-[#16243A]">
      <header className="bg-[#16243A] text-white">
        <div className="max-w-7xl mx-auto px-5 py-8">
          <p className="text-[#E8A23D] text-sm font-semibold tracking-wide uppercase">Career Pathways</p>
          <h1 className="text-3xl sm:text-4xl font-bold mt-1 font-display">Find the right path for you</h1>
          <p className="text-[#aebac6] mt-2 max-w-2xl">
            Explore degrees and careers by your stream, interests and the future demand of each field. Filter, compare,
            and dig into the details.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 py-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a degree, skill or career (e.g. electrician, welding, ITI)…"
            className="flex-1 rounded-xl border border-[#dbe2e7] bg-white px-4 py-3 text-sm outline-none focus:border-[#0E6E63] focus:ring-2 focus:ring-[#0E6E63]/20"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-[#dbe2e7] bg-white px-4 py-3 text-sm outline-none focus:border-[#0E6E63]"
          >
            <option value="relevance">Sort: Relevance</option>
            <option value="ai">Sort: Most AI-resilient</option>
            <option value="demand">Sort: Highest demand</option>
            <option value="name">Sort: A–Z</option>
          </select>
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            className="lg:hidden rounded-xl bg-[#0E6E63] text-white px-4 py-3 text-sm font-medium"
          >
            {showFilters ? 'Hide filters' : 'Filters'}
          </button>
        </div>

        <div className="flex gap-6">
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-72 shrink-0`}>
            <div className="bg-white rounded-2xl border border-[#e7ecef] px-4 py-2 lg:sticky lg:top-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-bold text-[#16243A]">Filters</span>
                <button type="button" onClick={clearAll} className="text-xs text-[#0E6E63] font-medium hover:underline">
                  Clear all
                </button>
              </div>
              {Filters}
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm text-[#5B6B7A]">
                <span className="font-bold text-[#16243A]">{results.length}</span> pathway
                {results.length === 1 ? '' : 's'}
              </span>
              {activeChips.map(([, label, remove], i) => (
                <Chip key={i} label={label} onRemove={remove} />
              ))}
            </div>

            {loading ? (
              <p className="text-[#5B6B7A] py-16 text-center">Loading pathways…</p>
            ) : results.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#e7ecef] py-16 text-center">
                <p className="text-[#16243A] font-semibold">No pathways match these filters.</p>
                <p className="text-[#5B6B7A] text-sm mt-1">Try removing a filter or searching a broader term.</p>
                <button type="button" onClick={clearAll} className="mt-4 text-sm text-[#0E6E63] font-medium hover:underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {results.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelected(c)}
                    className="text-left bg-white rounded-2xl border border-[#e7ecef] p-4 hover:border-[#0E6E63] hover:shadow-sm transition"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-[#0E6E63]">
                        {c.cluster}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${riskColor(c.aiImpactRisk)}`}>
                        AI risk: {c.aiImpactRisk}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#16243A] leading-snug font-display">{c.name}</h3>
                    <p className="text-xs text-[#5B6B7A] mt-0.5">
                      {c.degreeType} · {c.duration}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {c.streams.slice(0, 3).map((s) => (
                        <span key={s} className="text-[10px] bg-[#eef2f5] text-[#3a4753] rounded-md px-2 py-0.5">
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${demandColor(c.industryDemand)}`}>
                        {c.industryDemand} demand
                      </span>
                      <span className="text-xs text-[#5B6B7A]">{c.salaryEntry}</span>
                    </div>
                    <div className="mt-3">
                      <AIResilienceMeter score={c.aiProofScore} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <DetailModal c={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
