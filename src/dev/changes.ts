// Registry for the dev feedback overlay. Each id matches a `data-fb` attribute
// in the tree (badge drawn at that element) or is global (listed in the panel only).
export interface ChangeEntry {
  id: string;
  title: string;
  where: string;
  note?: string;
}

export const CHANGES: ChangeEntry[] = [
  { id: 'F1', title: 'Easing tokens + press feedback', where: 'global · header icons, cards, buttons',
    note: 'Quint ease-out at 150–300ms everywhere; clickables squash to 97–98.5% on press.' },
  { id: 'F2', title: 'Staggered row reveal', where: 'Work, Projects, Albums',
    note: 'Rows fade in from -10px, 90ms + 28ms per row.' },
  { id: 'F3', title: 'Route cross-fade', where: 'header name link, in-text links',
    note: 'View Transitions API; header pinned. Out 100ms / in 160ms.' },
  { id: 'F4', title: 'Card expand', where: 'Work Experience cards',
    note: 'grid 0fr→1fr with drawer curve; body slides 6px; chevron rotates.' },
  { id: 'F5', title: 'Hover nudge ↗', where: 'Resume button, Spotify link, Visit button, card chevrons' },
  { id: 'F6', title: 'Loading shimmer', where: 'Spotify line (while loading), Stats skeletons',
    note: 'Neutral sweep, no colour.' },
  { id: 'F7', title: 'Tooltip pop-in', where: '/stats heatmap tooltip' },
  { id: 'F8', title: 'Projects expand (sheet reverted)', where: 'Projects',
    note: 'Round 2: sheet removed, same grid expand as Work Experience.' },
  { id: 'F10', title: 'Reduced-motion fallbacks', where: 'global',
    note: 'All of the above collapse to instant/fade under prefers-reduced-motion.' },

  // ── /whoop ──
  { id: 'H1', title: 'Sparkline hover scrub', where: '/whoop · recovery, strain, sleep lines',
    note: 'Dot follows cursor, dashed hairline, date + value tooltip.' },
  { id: 'H2', title: 'Recovery zone bands', where: '/whoop · recovery sparkline',
    note: 'Low / Moderate / Optimal at 34 / 67 in ramp colours, 7% opacity.' },
  { id: 'H3', title: 'Strain line under recovery', where: '/whoop · Fitness',
    note: 'Neutral stroke, 0–21 scale, 30 days. Sage stays on recovery.' },
  { id: 'H4', title: 'Hero count-up + late unit/zone', where: '/whoop · 66%',
    note: 'Quint curve; "%" and zone label land after the number.' },
  { id: 'H5', title: 'Segmented sleep bar', where: '/whoop · Sleep',
    note: 'Round 2: 30-day sleep line removed; weekly average kept.' },
  { id: 'H6', title: '"as of" timestamps', where: '/whoop · section headers' },
  { id: 'H7', title: 'Insight callout', where: '/whoop · sleep average',
    note: 'Round 2: HRV metric + HRV insight removed entirely.' },

  // ── /stats ──
  { id: 'M1', title: 'Heatmap first + stat row', where: '/stats · top',
    note: 'Tracks this year · best day · current streak, counted up + staggered.' },
  { id: 'M2', title: 'Heatmap cell lift', where: '/stats · heat grid',
    note: 'Cell scales 1.4 on hover, quint curve.' },
  { id: 'M3', title: 'Artist flow restyled', where: '/stats · Top Artists',
    note: 'Round 2: top 20, sizes taper to text-sm.' },
  { id: 'M4', title: 'Track rows: stagger, cover lift, play bar', where: '/stats · Top Tracks' },
  { id: 'M5', title: 'Now playing row', where: '/stats · top',
    note: 'Cover, title, artist, 3-bar equalizer when playing.' },
  { id: 'M6', title: 'Copy: "Last 4 weeks"', where: '/stats · subtitles', note: 'Upstream now queries period=1month, so the label is correct again.' },
];
