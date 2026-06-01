import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEY = process.env.LASTFM_API_KEY;
const USER = process.env.LASTFM_USERNAME;
const BASE = 'https://ws.audioscrobbler.com/2.0/';
const BATCH_SIZE = 10;
const KV_KEY = 'lastfm:heatmap';
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const KV_AVAILABLE = !!(REDIS_URL && REDIS_TOKEN);

interface HeatmapCache {
  counts: Record<string, number>;
  cachedThrough: string; // YYYY-MM-DD, last fully-stored day (always yesterday or earlier)
}

async function kvGet<T>(key: string): Promise<T | null> {
  if (!KV_AVAILABLE) return null;
  const res = await fetch(`${REDIS_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  });
  if (!res.ok) return null;
  const data = await res.json() as { result: string | null };
  if (!data.result) return null;
  try { return JSON.parse(data.result) as T; } catch { return null; }
}

async function kvSet<T>(key: string, value: T): Promise<void> {
  if (!KV_AVAILABLE) return;
  // POST body form handles arbitrarily large JSON; path-style fails on long URLs.
  await fetch(`${REDIS_URL}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    body: JSON.stringify(value),
  });
}

function buildUrl(page: number, from?: number) {
  const u = new URL(BASE);
  u.searchParams.set('method', 'user.getRecentTracks');
  u.searchParams.set('user', USER || '');
  u.searchParams.set('api_key', API_KEY || '');
  u.searchParams.set('format', 'json');
  u.searchParams.set('limit', '200');
  u.searchParams.set('page', String(page));
  if (from !== undefined) u.searchParams.set('from', String(from));
  return u.toString();
}

function processTracks(tracks: any[], counts: Record<string, number>, excludeDate?: string) {
  for (const t of tracks) {
    if (t['@attr']?.nowplaying) continue;
    const uts = t.date?.uts;
    if (!uts) continue;
    const date = new Date(parseInt(uts) * 1000).toISOString().slice(0, 10);
    if (excludeDate && date === excludeDate) continue;
    counts[date] = (counts[date] ?? 0) + 1;
  }
}

async function fetchScrobbles(from?: number, excludeToday?: string): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  const firstRes = await fetch(buildUrl(1, from));
  if (!firstRes.ok) {
    const body = await firstRes.text();
    throw new Error(`Last.fm error: ${firstRes.status} ${body}`);
  }
  const firstData = await firstRes.json();
  const totalPages = parseInt(firstData.recenttracks?.['@attr']?.totalPages || '1');
  processTracks(firstData.recenttracks?.track ?? [], counts, excludeToday);

  for (let start = 2; start <= totalPages; start += BATCH_SIZE) {
    const pages = Array.from(
      { length: Math.min(BATCH_SIZE, totalPages - start + 1) },
      (_, i) => start + i
    );
    const results = await Promise.allSettled(
      pages.map(p => fetch(buildUrl(p, from)).then(r => r.ok ? r.json() : null))
    );
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        processTracks(result.value.recenttracks?.track ?? [], counts, excludeToday);
      }
    }
  }

  return counts;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  // Short server cache — today's live data refreshes every 5 min; historical is in KV
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const today = new Date().toISOString().slice(0, 10);
    const todayMidnightTs = Math.floor(new Date(today + 'T00:00:00Z').getTime() / 1000);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    let historicalCounts: Record<string, number> = {};

    if (KV_AVAILABLE) {
      try {
        const cached = await kvGet<HeatmapCache>(KV_KEY);

        if (cached) {
          historicalCounts = cached.counts;

          // Fetch any days between cachedThrough and yesterday (inclusive)
          if (cached.cachedThrough < yesterdayStr) {
            const nextDay = new Date(cached.cachedThrough);
            nextDay.setDate(nextDay.getDate() + 1);
            const fromTs = Math.floor(nextDay.setUTCHours(0, 0, 0, 0) / 1000);
            const newCounts = await fetchScrobbles(fromTs, today);
            for (const [date, count] of Object.entries(newCounts)) {
              historicalCounts[date] = (historicalCounts[date] ?? 0) + count;
            }
            await kvSet<HeatmapCache>(KV_KEY, { counts: historicalCounts, cachedThrough: yesterdayStr });
          }
        } else {
          // First run — full history fetch, store everything except today
          historicalCounts = await fetchScrobbles(undefined, today);
          await kvSet<HeatmapCache>(KV_KEY, { counts: historicalCounts, cachedThrough: yesterdayStr });
        }
      } catch (kvErr) {
        console.error('KV error, falling back to full fetch:', kvErr);
        historicalCounts = await fetchScrobbles(undefined, today);
      }
    } else {
      // No KV configured — full fetch every time
      historicalCounts = await fetchScrobbles(undefined, today);
    }

    // Always fetch today live (fast — just today's page)
    const todayCounts = await fetchScrobbles(todayMidnightTs);

    const finalCounts = { ...historicalCounts };
    for (const [date, count] of Object.entries(todayCounts)) {
      finalCounts[date] = (finalCounts[date] ?? 0) + count;
    }

    const data = Object.entries(finalCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return res.status(200).json({ data });
  } catch (error) {
    console.error('Last.fm heatmap error:', error);
    return res.status(500).json({ error: 'Failed to fetch listening history' });
  }
}
