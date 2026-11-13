import { useEffect, useRef, useState, CSSProperties } from 'react';
import { animate, stagger } from 'animejs';
import { useWhoop } from '@/hooks/useWhoop';
import { WhoopRecovery } from '@/services/whoop';
import SectionTitle from '@/components/common/SectionTitle';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import Sparkline, { SparkBand } from '@/components/whoop/Sparkline';
import CountUp from '@/components/whoop/CountUp';

const SAGE_LIGHT = '#5E915C';
const SAGE_DARK = '#75A872';
// data-viz ramp (design system): Forest / Sage map to Low / Optimal
const FOREST = '#326A54';

const fmtMins = (m: number) => {
  const h = Math.floor(m / 60);
  const min = Math.round(m % 60);
  return h ? `${h}h ${min.toString().padStart(2, '0')}m` : `${min}m`;
};

const recZone = (s: number) =>
  s >= 67 ? 'Optimal' : s >= 34 ? 'Moderate' : 'Low';

function avg(xs: number[]) {
  if (!xs.length) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

// [H6] "as of 7:42 AM" / "as of Mon 7:42 AM"
function asOf(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const sameDay = d.toDateString() === new Date().toDateString();
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return sameDay ? `as of ${time}` : `as of ${d.toLocaleDateString('en-US', { weekday: 'short' })} ${time}`;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('shimmer-block rounded-md', className)} />;
}

// [H7] quiet callout for the insight line
function Insight({ children, 'data-fb': fb }: { children: React.ReactNode; 'data-fb'?: string }) {
  return (
    <p
      className="relative text-xs text-foreground/75 italic pl-4 border-l border-dashed border-foreground/30 row-in"
      style={{ '--row': 10 } as CSSProperties}
      data-fb={fb}
    >
      <span className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-sage-moss" aria-hidden />
      {children}
    </p>
  );
}

// ─── Fitness ──────────────────────────────────────────────────────────────────

function FitnessSection({
  recovery,
  strain,
  trendRecovery,
  trendStrain,
  trendHrv,
  dates,
  strainDates,
  sage,
  loading,
}: {
  recovery: WhoopRecovery | null;
  strain: number | null;
  trendRecovery: number[];
  trendStrain: number[];
  trendHrv: number[];
  dates: string[];
  strainDates: string[];
  sage: string;
  loading: boolean;
}) {
  const insight = (() => {
    if (trendHrv.length < 8) return null;
    const latest = trendHrv[trendHrv.length - 1];
    const prior = avg(trendHrv.slice(-8, -1));
    if (latest == null || prior == null) return null;
    const delta = latest - prior;
    const pct = (delta / prior) * 100;
    if (Math.abs(pct) < 2) return 'HRV holding steady vs last week';
    const sign = delta > 0 ? '+' : '−';
    return `HRV ${sign}${Math.abs(Math.round(pct))}% vs 7-day average`;
  })();

  // [H2] zone bands behind the recovery line
  // middle zone stays clear so the chart doesn't read as a tinted block
  const bands: SparkBand[] = [
    { from: 0, to: 34, color: FOREST, label: 'Low', opacity: 0.05 },
    { from: 67, to: 100, color: sage, label: 'Optimal', opacity: 0.05 },
  ];

  return (
    <article className="whoop-card border-b border-border pb-10">
      <header className="flex items-baseline justify-between mb-6">
        <h3 className="font-body text-sm font-semibold tracking-wide uppercase text-muted-foreground">
          Fitness
        </h3>
        <span className="text-[11px] text-muted-foreground/80" data-fb="H6">
          today{asOf(recovery?.date) ? ` · ${asOf(recovery?.date)}` : ''}
        </span>
      </header>

      <div className="flex items-end gap-8 flex-wrap mb-6">
        <div data-fb="H4">
          <div className="flex items-baseline">
            {loading ? (
              <Skeleton className="h-14 w-28" />
            ) : (
              <>
                <CountUp
                  value={recovery?.score ?? null}
                  className="text-6xl md:text-7xl font-light tabular-nums leading-none text-foreground"
                />
                {/* [H4] unit + zone land after the number */}
                <span className="text-2xl font-light text-muted-foreground ml-1 row-in" style={{ '--row': 18 } as CSSProperties}>%</span>
              </>
            )}
          </div>
          <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground row-in" style={{ '--row': 22 } as CSSProperties}>
            {loading ? <Skeleton className="h-3 w-16 inline-block" /> : (
              <>recovery · {recovery?.score != null ? recZone(recovery.score) : '—'}</>
            )}
          </p>
        </div>

        <div className="flex gap-6 mb-1 row-in" style={{ '--row': 24 } as CSSProperties}>
          <Metric label="HRV" value={recovery?.hrv ?? null} suffix=" ms" loading={loading} />
          <Metric label="Strain" value={strain} decimals={1} loading={loading} />
        </div>
      </div>

      {/* [H1] hover scrub · [H2] zone bands */}
      <div className="mb-3">
        {loading ? (
          <Skeleton className="h-[60px] w-full" />
        ) : (
          <Sparkline
            values={trendRecovery}
            dates={dates}
            color={sage}
            domain={[0, 100]}
            height={60}
            bands={bands}
            formatValue={(v) => `${Math.round(v)}% · ${recZone(v)}`}
            className="w-full h-[60px]"
            data-fb="H1"
          />
        )}
      </div>
      <p className="text-[11px] text-muted-foreground/70 mb-5">
        Recovery · last 30 days
      </p>

      {/* [H3] strain paired under recovery, neutral stroke so sage stays on recovery */}
      {!loading && trendStrain.length > 1 && (
        <>
          <div className="mb-2 text-foreground/55" data-fb="H3">
            <Sparkline
              values={trendStrain}
              dates={strainDates}
              color="currentColor"
              domain={[0, 21]}
              height={36}
              area={false}
              strokeWidth={1.25}
              formatValue={(v) => `${v.toFixed(1)} strain`}
              className="w-full h-[36px]"
            />
          </div>
          <p className="text-[11px] text-muted-foreground/70 mb-5">
            Strain · last 30 days
          </p>
        </>
      )}

      {insight && <Insight data-fb="H7">{insight}</Insight>}
    </article>
  );
}

