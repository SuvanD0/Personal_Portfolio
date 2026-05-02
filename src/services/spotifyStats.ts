export interface SpotifyArtist {
  name: string;
  genres: string[];
  imageUrl: string | null;
  url: string;
}

export interface SpotifyTopTrack {
  name: string;
  artist: string;
  album: string;
  imageUrl: string | null;
  url: string;
  durationMs: number;
}

export interface SpotifyRecentTrack {
  name: string;
  artist: string;
  playedAt: string;
  url: string;
}

export interface SpotifyStatsData {
  topArtists: SpotifyArtist[];
  topTracks: SpotifyTopTrack[];
  recentlyPlayed: SpotifyRecentTrack[];
}

export async function getSpotifyStats(): Promise<SpotifyStatsData> {
  const res = await fetch('/api/spotify/stats');
  if (!res.ok) throw new Error('Failed to fetch Spotify stats');
  return res.json();
}
