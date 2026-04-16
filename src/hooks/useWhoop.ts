import { useQuery } from '@tanstack/react-query';
import { getWhoopData, WhoopData } from '@/services/whoop';

export function useWhoop() {
  return useQuery<WhoopData>({
    queryKey: ['whoop-data'],
    queryFn: getWhoopData,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 4 * 60 * 1000,
    retry: 2,
  });
}