// ─── Sleep ────────────────────────────────────────────────────────────────────

const STAGE_META = [
  { key: 'sws', label: 'Deep', op: 1 },
  { key: 'rem', label: 'REM', op: 0.65 },
  { key: 'light', label: 'Light', op: 0.35 },
  { key: 'awake', label: 'Awake', op: 0.15 },
] as const;

function SleepSection({
  sleepMinutes,
  performance,
  stages,
  trendSleep,
  dates,
  sleepDate,
  sage,
  loading,
}: {
  sleepMinutes: number | null;
  performance: number | null;
  stages: { light: number; rem: number; sws: number; awake: number } | null;
  trendSleep: number[];
  dates: string[];
  sleepDate?: string | null;
  sage: string;
  loading: boolean;
}) {
  const [hoverStage, setHoverStage] = useState<string | null>(null);

  const insight = (() => {
    if (trendSleep.length < 14) return null;
    const thisWeek = avg(trendSleep.slice(-7));
    const lastWeek = avg(trendSleep.slice(-14, -7));
    if (thisWeek == null || lastWeek == null) return null;
    const deltaMin = Math.round(thisWeek - lastWeek);
    if (Math.abs(deltaMin) < 6) {
      return `Averaging ${fmtMins(Math.round(thisWeek))} this week — flat vs last`;
    }
    const sign = deltaMin > 0 ? '+' : '−';
    return `Averaging ${fmtMins(Math.round(thisWeek))} this week, ${sign}${fmtMins(Math.abs(deltaMin))} vs last`;
  })();

  const total = stages ? stages.sws + stages.rem + stages.light + stages.awake : 0;

  return (
    <article className="whoop-card pt-10">
      <header className="flex items-baseline justify-between mb-6">
        <h3 className="font-body text-sm font-semibold tracking-wide uppercase text-muted-foreground">
          Sleep
        </h3>
        <span className="text-[11px] text-muted-foreground/80">
          last night{asOf(sleepDate) ? ` · ${asOf(sleepDate)}` : ''}
        </span>
      </header>

      <div className="flex items-end gap-8 flex-wrap mb-6">
        <div>
          <div className="flex items-baseline">
            {loading ? (
              <Skeleton className="h-14 w-40" />
            ) : sleepMinutes != null ? (
              <SleepHero minutes={sleepMinutes} />
            ) : (
              <span className="text-6xl md:text-7xl font-light text-muted-foreground">—</span>
            )}
          </div>
          <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground row-in" style={{ '--row': 22 } as CSSProperties}>
            {loading ? (
              <Skeleton className="h-3 w-20 inline-block" />
            ) : performance != null ? (
              <>{performance}% of need</>
            ) : (
              '—'
            )}
          </p>
        </div>
      </div>

      {/* [H5] segmented stage bar: hover lifts a segment, label sits under its own segment */}
      {!loading && stages && total > 0 && (
        <div className="mb-6" data-fb="H5">
          <div className="flex w-full gap-px" onMouseLeave={() => setHoverStage(null)}>
            {STAGE_META.map((s) => {
              const mins = stages[s.key];
              const pct = (mins / total) * 100;
              const active = hoverStage === s.key;
              return (
                <div
                  key={s.key}
                  className="relative min-w-0"
                  style={{ width: `${pct}%` }}
                  onMouseEnter={() => setHoverStage(s.key)}
                >
                  <div
                    className={cn(
                      'h-1.5 rounded-full transition-[transform,height] duration-200 ease-out',
                      active && '-translate-y-0.5 h-2'
                    )}
                    style={{ backgroundColor: s.key === 'awake' ? 'currentColor' : sage, opacity: s.op }}
                  />
                  <div className={cn(
                    'mt-2 text-[10px] uppercase tracking-wider truncate transition-colors duration-150 ease-out',
                    active ? 'text-foreground' : 'text-muted-foreground/70',
                    pct < 9 && 'opacity-0'
                  )}>
                    {s.label} {fmtMins(mins)}
                  </div>
                  {active && (
                    <div
                      className="popup-in absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none bg-card border border-border rounded px-2 py-1 text-xs shadow-md whitespace-nowrap z-10"
                    >
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className="ml-2 font-semibold text-foreground tabular-nums">{fmtMins(mins)} · {Math.round(pct)}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-3">
        {loading ? (
          <Skeleton className="h-[60px] w-full" />
        ) : (
          <Sparkline
            values={trendSleep}
            dates={dates}
            color={sage}
            height={60}
            formatValue={(v) => fmtMins(Math.round(v))}
            className="w-full h-[60px]"
          />
        )}
      </div>
      <p className="text-[11px] text-muted-foreground/70 mb-5">
        Sleep duration · last 30 days
      </p>

      {insight && <Insight>{insight}</Insight>}
    </article>
  );
}

// ─── small metric ─────────────────────────────────────────────────────────────

function Metric({
  label, value, decimals, suffix, loading,
}: { label: string; value: number | null; decimals?: number; suffix?: string; loading: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">{label}</p>
      {loading ? (
        <Skeleton className="h-6 w-14" />
      ) : (
        <p className="text-xl font-light tabular-nums text-foreground">
          <CountUp value={value} decimals={decimals ?? 0} suffix={suffix} />
        </p>
      )}
    </div>
  );
}

function SleepHero({ minutes }: { minutes: number }) {
  return (
    <CountUp
      value={minutes}
      duration={1100}
      format={(n) => fmtMins(Math.round(n))}
      className="text-6xl md:text-7xl font-light tabular-nums leading-none text-foreground"
    />
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function Whoop() {
  const { data, isLoading, isError } = useWhoop();
  const { theme } = useTheme();
  const sage = theme === 'dark' ? SAGE_DARK : SAGE_LIGHT;
  const recovery =
    data?.recovery?.scoreState === 'SCORED' ? (data.recovery as WhoopRecovery) : null;

  const rootRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!rootRef.current || isLoading) return;
    const cards = rootRef.current.querySelectorAll<HTMLElement>('.whoop-card');
    if (!cards.length) return;
    animate(cards, {
      opacity: [0, 1],
      translateY: [8, 0],
      duration: 600,
      ease: 'cubicBezier(0.23, 1, 0.32, 1)',
      delay: stagger(110),
    });
  }, [isLoading]);

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Unable to load health data.</p>
      </div>
    );
  }

  const trendRecovery = (data?.trends?.recovery ?? []).map((p) => p.score);
  const recoveryDates = (data?.trends?.recovery ?? []).map((p) => p.date);
  const trendStrain = (data?.trends?.strain ?? []).map((p) => p.score);
  const strainDates = (data?.trends?.strain ?? []).map((p) => p.date);
  const trendHrv = (data?.trends?.hrv ?? []).map((p) => p.value);
  const trendSleep = (data?.trends?.sleep ?? []).map((p) => p.minutes);
  const sleepDates = (data?.trends?.sleep ?? []).map((p) => p.date);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-100">
      <main ref={rootRef} className="max-w-3xl mx-auto px-6 py-6">
        <SectionTitle title="Health" />
        <FitnessSection
          recovery={recovery}
          strain={data?.strain?.score ?? null}
          trendRecovery={trendRecovery}
          trendStrain={trendStrain}
          trendHrv={trendHrv}
          dates={recoveryDates}
          strainDates={strainDates}
          sage={sage}
          loading={isLoading}
        />
        <SleepSection
          sleepMinutes={data?.sleep?.duration ?? null}
          performance={data?.sleep?.performance ?? null}
          stages={data?.sleep?.stages ?? null}
          trendSleep={trendSleep}
          dates={sleepDates}
          sleepDate={data?.sleep?.date}
          sage={sage}
          loading={isLoading}
        />
      </main>
    </div>
  );
}
