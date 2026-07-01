import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { useWhoop } from '@/hooks/useWhoop';
import { WhoopRecovery } from '@/services/whoop';
import SectionTitle from '@/components/common/SectionTitle';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import Sparkline from '@/components/whoop/Sparkline';
import CountUp from '@/components/whoop/CountUp';

const SAGE_LIGHT = '#5E915C';
const SAGE_DARK = '#75A872';

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

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-border/60', className)} />;
}

// ─── Fitness ──────────────────────────────────────────────────────────────────

function FitnessSection({
  recovery,
  strain,
  trendRecovery,
  trendHrv,
  sage,
  loading,
}: {
  recovery: WhoopRecovery | null;
  strain: number | null;
  trendRecovery: number[];
  trendHrv: number[];
  sage: string;
  loading: boolean;
}) {
  // Insight: HRV last value vs prior 7d avg.
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

  return (
    <article className="whoop-card border-b border-border pb-10">
      <header className="flex items-baseline justify-between mb-6">
        <h3 className="font-body text-sm font-semibold tracking-wide uppercase text-muted-foreground">
          Fitness
        </h3>
        <span className="text-[11px] text-muted-foreground/80">today</span>
      </header>

      <div className="flex items-end gap-8 flex-wrap mb-6">
        <div>
          <div className="flex items-baseline">
            {loading ? (
              <Skeleton className="h-14 w-28" />
            ) : (
              <>
                <CountUp
                  value={recovery?.score ?? null}
                  className="text-6xl md:text-7xl font-light tabular-nums leading-none text-foreground"
                />
                <span className="text-2xl font-light text-muted-foreground ml-1">%</span>
              </>
            )}
          </div>
          <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
            {loading ? <Skeleton className="h-3 w-16 inline-block" /> : (
              <>recovery · {recovery?.score != null ? recZone(recovery.score) : '—'}</>
            )}
          </p>
        </div>

        <div className="flex gap-6 mb-1">
          <Metric
            label="HRV"
            value={recovery?.hrv ?? null}
            suffix=" ms"
            loading={loading}
          />
          <Metric
            label="Strain"
            value={strain}
            decimals={1}
            loading={loading}
          />
        </div>
      </div>

      <div className="mb-3">
        {loading ? (
          <Skeleton className="h-[60px] w-full" />
        ) : (
          <Sparkline
            values={trendRecovery}
            color={sage}
            domain={[0, 100]}
            height={60}
            className="w-full h-[60px]"
          />
        )}
      </div>
      <p className="text-[11px] text-muted-foreground/70 mb-3">
        Recovery · last 30 days
      </p>

      {insight && (
        <p className="text-xs text-foreground/70 italic">{insight}</p>
      )}
    </article>
  );
}

// ─── Sleep ────────────────────────────────────────────────────────────────────

function SleepSection({
  sleepMinutes,
  performance,
  stages,
  trendSleep,
  sage,
  loading,
}: {
  sleepMinutes: number | null;
  performance: number | null;
  stages: { light: number; rem: number; sws: number; awake: number } | null;
  trendSleep: number[];
  sage: string;
  loading: boolean;
}) {
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

  const total = stages
    ? stages.sws + stages.rem + stages.light + stages.awake
    : 0;

  return (
    <article className="whoop-card pt-10">
      <header className="flex items-baseline justify-between mb-6">
        <h3 className="font-body text-sm font-semibold tracking-wide uppercase text-muted-foreground">
          Sleep
        </h3>
        <span className="text-[11px] text-muted-foreground/80">last night</span>
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
          <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">
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

      {/* Sleep stage bar — single thin row */}
      {!loading && stages && total > 0 && (
        <div className="mb-6">
          <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-border/60">
            {[
              { mins: stages.sws, color: sage, op: 1 },
              { mins: stages.rem, color: sage, op: 0.65 },
              { mins: stages.light, color: sage, op: 0.35 },
              { mins: stages.awake, color: 'currentColor', op: 0.15 },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  width: `${(s.mins / total) * 100}%`,
                  backgroundColor: s.color,
                  opacity: s.op,
                }}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground/70">
            <span>Deep {fmtMins(stages.sws)}</span>
            <span>REM {fmtMins(stages.rem)}</span>
            <span>Light {fmtMins(stages.light)}</span>
            <span>Awake {fmtMins(stages.awake)}</span>
          </div>
        </div>
      )}

      <div className="mb-3">
        {loading ? (
          <Skeleton className="h-[60px] w-full" />
        ) : (
          <Sparkline
            values={trendSleep}
            color={sage}
            height={60}
            className="w-full h-[60px]"
          />
        )}
      </div>
      <p className="text-[11px] text-muted-foreground/70 mb-3">
        Sleep duration · last 30 days
      </p>

      {insight && (
        <p className="text-xs text-foreground/70 italic">{insight}</p>
      )}
    </article>
  );
}

// ─── small metric ─────────────────────────────────────────────────────────────

function Metric({
  label,
  value,
  decimals,
  suffix,
  loading,
}: {
  label: string;
  value: number | null;
  decimals?: number;
  suffix?: string;
  loading: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
        {label}
      </p>
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

// Sleep hero — counts up duration then formats as "Xh YYm"
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
    data?.recovery?.scoreState === 'SCORED'
      ? (data.recovery as WhoopRecovery)
      : null;

  // Stagger fade-in for the two sections on mount / when data lands
  const rootRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!rootRef.current || isLoading) return;
    const cards = rootRef.current.querySelectorAll<HTMLElement>('.whoop-card');
    if (!cards.length) return;
    animate(cards, {
      opacity: [0, 1],
      translateY: [8, 0],
      duration: 700,
      ease: 'outQuart',
      delay: stagger(120),
    });
  }, [isLoading]);

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Unable to load health data.
        </p>
      </div>
    );
  }

  const trendRecovery = (data?.trends?.recovery ?? []).map((p) => p.score);
  const trendHrv = (data?.trends?.hrv ?? []).map((p) => p.value);
  const trendSleep = (data?.trends?.sleep ?? []).map((p) => p.minutes);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-100">
      <main ref={rootRef} className="max-w-3xl mx-auto px-6 py-6">
        <SectionTitle title="Health" />
        <FitnessSection
          recovery={recovery}
          strain={data?.strain?.score ?? null}
          trendRecovery={trendRecovery}
          trendHrv={trendHrv}
          sage={sage}
          loading={isLoading}
        />
        <SleepSection
          sleepMinutes={data?.sleep?.duration ?? null}
          performance={data?.sleep?.performance ?? null}
          stages={data?.sleep?.stages ?? null}
          trendSleep={trendSleep}
          sage={sage}
          loading={isLoading}
        />
      </main>
    </div>
  );
}
