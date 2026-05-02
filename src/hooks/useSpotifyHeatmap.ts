import { useQuery } from '@tanstack/react-query';
import { getSpotifyHeatmap, HeatmapData } from '@/services/spotifyHeatmap';

export function useSpotifyHeatmap() {
  return useQuery<HeatmapData>({
    queryKey: ['spotify-heatmap'],
    queryFn: getSpotifyHeatmap,
    staleTime: 1000 * 60 * 60,
    refetchInterval: 1000 * 60 * 60,
  });
}
