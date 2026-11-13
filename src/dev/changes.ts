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
  { id: 'F9', title: 'Hatch gutters', where: 'outside content column, ≥1024px',
    note: 'Round 2: dashed borders removed, solid column widened 3xl→4xl.' },
  { id: 'F10', title: 'Reduced-motion fallbacks', where: 'global',
    note: 'All of the above collapse to instant/fade under prefers-reduced-motion.' },
];
