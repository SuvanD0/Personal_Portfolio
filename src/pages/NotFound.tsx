import { useEffect, useRef } from 'react';
import TLink from '@/components/common/TLink';

// 404 as an ASCII koi pond. Scene is rendered as grayscale brightness on a
// small grid, then each cell becomes a character from RAMP (dark → light).
const RAMP = ' .:-=+*#%@';
const COLS_MAX = 150;
const ROWS_MAX = 62;
const FPS = 30;

// ── noise ───────────────────────────────────────────────────────────────────
const hash = (x: number, y: number, z: number) => {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 1274126177)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const smooth = (t: number) => t * t * (3 - 2 * t);
const noise = (x: number, y: number, z: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const fx = smooth(x - xi), fy = smooth(y - yi), fz = smooth(z - zi);
  const l = (a: number, b: number, t: number) => a + (b - a) * t;
  const c = (dx: number, dy: number, dz: number) => hash(xi + dx, yi + dy, zi + dz);
  return l(
    l(l(c(0, 0, 0), c(1, 0, 0), fx), l(c(0, 1, 0), c(1, 1, 0), fx), fy),
    l(l(c(0, 0, 1), c(1, 0, 1), fx), l(c(0, 1, 1), c(1, 1, 1), fx), fy),
    fz,
  );
};

// ── scene ───────────────────────────────────────────────────────────────────
// All geometry lives in "x-units" (one cell width). Rows are A units tall.
type Pad = { x: number; y: number; r: number; wedge: number; phase: number };
type Fish = { ax: number; ay: number; w: number; p: number; dir: number; len: number; wid: number; b: number; fig8: boolean };
type Ring = { x: number; y: number; t0: number };

// Digit strokes in a unit box (w 1, h 1.4). '0' is an ellipse.
const DIGIT_4: [number, number][][] = [
  [[0, 0], [0, 0.85]],
  [[0, 0.85], [1, 0.85]],
  [[0.7, 0], [0.7, 1.5]],
];

function buildPads(cols: number, rows: number, A: number): Pad[] {
  const Hu = rows * A;
  const totalW = cols * (cols < 100 ? 0.72 : 0.6);
  const d = totalW / 3.7; // digit width; gaps are 0.35d
  const r = d * 0.17;
  const top = Hu / 2 - (1.5 * d) / 2;
  const left = cols / 2 - totalW / 2;
  const pads: Pad[] = [];
  const push = (x: number, y: number) => {
    if (pads.some(p => Math.hypot(p.x - x, p.y - y) < r * 1.6)) return;
    pads.push({ x, y, r, wedge: hash(pads.length, 7, 3) * Math.PI * 2, phase: hash(pads.length, 11, 5) * Math.PI * 2 });
  };
  const digitX = (i: number) => left + i * d * 1.35;
  const four = (ox: number) => {
    for (const [[x0, y0], [x1, y1]] of DIGIT_4) {
      const len = Math.hypot(x1 - x0, y1 - y0);
      const n = Math.max(1, Math.round(len / 0.36));
      for (let k = 0; k <= n; k++) {
        const t = k / n;
        push(ox + (x0 + (x1 - x0) * t) * d, top + (y0 + (y1 - y0) * t) * d);
      }
    }
  };
  const zero = (ox: number) => {
    const n = 11;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      push(ox + (0.5 + 0.5 * Math.cos(a)) * d, top + (0.75 + 0.75 * Math.sin(a)) * d);
    }
  };
  four(digitX(0));
  zero(digitX(1));
  four(digitX(2));
  return pads;
}

function buildFish(cols: number, rows: number, A: number): Fish[] {
  const s = cols / COLS_MAX;
  return [
    { ax: cols * 0.34, ay: rows * A * 0.36, w: 0.16, p: 0.0, dir: 1, len: 4.2 * s, wid: 1.5 * s, b: 0.95, fig8: true },
    { ax: cols * 0.28, ay: rows * A * 0.30, w: 0.13, p: 2.1, dir: -1, len: 3.4 * s, wid: 1.25 * s, b: 0.42, fig8: false },
    { ax: cols * 0.40, ay: rows * A * 0.26, w: 0.11, p: 4.0, dir: 1, len: 3.6 * s, wid: 1.3 * s, b: 0.42, fig8: true },
    { ax: cols * 0.22, ay: rows * A * 0.40, w: 0.19, p: 5.3, dir: -1, len: 3.0 * s, wid: 1.1 * s, b: 0.42, fig8: false },
  ];
}

