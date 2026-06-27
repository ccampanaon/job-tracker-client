import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi, type CreateEventBody } from '@/api/events';
import { qk } from '@/lib/queryClient';

export function useEvents(appId: string) {
  return useQuery({
    queryKey: qk.events(appId),
    queryFn: () => eventsApi.list(appId),
    enabled: !!appId,
  });
}

export function useCreateEvent(appId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateEventBody) => eventsApi.create(appId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.events(appId) });
    },
  });
}

export function useUpdateEvent(appId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<CreateEventBody> }) =>
      eventsApi.update(appId, id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.events(appId) });
    },
  });
}

export function useDeleteEvent(appId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsApi.remove(appId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.events(appId) });
    },
  });
}
