import { Home, Search, User, Pencil, Sparkles, Package, Tag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/* Card wrapper matching the mockup's rounded panels */
const Panel = ({
  label,
  meta,
  className = '',
  children,
}: {
  label?: string;
  meta?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={`rounded-2xl bg-card p-5 shadow-sm ${className}`}>
    {(label || meta) && (
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="text-sm text-muted-foreground">{meta}</span>
      </div>
    )}
    {children}
  </div>
);

/* Color swatch with a tint/shade ramp, like the mockup's color chips */
const ColorSwatch = ({
  name,
  hex,
  base,
}: {
  name: string;
  hex: string;
  base: string;
}) => {
  // 12-step ramp from dark -> light over the base hue
  const steps = Array.from({ length: 12 }, (_, i) => {
    const t = i / 11;
    return `color-mix(in srgb, ${base} ${Math.round((1 - t) * 100)}%, white)`;
  });
  return (
    <div className="overflow-hidden rounded-2xl shadow-sm">
      <div className="flex items-center justify-between px-4 py-4" style={{ background: base }}>
        <span className="text-sm font-semibold text-white drop-shadow">{name}</span>
        <span className="text-sm font-medium text-white/90 drop-shadow">{hex}</span>
      </div>
      <div className="flex h-8">
        {steps.map((c, i) => (
          <div key={i} className="flex-1" style={{ background: c }} />
        ))}
      </div>
    </div>
  );
};

const StyleGuide = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="mb-1 text-3xl">Design System</h1>
        <p className="mb-8 text-muted-foreground">Colors, type, and components for the site.</p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* ---- Column 1: Colors ---- */}
          <div className="space-y-4">
            <ColorSwatch name="Primary" hex="#5E915C" base="#5E915C" />
            <ColorSwatch name="Secondary" hex="#EEEEEE" base="#EEEEEE" />
            <ColorSwatch name="Tertiary" hex="#B96E89" base="#B96E89" />
            <ColorSwatch name="Neutral" hex="#212121" base="#212121" />
          </div>

          {/* ---- Column 2: Typography ---- */}
          <div className="space-y-4">
            <Panel label="Headline" meta="Playfair Display">
              <span className="font-heading text-7xl leading-none">Aa</span>
            </Panel>
            <Panel label="Body" meta="Source Sans 3">
              <span className="font-body text-7xl leading-none">Aa</span>
            </Panel>
            <Panel label="Label" meta="Source Sans 3">
              <span className="font-body text-7xl font-medium leading-none">Aa</span>
            </Panel>
          </div>

          {/* ---- Column 3: Buttons / sliders / small controls ---- */}
          <div className="space-y-4">
            <Panel>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="inverted">Inverted</Button>
                <Button variant="outline">Outlined</Button>
              </div>
            </Panel>
            <Panel>
              <div className="space-y-4 py-2">
                <div className="h-1.5 w-full rounded-full bg-sage-moss" style={{ width: '85%' }} />
                <div className="h-1.5 w-full rounded-full bg-muted-foreground/50" style={{ width: '70%' }} />
                <div className="h-1.5 w-full rounded-full bg-tertiary" style={{ width: '45%' }} />
              </div>
            </Panel>
            <Panel>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="text-tertiary">
                  <Pencil />
                </Button>
                <Button variant="primary" className="gap-2">
                  <Pencil /> Label
                </Button>
              </div>
            </Panel>
          </div>

          {/* ---- Column 4: Search / nav / actions ---- */}
          <div className="space-y-4">
            <Panel>
              <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2.5">
                <Search className="size-4 text-muted-foreground" />
                <input
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="Search"
                />
              </div>
            </Panel>
            <Panel>
              <div className="flex items-center justify-center gap-6 py-2">
                <button className="flex size-10 items-center justify-center rounded-lg bg-sage-moss text-white">
                  <Home className="size-5" />
                </button>
                <button className="flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground">
                  <Search className="size-5" />
                </button>
                <button className="flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground">
                  <User className="size-5" />
                </button>
              </div>
            </Panel>
            <Panel>
              <div className="flex items-center gap-2">
                <Button variant="tertiary" size="icon"><Sparkles /></Button>
                <Button variant="inverted" size="icon"><Package /></Button>
                <Button variant="tertiary" size="icon"><Tag /></Button>
                <Button variant="destructive" size="icon"><Trash2 /></Button>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleGuide;
