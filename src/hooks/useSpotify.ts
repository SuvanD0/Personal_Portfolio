import { useQuery } from '@tanstack/react-query';
import { getNowPlaying, SpotifyTrackData } from '@/services/spotify';

export function useSpotify() {
  return useQuery<SpotifyTrackData>({
    queryKey: ['spotify-now-playing'],
    queryFn: getNowPlaying,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
    retry: 2,
  });
}
