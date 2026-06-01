import { motion } from 'framer-motion';

const COLORS = ['#f59e0b', '#ea580c', '#10b981', '#8b5cf6', '#3b82f6', '#ec4899', '#14b8a6', '#6366f1'];

export function AdminBarChart({ data = [], labelKey = 'label', valueKey = 'count', height = 180, formatValue }) {
  if (!data.length) {
    return <p className="text-sm opacity-60 py-8 text-center">No data yet</p>;
  }
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  const barW = Math.min(48, Math.max(24, 320 / data.length - 8));

  return (
    <svg viewBox={`0 0 ${Math.max(data.length * (barW + 12), 200)} ${height + 40}`} className="w-full h-auto" role="img">
      {data.map((item, i) => {
        const val = item[valueKey] || 0;
        const h = (val / max) * height;
        const x = i * (barW + 12) + 6;
        const y = height - h + 8;
        return (
          <g key={item[labelKey] || i}>
            <motion.rect
              x={x}
              y={height + 8}
              width={barW}
              height={0}
              rx={6}
              fill={COLORS[i % COLORS.length]}
              initial={{ height: 0, y: height + 8 }}
              animate={{ height: h, y }}
              transition={{ delay: i * 0.06, duration: 0.55, ease: 'easeOut' }}
            />
            <text x={x + barW / 2} y={height + 26} textAnchor="middle" className="fill-current text-[9px] opacity-60">
              {String(item[labelKey] || '').slice(0, 8)}
            </text>
            <text x={x + barW / 2} y={y - 4} textAnchor="middle" className="fill-amber-700 dark:fill-amber-400 text-[10px] font-bold">
              {formatValue ? formatValue(val) : val}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function AdminLineChart({ data = [], valueKey = 'count', height = 140, formatValue }) {
  if (!data.length) {
    return <p className="text-sm opacity-60 py-8 text-center">No data yet</p>;
  }
  const w = 360;
  const pad = 24;
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1);
  const step = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;
  const points = data.map((d, i) => {
    const x = pad + i * step;
    const y = pad + (1 - (d[valueKey] || 0) / max) * (height - pad);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${height + 36}`} className="w-full h-auto">
      <motion.polyline
        fill="none"
        stroke="#f59e0b"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      {data.map((d, i) => {
        const x = pad + i * step;
        const y = pad + (1 - (d[valueKey] || 0) / max) * (height - pad);
        return (
          <g key={d.month || i}>
            <motion.circle
              cx={x}
              cy={y}
              r={4}
              fill="#ea580c"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            />
            <text x={x} y={height + 28} textAnchor="middle" className="fill-current text-[8px] opacity-55">
              {(d.month || '').slice(5)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function AdminDonutChart({ data = [], labelKey = 'label', valueKey = 'count' }) {
  if (!data.length) {
    return <p className="text-sm opacity-60 py-8 text-center">No data yet</p>;
  }
  const total = data.reduce((s, d) => s + (d[valueKey] || 0), 0) || 1;
  const r = 52;
  const cx = 70;
  const cy = 70;
  let angle = -90;

  const slices = data.map((item, i) => {
    const val = item[valueKey] || 0;
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
