import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getWhoopData, WhoopData } from '@/services/whoop';

export function useWhoop() {
  return useQuery<WhoopData>({
    queryKey: ['whoop-data'],
    queryFn: getWhoopData,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 4 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}
