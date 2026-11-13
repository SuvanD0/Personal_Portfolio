import { useSpotifyStats } from '@/hooks/useSpotifyStats';
import { useSpotifyHeatmap } from '@/hooks/useSpotifyHeatmap';
import { useSpotify } from '@/hooks/useSpotify';
import { useTheme } from '@/hooks/useTheme';
import SectionTitle from '@/components/common/SectionTitle';
import NudgeArrow from '@/components/common/NudgeArrow';
import CountUp from '@/components/whoop/CountUp';
import { SpotifyTopTrack, SpotifyArtist } from '@/services/spotifyStats';
import { HeatmapDay } from '@/services/spotifyHeatmap';
import { useState, useRef, useEffect, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

function fmtDuration(ms: number): string {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// [F6] neutral shimmer sweep instead of pulse
function Skeleton({ className }: { className?: string }) {
  return <div className={`shimmer-block rounded ${className ?? ''}`} data-fb="F6" />;
}

const row = (i: number) => ({ '--row': i } as CSSProperties);

// ─── now playing [M5] ─────────────────────────────────────────────────────────

function NowPlaying() {
  const { data, isLoading } = useSpotify();
  if (isLoading) {
    return (
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-md" />
        <div className="space-y-1.5"><Skeleton className="h-4 w-44" /><Skeleton className="h-3 w-24" /></div>
      </div>
    );
  }
  if (!data?.title) return null;
  const playing = data.isPlaying;
  return (
    <a
      href={data.songUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group pressable flex items-center gap-4 rounded-xl -mx-3 px-3 py-2 hover:bg-muted/20 transition-colors duration-150 ease-out row-in"
      style={row(0)}
      data-fb="M5"
    >
      {data.albumImageUrl ? (
        <img src={data.albumImageUrl} alt={data.album ?? ''} className="w-12 h-12 rounded-md object-cover shadow-sm transition-transform duration-200 ease-out group-hover:-translate-y-px" />
      ) : (
        <div className="w-12 h-12 rounded-md bg-border" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5 flex items-center gap-2">
          <span className={cn('eq', !playing && 'paused')} aria-hidden><i /><i /><i /></span>
          {playing ? 'Now playing' : 'Last played'}
        </p>
        <p className="text-sm font-semibold text-foreground truncate group-hover:text-sage-moss transition-colors duration-150 ease-out inline-flex items-center gap-1">
          {data.title}<NudgeArrow className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </p>
        <p className="text-xs text-muted-foreground truncate">{data.artist}{data.album ? ` · ${data.album}` : ''}</p>
      </div>
    </a>
  );
}

// ─── artist flow [M3] ─────────────────────────────────────────────────────────

// [M3] round 2: top 20, sizes taper by rank
const RANK_SIZE = ['text-3xl', 'text-2xl', 'text-2xl', 'text-xl', 'text-xl', 'text-xl', 'text-lg', 'text-lg', 'text-lg', 'text-lg', 'text-base', 'text-base', 'text-base', 'text-base', 'text-base', 'text-sm', 'text-sm', 'text-sm', 'text-sm', 'text-sm'];

function ArtistFlow({ artists }: { artists: SpotifyArtist[] }) {
  return (
    <p className="leading-[1.5] tracking-tight" data-fb="M3">
      {artists.map((a, i) => (
        <span key={a.name} className="row-in inline" style={row(i)}>
          <a
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'font-semibold transition-colors duration-150 ease-out hover:text-sage-moss',
              RANK_SIZE[i] ?? 'text-sm',
              i === 0 ? 'text-sage-moss' : 'text-foreground'
            )}
          >
            {a.name}
          </a>
          {a.playcount != null && (
            <sup className="ml-0.5 text-[10px] font-normal tabular-nums text-muted-foreground">
              {a.playcount.toLocaleString()}
            </sup>
          )}
          {i < artists.length - 1 && (
            <span className="text-muted-foreground mx-2 font-normal select-none">·</span>
          )}
        </span>
      ))}
    </p>
  );
}

// ─── heat grid ────────────────────────────────────────────────────────────────

// scheme2: deep teal → forest → sage → olive → lime → bright yellow-green
const SCHEME_DARK  = ['#1a1a1a', '#02404C', '#326A54', '#5E915C', '#84B362', '#ADD76A', '#DAFF71'];
const SCHEME_LIGHT = ['#eeecea', '#02404C', '#326A54', '#5E915C', '#84B362', '#ADD76A', '#DAFF71'];

// Bucket cutoffs as % of max — progressively wider so peak color is rare
const CUTOFFS = [0.05, 0.15, 0.30, 0.50, 0.75];

function buildThresholds(max: number): number[] {
  return CUTOFFS.map((p, i) => Math.max(i + 1, Math.round(max * p)));
}

function cellColor(count: number, dark: boolean, thresholds: number[]): string {
  const s = dark ? SCHEME_DARK : SCHEME_LIGHT;
  if (count === 0) return s[0];
  for (let i = 0; i < thresholds.length; i++) {
    if (count <= thresholds[i]) return s[i + 1];
  }
  return s[s.length - 1];
}

// [M1] summary numbers from the heatmap
function summarize(days: HeatmapDay[]) {
  const year = String(new Date().getFullYear());
  const thisYear = days.filter(d => d.date.startsWith(year)).reduce((a, d) => a + d.count, 0);
  const best = days.reduce<HeatmapDay | null>((b, d) => (!b || d.count > b.count ? d : b), null);
  const byDate = new Map(days.map(d => [d.date, d.count]));
  // streak: consecutive listening days ending today or yesterday
  const cur = new Date(); cur.setHours(12, 0, 0, 0);
  const isoOf = (d: Date) => d.toISOString().slice(0, 10);
  if (!byDate.get(isoOf(cur))) cur.setDate(cur.getDate() - 1);
  let streak = 0;
  while ((byDate.get(isoOf(cur)) ?? 0) > 0) { streak++; cur.setDate(cur.getDate() - 1); }
  return { thisYear, best, streak };
}

function Stat({ value, label, sub, accent, index, format }: {
  value: number | null; label: string; sub?: string; accent?: boolean; index: number; format?: (n: number) => string;
}) {
  return (
    <div className="row-in" style={row(index)}>
      <p className={cn('text-3xl md:text-4xl font-light tabular-nums leading-none', accent ? 'text-sage-moss' : 'text-foreground')}>
        <CountUp value={value} format={format ?? ((n) => Math.round(n).toLocaleString())} />
      </p>
      <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      {sub && <p className="text-[11px] text-muted-foreground/70 mt-0.5">{sub}</p>}
    </div>
  );
}

function HeatGrid({ dark }: { dark: boolean }) {
  const { data, isLoading } = useSpotifyHeatmap();
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to most recent (right) when data loads
  useEffect(() => {
    if (!isLoading && scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [isLoading]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lookup = new Map<string, number>();
  (data?.data ?? []).forEach(d => lookup.set(d.date, d.count));

  const max = Math.max(1, ...((data?.data ?? []).map(d => d.count)));
  const thresholds = buildThresholds(max);

  // Show all available history
  const dates = data?.data?.map(d => d.date) ?? [];
  const oneYearAgo = new Date(today);
  oneYearAgo.setDate(today.getDate() - 364);
  const oneYearAgoStr = oneYearAgo.toISOString().slice(0, 10);
  const earliest = dates.length > 0 && dates[0] < oneYearAgoStr ? dates[0] : oneYearAgoStr;
  const startDate = new Date(earliest + 'T12:00:00');
  const DAYS = Math.ceil((today.getTime() - startDate.getTime()) / 86400000) + 1;

  const cells: { date: string; count: number; dayOfWeek: number }[] = [];
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    cells.push({ date: iso, count: lookup.get(iso) ?? 0, dayOfWeek: d.getDay() });
  }

  // Pad start so week columns align with Mon
  const firstDay = cells[0].dayOfWeek; // 0=Sun
  const padStart = firstDay === 0 ? 6 : firstDay - 1; // shift to Mon-start

  // Month labels
  const monthLabels: { label: string; col: number }[] = [];
  let prevMonth = -1;
  cells.forEach((c, i) => {
    const col = Math.floor((i + padStart) / 7);
    const month = new Date(c.date).getMonth();
    if (month !== prevMonth) { monthLabels.push({ label: new Date(c.date).toLocaleString('en-US', { month: 'short' }), col }); prevMonth = month; }
  });

  const totalCols = Math.ceil((cells.length + padStart) / 7);
  const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-10"><Skeleton className="h-10 w-24" /><Skeleton className="h-10 w-20" /><Skeleton className="h-10 w-20" /></div>
        <div className="shimmer-block h-28 rounded" data-fb="F6" />
      </div>
    );
  }

  const sum = summarize(data?.data ?? []);
  const bestLabel = sum.best
    ? new Date(sum.best.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : undefined;

  return (
    <div className="relative select-none">
      {/* [M1] stat row */}
      <div className="flex gap-10 flex-wrap mb-7" data-fb="M1">
        <Stat value={sum.thisYear} label="tracks this year" accent index={0} />
        <Stat value={sum.best?.count ?? null} label="best day" sub={bestLabel} index={1} />
        <Stat value={sum.streak} label="day streak" format={(n) => String(Math.round(n))} index={2} />
      </div>

      <div ref={scrollRef} className="overflow-x-auto pb-1 pt-1" data-fb="M2">
      {/* Month labels */}
      <div className="flex mb-1 ml-7 text-[9px] text-muted-foreground">
        {Array.from({ length: totalCols }).map((_, col) => {
          const lbl = monthLabels.find(m => m.col === col);
          return <div key={col} className="w-[11px] mr-[2px] flex-shrink-0">{lbl?.label ?? ''}</div>;
        })}
      </div>

      <div className="flex gap-0">
        {/* Day-of-week labels */}
        <div className="flex flex-col mr-1.5">
          {DOW.map((d, i) => (
            <div key={d} className="text-[9px] text-muted-foreground h-[11px] mb-[2px] w-5 flex items-center">
              {i % 2 === 0 ? d : ''}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-[2px]">
          {Array.from({ length: totalCols }).map((_, col) => (
            <div key={col} className="flex flex-col gap-[2px]">
              {Array.from({ length: 7 }).map((_, r) => {
                const idx = col * 7 + r - padStart;
                if (idx < 0 || idx >= cells.length) {
                  return <div key={r} className="w-[11px] h-[11px] rounded-[2px] opacity-0" />;
                }
                const cell = cells[idx];
                return (
                  <div
                    key={r}
                    className="heat-cell w-[11px] h-[11px] rounded-[2px] cursor-default"
                    style={{ backgroundColor: cellColor(cell.count, dark, thresholds) }}
                    onMouseEnter={e => {
                      const rect = (e.target as HTMLElement).getBoundingClientRect();
                      setTooltip({ date: cell.date, count: cell.count, x: rect.left, y: rect.top });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      </div>{/* end scrollable */}

      {/* [F7] Tooltip */}
      {tooltip && (
        <div
          key={tooltip.date}
          className="popup-in fixed z-50 pointer-events-none bg-card border border-border rounded px-2 py-1 text-xs shadow-md"
          style={{ left: tooltip.x + 18, top: tooltip.y - 8 }}
        >
          <span className="text-muted-foreground">
            {new Date(tooltip.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <span className="ml-2 font-semibold text-foreground">
            {tooltip.count} {tooltip.count === 1 ? 'track' : 'tracks'}
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3 justify-end" data-fb="F7">
        <span className="text-[10px] text-muted-foreground">Less</span>
        {[0, 1, thresholds[0] + 1, thresholds[1] + 1, thresholds[2] + 1, thresholds[3] + 1, thresholds[4] + 1].map((n, i) => (
          <div key={i} className="w-[11px] h-[11px] rounded-[2px]" style={{ backgroundColor: cellColor(n, dark, thresholds) }} />
        ))}
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>
    </div>
  );
}

// ─── track rows [M4] ──────────────────────────────────────────────────────────

function TrackRow({ track, index, max }: { track: SpotifyTopTrack; index: number; max: number }) {
  const pct = track.playcount && max ? (track.playcount / max) * 100 : 0;
  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group pressable flex items-center justify-between py-3 border-b border-border last:border-0 row-in rounded-md"
      style={{ ...row(index), '--press': 0.99 } as CSSProperties}
    >
      <div className="flex items-center gap-4 min-w-0">
        <span className="text-sm tabular-nums text-muted-foreground w-4 flex-shrink-0">{index + 1}</span>
        {track.imageUrl && (
          <img
            src={track.imageUrl}
            alt={track.album}
            className="w-9 h-9 rounded-sm object-cover flex-shrink-0 transition-[transform,box-shadow] duration-200 ease-out group-hover:-translate-y-px group-hover:shadow-md"
          />
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate group-hover:text-sage-moss transition-colors duration-150 ease-out">
            {track.name}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{track.artist}</p>
        </div>
      </div>
      <div className="flex-shrink-0 ml-4 w-24 text-right">
        <span className="text-xs tabular-nums text-muted-foreground">
          {track.playcount ? `${track.playcount.toLocaleString()} plays` : fmtDuration(track.durationMs)}
        </span>
        {pct > 0 && (
          <div className="mt-1 h-[2px] w-full rounded-full bg-border/70 overflow-hidden">
            <div className="h-full rounded-full bg-sage-moss/60 origin-right transition-[width] duration-500 ease-out" style={{ width: `${pct}%`, marginLeft: 'auto' }} />
          </div>
        )}
      </div>
    </a>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function Stats() {
  const { data: stats, isLoading, isError } = useSpotifyStats();
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const maxPlays = Math.max(0, ...((stats?.topTracks ?? []).map(t => t.playcount ?? 0)));

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-100">
      <main className="max-w-3xl mx-auto px-6 py-6 space-y-16">

        {/* [M5] now playing */}
        <section className="-mb-6">
          <NowPlaying />
        </section>

        {/* [M1] listening history first */}
        <section>
          <SectionTitle title="Listening History" />
          <p className="text-xs text-muted-foreground mb-5">Tracks per day</p>
          <HeatGrid dark={dark} />
        </section>

        {/* [M3] top artists — typographic flow */}
        <section>
          <SectionTitle title="Top Artists" />
          <p className="text-xs text-muted-foreground mb-5" data-fb="M6">All time</p>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-4/5" />
              <Skeleton className="h-8 w-3/5" />
            </div>
          ) : isError ? (
            <p className="text-sm text-muted-foreground">Couldn't load stats.</p>
          ) : (
            <ArtistFlow artists={stats?.topArtists ?? []} />
          )}
        </section>

        {/* [M4] top tracks */}
        <section>
          <SectionTitle title="Top Tracks" />
          <p className="text-xs text-muted-foreground mb-4">All time</p>
          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-4 py-3 border-b border-border">
                  <Skeleton className="w-4 h-4" />
                  <Skeleton className="w-9 h-9 rounded-sm" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div data-fb="M4">
              {(stats?.topTracks ?? []).map((track, i) => (
                <TrackRow key={track.name + track.artist} track={track} index={i} max={maxPlays} />
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
