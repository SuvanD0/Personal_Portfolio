import type { VercelRequest, VercelResponse } from '@vercel/node';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

async function getAccessToken(): Promise<string> {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN || '',
    }),
  });
  const data = await response.json();
  return data.access_token;
}

// Paginate as far back as Spotify's API allows.
// We stop when: Spotify returns <50 items (no more pages), or we hit the
// serverless function budget (~8 s wall time to stay under Vercel's 10 s limit).
const BUDGET_MS = 8000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  // Cache aggressively — history doesn't change by the minute.
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const token = await getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };
    const deadline = Date.now() + BUDGET_MS;

    const dailyCounts: Record<string, number> = {};
    let before: number | null = null;

    while (Date.now() < deadline) {
      const url = new URL('https://api.spotify.com/v1/me/player/recently-played');
      url.searchParams.set('limit', '50');
      if (before) url.searchParams.set('before', String(before));

      const r = await fetch(url.toString(), { headers });
      if (!r.ok) break;

      const pageData = await r.json();
      const items: { played_at: string }[] = pageData.items ?? [];
      if (items.length === 0) break;

      for (const item of items) {
        const date = item.played_at.slice(0, 10); // YYYY-MM-DD
        dailyCounts[date] = (dailyCounts[date] ?? 0) + 1;
      }

      // Cursor for next page: 1 ms before the oldest item on this page
      const oldest = items[items.length - 1];
      before = new Date(oldest.played_at).getTime() - 1;

      // Spotify returns fewer than 50 when we've hit the beginning of stored history
      if (items.length < 50) break;
    }

    const data = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return res.status(200).json({ data });
  } catch (error) {
    console.error('Spotify heatmap error:', error);
    return res.status(500).json({ error: 'Failed to fetch listening history' });
  }
}
