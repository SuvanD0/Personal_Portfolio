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

// Last.fm serves this star graphic when it has no art; treat it as "no image".
const PLACEHOLDER = '2a96cbd8b46e442fc41c2b86b821562f';

function pickImage(images: any[], size = 'large'): string | null {
  const img = images?.find((i: any) => i.size === size) ?? images?.[images.length - 1];
  const url: string | null = img?.['#text'] || null;
  return url && !url.includes(PLACEHOLDER) ? url : null;
}

// user.getTopTracks only ever returns the placeholder, so resolve real album
// art per track: track.getInfo first, iTunes Search as a keyless fallback.
async function trackArt(artist: string, track: string): Promise<{ imageUrl: string | null; album: string }> {
  try {
    const info = await lfm('track.getInfo', { artist, track, autocorrect: '1' });
    const album = info.track?.album;
    const img = pickImage(album?.image ?? [], 'extralarge');
    if (img) return { imageUrl: img, album: album?.title ?? '' };
  } catch { /* fall through */ }
  try {
    const q = encodeURIComponent(`${artist} ${track}`);
    const r = await fetch(`https://itunes.apple.com/search?term=${q}&entity=song&limit=1`);
    const data = await r.json();
    const hit = data.results?.[0];
    if (hit?.artworkUrl100) {
      return { imageUrl: hit.artworkUrl100.replace('100x100bb', '300x300bb'), album: hit.collectionName ?? '' };
    }
  } catch { /* fall through */ }
  return { imageUrl: null, album: '' };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // "1month" matches the "Last 4 weeks" label on the stats page.
    const [artistsData, tracksData, recentData] = await Promise.all([
      lfm('user.getTopArtists', { period: '1month', limit: '20' }),
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

    const rawTracks: any[] = tracksData.toptracks?.track ?? [];
    const art = await Promise.all(rawTracks.map((t) => trackArt(t.artist?.name ?? '', t.name)));
    const topTracks = rawTracks.map((t: any, i: number) => ({
      name: t.name,
      artist: t.artist?.name ?? '',
      album: art[i].album,
      imageUrl: art[i].imageUrl,
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