const fishPos = (f: Fish, t: number, cx: number, cy: number) => {
  const a = f.w * t * f.dir + f.p;
  return f.fig8
    ? [cx + f.ax * Math.cos(a), cy + f.ay * Math.sin(2 * a) * 0.9]
    : [cx + f.ax * Math.cos(a), cy + f.ay * Math.sin(a)];
};

// ── renderer ────────────────────────────────────────────────────────────────
function makeScene(cols: number, rows: number, A: number) {
  const buf = new Float32Array(cols * rows);
  const pads = buildPads(cols, rows, A);
  const fish = buildFish(cols, rows, A);
  const rings: Ring[] = [];
  let nextRing = 0.4;
  const cx = cols / 2, cy = (rows * A) / 2;

  const frame = (t: number, animate: boolean) => {
    // water
    for (let j = 0; j < rows; j++) {
      const y = (j + 0.5) * A;
      for (let i = 0; i < cols; i++) {
        const n = noise((i + 0.5) * 0.16 + t * 0.12, y * 0.16, t * 0.07);
        buf[j * cols + i] = n * 0.13;
      }
    }

    // raindrop rings
    if (animate) {
      if (t > nextRing) {
        rings.push({ x: 2 + hash(Math.floor(t * 100), 1, 1) * (cols - 4), y: 1 + hash(Math.floor(t * 100), 2, 1) * (rows * A - 2), t0: t });
        nextRing = t + 0.7 + hash(Math.floor(t * 100), 3, 1) * 0.8;
      }
    } else if (rings.length === 0) {
      rings.push({ x: cols * 0.2, y: rows * A * 0.3, t0: t - 0.6 }, { x: cols * 0.8, y: rows * A * 0.75, t0: t - 1.0 });
    }
    for (let k = rings.length - 1; k >= 0; k--) {
      const rg = rings[k];
      const age = t - rg.t0;
      if (age > 1.7) { rings.splice(k, 1); continue; }
      const r = age * 8;
      const alpha = 1 - age / 1.7;
      const j0 = Math.max(0, Math.floor((rg.y - r - 1) / A)), j1 = Math.min(rows - 1, Math.ceil((rg.y + r + 1) / A));
      const i0 = Math.max(0, Math.floor(rg.x - r - 1)), i1 = Math.min(cols - 1, Math.ceil(rg.x + r + 1));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const d = Math.abs(Math.hypot(i + 0.5 - rg.x, (j + 0.5) * A - rg.y) - r);
        if (d < 0.8) buf[j * cols + i] += 0.4 * alpha * (1 - d / 0.8);
      }
    }

    // fish: shadow first, then body + tail
    for (const f of fish) {
      const [px, py] = fishPos(f, t, cx, cy);
      const [qx, qy] = fishPos(f, t + 0.05, cx, cy);
      const hd = Math.atan2(qy - py, qx - px);
      const ch = Math.cos(hd), sh = Math.sin(hd);
      const swish = Math.sin(t * 5 + f.p) * f.wid * 0.9;
      const R = f.len * 1.6 + 1;
      const paint = (ox: number, oy: number, apply: (idx: number, inBody: boolean) => void) => {
        const j0 = Math.max(0, Math.floor((py + oy - R) / A)), j1 = Math.min(rows - 1, Math.ceil((py + oy + R) / A));
        const i0 = Math.max(0, Math.floor(px + ox - R)), i1 = Math.min(cols - 1, Math.ceil(px + ox + R));
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
          const dx = i + 0.5 - (px + ox), dy = (j + 0.5) * A - (py + oy);
          const u = dx * ch + dy * sh, v = -dx * sh + dy * ch; // along / across
          const body = (u * u) / (f.len * f.len) + (v * v) / (f.wid * f.wid) <= 1;
          let tail = false;
          if (!body && u < -f.len * 0.75 && u > -f.len * 1.55) {
            const k = (-u - f.len * 0.75) / (f.len * 0.8); // 0 at body, 1 at tip
            tail = Math.abs(v - swish * k) <= f.wid * 1.1 * k;
          }
          if (body || tail) apply(j * cols + i, body);
        }
      };
      paint(1.2, 1.1, idx => { buf[idx] = Math.max(0, buf[idx] - 0.14); });
      paint(0, 0, (idx, inBody) => { buf[idx] = inBody ? f.b : f.b * 0.8; });
    }

    // lily pads on top
    for (let k = 0; k < pads.length; k++) {
      const p = pads[k];
      const bob = animate ? Math.sin(t * 0.8 + p.phase) * 0.35 : 0;
      const bx = p.x + bob * 0.6, by = p.y + bob;
      const j0 = Math.max(0, Math.floor((by - p.r) / A)), j1 = Math.min(rows - 1, Math.ceil((by + p.r) / A));
      const i0 = Math.max(0, Math.floor(bx - p.r)), i1 = Math.min(cols - 1, Math.ceil(bx + p.r));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const dx = i + 0.5 - bx, dy = (j + 0.5) * A - by;
        const d = Math.hypot(dx, dy);
        if (d > p.r) continue;
        let ang = Math.atan2(dy, dx) - p.wedge;
        ang = ((ang % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        if (ang < 0.6) continue; // wedge cut
        buf[j * cols + i] = d > p.r - 1 ? 0.55 : hash(i, j, k) > 0.5 ? 0.95 : 0.75;
      }
    }
    return buf;
  };
  return { frame };
}

