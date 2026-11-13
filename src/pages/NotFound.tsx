import { CSSProperties } from 'react';
import TLink from '@/components/common/TLink';
import NudgeArrow from '@/components/common/NudgeArrow';

// One paper crane, side-on: beak left, neck up-left, tall wing, tail up-right, flat body.
const CRANE = String.raw`
                    ##
                   ####
 <                 ####
  \               ######               /
   \             ########             /
    \           ##########           /
     \          ##########          /
      \        ############        /
       \      ##############      /
        \    ################    /
        ==========================
         ========================
          ======================
           ====================
`;

// A distant flock: small glyph-cranes drifting across at different depths.
const FLOCK: { top: string; dur: number; delay: number; size: number; op: number; glyph: string }[] = [
  { top: '12%', dur: 38, delay: -4,  size: 11, op: 0.55, glyph: '~v~' },
  { top: '18%', dur: 46, delay: -20, size: 9,  op: 0.35, glyph: '\\v/' },
  { top: '26%', dur: 52, delay: -31, size: 8,  op: 0.25, glyph: '~v~' },
  { top: '70%', dur: 44, delay: -12, size: 10, op: 0.4,  glyph: '\\v/' },
  { top: '78%', dur: 58, delay: -40, size: 8,  op: 0.25, glyph: '~v~' },
  { top: '86%', dur: 40, delay: -8,  size: 12, op: 0.5,  glyph: '\\v/' },
];

const NotFound = () => {
  return (
    <div className="relative min-h-[calc(100vh-200px)] overflow-hidden flex items-center justify-center text-foreground">
      {/* flock */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden>
        {FLOCK.map((b, i) => (
          <span
            key={i}
            className="crane-drift absolute left-0 text-sage-moss whitespace-pre"
            style={{
              top: b.top,
              fontSize: b.size,
              opacity: b.op,
              animationDuration: `${b.dur}s`,
              animationDelay: `${b.delay}s`,
              fontFamily: 'Menlo, Consolas, monospace',
              fontFeatureSettings: 'normal',
            } as CSSProperties}
          >
            {b.glyph}
          </span>
        ))}
      </div>

      <main className="relative max-w-3xl mx-auto px-6 py-10 flex flex-col items-center text-center">
        <pre
          aria-hidden
          className="crane-float text-left text-sage-moss leading-[1.05] select-none mb-8"
          style={{
            fontSize: 'clamp(8px, 1.5vw, 12px)',
            // body sets "calt"; contextual alternates break the character grid
            fontFamily: 'Menlo, Consolas, "Liberation Mono", "Courier New", monospace',
            fontFeatureSettings: 'normal',
            fontVariantLigatures: 'none',
          }}
        >
          {CRANE.replace(/^\n/, '')}
        </pre>

        <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-3 row-in" style={{ '--row': 2 } as CSSProperties}>
          404
        </p>
        <h1 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight mb-3 row-in" style={{ '--row': 4 } as CSSProperties}>
          This page folded itself away.
        </h1>
        <p className="text-muted-foreground leading-relaxed max-w-md mb-8 row-in" style={{ '--row': 6 } as CSSProperties}>
          Whatever you were looking for isn't here anymore. The cranes don't seem to mind.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 row-in" style={{ '--row': 8 } as CSSProperties}>
          <TLink
            to="/"
            className="group pressable inline-flex items-center gap-1.5 rounded-lg border border-dashed border-foreground/40 px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary transition-colors duration-150 ease-out"
          >
            Back home <NudgeArrow className="h-3 w-3 rotate-[225deg] group-hover:-translate-x-0.5 group-hover:translate-y-0.5 group-hover:translate-x-0 group-hover:-translate-y-0" />
          </TLink>
          <TLink
            to="/origami"
            className="group pressable inline-flex items-center gap-1 px-2 py-2 text-sm font-medium text-sage-moss hover:opacity-80 transition-opacity"
          >
            See the origami <NudgeArrow className="h-3 w-3" />
          </TLink>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
