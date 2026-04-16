import { useWhoop } from '@/hooks/useWhoop';
import { WhoopRecovery, WhoopSleep, WhoopWorkout } from '@/services/whoop';
import SectionTitle from '@/components/common/SectionTitle';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { Heart, Activity, Zap, Moon } from 'lucide-react';
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, CartesianGrid,
} from 'recharts';

// ─── palette ──────────────────────────────────────────────────────────────────

const C = {
  lime:   '#C8F135',
  cyan:   '#00D4C8',
  pink:   '#FF2D7A',
  orange: '#FF6335',
  purple: '#7B6FFF',
  rem:    '#C8F135',
  light:  '#00D4C8',
  awake:  '#6b7280',
} as const;

// ─── helpers ──────────────────────────────────────────────────────────────────

const recColor = (s: number) => s >= 67 ? C.lime : s >= 34 ? C.orange : C.pink;
const recZone  = (s: number) => s >= 67 ? 'Optimal' : s >= 34 ? 'Moderate' : 'Low';

const fmtMins = (m: number) => {
  const h = Math.floor(m / 60), min = m % 60;
  return h ? `${h}h ${min.toString().padStart(2, '0')}m` : `${min}m`;
};
const fmtDay = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'short' });
const fmtRel = (d: string) => {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
  return days === 0 ? 'today' : days === 1 ? 'yesterday' : `${days}d ago`;
};

// ─── base card ────────────────────────────────────────────────────────────────

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-card border border-border rounded-3xl p-6', className)}>
      {children}
    </div>
  );
}

