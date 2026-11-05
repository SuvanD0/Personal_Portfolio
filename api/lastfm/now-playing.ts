import type { VercelRequest, VercelResponse } from '@vercel/node';

const API_KEY = process.env.LASTFM_API_KEY;
const USER = process.env.LASTFM_USERNAME;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const u = new URL('https://ws.audioscrobbler.com/2.0/');
    u.searchParams.set('method', 'user.getRecentTracks');
    u.searchParams.set('user', USER || '');
    u.searchParams.set('api_key', API_KEY || '');
    u.searchParams.set('format', 'json');
    u.searchParams.set('limit', '1');

    const r = await fetch(u.toString());
    const data = await r.json().catch(() => ({}));
    if (!r.ok || data.error) {
      throw new Error(`Last.fm failed: ${data.message ?? r.status}`);
    }

    const tracks = data.recenttracks?.track ?? [];
    const track = Array.isArray(tracks) ? tracks[0] : tracks;

    if (!track) {
      return res.status(200).json({ isPlaying: false, title: null, artist: null });
    }

    const images: any[] = track.image ?? [];
    return res.status(200).json({
      isPlaying: track['@attr']?.nowplaying === 'true',
      title: track.name,
      artist: track.artist?.['#text'] ?? '',
      album: track.album?.['#text'] ?? '',
      albumImageUrl: images[images.length - 1]?.['#text'] || undefined,
      songUrl: track.url,
    });
  } catch (error) {
    console.error('Last.fm now-playing error:', error);
    return res.status(500).json({ error: 'Failed to fetch Last.fm data' });
  }
}
