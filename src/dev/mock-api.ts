// Dev-only mock for /api/* so /whoop and /stats render without the Vercel
// functions. Enabled in `vite` dev unless MOCK_API=0 (see `npm run dev:live`).
// Data is seeded so it is identical across reloads.
import type { Plugin } from 'vite';

// ── seeded rng ────────────────────────────────────────────────────────────────
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (n: number) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - n); return d; };

// ── music ─────────────────────────────────────────────────────────────────────
const ARTISTS = [
  ['Radiohead', 2140], ['Elliott Smith', 1820], ['Peter Cat Recording Co.', 1510],
  ['Nick Drake', 1275], ['Taylor Swift', 1190], ['Vampire Weekend', 1044],
  ['The Alchemist', 980], ['Black Box Recorder', 612], ['Big Thief', 540], ['MF DOOM', 498],
] as const;

const TRACKS: [string, string, string, number, number][] = [
  // name, artist, cover, durationMs, playcount
  ['Weird Fishes / Arpeggi', 'Radiohead', '/albums/In_Rainbows.jpg', 318000, 212],
  ['Between the Bars', 'Elliott Smith', '/albums/Either_Or.jpg', 141000, 187],
  ['Floated By', 'Peter Cat Recording Co.', '/albums/Beta.jpg', 279000, 164],
  ['Pink Moon', 'Nick Drake', '/albums/Pink_Moon.jpg', 125000, 149],
  ['august', 'Taylor Swift', '/albums/Folklore.jpg', 261000, 141],
  ['Oxford Comma', 'Vampire Weekend', '/albums/Vampire_Weekend.jpg', 195000, 126],
  ['E-Coli', 'The Alchemist', '/albums/Bread.jpg', 151000, 118],
  ['Child Psychology', 'Black Box Recorder', '/albums/England_Made_Me.jpg', 241000, 97],
  ['Reckoner', 'Radiohead', '/albums/In_Rainbows.jpg', 290000, 91],
  ['Say Yes', 'Elliott Smith', '/albums/Either_Or.jpg', 139000, 84],
];

function musicStats() {
  const slug = (s: string) => encodeURIComponent(s.replace(/ /g, '+'));
  return {
    topArtists: ARTISTS.map(([name, playcount]) => ({
      name, genres: [], imageUrl: null, url: `https://www.last.fm/music/${slug(name)}`, playcount,
    })),
    topTracks: TRACKS.map(([name, artist, imageUrl, durationMs, playcount]) => ({
      name, artist, album: '', imageUrl, url: `https://www.last.fm/music/${slug(artist)}/_/${slug(name)}`, durationMs, playcount,
    })),
    recentlyPlayed: [],
  };
}

function heatmap() {
  // ~14 months, weekday-heavy with a few dead weeks (travel) and a hot streak.
  const r = rng(42);
  const out: { date: string; count: number }[] = [];
  const N = 420;
  for (let i = N - 1; i >= 0; i--) {
    const d = daysAgo(i);
    const dow = d.getDay();
    const weekend = dow === 0 || dow === 6;
    const base = weekend ? 14 : 34;
    const season = 1 + 0.35 * Math.sin((i / N) * Math.PI * 4);
    let c = base * season + (r() - 0.5) * 22;
    if (i > 300 && i < 312) c = r() < 0.7 ? 0 : 3;        // trip, phone off
    if (i > 120 && i < 128) c = r() < 0.6 ? 0 : 5;
    if (i >= 40 && i < 52) c *= 1.9;                        // new-album binge
    if (r() < 0.08) c = 0;
    out.push({ date: iso(d), count: Math.round(clamp(c, 0, 140)) });
  }
  return { data: out };
}

const nowPlaying = {
  isPlaying: true,
  title: 'Weird Fishes / Arpeggi',
  artist: 'Radiohead',
  album: 'In Rainbows',
  albumImageUrl: '/albums/In_Rainbows.jpg',
  songUrl: 'https://open.spotify.com/track/1p3xlnxHX3ZR8I0RfaZaiL',
};

// ── whoop ─────────────────────────────────────────────────────────────────────
function whoop() {
  const r = rng(7);
  const days = 30;
  const recovery: { date: string; score: number }[] = [];
  const hrv: { date: string; value: number }[] = [];
  const strain: { date: string; score: number }[] = [];
  const sleep: { date: string; minutes: number }[] = [];
  let hrvBase = 62;
  for (let i = days - 1; i >= 0; i--) {
    const d = daysAgo(i);
    const dow = d.getDay();
    hrvBase += (r() - 0.5) * 6;
    hrvBase = clamp(hrvBase, 40, 90);
    const slept = clamp(7.1 * 60 + (dow === 5 || dow === 6 ? 45 : 0) + (r() - 0.5) * 110, 290, 560);
    const rec = clamp(Math.round(hrvBase * 0.9 + (slept - 420) * 0.12 + (r() - 0.5) * 22), 12, 98);
    const str = clamp(+(8 + (dow === 2 || dow === 4 ? 6 : 2) + (r() - 0.5) * 7).toFixed(1), 3.5, 19.8);
    const ds = d.toISOString();
    recovery.push({ date: ds, score: rec });
    hrv.push({ date: ds, value: Math.round(hrvBase) });
    strain.push({ date: ds, score: str });
    sleep.push({ date: ds, minutes: Math.round(slept) });
  }
  const last = recovery[recovery.length - 1];
  const lastSleep = sleep[sleep.length - 1].minutes;
  const light = Math.round(lastSleep * 0.5), rem = Math.round(lastSleep * 0.24), sws = lastSleep - light - rem;
  return {
    recovery: { score: last.score, hrv: hrv[hrv.length - 1].value, rhr: 52, spo2: 97.4, skinTemp: 33.6, scoreState: 'SCORED', date: last.date },
    sleep: { duration: lastSleep, performance: Math.round(clamp((lastSleep / 460) * 100, 40, 100)), efficiency: 92, stages: { light, rem, sws, awake: 31 }, respiratoryRate: 14.8, date: last.date },
    strain: { score: strain[strain.length - 1].score, calories: 2310, avgHr: 71, maxHr: 168, date: last.date },
    trends: { recovery, strain, hrv, sleep },
  };
}

// ── plugin ────────────────────────────────────────────────────────────────────
const ROUTES: Record<string, () => unknown> = {
  '/api/spotify/now-playing': () => nowPlaying,
  '/api/spotify/stats': musicStats,
  '/api/lastfm/heatmap': heatmap,
  '/api/whoop/data': whoop,
};

export function mockApi(): Plugin {
  return {
    name: 'mock-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? '').split('?')[0];
        const handler = ROUTES[path];
        if (!handler) return next();
        const body = JSON.stringify(handler());
        // small, varied latency so loading states are visible
        const delay = 350 + Math.round(Math.random() * 500);
        setTimeout(() => {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('X-Mock', '1');
          res.end(body);
        }, delay);
      });
      server.config.logger.info('  ➜  mock-api: serving fake /api/* (MOCK_API=0 to use real backend)');
    },
  };
}
