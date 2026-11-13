import { useId, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface SparkBand {
  from: number;
  to: number;
  color: string;
  label?: string;
  opacity?: number;
}

interface SparklineProps {
  values: number[];
  /** ISO dates aligned with values — enables the hover scrub (H1). */
  dates?: string[];
  width?: number;
  height?: number;
  color: string;
  /** Force min/max so multiple sparklines can share a scale. */
  domain?: [number, number];
  /** Render the area under the line. */
  area?: boolean;
  /** Show a small dot on the final value. */
  endDot?: boolean;
  /** Horizontal zone bands drawn behind the line (H2). */
  bands?: SparkBand[];
  /** Tooltip value formatter. */
  formatValue?: (v: number) => string;
  strokeWidth?: number;
  className?: string;
  'data-fb'?: string;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

export default function Sparkline({
  values,
  dates,
  width = 600,
  height = 60,
  color,
  domain,
  area = true,
  endDot = true,
  bands,
  formatValue = (v) => String(Math.round(v)),
  strokeWidth = 1.5,
  className,
  'data-fb': dataFb,
}: SparklineProps) {
  const gradId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const { path, areaPath, lastX, lastY, pts, min, range } = useMemo(() => {
    if (!values.length) return { path: '', areaPath: '', lastX: 0, lastY: 0, pts: [] as (readonly [number, number])[], min: 0, range: 1 };
    const min = domain ? domain[0] : Math.min(...values);
    const max = domain ? domain[1] : Math.max(...values);
    const range = max - min || 1;
    const stepX = values.length > 1 ? width / (values.length - 1) : 0;
    const pad = 4;
    const usableH = height - pad * 2;

    const pts = values.map((v, i) => {
      const x = i * stepX;
      const y = pad + usableH - ((v - min) / range) * usableH;
      return [x, y] as const;
    });

    const d = pts
      .map(([x, y], i) => (i === 0 ? `M${x.toFixed(1)} ${y.toFixed(1)}` : `L${x.toFixed(1)} ${y.toFixed(1)}`))
      .join(' ');

    const a = `${d} L${pts[pts.length - 1][0].toFixed(1)} ${height} L0 ${height} Z`;
    const [lx, ly] = pts[pts.length - 1];

    return { path: d, areaPath: a, lastX: lx, lastY: ly, pts, min, range };
  }, [values, width, height, domain]);

  if (!values.length) return null;

  const yFor = (v: number) => {
    const pad = 4;
    const usableH = height - pad * 2;
    return pad + usableH - ((v - min) / range) * usableH;
  };

  // [H1] nearest point under the cursor
  const onMove = (e: React.MouseEvent) => {
    if (!dates || !wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    setHover(Math.round(t * (values.length - 1)));
  };

  const hp = hover != null ? pts[hover] : null;
  const hx = hp ? (hp[0] / width) * 100 : 0;
  const hy = hp ? (hp[1] / height) * 100 : 0;

  return (
    <div
      ref={wrapRef}
      className={cn('relative', dates && 'cursor-crosshair', className)}
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
      data-fb={dataFb}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full block"
        aria-hidden="true"
      >
        {/* [H2] zone bands */}
        {bands?.map((b, i) => {
          const y1 = yFor(b.to);
          const y2 = yFor(b.from);
          return (
            <g key={i}>
              <rect x={0} y={y1} width={width} height={Math.max(0, y2 - y1)} fill={b.color} opacity={b.opacity ?? 0.07} />
              {b.from > (domain?.[0] ?? -Infinity) && (
                <line x1={0} x2={width} y1={y2} y2={y2} stroke={b.color} strokeOpacity={0.35} strokeWidth={1} strokeDasharray="2 4" vectorEffect="non-scaling-stroke" />
              )}
              {b.to < (domain?.[1] ?? Infinity) && (
                <line x1={0} x2={width} y1={y1} y2={y1} stroke={b.color} strokeOpacity={0.35} strokeWidth={1} strokeDasharray="2 4" vectorEffect="non-scaling-stroke" />
              )}
            </g>
          );
        })}
        {area && (
          <>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d={areaPath} fill={`url(#${gradId})`} />
          </>
        )}
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {endDot && hover == null && (
          <circle cx={lastX} cy={lastY} r={2.5} fill={color} />
        )}
        {hp && (
          <line x1={hp[0]} x2={hp[0]} y1={0} y2={height} stroke="currentColor" strokeOpacity={0.25} strokeWidth={1} vectorEffect="non-scaling-stroke" strokeDasharray="2 3" />
        )}
      </svg>

      {/* [H2] band labels, right edge */}
      {bands?.some(b => b.label) && (
        <div className="absolute inset-y-0 right-0 pointer-events-none" aria-hidden>
          {bands.filter(b => b.label).map((b, i) => (
            <span
              key={i}
              className="absolute right-0 text-[9px] uppercase tracking-wider text-muted-foreground/60 -translate-y-1/2"
              style={{ top: `${(yFor((b.from + b.to) / 2) / height) * 100}%` }}
            >
              {b.label}
            </span>
          ))}
        </div>
      )}

      {/* [H1] scrub dot + tooltip (HTML so the dot stays round under non-uniform scaling) */}
      {hp && dates && (
        <>
          <span
            className="absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${hx}%`, top: `${hy}%`, background: color, boxShadow: '0 0 0 2px hsl(var(--background))' }}
          />
          <div
            key={hover}
            className="popup-in absolute bottom-full mb-2 pointer-events-none bg-card border border-border rounded px-2 py-1 text-xs shadow-md whitespace-nowrap"
            style={{ left: `${hx}%`, transform: `translateX(${hx < 12 ? '0%' : hx > 88 ? '-100%' : '-50%'})` }}
          >
            <span className="text-muted-foreground">{fmtDate(dates[hover!])}</span>
            <span className="ml-2 font-semibold text-foreground tabular-nums">{formatValue(values[hover!])}</span>
          </div>
        </>
      )}
    </div>
  );
}
