import type { VercelRequest, VercelResponse } from '@vercel/node';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing';
const RECENTLY_PLAYED_ENDPOINT = 'https://api.spotify.com/v1/me/player/recently-played?limit=1';

interface SpotifyTrack {
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  external_urls: {
    spotify: string;
  };
}

interface NowPlayingResponse {
  is_playing: boolean;
  item: SpotifyTrack;
}

interface RecentlyPlayedResponse {
  items: Array<{
    track: SpotifyTrack;
    played_at: string;
  }>;
}

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

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const accessToken = await getAccessToken();

    // Try to get currently playing
    const nowPlayingResponse = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // If something is currently playing
    if (nowPlayingResponse.status === 200) {
      const data: NowPlayingResponse = await nowPlayingResponse.json();

      if (data.is_playing && data.item) {
        return res.status(200).json({
          isPlaying: true,
          title: data.item.name,
          artist: data.item.artists.map((a) => a.name).join(', '),
          album: data.item.album.name,
          albumImageUrl: data.item.album.images[0]?.url,
          songUrl: data.item.external_urls.spotify,
        });
      }
    }

    // Fallback: Get recently played
    const recentlyPlayedResponse = await fetch(RECENTLY_PLAYED_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (recentlyPlayedResponse.status === 200) {
      const data: RecentlyPlayedResponse = await recentlyPlayedResponse.json();

      if (data.items && data.items.length > 0) {
        const track = data.items[0].track;
        return res.status(200).json({
          isPlaying: false,
          title: track.name,
          artist: track.artists.map((a) => a.name).join(', '),
          album: track.album.name,
          albumImageUrl: track.album.images[0]?.url,
          songUrl: track.external_urls.spotify,
        });
      }
    }

    // Nothing playing and no recent tracks
    return res.status(200).json({
      isPlaying: false,
      title: null,
      artist: null,
    });
  } catch (error) {
    console.error('Spotify API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch Spotify data',
    });
  }
}
