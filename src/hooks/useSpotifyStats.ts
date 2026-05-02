import { useQuery } from '@tanstack/react-query';
import { getSpotifyStats, SpotifyStatsData } from '@/services/spotifyStats';

export function useSpotifyStats() {
  return useQuery<SpotifyStatsData>({
    queryKey: ['spotify-stats'],
    queryFn: getSpotifyStats,
    staleTime: 1000 * 60 * 60,
    refetchInterval: 1000 * 60 * 60,
  });
}
