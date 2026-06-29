import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllApplications } from '@/api/applications';
import { computeStats } from './dashboardUtils';
import type { DateRange, DashboardStats } from './dashboardTypes';

export function useDashboardStats(range: DateRange): {
  stats: DashboardStats | undefined;
  isLoading: boolean;
  error: Error | null;
} {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'all-applications'],
    queryFn: fetchAllApplications,
    staleTime: 2 * 60_000,
  });

  const stats = useMemo(
    () => (data ? computeStats(data, range) : undefined),
    [data, range],
  );

  return { stats, isLoading, error: error as Error | null };
}
