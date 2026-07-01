import { useId, useMemo } from 'react';

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  color: string;
  /** Force min/max so multiple sparklines can share a scale. */
  domain?: [number, number];
  /** Render the area under the line. */
  area?: boolean;
  /** Show a small dot on the final value. */
  endDot?: boolean;
  className?: string;
}

export default function Sparkline({
  values,
  width = 600,
  height = 60,
  color,
  domain,
  area = true,
  endDot = true,
  className,
}: SparklineProps) {
  const gradId = useId();

  const { path, areaPath, lastX, lastY } = useMemo(() => {
    if (!values.length) return { path: '', areaPath: '', lastX: 0, lastY: 0 };
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

    return { path: d, areaPath: a, lastX: lx, lastY: ly };
  }, [values, width, height, domain]);

  if (!values.length) return null;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
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
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {endDot && (
        <circle cx={lastX} cy={lastY} r={2.5} fill={color} />
      )}
    </svg>
  );
}
