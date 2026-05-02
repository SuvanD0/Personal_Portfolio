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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const token = await getAccessToken();
    const headers = { Authorization: `Bearer ${token}` };

    const [artistsRes, tracksRes, recentRes] = await Promise.all([
      fetch('https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=50', { headers }),
      fetch('https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10', { headers }),
      fetch('https://api.spotify.com/v1/me/player/recently-played?limit=10', { headers }),
    ]);

    const [artistsData, tracksData, recentData] = await Promise.all([
      artistsRes.ok ? artistsRes.json() : { items: [] },
      tracksRes.ok ? tracksRes.json() : { items: [] },
      recentRes.ok ? recentRes.json() : { items: [] },
    ]);

    return res.status(200).json({
      topArtists: (artistsData.items ?? []).map((a: any) => ({
        name: a.name,
        genres: a.genres.slice(0, 2),
        imageUrl: a.images?.[1]?.url ?? a.images?.[0]?.url ?? null,
        url: a.external_urls.spotify,
      })),
      topTracks: (tracksData.items ?? []).map((t: any) => ({
        name: t.name,
        artist: t.artists.map((a: any) => a.name).join(', '),
        album: t.album.name,
        imageUrl: t.album.images?.[1]?.url ?? null,
        url: t.external_urls.spotify,
        durationMs: t.duration_ms,
      })),
      recentlyPlayed: (recentData.items ?? []).map((item: any) => ({
        name: item.track.name,
        artist: item.track.artists.map((a: any) => a.name).join(', '),
        playedAt: item.played_at,
        url: item.track.external_urls.spotify,
      })),
    });
  } catch (error) {
    console.error('Spotify stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch Spotify stats' });
  }
}
