import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  applicationsApi,
  type ListParams,
  type CreateApplicationBody,
  type UpdateApplicationBody,
} from '@/api/applications';
import type { Application, ApplicationStatus, Page } from '@/types';
import { qk } from '@/lib/queryClient';

export function useApplications(params: ListParams = {}) {
  return useQuery({
    queryKey: qk.applications(params),
    queryFn: () => applicationsApi.list(params),
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: qk.application(id),
    queryFn: () => applicationsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateApplicationBody) => applicationsApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.applications() });
    },
  });
}

export function useUpdateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateApplicationBody }) =>
      applicationsApi.update(id, body),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: qk.applications() });
      qc.setQueryData(qk.application(updated.id), updated);
    },
  });
}

// Optimistic status change — the kanban drag updates instantly, rolls back on error.
export function useChangeStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      applicationsApi.update(id, { status }),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: qk.applications() });
      const snapshots = qc.getQueriesData<Page<Application>>({
        queryKey: qk.applications(),
      });
      snapshots.forEach(([key, value]) => {
        if (!value) return;
        qc.setQueryData(key, {
          ...value,
          items: value.items.map((a) =>
            a.id === id ? { ...a, status } : a,
          ),
        });
      });
      return { snapshots };
    },
    onError: (_e, _v, ctx) => {
      ctx?.snapshots.forEach(([key, value]) => qc.setQueryData(key, value));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.applications() });
    },
  });
}

export function useDeleteApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => applicationsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.applications() }),
  });
}