function Sk({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-border', className)} />;
}

// ─── icon badge ───────────────────────────────────────────────────────────────

function IconBadge({ icon: Icon, color, size = 'md' }: {
  icon: React.ElementType; color: string; size?: 'sm' | 'md';
}) {
  const dim = size === 'md' ? 'w-10 h-10' : 'w-8 h-8';
  return (
    <div
      className={cn('rounded-2xl flex items-center justify-center flex-shrink-0', dim)}
      style={{ backgroundColor: `${color}25`, boxShadow: `0 0 16px ${color}40` }}
    >
      <Icon className="w-5 h-5" style={{ color }} strokeWidth={2.2} />
    </div>
  );
}

// ─── stat card ────────────────────────────────────────────────────────────────

function StatCard({ icon, color, label, value, unit, sub, loading }: {
  icon: React.ElementType; color: string; label: string;
  value: number | string | null; unit?: string; sub?: string; loading?: boolean;
}) {
  return (
    <Card>
      <div className="flex items-center gap-3 mb-4">
        <IconBadge icon={icon} color={color} size="md" />
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      {loading ? <Sk className="h-9 w-20 mt-1" /> : (
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tabular-nums text-foreground">{value ?? '—'}</span>
          {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
        </div>
      )}
      {sub && <p className="text-xs mt-1.5 font-medium" style={{ color }}>{sub}</p>}
    </Card>
  );
}

// ─── recharts tooltip ─────────────────────────────────────────────────────────

function ChartTip({ active, payload, label, unit }: {
  active?: boolean; payload?: { value: number }[]; label?: string; unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-2xl px-3 py-2 text-xs shadow-xl">
      <p className="text-muted-foreground mb-0.5">{label ? fmtDay(label) : ''}</p>
      <p className="font-bold text-foreground">
        {payload[0].value}
        {unit && <span className="text-muted-foreground ml-1 font-normal">{unit}</span>}
      </p>
    </div>
  );
}

// ─── recovery chart card ──────────────────────────────────────────────────────

function RecoveryCard({ trends, score, loading }: {
  trends: { date: string; score: number }[]; score: number | null; loading: boolean;
}) {
  const { theme } = useTheme();
  const grid = theme === 'dark' ? '#2a2a2a' : '#d4cec680';
  const axis = theme === 'dark' ? '#555' : '#aaa';

  return (
    <Card>
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <IconBadge icon={Activity} color={C.lime} size="sm" />
          <div>
            <p className="text-sm font-semibold text-foreground">Recovery</p>
            <p className="text-[11px] text-muted-foreground">Last 7 days</p>
          </div>
        </div>
        {loading ? <Sk className="h-10 w-16" /> : score != null ? (
          <div className="text-right">
            <p className="text-3xl font-bold tabular-nums leading-none" style={{ color: recColor(score) }}>
              {score}<span className="text-sm font-normal text-muted-foreground ml-0.5">%</span>
            </p>
            <p className="text-[11px] mt-1 font-medium" style={{ color: recColor(score) }}>
              {recZone(score)}
            </p>
          </div>
        ) : null}
      </div>
      {loading ? <Sk className="h-40 w-full" /> : trends.length > 0 ? (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={trends} barSize={28} margin={{ left: -10, right: 4 }}>
            <CartesianGrid vertical={false} stroke={grid} strokeDasharray="0" />
            <XAxis dataKey="date" tickFormatter={fmtDay}
              tick={{ fontSize: 11, fill: axis }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} hide />
            <Tooltip content={<ChartTip unit="%" />} cursor={{ fill: 'transparent' }} />
            <Bar dataKey="score" radius={[8, 8, 4, 4]}>
              {trends.map((e, i) => <Cell key={i} fill={recColor(e.score)} fillOpacity={0.9} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : <p className="text-xs mt-2 text-muted-foreground">No trend data yet.</p>}
    </Card>
  );
}

// ─── HRV chart card ───────────────────────────────────────────────────────────

function HRVCard({ trends, hrv, loading }: {
  trends: { date: string; value: number }[]; hrv: number | null; loading: boolean;
}) {
  const { theme } = useTheme();
  const grid = theme === 'dark' ? '#2a2a2a' : '#d4cec680';
  const axis = theme === 'dark' ? '#555' : '#aaa';

  return (
    <Card>
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <IconBadge icon={Heart} color={C.cyan} size="sm" />
          <div>
            <p className="text-sm font-semibold text-foreground">HRV</p>
            <p className="text-[11px] text-muted-foreground">7-day trend</p>
          </div>
        </div>
        {loading ? <Sk className="h-10 w-16" /> : hrv != null ? (
          <div className="text-right">
            <p className="text-3xl font-bold tabular-nums leading-none" style={{ color: C.cyan }}>
              {hrv}<span className="text-sm font-normal text-muted-foreground ml-0.5">ms</span>
            </p>
          </div>
        ) : null}
      </div>
      {loading ? <Sk className="h-40 w-full" /> : trends.length > 0 ? (
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={trends} margin={{ left: -10, right: 4 }}>
            <defs>
              <linearGradient id="hrv-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.cyan} stopOpacity={0.35} />
                <stop offset="95%" stopColor={C.cyan} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={grid} />
            <XAxis dataKey="date" tickFormatter={fmtDay}
              tick={{ fontSize: 11, fill: axis }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<ChartTip unit=" ms" />}
              cursor={{ stroke: C.cyan, strokeWidth: 1, strokeDasharray: '4 2' }} />
            <Area type="monotone" dataKey="value" stroke={C.cyan} strokeWidth={2.5}
              fill="url(#hrv-grad)"
              dot={{ fill: C.cyan, r: 4, strokeWidth: 0 }}
              activeDot={{ fill: C.cyan, r: 6, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      ) : <p className="text-xs mt-2 text-muted-foreground">No trend data yet.</p>}
    </Card>
  );
}

// ─── sleep card ───────────────────────────────────────────────────────────────

function SleepCard({ sleep, loading }: { sleep: WhoopSleep | null; loading: boolean }) {
  const segments = sleep ? [
    { label: 'Deep',  color: C.purple, mins: sleep.stages.sws   },
    { label: 'REM',   color: C.rem,    mins: sleep.stages.rem   },
    { label: 'Light', color: C.light,  mins: sleep.stages.light },
    { label: 'Awake', color: C.awake,  mins: sleep.stages.awake },
  ] : [];
  const total = segments.reduce((s, x) => s + x.mins, 0);

  return (
    <Card className="flex flex-col">
      <div className="flex items-center gap-3 mb-5">
        <IconBadge icon={Moon} color={C.purple} size="sm" />
        <p className="text-sm font-semibold text-foreground">Sleep</p>
      </div>
      {loading ? (
        <div className="space-y-4 flex-1">
          <div className="grid grid-cols-3 gap-3 mb-2">
            {[0,1,2].map(i => <div key={i}><Sk className="h-3 w-12 mb-2" /><Sk className="h-6 w-14" /></div>)}
          </div>
          {[0,1,2,3].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Sk className="h-3 w-10" /><Sk className="h-3 flex-1 rounded-full" /><Sk className="h-3 w-10" />
            </div>
          ))}
        </div>
      ) : sleep ? (
        <div className="flex-1">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Duration',   value: fmtMins(sleep.duration), unit: ''  },
              { label: 'Perf',       value: sleep.performance,        unit: '%' },
              { label: 'Efficiency', value: sleep.efficiency,         unit: '%' },
            ].map(m => (
              <div key={m.label}>
                <p className="text-[10px] uppercase tracking-widest mb-1.5 text-muted-foreground">{m.label}</p>
                <p className="text-lg font-bold tabular-nums text-foreground">
                  {m.value}
                  {m.unit && <span className="text-sm font-normal text-muted-foreground ml-0.5">{m.unit}</span>}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {segments.map(seg => (
              <div key={seg.label} className="flex items-center gap-3">
                <span className="text-[11px] w-10 text-right flex-shrink-0 text-muted-foreground">{seg.label}</span>
                <div className="flex-1 h-2.5 rounded-full overflow-hidden bg-border">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: total ? `${(seg.mins / total) * 100}%` : '0%',
                      backgroundColor: seg.color,
                      boxShadow: `0 0 8px ${seg.color}60`,
                    }}
                  />
                </div>
                <span className="text-[11px] tabular-nums w-12 flex-shrink-0 text-muted-foreground">
                  {fmtMins(seg.mins)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : <p className="text-sm text-muted-foreground">No sleep data available.</p>}
    </Card>
  );
}

// ─── workouts card ────────────────────────────────────────────────────────────

function WorkoutsCard({ workouts, loading }: { workouts: WhoopWorkout[]; loading: boolean }) {
  return (
    <Card>
      <div className="flex items-center gap-3 mb-5">
        <IconBadge icon={Zap} color={C.orange} size="sm" />
        <p className="text-sm font-semibold text-foreground">Recent Workouts</p>
      </div>
      {loading ? (
        <div className="space-y-1">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-border last:border-0">
              <div className="space-y-1.5"><Sk className="h-4 w-24" /><Sk className="h-3 w-14" /></div>
              <Sk className="h-6 w-12 rounded-full" />
            </div>
          ))}
        </div>
      ) : workouts.length > 0 ? (
        <div>
          {workouts.slice(0, 5).map(w => (
            <div key={w.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-semibold text-foreground">{w.sport}</p>
                <p className="text-[11px] mt-0.5 text-muted-foreground">
                  {fmtRel(w.date)} · {fmtMins(w.duration)}
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] tabular-nums text-muted-foreground">{w.avgHr} bpm</span>
                <span
                  className="text-xs font-bold tabular-nums px-2.5 py-1 rounded-full"
                  style={{ background: `${C.orange}20`, color: C.orange, boxShadow: `0 0 10px ${C.orange}30` }}
                >
                  {w.strain}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : <p className="text-sm text-muted-foreground">No recent workouts.</p>}
    </Card>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function Whoop() {
  const { data, isLoading, isError } = useWhoop();
  const recovery = data?.recovery?.scoreState === 'SCORED' ? (data.recovery as WhoopRecovery) : null;

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Unable to load health data. Check WHOOP credentials.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-100">
      <main className="max-w-5xl mx-auto px-6 py-8">
        <SectionTitle title="Health" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <StatCard icon={Heart} color={recovery?.score != null ? recColor(recovery.score) : C.lime}
            label="Recovery" value={recovery?.score ?? null} unit="%" loading={isLoading}
            sub={recovery?.score != null ? recZone(recovery.score) : undefined} />
          <StatCard icon={Activity} color={C.cyan} label="HRV" value={recovery?.hrv ?? null} unit="ms" loading={isLoading} />
          <StatCard icon={Heart} color={C.pink} label="Resting HR" value={recovery?.rhr ?? null} unit="bpm" loading={isLoading} />
          <StatCard icon={Zap} color={C.orange} label="Day Strain" value={data?.strain?.score ?? null} unit="/ 21" loading={isLoading} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <RecoveryCard trends={data?.trends?.recovery ?? []} score={recovery?.score ?? null} loading={isLoading} />
          <HRVCard trends={data?.trends?.hrv ?? []} hrv={recovery?.hrv ?? null} loading={isLoading} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SleepCard sleep={data?.sleep ?? null} loading={isLoading} />
          <WorkoutsCard workouts={data?.workouts ?? []} loading={isLoading} />
        </div>
      </main>
    </div>
  );
}
