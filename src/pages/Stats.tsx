import { useSpotify } from '@/hooks/useSpotify';
import { useSpotifyStats } from '@/hooks/useSpotifyStats';
import { useSpotifyHeatmap } from '@/hooks/useSpotifyHeatmap';
import { useTheme } from '@/hooks/useTheme';
import SectionTitle from '@/components/common/SectionTitle';
import { SpotifyRecentTrack, SpotifyTopTrack, SpotifyArtist } from '@/services/spotifyStats';
import { useState } from 'react';

const CLAY_LIGHT = '#B06B52';
const CLAY_DARK  = '#C07B62';

function fmtDuration(ms: number): string {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function fmtRelative(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'just now';
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-border ${className ?? ''}`} />;
}

// ─── artist flow ──────────────────────────────────────────────────────────────

function ArtistFlow({ artists, dark }: { artists: SpotifyArtist[]; dark: boolean }) {
  const clay = dark ? CLAY_DARK : CLAY_LIGHT;
  return (
    <p className="text-2xl font-bold leading-snug tracking-tight">
      {artists.map((a, i) => (
        <span key={a.name}>
          <a
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: clay }}
            className="hover:opacity-70 transition-opacity duration-150"
          >
            {a.name}
          </a>
          {i < artists.length - 1 && (
            <span className="text-muted-foreground mx-1.5 font-normal select-none">·</span>
          )}
        </span>
      ))}
    </p>
  );
}

// ─── heat grid ────────────────────────────────────────────────────────────────

function cellColor(count: number, dark: boolean): string {
  const clay = dark ? CLAY_DARK : CLAY_LIGHT;
  if (count === 0) return dark ? '#2a2a2a' : '#e8e3da';
  if (count <= 3)  return `${clay}33`;
  if (count <= 8)  return `${clay}66`;
  if (count <= 15) return `${clay}99`;
  if (count <= 25) return `${clay}cc`;
  return clay;
}

function HeatGrid({ dark }: { dark: boolean }) {
  const { data, isLoading } = useSpotifyHeatmap();
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lookup = new Map<string, number>();
  (data?.data ?? []).forEach(d => lookup.set(d.date, d.count));

  // Span from earliest data date to today
  const dates = data?.data?.map(d => d.date) ?? [];
  const earliest = dates.length > 0 ? dates[0] : (() => {
    const d = new Date(today); d.setDate(today.getDate() - 90); return d.toISOString().slice(0, 10);
  })();
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
    return <div className="animate-pulse h-28 rounded bg-border" />;
  }

  return (
    <div className="relative select-none">
      {/* Month labels */}
      <div className="flex mb-1 ml-8 text-[10px] text-muted-foreground">
        {Array.from({ length: totalCols }).map((_, col) => {
          const lbl = monthLabels.find(m => m.col === col);
          return <div key={col} className="w-[13px] mr-[2px] flex-shrink-0">{lbl?.label ?? ''}</div>;
        })}
      </div>

      <div className="flex gap-0">
        {/* Day-of-week labels */}
        <div className="flex flex-col mr-1.5">
          {DOW.map((d, i) => (
            <div key={d} className="text-[10px] text-muted-foreground h-[13px] mb-[2px] w-6 flex items-center">
              {i % 2 === 0 ? d : ''}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-[2px]">
          {Array.from({ length: totalCols }).map((_, col) => (
            <div key={col} className="flex flex-col gap-[2px]">
              {Array.from({ length: 7 }).map((_, row) => {
                const idx = col * 7 + row - padStart;
                if (idx < 0 || idx >= cells.length) {
                  return <div key={row} className="w-[13px] h-[13px] rounded-[2px] opacity-0" />;
                }
                const cell = cells[idx];
                return (
                  <div
                    key={row}
                    className="w-[13px] h-[13px] rounded-[2px] cursor-default transition-opacity duration-100 hover:opacity-80"
                    style={{ backgroundColor: cellColor(cell.count, dark) }}
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

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-card border border-border rounded px-2 py-1 text-xs shadow-md"
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
      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-[10px] text-muted-foreground">Less</span>
        {[0, 3, 8, 15, 25, 30].map(n => (
          <div key={n} className="w-[11px] h-[11px] rounded-[2px]" style={{ backgroundColor: cellColor(n, dark) }} />
        ))}
        <span className="text-[10px] text-muted-foreground">More</span>
      </div>
    </div>
  );
}

// ─── track / recent rows ──────────────────────────────────────────────────────

function TrackRow({ track, index }: { track: SpotifyTopTrack; index: number }) {
  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between py-3 border-b border-border last:border-0 group"
    >
      <div className="flex items-center gap-4 min-w-0">
        <span className="text-sm tabular-nums text-muted-foreground w-4 flex-shrink-0">{index + 1}</span>
        {track.imageUrl && (
          <img src={track.imageUrl} alt={track.album} className="w-9 h-9 rounded-sm object-cover flex-shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate group-hover:text-clay-ember transition-colors duration-150">
            {track.name}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{track.artist}</p>
        </div>
      </div>
      <span className="text-xs tabular-nums text-muted-foreground flex-shrink-0 ml-4">
        {fmtDuration(track.durationMs)}
      </span>
    </a>
  );
}

function RecentRow({ track }: { track: SpotifyRecentTrack }) {
  return (
    <a
      href={track.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between py-2.5 border-b border-border last:border-0 group"
    >
      <div className="min-w-0">
        <p className="text-sm text-foreground truncate group-hover:text-clay-ember transition-colors duration-150">
          {track.name}
          <span className="text-muted-foreground font-normal"> · {track.artist}</span>
        </p>
      </div>
      <span className="text-xs tabular-nums text-muted-foreground flex-shrink-0 ml-4">
        {fmtRelative(track.playedAt)}
      </span>
    </a>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function Stats() {
  const { data: nowPlaying } = useSpotify();
  const { data: stats, isLoading, isError } = useSpotifyStats();
  const { theme } = useTheme();
  const dark = theme === 'dark';

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-100">
      <main className="max-w-3xl mx-auto px-6 py-6 space-y-16">

        {/* Now playing */}
        <section>
          <SectionTitle title="Listening" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {!nowPlaying || !nowPlaying.title ? (
              'Not currently listening to anything.'
            ) : nowPlaying.isPlaying ? (
              <>
                Currently listening to{' '}
                <a href={nowPlaying.songUrl} target="_blank" rel="noopener noreferrer"
                  className="text-clay-ember hover:opacity-80 transition-opacity font-medium">
                  {nowPlaying.title}
                </a>
                {' '}by {nowPlaying.artist}.
              </>
            ) : (
              <>
                Last played{' '}
                <a href={nowPlaying.songUrl} target="_blank" rel="noopener noreferrer"
                  className="text-clay-ember hover:opacity-80 transition-opacity font-medium">
                  {nowPlaying.title}
                </a>
                {' '}by {nowPlaying.artist}.
              </>
            )}
          </p>
        </section>

        {/* Top artists — typographic flow */}
        <section>
          <SectionTitle title="Top Artists" />
          <p className="text-xs text-muted-foreground mb-5">Last 6 months</p>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-4/5" />
              <Skeleton className="h-8 w-3/5" />
            </div>
          ) : isError ? (
            <p className="text-sm text-muted-foreground">Couldn't load stats.</p>
          ) : (
            <ArtistFlow artists={stats?.topArtists ?? []} dark={dark} />
          )}
        </section>

        {/* Listening history heat grid */}
        <section>
          <SectionTitle title="Listening History" />
          <p className="text-xs text-muted-foreground mb-5">Tracks per day</p>
          <HeatGrid dark={dark} />
        </section>

        {/* Top tracks */}
        <section>
          <SectionTitle title="Top Tracks" />
          <p className="text-xs text-muted-foreground mb-4">Last 4 weeks</p>
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
            <div>
              {(stats?.topTracks ?? []).map((track, i) => (
                <TrackRow key={track.name + track.artist} track={track} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Recently played */}
        <section>
          <SectionTitle title="Recently Played" />
          {isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-border">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          ) : (
            <div>
              {(stats?.recentlyPlayed ?? []).map((track, i) => (
                <RecentRow key={`${track.name}-${track.playedAt}`} track={track} />
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