const TIERS: [number, string][] = [[0.68, '#f2f2f2'], [0.3, '#a3a3a3'], [0, '#6a6a6a']];

const NotFound = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let raf = 0;
    let cols = 0, rows = 0, cellW = 0, cellH = 0, font = 0;
    let scene: ReturnType<typeof makeScene> | null = null;
    const t0 = performance.now();
    let last = 0;

    const layout = () => {
      const w = wrap.clientWidth;
      if (!w) return;
      cols = Math.max(56, Math.min(COLS_MAX, Math.floor(w / (w < 500 ? 4 : 5))));
      rows = Math.round((cols * ROWS_MAX) / COLS_MAX);
      cellW = w / cols;
      // size the font so one glyph advance == cellW
      ctx.font = '10px Menlo, Consolas, "Liberation Mono", "Courier New", monospace';
      const adv = ctx.measureText('M').width / 10;
      font = cellW / adv;
      cellH = font * 1.0;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(rows * cellH * dpr);
      canvas.style.height = `${rows * cellH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scene = makeScene(cols, rows, cellH / cellW);
      draw(reduced ? 3 : (performance.now() - t0) / 1000);
    };

    const draw = (t: number) => {
      if (!scene) return;
      const buf = scene.frame(t, !reduced);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, cols * cellW, rows * cellH);
      ctx.font = `${font}px Menlo, Consolas, "Liberation Mono", "Courier New", monospace`;
      ctx.textBaseline = 'top';
      for (let j = 0; j < rows; j++) {
        for (const [min, color] of TIERS) {
          let s = '';
          let any = false;
          for (let i = 0; i < cols; i++) {
            const b = buf[j * cols + i];
            const lo = min, hi = min === 0.68 ? 2 : min === 0.3 ? 0.68 : 0.3;
            if (b >= lo && b < hi) {
              const c = RAMP[Math.min(9, Math.max(0, Math.floor(b * 10)))];
              s += c; any = any || c !== ' ';
            } else s += ' ';
          }
          if (!any) continue;
          ctx.fillStyle = color;
          ctx.fillText(s, 0, j * cellH);
        }
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 1000 / FPS) return;
      last = now;
      draw((now - t0) / 1000);
    };

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(wrap);
    if (!reduced) raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div ref={wrapRef} className="rounded-lg overflow-hidden bg-black">
        <canvas ref={canvasRef} className="block w-full" role="img" aria-label="404. An ASCII koi pond: lily pads spell 404 while koi swim beneath." />
      </div>
      <div className="mt-6 text-center font-mono text-sm text-muted-foreground row-in" style={{ '--row': 2 } as React.CSSProperties}>
        <p>this page swam away</p>
        <p className="mt-1">
          <TLink to="/" className="pressable text-foreground underline decoration-dashed underline-offset-4 hover:text-primary transition-colors duration-150 ease-out">
            back to shore
          </TLink>
        </p>
      </div>
    </main>
  );
};

export default NotFound;
