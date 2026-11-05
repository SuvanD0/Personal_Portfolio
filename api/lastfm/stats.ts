import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEY = process.env.LASTFM_API_KEY;
const USER = process.env.LASTFM_USERNAME;
const BASE = 'https://ws.audioscrobbler.com/2.0/';

async function lfm(method: string, params: Record<string, string> = {}) {
  const u = new URL(BASE);
  u.searchParams.set('method', method);
  u.searchParams.set('user', USER || '');
  u.searchParams.set('api_key', API_KEY || '');
  u.searchParams.set('format', 'json');
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const res = await fetch(u.toString());
  const data = await res.json().catch(() => ({}));
  // Last.fm reports errors in the body, sometimes with a 200 status.
  if (!res.ok || data.error) {
    throw new Error(`Last.fm ${method} failed: ${data.message ?? res.status}`);
  }
  return data;
}

function pickImage(images: any[], size = 'large'): string | null {
  const img = images?.find((i: any) => i.size === size);
  return img?.['#text'] || null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // "1month" matches the "Last 4 weeks" label on the stats page.
    const [artistsData, tracksData, recentData] = await Promise.all([
      lfm('user.getTopArtists', { period: '1month', limit: '30' }),
      lfm('user.getTopTracks', { period: '1month', limit: '10' }),
      lfm('user.getRecentTracks', { limit: '10' }),
    ]);

    const topArtists = (artistsData.topartists?.artist ?? []).map((a: any) => ({
      name: a.name,
      genres: [],
      imageUrl: pickImage(a.image, 'large'),
      url: a.url,
      playcount: parseInt(a.playcount || '0'),
    }));

    const topTracks = (tracksData.toptracks?.track ?? []).map((t: any) => ({
      name: t.name,
      artist: t.artist?.name ?? '',
      album: '',
      imageUrl: pickImage(t.image, 'medium'),
      url: t.url,
      durationMs: parseInt(t.duration || '0') * 1000,
      playcount: parseInt(t.playcount || '0'),
    }));

    const recentlyPlayed = (recentData.recenttracks?.track ?? []).map((t: any) => ({
      name: t.name,
      artist: t.artist?.['#text'] ?? '',
      playedAt: t.date?.uts
        ? new Date(parseInt(t.date.uts) * 1000).toISOString()
        : new Date().toISOString(), // now playing has no date
      url: t.url,
    }));

    return res.status(200).json({ topArtists, topTracks, recentlyPlayed });
  } catch (error) {
    console.error('Last.fm stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch Last.fm stats' });
  }
}
