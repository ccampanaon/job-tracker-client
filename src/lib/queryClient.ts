import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30s: data considered fresh, no refetch on remount
      gcTime: 5 * 60_000, // keep unused cache 5 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Central key factory keeps cache keys consistent across hooks.
export const qk = {
  applications: (params?: unknown) =>
    params ? (['applications', params] as const) : (['applications'] as const),
  application: (id: string) => ['application', id] as const,
  companies: (search?: string) => ['companies', search ?? ''] as const,
  interviews: (appId: string) => ['interviews', appId] as const,
  events: (appId: string) => ['events', appId] as const,
};
