import { motion } from 'framer-motion';

const COLORS = ['#f59e0b', '#ea580c', '#10b981', '#8b5cf6', '#3b82f6', '#ec4899', '#14b8a6', '#6366f1'];

export function AdminBarChart({ data = [], labelKey = 'label', valueKey = 'count', height = 180, formatValue }) {
  if (!data.length) {
    return <p className="text-sm opacity-60 py-8 text-center">No data yet</p>;
  }
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);

  return (
    <div className="flex items-end justify-between gap-2" style={{ minHeight: height }}>
      {data.map((item, i) => {
        const val = Number(item[valueKey]) || 0;
        const pct = Math.max((val / max) * 100, val ? 6 : 0);
        return (
          <div key={`${item[labelKey]}-${i}`} className="flex-1 min-w-[2rem] flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
              {formatValue ? formatValue(val) : val}
            </span>
            <motion.div
              className="w-full rounded-t-lg"
              style={{ background: COLORS[i % COLORS.length], height: `${pct}%`, minHeight: val ? 6 : 0 }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.05, duration: 0.45 }}
              title={`${item[labelKey]}: ${formatValue ? formatValue(val) : val}`}
            />
            <span className="text-[9px] opacity-60 text-center truncate w-full" title={item[labelKey]}>
              {String(item[labelKey] || '').slice(0, 10)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function AdminLineChart({ data = [], valueKey = 'count', height = 140, formatValue }) {
  if (!data.length) {
    return <p className="text-sm opacity-60 py-8 text-center">No data yet</p>;
  }
  const w = 360;
  const pad = 28;
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);
  const step = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;
  const points = data.map((d, i) => {
    const x = pad + i * step;
    const y = pad + (1 - (Number(d[valueKey]) || 0) / max) * (height - pad * 2);
    return { x, y, d };
  });
  const poly = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${height + 40}`} className="w-full h-auto" role="img">
      <polyline fill="none" stroke="#fcd34d" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" points={poly} opacity="0.35" />
      <motion.polyline
        fill="none"
        stroke="#f59e0b"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={poly}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      {points.map((p, i) => (
        <g key={p.d.month || i}>
          <circle cx={p.x} cy={p.y} r={5} fill="#ea580c" />
          <text x={p.x} y={height + 30} textAnchor="middle" className="fill-current text-[9px] opacity-70">
            {(p.d.month || '').slice(2)}
          </text>
          <text x={p.x} y={p.y - 8} textAnchor="middle" className="fill-amber-700 text-[9px] font-bold">
            {formatValue ? formatValue(p.d[valueKey]) : p.d[valueKey]}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function AdminDonutChart({ data = [], labelKey = 'label', valueKey = 'count' }) {
  if (!data.length) {
    return <p className="text-sm opacity-60 py-8 text-center">No data yet</p>;
  }
  const total = data.reduce((s, d) => s + (Number(d[valueKey]) || 0), 0) || 1;
  const r = 52;
  const cx = 70;
  const cy = 70;
  let angle = -90;

  const slices = data.map((item, i) => {
    const val = Number(item[valueKey]) || 0;
    const pct = val / total;
    const sweep = pct * 360;
    const start = angle;
    angle += sweep;
    const x1 = cx + r * Math.cos((start * Math.PI) / 180);
    const y1 = cy + r * Math.sin((start * Math.PI) / 180);
    const x2 = cx + r * Math.cos(((start + sweep) * Math.PI) / 180);
    const y2 = cy + r * Math.sin(((start + sweep) * Math.PI) / 180);
    const large = sweep > 180 ? 1 : 0;
    return {
      ...item,
      d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`,
      color: COLORS[i % COLORS.length],
      pct: Math.round(pct * 100),
    };
  });

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 140 140" className="w-36 h-36 shrink-0">
        {slices.map((s, i) => (
          <motion.path
            key={s[labelKey]}
            d={s.d}
            fill={s.color}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        ))}
        <circle cx={cx} cy={cy} r={32} className="fill-[var(--bg-elevated)]" />
        <text x={cx} y={cy + 4} textAnchor="middle" className="fill-amber-700 text-sm font-bold">{total}</text>
      </svg>
      <div className="space-y-2 flex-1 min-w-[10rem]">
        {slices.map((s) => (
          <div key={s[labelKey]} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="flex-1 truncate font-medium">{s[labelKey]}</span>
            <span className="font-bold opacity-80">{s[valueKey]} · {s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
