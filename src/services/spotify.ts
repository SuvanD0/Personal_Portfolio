export interface SpotifyTrackData {
  isPlaying: boolean;
  title: string | null;
  artist: string | null;
  album?: string;
  albumImageUrl?: string;
  songUrl?: string;
}

export async function getNowPlaying(): Promise<SpotifyTrackData> {
  const response = await fetch('/api/spotify/now-playing');

  if (!response.ok) {
    throw new Error('Failed to fetch Spotify data');
  }

  return response.json();
}
